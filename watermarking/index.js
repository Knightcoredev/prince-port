/**
 * Main Watermarking Script
 * Entry point for the image watermarking system with CLI interface
 */

import { ImageDiscovery } from './src/ImageDiscovery.js';
import { BackupManager } from './src/BackupManager.js';
import { WatermarkProcessor } from './src/WatermarkProcessor.js';
import { ValidationEngine } from './src/ValidationEngine.js';
import { ReportGenerator } from './src/ReportGenerator.js';
import { ReferenceValidator } from './src/ReferenceValidator.js';
import { ErrorHandler } from './src/ErrorHandler.js';
// import FinalReportGenerator from './src/FinalReportGenerator.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration management for the watermarking system
 */
class WatermarkConfig {
  constructor() {
    this.defaultConfig = {
      text: "P.F.O",
      position: "bottom-right",
      padding: 20,
      fontSize: "5%",
      minFontSize: 24,
      color: "rgba(255, 255, 255, 0.8)",
      shadow: {
        blur: 2,
        color: "rgba(0, 0, 0, 0.5)"
      }
    };
  }

  /**
   * Load configuration from file or use defaults
   */
  async loadConfig(configPath) {
    if (configPath) {
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const userConfig = JSON.parse(configData);
        return { ...this.defaultConfig, ...userConfig };
      } catch (error) {
        console.warn(`⚠️  Could not load config from ${configPath}, using defaults: ${error.message}`);
      }
    }
    return this.defaultConfig;
  }

  /**
   * Save current configuration to file
   */
  async saveConfig(config, configPath) {
    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(`✅ Configuration saved to ${configPath}`);
    } catch (error) {
      console.error(`❌ Failed to save configuration: ${error.message}`);
    }
  }

  /**
   * Validate configuration options
   */
  validateConfig(config) {
    const errors = [];
    
    if (!config.text || typeof config.text !== 'string') {
      errors.push('text must be a non-empty string');
    }
    
    if (!['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(config.position)) {
      errors.push('position must be one of: bottom-right, bottom-left, top-right, top-left');
    }
    
    if (typeof config.padding !== 'number' || config.padding < 0) {
      errors.push('padding must be a non-negative number');
    }
    
    if (typeof config.minFontSize !== 'number' || config.minFontSize < 8) {
      errors.push('minFontSize must be a number >= 8');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Progress tracking and status management
 */
class ProgressTracker {
  constructor(total = 0) {
    this.total = total;
    this.processed = 0;
    this.skipped = 0;
    this.errors = 0;
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
    this.interrupted = false;
    this.resumeData = null;
  }

  update(type = 'processed') {
    this[type]++;
    this.lastUpdate = Date.now();
    this.printProgress();
  }

  printProgress() {
    const completed = this.processed + this.skipped + this.errors;
    const percentage = this.total > 0 ? Math.round((completed / this.total) * 100) : 0;
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const rate = completed > 0 ? Math.round(completed / elapsed * 60) : 0;
    
    process.stdout.write(`\r📊 Progress: ${completed}/${this.total} (${percentage}%) | ✅ ${this.processed} | ⏭️  ${this.skipped} | ❌ ${this.errors} | ⏱️  ${elapsed}s | 🚀 ${rate}/min`);
  }

  getStats() {
    const completed = this.processed + this.skipped + this.errors;
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    
    return {
      total: this.total,
      completed,
      processed: this.processed,
      skipped: this.skipped,
      errors: this.errors,
      percentage: this.total > 0 ? Math.round((completed / this.total) * 100) : 0,
      elapsedSeconds: elapsed,
      rate: completed > 0 ? Math.round(completed / elapsed * 60) : 0
    };
  }

  saveResumeData(currentIndex, imagePaths) {
    this.resumeData = {
      currentIndex,
      stats: this.getStats(),
      timestamp: new Date().toISOString(),
      remainingImages: imagePaths.slice(currentIndex)
    };
  }

  interrupt() {
    this.interrupted = true;
    console.log('\n\n⚠️  Processing interrupted by user');
  }
}

export class WatermarkingSystem {
  constructor(options = {}) {
    this.imageDiscovery = new ImageDiscovery();
    this.backupManager = new BackupManager();
    this.watermarkProcessor = new WatermarkProcessor(options.watermarkConfig);
    this.validationEngine = new ValidationEngine();
    this.reportGenerator = new ReportGenerator();
    this.referenceValidator = new ReferenceValidator();
    this.errorHandler = new ErrorHandler(this.reportGenerator, this.backupManager);
    this.configManager = new WatermarkConfig();
    // this.finalReportGenerator = new FinalReportGenerator(this.reportGenerator, this.validationEngine, this.referenceValidator);
    this.progressTracker = null;
    this.processingOptions = {
      continueOnError: options.continueOnError !== false,
      maxRetries: options.maxRetries || 3,
      batchSize: options.batchSize || 10,
      parallel: options.parallel || false,
      maxConcurrency: options.maxConcurrency || 4,
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      resumeFile: options.resumeFile || null
    };
    
    // Set up graceful shutdown handling
    this.setupInterruptHandlers();
  }

  /**
   * Set up handlers for graceful interruption
   */
  setupInterruptHandlers() {
    const gracefulShutdown = async (signal) => {
      console.log(`\n\n🛑 Received ${signal}. Initiating graceful shutdown...`);
      
      if (this.progressTracker) {
        this.progressTracker.interrupt();
        await this.saveResumeData();
      }
      
      console.log('💾 Progress saved. You can resume processing later.');
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  }

  /**
   * Save resume data for interrupted processing
   */
  async saveResumeData() {
    if (!this.progressTracker || !this.progressTracker.resumeData) return;
    
    try {
      const resumeFile = path.join(__dirname, 'watermarking-resume.json');
      await fs.writeFile(resumeFile, JSON.stringify(this.progressTracker.resumeData, null, 2));
      console.log(`📄 Resume data saved to ${resumeFile}`);
    } catch (error) {
      console.error('❌ Failed to save resume data:', error.message);
    }
  }

  /**
   * Load resume data from previous interrupted session
   */
  async loadResumeData() {
    if (!this.processingOptions.resumeFile) return null;
    
    try {
      const resumeData = await fs.readFile(this.processingOptions.resumeFile, 'utf8');
      const data = JSON.parse(resumeData);
      console.log(`📄 Loaded resume data from ${this.processingOptions.resumeFile}`);
      console.log(`   Previous session: ${data.stats.processed} processed, ${data.stats.skipped} skipped, ${data.stats.errors} errors`);
      return data;
    } catch (error) {
      console.warn(`⚠️  Could not load resume data: ${error.message}`);
      return null;
    }
  }

  /**
   * Main execution method
   * @param {string} rootPath - Root directory to process
   * @returns {Promise<Object>} Processing results
   */
  async run(rootPath = '../') {
    console.log('🎨 Starting Image Watermarking System...');
    this.reportGenerator.startTiming();

    try {
      // Check for resume data
      const resumeData = await this.loadResumeData();
      let imagePaths;
      let startIndex = 0;

      if (resumeData) {
        console.log('🔄 Resuming from previous session...');
        imagePaths = resumeData.remainingImages;
        startIndex = resumeData.currentIndex || 0;
        
        // Restore previous stats to report generator
        this.reportGenerator.restoreStats({
          processed: resumeData.stats.processed,
          skipped: resumeData.stats.skipped,
          errors: resumeData.stats.errors
        });
      } else {
        // Discover all images
        console.log('🔍 Discovering images...');
        imagePaths = await this.imageDiscovery.findAllImages(rootPath);
      }
      
      this.reportGenerator.setTotal(imagePaths.length + (resumeData ? resumeData.stats.completed : 0));
      
      // Initialize progress tracker
      this.progressTracker = new ProgressTracker(imagePaths.length);
      if (resumeData) {
        this.progressTracker.processed = resumeData.stats.processed;
        this.progressTracker.skipped = resumeData.stats.skipped;
        this.progressTracker.errors = resumeData.stats.errors;
      }
      
      console.log(`Found ${imagePaths.length} images to process`);

      // Scan for image references before processing
      console.log('🔍 Scanning code files for image references...');
      await this.referenceValidator.scanCodeFilesForImageReferences(rootPath);
      const referenceSummary = this.referenceValidator.getReferenceSummary();
      console.log(`Found ${referenceSummary.totalReferences} image references across ${referenceSummary.totalImages} images`);

      // Store original paths for consistency validation
      const originalPaths = imagePaths.map(img => img.path || img);

      // Handle dry-run mode
      if (this.processingOptions.dryRun) {
        console.log('\n🔍 DRY RUN MODE - No changes will be made');
        console.log('Images that would be processed:');
        
        for (const imageInfo of imagePaths) {
          const imagePath = imageInfo.path || imageInfo;
          
          try {
            const validation = await this.validationEngine.validateImage(imagePath);
            if (!validation.isValid) {
              console.log(`❌ ${imagePath} - Would skip: ${validation.error}`);
              continue;
            }

            const watermarkCheck = await this.validationEngine.checkWatermarkExists(imagePath);
            if (watermarkCheck.hasWatermark) {
              console.log(`🏷️  ${imagePath} - Would skip: Already watermarked`);
            } else {
              console.log(`✅ ${imagePath} - Would process`);
            }
          } catch (error) {
            console.log(`❌ ${imagePath} - Would skip: ${error.message}`);
          }
        }
        
        console.log('\n📊 Dry run completed - use without --dry-run to apply changes');
        return {
          totalImages: imagePaths.length,
          processed: 0,
          skipped: imagePaths.length,
          errors: 0,
          dryRun: true
        };
      }

      // Process images in batches to handle memory constraints
      const batchSize = this.processingOptions.batchSize;
      const totalBatches = Math.ceil(imagePaths.length / batchSize);
      
      for (let i = startIndex; i < imagePaths.length; i += batchSize) {
        // Check for interruption
        if (this.progressTracker.interrupted) {
          this.progressTracker.saveResumeData(i, imagePaths);
          await this.saveResumeData();
          break;
        }
        
        const batch = imagePaths.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} images)`);
        
        try {
          // Process batch with parallel or sequential processing
          if (this.processingOptions.parallel) {
            await this._processBatchParallel(batch, i);
          } else {
            await this._processBatch(batch, i);
          }
          
          // Save progress periodically (every 5 batches)
          if (batchNumber % 5 === 0) {
            this.progressTracker.saveResumeData(i + batchSize, imagePaths);
          }
          
        } catch (batchError) {
          // Handle batch-level errors
          const systemErrorResult = await this.errorHandler.handleSystemError(batchError, `batch_${batchNumber}`);
          
          if (!systemErrorResult.canContinue) {
            console.error(`❌ Critical error in batch processing: ${systemErrorResult.message}`);
            
            // Save progress before potentially exiting
            this.progressTracker.saveResumeData(i + batchSize, imagePaths);
            await this.saveResumeData();
            
            if (!this.processingOptions.continueOnError) {
              throw batchError;
            }
          } else {
            console.warn(`⚠️  Batch error handled: ${systemErrorResult.message}`);
            // Adjust batch size if memory error
            if (systemErrorResult.action === 'reduce_batch_size') {
              this.processingOptions.batchSize = Math.max(1, Math.floor(this.processingOptions.batchSize / 2));
              console.log(`📉 Reduced batch size to ${this.processingOptions.batchSize}`);
            }
          }
        }
      }
      
      // Clear resume data on successful completion
      if (!this.progressTracker.interrupted) {
        try {
          const resumeFile = path.join(__dirname, 'watermarking-resume.json');
          await fs.unlink(resumeFile).catch(() => {}); // Ignore if file doesn't exist
        } catch (error) {
          // Ignore cleanup errors
        }
      }

      // Validate processing consistency across all processed images
      const processedImages = this.reportGenerator.getProcessedImages();
      if (processedImages.length > 1) {
        console.log('🔍 Validating processing consistency...');
        try {
          const consistencyValidation = await this.watermarkProcessor.validateProcessingConsistency(processedImages);
          
          if (!consistencyValidation.isConsistent) {
            console.warn('⚠️  Processing consistency issues detected:');
            consistencyValidation.inconsistencies.forEach(issue => {
              console.warn(`  - ${issue}`);
            });
          } else {
            console.log('✅ Processing consistency validated successfully');
          }
          
          // Add consistency results to report
          this.reportGenerator.addConsistencyResults(consistencyValidation);
        } catch (consistencyError) {
          console.warn('⚠️  Consistency validation failed:', consistencyError.message);
          this.reportGenerator.logError('CONSISTENCY_CHECK', consistencyError.message, {
            errorType: 'validation_failure',
            processedCount: processedImages.length
          });
        }
      }

      // Validate that file paths remain unchanged after processing
      console.log('🔍 Validating path consistency...');
      try {
        const processedPaths = processedImages.map(img => img.path || img);
        const pathValidation = this.referenceValidator.validatePathConsistency(originalPaths, processedPaths);
        
        if (!pathValidation.pathsUnchanged) {
          console.warn('⚠️  Path consistency issues detected:');
          pathValidation.changedPaths.forEach(change => {
            console.warn(`  - ${change.status}: ${change.original || change.processed} - ${change.issue}`);
          });
        } else {
          console.log('✅ File paths remain unchanged after processing');
        }

        // Validate that processed images maintain functionality
        console.log('🔍 Validating image references...');
        const referenceValidation = await this.referenceValidator.validateProcessedImageReferences(processedPaths, rootPath);
        
        if (!referenceValidation.valid) {
          console.warn('⚠️  Reference validation issues detected:');
          referenceValidation.brokenReferences.forEach(ref => {
            console.warn(`  - ${ref.imagePath}: ${ref.issue} (referenced in ${ref.reference.sourceFile})`);
          });
        } else {
          console.log('✅ All image references remain functional');
        }

        // Add reference validation results to report
        this.reportGenerator.addReferenceValidation({
          pathValidation,
          referenceValidation,
          referenceSummary
        });
      } catch (validationError) {
        console.warn('⚠️  Reference validation failed:', validationError.message);
        this.reportGenerator.logError('REFERENCE_VALIDATION', validationError.message, {
          errorType: 'validation_failure'
        });
      }

      // Generate comprehensive final report
      console.log('\n🎯 Generating comprehensive final report...');
      const report = this.reportGenerator.generateReport();
      
      // Generate final comprehensive report with analysis and recommendations
      const finalReport = await this._generateFinalReport(report);
      
      // Export all reports
      this.reportGenerator.printSummary();
      await this.reportGenerator.exportResults();
      await this.reportGenerator.exportDetailedLogs();
      
      // Export final comprehensive report
      const finalReportPaths = await this._exportFinalReport(finalReport, 'watermarking-final-report');
      this._printFinalSummary(finalReport);
      
      console.log('\n📊 Final Report Files Generated:');
      Object.entries(finalReportPaths).forEach(([type, path]) => {
        console.log(`  • ${type.toUpperCase()}: ${path}`);
      });

      return finalReport;

    } catch (error) {
      // Handle fatal system errors
      const systemErrorResult = await this.errorHandler.handleSystemError(error, 'main_execution');
      console.error('❌ Fatal error during watermarking:', systemErrorResult.message);
      
      // Generate error report even on failure
      try {
        const report = this.reportGenerator.generateReport();
        await this.reportGenerator.exportResults('watermarking-error-report.json');
        await this.reportGenerator.exportDetailedLogs('watermarking-error-logs.json');
        
        // Generate final report even on failure for analysis
        try {
          const finalReport = await this._generateFinalReport(report);
          await this._exportFinalReport(finalReport, 'watermarking-error-final-report');
          console.log('📊 Final error analysis report generated');
        } catch (finalReportError) {
          console.error('Failed to generate final error report:', finalReportError.message);
        }
      } catch (reportError) {
        console.error('Failed to generate error report:', reportError.message);
      }
      
      throw error;
    }
  }

  /**
   * Processes a batch of images sequentially with error handling
   * @private
   */
  async _processBatch(imageBatch, batchStartIndex = 0) {
    for (let i = 0; i < imageBatch.length; i++) {
      // Check for interruption
      if (this.progressTracker && this.progressTracker.interrupted) {
        this.progressTracker.saveResumeData(batchStartIndex + i, imageBatch.slice(i));
        break;
      }
      
      await this._processImage(imageBatch[i]);
    }
  }

  /**
   * Processes a batch of images in parallel with concurrency control
   * @private
   */
  async _processBatchParallel(imageBatch, batchStartIndex = 0) {
    const maxConcurrency = this.processingOptions.maxConcurrency;
    const semaphore = new Array(maxConcurrency).fill(null);
    let activePromises = 0;
    let completedCount = 0;
    
    const processWithConcurrency = async (imageInfo, index) => {
      // Check for interruption before processing
      if (this.progressTracker && this.progressTracker.interrupted) {
        return;
      }
      
      // Wait for available slot
      while (activePromises >= maxConcurrency && !this.progressTracker?.interrupted) {
        await Promise.race(semaphore.filter(p => p !== null));
      }
      
      if (this.progressTracker?.interrupted) {
        return;
      }
      
      // Process image
      activePromises++;
      const promise = this._processImage(imageInfo).finally(() => {
        activePromises--;
        completedCount++;
        
        const semaphoreIndex = semaphore.indexOf(promise);
        if (semaphoreIndex !== -1) {
          semaphore[semaphoreIndex] = null;
        }
        
        // Save progress on interruption
        if (this.progressTracker?.interrupted) {
          const remainingImages = imageBatch.slice(completedCount);
          this.progressTracker.saveResumeData(batchStartIndex + completedCount, remainingImages);
        }
      });
      
      // Add to semaphore
      const availableSlot = semaphore.indexOf(null);
      if (availableSlot !== -1) {
        semaphore[availableSlot] = promise;
      }
      
      return promise;
    };

    // Process all images with concurrency control
    const promises = imageBatch.map((imageInfo, index) => processWithConcurrency(imageInfo, index));
    await Promise.all(promises.filter(p => p !== undefined));
  }

  /**
   * Processes a single image with comprehensive error handling
   * @private
   */
  async _processImage(imageInfo) {
    const imagePath = imageInfo.path || imageInfo;
    let backupPath = null;
    
    try {
      // Validate image with enhanced error handling
      const validation = await this.validationEngine.validateImage(imagePath);
      if (!validation.isValid) {
        // Handle corrupted images gracefully
        if (validation.error && (validation.error.includes('corrupt') || validation.error.includes('invalid'))) {
          const corruptionResult = await this.errorHandler.handleCorruptedImage(imagePath, new Error(validation.error));
          this.reportGenerator.recordSkipped(imagePath, corruptionResult.message);
        } else {
          this.reportGenerator.recordSkipped(imagePath, `Invalid image file: ${validation.error}`);
        }
        
        // Update progress tracker
        if (this.progressTracker) {
          this.progressTracker.update('skipped');
        }
        return;
      }

      // Check for existing watermark
      const watermarkCheck = await this.validationEngine.checkWatermarkExists(imagePath);
      if (watermarkCheck.error) {
        console.warn(`⚠️  Watermark detection failed for ${imagePath}: ${watermarkCheck.error}`);
      }
      
      if (watermarkCheck.hasWatermark) {
        this.reportGenerator.recordSkipped(imagePath, 'Already watermarked');
        
        // Update progress tracker
        if (this.progressTracker) {
          this.progressTracker.update('skipped');
        }
        return;
      }

      // Create backup with error handling
      try {
        backupPath = await this.backupManager.createBackup(imagePath);
      } catch (backupError) {
        const backupErrorResult = await this.errorHandler.handleSystemError(backupError, 'backup_creation');
        if (!backupErrorResult.canContinue) {
          this.reportGenerator.logError(imagePath, `Backup creation failed: ${backupError.message}`, {
            errorType: 'backup_failure',
            cannotContinue: true
          });
          
          // Update progress tracker
          if (this.progressTracker) {
            this.progressTracker.update('errors');
          }
          return;
        }
        console.warn(`⚠️  Backup creation failed, continuing without backup: ${backupError.message}`);
      }

      // Apply watermark with retry logic
      let processingResult = null;
      let retryCount = 0;
      const maxRetries = this.processingOptions.maxRetries;

      while (retryCount <= maxRetries) {
        try {
          processingResult = await this.watermarkProcessor.applyWatermark(imagePath);
          break; // Success, exit retry loop
        } catch (processingError) {
          retryCount++;
          
          if (retryCount > maxRetries) {
            // Max retries exceeded, handle failure
            const failureResult = await this.errorHandler.handleProcessingFailure(imagePath, processingError, backupPath);
            this.reportGenerator.logError(imagePath, failureResult.message, {
              errorType: 'processing_failure',
              retries: retryCount - 1,
              maxRetries,
              recoveryAction: failureResult.action
            });
            
            // Update progress tracker
            if (this.progressTracker) {
              this.progressTracker.update('errors');
            }
            return;
          }

          // Attempt recovery
          const recoveryResult = await this.errorHandler.handleProcessingFailure(imagePath, processingError, backupPath);
          
          if (recoveryResult.action === 'retry_after_delay') {
            console.log(`🔄 Retrying ${imagePath} (attempt ${retryCount}/${maxRetries}) after delay...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          } else if (recoveryResult.action === 'skip_unsupported') {
            this.reportGenerator.recordSkipped(imagePath, recoveryResult.message);
            
            // Update progress tracker
            if (this.progressTracker) {
              this.progressTracker.update('skipped');
            }
            return;
          } else {
            console.log(`🔄 Retrying ${imagePath} (attempt ${retryCount}/${maxRetries})...`);
          }
        }
      }

      // Validate processing result
      if (!processingResult || !processingResult.success) {
        const errorMessage = processingResult ? 'Processing failed' : 'No processing result';
        
        if (backupPath) {
          try {
            await this.backupManager.restoreFromBackup(imagePath, backupPath);
            console.log(`🔄 Restored ${imagePath} from backup after processing failure`);
          } catch (restoreError) {
            console.error(`Failed to restore backup for ${imagePath}:`, restoreError.message);
          }
        }
        
        this.reportGenerator.logError(imagePath, errorMessage, {
          errorType: 'processing_validation_failure',
          hasBackup: !!backupPath
        });
        
        // Update progress tracker
        if (this.progressTracker) {
          this.progressTracker.update('errors');
        }
        return;
      }

      // Validate image preservation
      if (processingResult.preservationResult && !processingResult.preservationResult.isPreserved) {
        const preservationIssues = processingResult.preservationResult.issues.join(', ');
        
        if (backupPath) {
          try {
            await this.backupManager.restoreFromBackup(imagePath, backupPath);
            console.log(`🔄 Restored ${imagePath} from backup due to preservation issues`);
          } catch (restoreError) {
            console.error(`Failed to restore backup for ${imagePath}:`, restoreError.message);
          }
        }
        
        this.reportGenerator.logError(imagePath, `Image preservation failed: ${preservationIssues}`, {
          errorType: 'preservation_failure',
          issues: processingResult.preservationResult.issues,
          hasBackup: !!backupPath
        });
        
        // Update progress tracker
        if (this.progressTracker) {
          this.progressTracker.update('errors');
        }
        return;
      }

      // Final validation with error handling
      try {
        const finalValidation = await this.validationEngine.validateImage(imagePath);
        if (!finalValidation.isValid) {
          if (backupPath) {
            await this.backupManager.restoreFromBackup(imagePath, backupPath);
            console.log(`🔄 Restored ${imagePath} from backup after final validation failure`);
          }
          
          this.reportGenerator.logError(imagePath, `Final validation failed: ${finalValidation.error}`, {
            errorType: 'final_validation_failure',
            hasBackup: !!backupPath
          });
          
          // Update progress tracker
          if (this.progressTracker) {
            this.progressTracker.update('errors');
          }
          return;
        }
      } catch (validationError) {
        console.warn(`⚠️  Final validation error for ${imagePath}: ${validationError.message}`);
        // Continue anyway as the processing might have succeeded
      }

      // Success - record processed image and clear recovery attempts
      this.reportGenerator.recordProcessed(imagePath, processingResult);
      this.errorHandler.clearRecoveryAttempts(imagePath);
      
      // Update progress tracker
      if (this.progressTracker) {
        this.progressTracker.update('processed');
      }

    } catch (error) {
      // Handle unexpected errors
      const errorReport = this.errorHandler.generateDetailedErrorReport(imagePath, error, {
        hasBackup: !!backupPath,
        processingStage: 'unknown'
      });
      
      this.reportGenerator.logError(imagePath, error.message, errorReport);
      
      // Attempt to restore from backup on unexpected error
      if (backupPath) {
        try {
          await this.backupManager.restoreFromBackup(imagePath, backupPath);
          console.log(`🔄 Restored ${imagePath} from backup after unexpected error`);
        } catch (restoreError) {
          console.error(`Failed to restore backup for ${imagePath}:`, restoreError.message);
          this.reportGenerator.logError(imagePath, `Backup restoration failed: ${restoreError.message}`, {
            errorType: 'backup_restoration_failure',
            originalError: error.message
          });
        }
      }
    }
  }

  /**
   * Formats milliseconds to human readable time
   * @private
   */
  _formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  /**
   * Generates comprehensive final processing report
   * @private
   */
  async _generateFinalReport(baseReport) {
    console.log('📊 Generating comprehensive final report...');
    
    const timestamp = new Date().toISOString();
    const reportId = `final_report_${Date.now()}`;
    
    // Perform final validation
    const validationSummary = await this._performFinalValidation();
    
    // Calculate quality metrics
    const successRate = baseReport.totalImages > 0 
      ? ((baseReport.processed / baseReport.totalImages) * 100).toFixed(1) + '%'
      : '0%';
    
    const errorRate = baseReport.totalImages > 0 ? (baseReport.errors / baseReport.totalImages) : 0;
    let qualityScore = 100;
    qualityScore -= errorRate * 50;
    qualityScore -= validationSummary.criticalIssues * 10;
    qualityScore -= validationSummary.warnings * 2;
    qualityScore = Math.max(0, Math.round(qualityScore));
    
    // Determine overall status
    let overallStatus = 'SUCCESS';
    if (validationSummary.criticalIssues > 0) {
      overallStatus = 'CRITICAL_ISSUES';
    } else if (validationSummary.warnings > 0 || baseReport.errors > 0) {
      overallStatus = 'SUCCESS_WITH_WARNINGS';
    }
    
    // Assess deployment readiness
    const deploymentReadiness = this._assessDeploymentReadiness(baseReport, validationSummary);
    
    // Generate recommendations
    const recommendations = this._generateRecommendations(baseReport, validationSummary);
    
    const finalReport = {
      reportMetadata: {
        reportId,
        timestamp,
        reportType: 'Final Processing Report',
        version: '1.0.0',
        generatedBy: 'P.F.O Image Watermarking System'
      },
      
      executiveSummary: {
        overallStatus,
        successRate,
        qualityScore,
        processingEfficiency: this._calculateProcessingEfficiency(baseReport),
        keyAchievements: this._identifyKeyAchievements(baseReport),
        criticalIssues: validationSummary.criticalIssues,
        warnings: validationSummary.warnings
      },
      
      processingResults: {
        ...baseReport,
        sessionDuration: this._formatTime(baseReport.processingTime),
        throughput: this._calculateThroughput(baseReport),
        qualityMetrics: this._calculateQualityMetrics(baseReport)
      },
      
      validationResults: validationSummary,
      deploymentReadiness,
      recommendations,
      
      systemHealth: {
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        status: 'HEALTHY'
      }
    };
    
    console.log('✅ Final report generated successfully');
    return finalReport;
  }

  /**
   * Performs final validation checks
   * @private
   */
  async _performFinalValidation() {
    console.log('🔍 Performing final validation checks...');
    
    const validation = {
      criticalIssues: 0,
      warnings: 0,
      imageIntegrity: { status: 'PASS', issues: [] },
      referencePreservation: { status: 'PASS', issues: [] }
    };

    try {
      // Validate processed images integrity
      const processedImages = this.reportGenerator.getProcessedImages();
      let integrityIssues = 0;
      
      for (const imagePath of processedImages) {
        try {
          const imageValidation = await this.validationEngine.validateImage(imagePath);
          if (!imageValidation.isValid) {
            validation.imageIntegrity.issues.push({
              image: imagePath,
              issue: imageValidation.error,
              severity: 'critical'
            });
            integrityIssues++;
          }
        } catch (error) {
          validation.imageIntegrity.issues.push({
            image: imagePath,
            issue: `Validation failed: ${error.message}`,
            severity: 'warning'
          });
        }
      }
      
      if (integrityIssues > 0) {
        validation.imageIntegrity.status = integrityIssues > processedImages.length * 0.1 ? 'FAIL' : 'WARNING';
        validation.criticalIssues += integrityIssues > processedImages.length * 0.1 ? integrityIssues : 0;
        validation.warnings += integrityIssues <= processedImages.length * 0.1 ? integrityIssues : 0;
      }

      // Check reference validation results
      const referenceValidation = this.reportGenerator.results.referenceValidation;
      if (referenceValidation) {
        if (!referenceValidation.pathValidation.pathsUnchanged) {
          validation.referencePreservation.status = 'FAIL';
          validation.criticalIssues += referenceValidation.pathValidation.changedPaths.length;
        }
        
        if (!referenceValidation.referenceValidation.valid) {
          validation.referencePreservation.status = 'FAIL';
          validation.criticalIssues += referenceValidation.referenceValidation.brokenReferences?.length || 0;
        }
      }

    } catch (error) {
      console.error('⚠️ Final validation encountered errors:', error.message);
      validation.warnings++;
    }

    return validation;
  }

  /**
   * Assesses deployment readiness
   * @private
   */
  _assessDeploymentReadiness(baseReport, validationSummary) {
    const blockers = [];
    const warnings = [];
    
    // Check for critical issues
    if (validationSummary.criticalIssues > 0) {
      blockers.push(`${validationSummary.criticalIssues} critical validation issues must be resolved`);
    }
    
    // Check error rate
    const errorRate = baseReport.totalImages > 0 ? (baseReport.errors / baseReport.totalImages) : 0;
    if (errorRate > 0.1) {
      blockers.push(`High error rate (${(errorRate * 100).toFixed(1)}%) exceeds deployment threshold`);
    }
    
    // Check for warnings
    if (validationSummary.warnings > 0) {
      warnings.push(`${validationSummary.warnings} warnings should be reviewed`);
    }
    
    const isReady = blockers.length === 0;
    const confidenceLevel = isReady ? (warnings.length === 0 ? 'HIGH' : 'MEDIUM') : 'LOW';
    
    return {
      isReady,
      confidenceLevel,
      blockers,
      warnings,
      recommendation: isReady 
        ? 'System is ready for deployment' 
        : 'Resolve critical issues before deployment'
    };
  }

  /**
   * Generates actionable recommendations
   * @private
   */
  _generateRecommendations(baseReport, validationSummary) {
    const recommendations = {
      priority: [],
      optimization: [],
      maintenance: []
    };

    // Priority recommendations based on critical issues
    if (validationSummary.criticalIssues > 0) {
      recommendations.priority.push({
        title: 'Address Critical Validation Issues',
        description: `${validationSummary.criticalIssues} critical issues detected that must be resolved before deployment`,
        action: 'Review and fix all critical validation failures',
        impact: 'High',
        effort: 'Medium'
      });
    }

    if (baseReport.errors > baseReport.totalImages * 0.05) {
      recommendations.priority.push({
        title: 'Investigate High Error Rate',
        description: `Error rate of ${((baseReport.errors / baseReport.totalImages) * 100).toFixed(1)}% exceeds acceptable threshold`,
        action: 'Review error patterns and implement fixes for common failure modes',
        impact: 'High',
        effort: 'High'
      });
    }

    // Maintenance recommendations
    if (baseReport.statistics.errorCategories && Object.keys(baseReport.statistics.errorCategories).length > 0) {
      recommendations.maintenance.push({
        title: 'Implement Error Monitoring',
        description: 'Set up monitoring for recurring error patterns',
        action: 'Create automated alerts for common error categories',
        impact: 'Medium',
        effort: 'Low'
      });
    }

    return recommendations;
  }

  /**
   * Calculates processing efficiency
   * @private
   */
  _calculateProcessingEfficiency(baseReport) {
    const successRate = baseReport.totalImages > 0 ? (baseReport.processed / baseReport.totalImages) : 0;
    
    if (successRate >= 0.95) return 'Excellent';
    if (successRate >= 0.85) return 'Good';
    if (successRate >= 0.70) return 'Fair';
    return 'Poor';
  }

  /**
   * Identifies key achievements
   * @private
   */
  _identifyKeyAchievements(baseReport) {
    const achievements = [];
    
    if (baseReport.processed > 0) {
      achievements.push(`Successfully watermarked ${baseReport.processed} images`);
    }
    
    if (baseReport.errors === 0) {
      achievements.push('Zero processing errors achieved');
    }
    
    if (baseReport.consistencyResults?.isConsistent) {
      achievements.push('Consistent watermark application across all images');
    }
    
    return achievements;
  }

  /**
   * Calculates throughput
   * @private
   */
  _calculateThroughput(baseReport) {
    if (baseReport.processingTime <= 0) return '0 images/min';
    
    const imagesPerMinute = (baseReport.processed / (baseReport.processingTime / 60000)).toFixed(1);
    return `${imagesPerMinute} images/min`;
  }

  /**
   * Calculates quality metrics
   * @private
   */
  _calculateQualityMetrics(baseReport) {
    return {
      errorRate: baseReport.totalImages > 0 ? `${((baseReport.errors / baseReport.totalImages) * 100).toFixed(2)}%` : '0%',
      skipRate: baseReport.totalImages > 0 ? `${((baseReport.skipped / baseReport.totalImages) * 100).toFixed(2)}%` : '0%',
      successRate: baseReport.totalImages > 0 ? `${((baseReport.processed / baseReport.totalImages) * 100).toFixed(2)}%` : '0%'
    };
  }

  /**
   * Exports the final report to multiple formats
   * @private
   */
  async _exportFinalReport(finalReport, basePath = 'watermarking-final-report') {
    const exports = {};
    
    try {
      // Export comprehensive JSON report
      const jsonPath = `${basePath}.json`;
      await fs.writeFile(jsonPath, JSON.stringify(finalReport, null, 2));
      exports.json = jsonPath;
      console.log(`📄 Comprehensive report exported to: ${jsonPath}`);
      
      // Export executive summary
      const summaryPath = `${basePath}-summary.json`;
      const summary = {
        reportMetadata: finalReport.reportMetadata,
        executiveSummary: finalReport.executiveSummary,
        recommendations: finalReport.recommendations.priority,
        deploymentReadiness: finalReport.deploymentReadiness
      };
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      exports.summary = summaryPath;
      console.log(`📋 Executive summary exported to: ${summaryPath}`);
      
      // Export human-readable report
      const readablePath = `${basePath}-readable.txt`;
      const readableReport = this._generateReadableReport(finalReport);
      await fs.writeFile(readablePath, readableReport);
      exports.readable = readablePath;
      console.log(`📖 Human-readable report exported to: ${readablePath}`);
      
      return exports;
      
    } catch (error) {
      console.error('❌ Failed to export final report:', error.message);
      throw error;
    }
  }

  /**
   * Prints the final report summary to console
   * @private
   */
  _printFinalSummary(finalReport) {
    console.log('\n' + '='.repeat(60));
    console.log('🎨 FINAL WATERMARKING REPORT');
    console.log('='.repeat(60));
    console.log(`Report ID: ${finalReport.reportMetadata.reportId}`);
    console.log(`Generated: ${new Date(finalReport.reportMetadata.timestamp).toLocaleString()}`);
    
    // Executive Summary
    console.log('\n📊 EXECUTIVE SUMMARY:');
    console.log(`Overall Status: ${finalReport.executiveSummary.overallStatus}`);
    console.log(`Success Rate: ${finalReport.executiveSummary.successRate}`);
    console.log(`Quality Score: ${finalReport.executiveSummary.qualityScore}/100`);
    console.log(`Processing Efficiency: ${finalReport.executiveSummary.processingEfficiency}`);
    
    // Key Metrics
    console.log('\n📈 KEY METRICS:');
    console.log(`Total Images: ${finalReport.processingResults.totalImages}`);
    console.log(`Successfully Processed: ${finalReport.processingResults.processed}`);
    console.log(`Skipped: ${finalReport.processingResults.skipped}`);
    console.log(`Errors: ${finalReport.processingResults.errors}`);
    console.log(`Session Duration: ${finalReport.processingResults.sessionDuration}`);
    console.log(`Throughput: ${finalReport.processingResults.throughput}`);
    
    // Deployment Readiness
    console.log('\n🚀 DEPLOYMENT READINESS:');
    console.log(`Ready for Deployment: ${finalReport.deploymentReadiness.isReady ? '✅ YES' : '❌ NO'}`);
    console.log(`Confidence Level: ${finalReport.deploymentReadiness.confidenceLevel}`);
    
    if (finalReport.deploymentReadiness.blockers.length > 0) {
      console.log('Deployment Blockers:');
      finalReport.deploymentReadiness.blockers.forEach(blocker => {
        console.log(`  • ${blocker}`);
      });
    }
    
    // Priority Recommendations
    if (finalReport.recommendations.priority.length > 0) {
      console.log('\n⚡ PRIORITY RECOMMENDATIONS:');
      finalReport.recommendations.priority.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.title}`);
        console.log(`   ${rec.description}`);
      });
    }
    
    console.log('='.repeat(60));
  }

  /**
   * Generates human-readable report
   * @private
   */
  _generateReadableReport(finalReport) {
    const timestamp = new Date(finalReport.reportMetadata.timestamp).toLocaleString();
    
    return `
P.F.O IMAGE WATERMARKING - FINAL PROCESSING REPORT
==================================================

Report Generated: ${timestamp}
Report ID: ${finalReport.reportMetadata.reportId}

EXECUTIVE SUMMARY
-----------------
Overall Status: ${finalReport.executiveSummary.overallStatus}
Success Rate: ${finalReport.executiveSummary.successRate}
Quality Score: ${finalReport.executiveSummary.qualityScore}/100
Processing Efficiency: ${finalReport.executiveSummary.processingEfficiency}

PROCESSING RESULTS
------------------
Total Images Found: ${finalReport.processingResults.totalImages}
Successfully Processed: ${finalReport.processingResults.processed}
Skipped: ${finalReport.processingResults.skipped}
Errors: ${finalReport.processingResults.errors}
Session Duration: ${finalReport.processingResults.sessionDuration}
Throughput: ${finalReport.processingResults.throughput}

DEPLOYMENT READINESS
--------------------
Ready for Deployment: ${finalReport.deploymentReadiness.isReady ? 'YES' : 'NO'}
Confidence Level: ${finalReport.deploymentReadiness.confidenceLevel}

${finalReport.deploymentReadiness.blockers.length > 0 ? 
`Deployment Blockers:
${finalReport.deploymentReadiness.blockers.map(b => `• ${b}`).join('\n')}` : ''}

${finalReport.deploymentReadiness.warnings.length > 0 ? 
`Warnings:
${finalReport.deploymentReadiness.warnings.map(w => `• ${w}`).join('\n')}` : ''}

PRIORITY RECOMMENDATIONS
------------------------
${finalReport.recommendations.priority.map((rec, i) => 
`${i + 1}. ${rec.title}
   ${rec.description}
   Action: ${rec.action}
   Impact: ${rec.impact} | Effort: ${rec.effort}`).join('\n\n')}

${finalReport.processingResults.errorDetails.length > 0 ? 
`ERROR DETAILS
-------------
${finalReport.processingResults.errorDetails.map(error => 
`• ${error.file}: ${error.error}
  Category: ${error.category}
  Timestamp: ${error.timestamp}`).join('\n\n')}` : ''}

Report generated by P.F.O Image Watermarking System v${finalReport.reportMetadata.version}
`;
  }
}

/**
 * Command Line Interface for the watermarking system
 */
class WatermarkCLI {
  constructor() {
    this.commands = {
      run: this.runWatermarking.bind(this),
      config: this.manageConfig.bind(this),
      validate: this.validateImages.bind(this),
      help: this.showHelp.bind(this)
    };
    this.configManager = new WatermarkConfig();
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const options = {
      command: 'run',
      rootPath: '../',
      configPath: null,
      continueOnError: true,
      maxRetries: 3,
      batchSize: 10,
      parallel: false,
      maxConcurrency: 4,
      dryRun: false,
      verbose: false,
      outputReport: null
    };

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case 'help':
        case '--help':
        case '-h':
          options.command = 'help';
          break;
        case 'config':
          options.command = 'config';
          if (nextArg && !nextArg.startsWith('-')) {
            options.configPath = nextArg;
            i++;
          }
          break;
        case 'validate':
          options.command = 'validate';
          break;
        case '--path':
        case '-p':
          if (nextArg && !nextArg.startsWith('-')) {
            options.rootPath = nextArg;
            i++;
          }
          break;
        case '--config-file':
        case '-c':
          if (nextArg && !nextArg.startsWith('-')) {
            options.configPath = nextArg;
            i++;
          }
          break;
        case '--batch-size':
        case '-b':
          if (nextArg && !isNaN(nextArg)) {
            options.batchSize = parseInt(nextArg);
            i++;
          }
          break;
        case '--max-retries':
        case '-r':
          if (nextArg && !isNaN(nextArg)) {
            options.maxRetries = parseInt(nextArg);
            i++;
          }
          break;
        case '--max-concurrency':
          if (nextArg && !isNaN(nextArg)) {
            options.maxConcurrency = parseInt(nextArg);
            i++;
          }
          break;
        case '--output':
        case '-o':
          if (nextArg && !nextArg.startsWith('-')) {
            options.outputReport = nextArg;
            i++;
          }
          break;
        case '--resume':
          if (nextArg && !nextArg.startsWith('-')) {
            options.resumeFile = nextArg;
            i++;
          } else {
            options.resumeFile = path.join(__dirname, 'watermarking-resume.json');
          }
          break;
        case '--parallel':
          options.parallel = true;
          break;
        case '--dry-run':
          options.dryRun = true;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--stop-on-error':
          options.continueOnError = false;
          break;
        default:
          if (!arg.startsWith('-') && !options.rootPath) {
            options.rootPath = arg;
          }
          break;
      }
    }

    return options;
  }

  /**
   * Main watermarking execution
   */
  async runWatermarking(options) {
    try {
      console.log('🎨 P.F.O Image Watermarking System');
      console.log('=====================================\n');

      if (options.verbose) {
        console.log('Configuration:');
        console.log(`  Root Path: ${options.rootPath}`);
        console.log(`  Config File: ${options.configPath || 'default'}`);
        console.log(`  Batch Size: ${options.batchSize}`);
        console.log(`  Max Retries: ${options.maxRetries}`);
        console.log(`  Parallel Processing: ${options.parallel}`);
        console.log(`  Dry Run: ${options.dryRun}`);
        console.log(`  Continue on Error: ${options.continueOnError}\n`);
      }

      // Load configuration
      const watermarkConfig = await this.configManager.loadConfig(options.configPath);
      const configValidation = this.configManager.validateConfig(watermarkConfig);
      
      if (!configValidation.isValid) {
        console.error('❌ Invalid configuration:');
        configValidation.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }

      if (options.verbose) {
        console.log('Watermark Configuration:');
        console.log(`  Text: "${watermarkConfig.text}"`);
        console.log(`  Position: ${watermarkConfig.position}`);
        console.log(`  Padding: ${watermarkConfig.padding}px`);
        console.log(`  Font Size: ${watermarkConfig.fontSize} (min: ${watermarkConfig.minFontSize}px)`);
        console.log(`  Color: ${watermarkConfig.color}\n`);
      }

      // Create watermarking system
      const systemOptions = {
        watermarkConfig,
        continueOnError: options.continueOnError,
        maxRetries: options.maxRetries,
        batchSize: options.batchSize,
        parallel: options.parallel,
        maxConcurrency: options.maxConcurrency,
        dryRun: options.dryRun,
        verbose: options.verbose,
        resumeFile: options.resumeFile
      };

      const system = new WatermarkingSystem(systemOptions);

      // Run the watermarking process
      const result = await system.run(options.rootPath);

      // Save report if requested
      if (options.outputReport) {
        await system.reportGenerator.exportResults(options.outputReport);
        console.log(`📄 Report saved to ${options.outputReport}`);
      }

      // Exit with appropriate code
      const hasErrors = result.errors > 0;
      if (hasErrors && !options.continueOnError) {
        console.log('\n❌ Watermarking completed with errors');
        process.exit(1);
      } else {
        console.log('\n✅ Watermarking completed successfully');
        process.exit(0);
      }

    } catch (error) {
      console.error('\n❌ Fatal error:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Configuration management
   */
  async manageConfig(options) {
    const configManager = new WatermarkConfig();
    
    try {
      if (options.configPath === 'init') {
        // Create default configuration file
        const defaultConfigPath = path.join(__dirname, 'watermark-config.json');
        const defaultConfig = configManager.defaultConfig;
        await configManager.saveConfig(defaultConfig, defaultConfigPath);
        console.log(`✅ Default configuration created at ${defaultConfigPath}`);
        console.log('\nYou can now edit this file to customize watermark settings.');
      } else {
        // Load and display current configuration
        const configPath = options.configPath || path.join(__dirname, 'watermark-config.json');
        const config = await configManager.loadConfig(configPath);
        console.log('Current Watermark Configuration:');
        console.log('================================');
        console.log(JSON.stringify(config, null, 2));
        
        const validation = configManager.validateConfig(config);
        if (validation.isValid) {
          console.log('\n✅ Configuration is valid');
        } else {
          console.log('\n❌ Configuration has errors:');
          validation.errors.forEach(error => console.log(`  - ${error}`));
        }
      }
    } catch (error) {
      console.error('❌ Configuration error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate images without processing
   */
  async validateImages(options) {
    try {
      console.log('🔍 Validating Images');
      console.log('====================\n');

      const system = new WatermarkingSystem({ verbose: options.verbose });
      
      // Discover images
      const imagePaths = await system.imageDiscovery.findAllImages(options.rootPath);
      console.log(`Found ${imagePaths.length} images to validate\n`);

      let validCount = 0;
      let invalidCount = 0;
      let watermarkedCount = 0;

      for (const imageInfo of imagePaths) {
        const imagePath = imageInfo.path || imageInfo;
        
        try {
          // Validate image
          const validation = await system.validationEngine.validateImage(imagePath);
          
          if (validation.isValid) {
            // Check for existing watermark
            const watermarkCheck = await system.validationEngine.checkWatermarkExists(imagePath);
            
            if (watermarkCheck.hasWatermark) {
              console.log(`🏷️  ${imagePath} - Valid (already watermarked)`);
              watermarkedCount++;
            } else {
              console.log(`✅ ${imagePath} - Valid`);
              validCount++;
            }
          } else {
            console.log(`❌ ${imagePath} - Invalid: ${validation.error}`);
            invalidCount++;
          }
        } catch (error) {
          console.log(`❌ ${imagePath} - Error: ${error.message}`);
          invalidCount++;
        }
      }

      console.log('\nValidation Summary:');
      console.log(`  Valid images: ${validCount}`);
      console.log(`  Already watermarked: ${watermarkedCount}`);
      console.log(`  Invalid images: ${invalidCount}`);
      console.log(`  Total images: ${imagePaths.length}`);

    } catch (error) {
      console.error('❌ Validation error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🎨 P.F.O Image Watermarking System
=================================

USAGE:
  node index.js [command] [options]

COMMANDS:
  run                    Run the watermarking process (default)
  config [init|path]     Manage configuration
  validate              Validate images without processing
  help                  Show this help message

OPTIONS:
  -p, --path <path>           Root directory to process (default: ../)
  -c, --config-file <file>    Configuration file path
  -b, --batch-size <number>   Images per batch (default: 10)
  -r, --max-retries <number>  Max retry attempts (default: 3)
  --max-concurrency <number>  Max parallel processes (default: 4)
  -o, --output <file>         Save report to file
  --resume [file]             Resume from interrupted session
  --parallel                  Enable parallel processing
  --dry-run                   Preview changes without applying
  --stop-on-error            Stop processing on first error
  -v, --verbose              Verbose output
  -h, --help                 Show help

EXAMPLES:
  node index.js                                    # Process current directory
  node index.js --path /path/to/images            # Process specific directory
  node index.js --parallel --batch-size 5         # Parallel processing with smaller batches
  node index.js --dry-run --verbose               # Preview with detailed output
  node index.js --resume                          # Resume interrupted processing
  node index.js config init                       # Create default configuration
  node index.js validate --path /path/to/images   # Validate images only

CONFIGURATION:
  Use 'node index.js config init' to create a configuration file.
  Edit watermark-config.json to customize watermark appearance.
`);
  }

  /**
   * Execute CLI command
   */
  async execute(args) {
    const options = this.parseArgs(args);
    
    if (this.commands[options.command]) {
      await this.commands[options.command](options);
    } else {
      console.error(`❌ Unknown command: ${options.command}`);
      this.showHelp();
      process.exit(1);
    }
  }
}

// CLI execution - check if this file is being run directly
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('index.js') || 
  process.argv[1].endsWith('watermarking/index.js') ||
  fileURLToPath(import.meta.url) === process.argv[1]
);

if (isMainModule) {
  const cli = new WatermarkCLI();
  cli.execute(process.argv).catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}