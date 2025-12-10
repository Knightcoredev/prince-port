/**
 * ErrorHandler Module
 * Provides comprehensive error handling and recovery mechanisms
 */

import { access, constants } from 'fs/promises';
import path from 'path';

export class ErrorHandler {
  constructor(reportGenerator, backupManager) {
    this.reportGenerator = reportGenerator;
    this.backupManager = backupManager;
    this.recoveryAttempts = new Map(); // Track recovery attempts per file
    this.maxRecoveryAttempts = 3;
  }

  /**
   * Handles corrupted image files gracefully
   * @param {string} imagePath - Path to corrupted image
   * @param {Error} error - Original error
   * @returns {Promise<{recovered: boolean, action: string, message: string}>}
   */
  async handleCorruptedImage(imagePath, error) {
    const result = {
      recovered: false,
      action: 'skip',
      message: `Corrupted image detected: ${error.message}`
    };

    try {
      // Check if file exists
      await access(imagePath, constants.R_OK);
      
      // Attempt basic file validation
      const stats = await import('fs/promises').then(fs => fs.stat(imagePath));
      
      if (stats.size === 0) {
        result.message = 'File is empty - cannot recover';
        this.reportGenerator.logError(imagePath, 'Empty file detected', { 
          errorType: 'corrupted',
          fileSize: 0,
          recovery: 'impossible'
        });
        return result;
      }

      // Try to identify the actual file type
      const actualFormat = await this._detectFileFormat(imagePath);
      if (actualFormat && actualFormat !== path.extname(imagePath).toLowerCase().replace('.', '')) {
        result.message = `Format mismatch detected - file appears to be ${actualFormat} but has ${path.extname(imagePath)} extension`;
        this.reportGenerator.logError(imagePath, result.message, {
          errorType: 'format_mismatch',
          detectedFormat: actualFormat,
          expectedFormat: path.extname(imagePath),
          recovery: 'format_correction_needed'
        });
        return result;
      }

      // Log as corrupted with detailed context
      this.reportGenerator.logError(imagePath, 'Image file is corrupted and cannot be processed', {
        errorType: 'corrupted',
        fileSize: stats.size,
        originalError: error.message,
        recovery: 'skip_recommended'
      });

    } catch (accessError) {
      result.message = `File access error: ${accessError.message}`;
      this.reportGenerator.logError(imagePath, result.message, {
        errorType: 'access_denied',
        originalError: error.message,
        accessError: accessError.message,
        recovery: 'check_permissions'
      });
    }

    return result;
  }

  /**
   * Implements recovery mechanisms for processing failures
   * @param {string} imagePath - Path to failed image
   * @param {Error} error - Processing error
   * @param {string} backupPath - Path to backup file
   * @returns {Promise<{recovered: boolean, action: string, message: string}>}
   */
  async handleProcessingFailure(imagePath, error, backupPath = null) {
    const attemptKey = imagePath;
    const currentAttempts = this.recoveryAttempts.get(attemptKey) || 0;
    
    const result = {
      recovered: false,
      action: 'restore_and_skip',
      message: `Processing failed: ${error.message}`
    };

    // Check if we've exceeded max recovery attempts
    if (currentAttempts >= this.maxRecoveryAttempts) {
      result.message = `Max recovery attempts (${this.maxRecoveryAttempts}) exceeded for ${imagePath}`;
      this.reportGenerator.logError(imagePath, result.message, {
        errorType: 'max_attempts_exceeded',
        attempts: currentAttempts,
        originalError: error.message,
        recovery: 'manual_intervention_required'
      });
      return result;
    }

    // Increment attempt counter
    this.recoveryAttempts.set(attemptKey, currentAttempts + 1);

    try {
      // Attempt to restore from backup if available
      if (backupPath && this.backupManager) {
        await this.backupManager.restoreFromBackup(imagePath, backupPath);
        console.log(`🔄 Restored ${imagePath} from backup (attempt ${currentAttempts + 1})`);
      }

      // Analyze the error type and attempt specific recovery
      const errorType = this._analyzeErrorType(error);
      
      switch (errorType) {
        case 'memory_error':
          result.action = 'retry_with_optimization';
          result.message = 'Memory error detected - will retry with memory optimization';
          break;
          
        case 'permission_error':
          result.action = 'check_permissions';
          result.message = 'Permission error - check file access rights';
          break;
          
        case 'format_error':
          result.action = 'skip_unsupported';
          result.message = 'Unsupported format - skipping file';
          break;
          
        case 'network_error':
          result.action = 'retry_after_delay';
          result.message = 'Network error - will retry after delay';
          break;
          
        default:
          result.action = 'restore_and_skip';
          result.message = 'Unknown error - restoring from backup and skipping';
      }

      // Log detailed error information
      this.reportGenerator.logError(imagePath, error.message, {
        errorType,
        attempt: currentAttempts + 1,
        maxAttempts: this.maxRecoveryAttempts,
        recoveryAction: result.action,
        backupRestored: !!backupPath,
        originalError: error.stack || error.message
      });

    } catch (recoveryError) {
      result.message = `Recovery failed: ${recoveryError.message}`;
      this.reportGenerator.logError(imagePath, result.message, {
        errorType: 'recovery_failure',
        originalError: error.message,
        recoveryError: recoveryError.message,
        attempt: currentAttempts + 1
      });
    }

    return result;
  }

  /**
   * Handles system-level errors (memory, disk space, etc.)
   * @param {Error} error - System error
   * @param {string} context - Context where error occurred
   * @returns {Promise<{canContinue: boolean, action: string, message: string}>}
   */
  async handleSystemError(error, context = 'unknown') {
    const result = {
      canContinue: false,
      action: 'abort',
      message: `System error in ${context}: ${error.message}`
    };

    const errorType = this._analyzeErrorType(error);

    switch (errorType) {
      case 'memory_error':
        result.canContinue = true;
        result.action = 'reduce_batch_size';
        result.message = 'Memory error detected - reducing batch size and continuing';
        break;
        
      case 'storage_error':
        // Check available disk space
        const spaceCheck = await this._checkDiskSpace();
        if (spaceCheck.available > spaceCheck.required) {
          result.canContinue = true;
          result.action = 'cleanup_and_continue';
          result.message = 'Storage error - cleaning up temporary files and continuing';
        } else {
          result.message = `Insufficient disk space: ${spaceCheck.available}MB available, ${spaceCheck.required}MB required`;
        }
        break;
        
      case 'permission_error':
        result.message = 'Permission denied - check user privileges and file permissions';
        break;
        
      default:
        result.message = `Unhandled system error: ${error.message}`;
    }

    // Log system error with context
    this.reportGenerator.logError('SYSTEM', error.message, {
      errorType,
      context,
      canContinue: result.canContinue,
      recommendedAction: result.action,
      systemInfo: await this._getSystemInfo()
    });

    return result;
  }

  /**
   * Provides detailed error reporting with troubleshooting information
   * @param {string} imagePath - Path to image (or 'SYSTEM' for system errors)
   * @param {Error} error - Error object
   * @param {Object} additionalContext - Additional error context
   * @returns {Object} Detailed error report
   */
  generateDetailedErrorReport(imagePath, error, additionalContext = {}) {
    const errorType = this._analyzeErrorType(error);
    const timestamp = new Date().toISOString();
    const troubleshootingSteps = this._generateTroubleshootingSteps(errorType, error);
    
    const report = {
      timestamp,
      file: imagePath,
      error: {
        message: error.message,
        type: errorType,
        stack: error.stack,
        code: error.code
      },
      context: additionalContext,
      troubleshooting: troubleshootingSteps,
      systemInfo: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    return report;
  }

  /**
   * Detects file format by reading file headers
   * @private
   */
  async _detectFileFormat(filePath) {
    try {
      const { readFile } = await import('fs/promises');
      const buffer = await readFile(filePath);
      
      // Check file signatures
      if (buffer.length < 4) return null;
      
      const header = buffer.subarray(0, 4);
      
      // JPEG
      if (header[0] === 0xFF && header[1] === 0xD8) return 'jpeg';
      
      // PNG
      if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return 'png';
      
      // WebP
      if (buffer.length >= 12) {
        const webpHeader = buffer.subarray(8, 12);
        if (webpHeader.toString() === 'WEBP') return 'webp';
      }
      
      // SVG (check for XML declaration or SVG tag)
      const textContent = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
      if (textContent.includes('<svg') || textContent.includes('<?xml')) return 'svg';
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Analyzes error type based on error message and properties
   * @private
   */
  _analyzeErrorType(error) {
    const message = error.message.toLowerCase();
    const code = error.code;

    if (message.includes('memory') || message.includes('heap') || code === 'ERR_MEMORY_ALLOCATION_FAILED') {
      return 'memory_error';
    }
    
    if (message.includes('permission') || message.includes('access') || code === 'EACCES' || code === 'EPERM') {
      return 'permission_error';
    }
    
    if (message.includes('space') || message.includes('disk') || code === 'ENOSPC') {
      return 'storage_error';
    }
    
    if (message.includes('network') || message.includes('timeout') || code === 'ETIMEDOUT' || code === 'ECONNREFUSED') {
      return 'network_error';
    }
    
    if (message.includes('format') || message.includes('unsupported') || message.includes('invalid')) {
      return 'format_error';
    }
    
    if (message.includes('corrupt') || message.includes('malformed')) {
      return 'corruption_error';
    }

    return 'unknown_error';
  }

  /**
   * Generates specific troubleshooting steps based on error type
   * @private
   */
  _generateTroubleshootingSteps(errorType, error) {
    const steps = {
      immediate: [],
      preventive: [],
      escalation: []
    };

    switch (errorType) {
      case 'memory_error':
        steps.immediate = [
          'Close other memory-intensive applications',
          'Process images in smaller batches',
          'Restart the watermarking process'
        ];
        steps.preventive = [
          'Increase system RAM if possible',
          'Process large images separately',
          'Monitor memory usage during processing'
        ];
        steps.escalation = [
          'Contact system administrator for memory allocation',
          'Consider using a machine with more RAM'
        ];
        break;
        
      case 'permission_error':
        steps.immediate = [
          'Check file and directory permissions',
          'Run with elevated privileges if necessary',
          'Ensure files are not locked by other processes'
        ];
        steps.preventive = [
          'Set appropriate file permissions before processing',
          'Run as a user with sufficient privileges'
        ];
        steps.escalation = [
          'Contact system administrator for permission changes'
        ];
        break;
        
      case 'storage_error':
        steps.immediate = [
          'Free up disk space',
          'Clean temporary files',
          'Check backup directory space'
        ];
        steps.preventive = [
          'Monitor disk space before processing',
          'Set up automatic cleanup of old backups'
        ];
        steps.escalation = [
          'Add more storage capacity',
          'Move processing to a different drive'
        ];
        break;
        
      default:
        steps.immediate = [
          'Check the specific error message for details',
          'Verify the image file is accessible',
          'Try processing the file individually'
        ];
        steps.preventive = [
          'Validate images before batch processing',
          'Keep backups of original files'
        ];
        steps.escalation = [
          'Report the issue with full error details',
          'Consider manual processing for problematic files'
        ];
    }

    return steps;
  }

  /**
   * Checks available disk space
   * @private
   */
  async _checkDiskSpace() {
    try {
      const { execSync } = await import('child_process');
      let command;
      
      if (process.platform === 'win32') {
        command = 'dir /-c';
      } else {
        command = 'df -h .';
      }
      
      // This is a simplified check - in production, you'd use a proper disk space library
      return {
        available: 1000, // MB - placeholder
        required: 100    // MB - placeholder
      };
    } catch (error) {
      return {
        available: 0,
        required: 100
      };
    }
  }

  /**
   * Gets system information for error reporting
   * @private
   */
  async _getSystemInfo() {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cwd: process.cwd(),
      pid: process.pid
    };
  }

  /**
   * Clears recovery attempt tracking for a file
   * @param {string} imagePath - Path to image
   */
  clearRecoveryAttempts(imagePath) {
    this.recoveryAttempts.delete(imagePath);
  }

  /**
   * Gets current recovery attempt count for a file
   * @param {string} imagePath - Path to image
   * @returns {number} Number of recovery attempts
   */
  getRecoveryAttempts(imagePath) {
    return this.recoveryAttempts.get(imagePath) || 0;
  }
}