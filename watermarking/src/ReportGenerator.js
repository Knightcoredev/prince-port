/**
 * ReportGenerator Module
 * Provides processing summary and logs
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';

export class ReportGenerator {
  constructor() {
    this.results = {
      totalImages: 0,
      processed: 0,
      skipped: 0,
      errors: 0,
      processingTime: 0,
      errorDetails: [],
      processedImages: [], // Track processed image paths
      consistencyResults: null, // Store consistency validation results
      referenceValidation: null, // Store reference validation results
      statistics: {
        formatBreakdown: {}, // Count by image format
        sizeBreakdown: {}, // Count by size ranges
        processingTimes: [], // Individual processing times
        errorCategories: {}, // Categorized error counts
        skippedReasons: {}, // Categorized skip reasons
        averageProcessingTime: 0,
        largestImage: null,
        smallestImage: null
      }
    };
    this.startTime = null;
    this.sessionId = this._generateSessionId();
    this.logEntries = []; // Detailed log entries with timestamps
  }

  /**
   * Starts timing the processing session
   */
  startTiming() {
    this.startTime = Date.now();
  }

  /**
   * Restores statistics from previous session (for resume functionality)
   * @param {Object} stats - Previous session statistics
   */
  restoreStats(stats) {
    if (stats.processed) this.results.processed = stats.processed;
    if (stats.skipped) this.results.skipped = stats.skipped;
    if (stats.errors) this.results.errors = stats.errors;
  }

  /**
   * Records a successfully processed image
   * @param {string} imagePath - Path to processed image
   * @param {Object} processingResult - Processing result details
   */
  recordProcessed(imagePath, processingResult = null) {
    this.results.processed++;
    this.results.processedImages.push(imagePath);
    
    // Track detailed statistics
    this._updateStatistics(imagePath, 'processed', processingResult);
    
    // Log with timestamp
    this._addLogEntry('success', `Processed: ${imagePath}`, { processingResult });
    
    console.log(`✓ Processed: ${imagePath}`);
    
    if (processingResult && processingResult.preservationResult && !processingResult.preservationResult.isPreserved) {
      console.log(`  ⚠️  Preservation issues: ${processingResult.preservationResult.issues.join(', ')}`);
    }
  }

  /**
   * Records a skipped image
   * @param {string} imagePath - Path to skipped image
   * @param {string} reason - Reason for skipping
   */
  recordSkipped(imagePath, reason) {
    this.results.skipped++;
    
    // Track skip reasons
    this.results.statistics.skippedReasons[reason] = (this.results.statistics.skippedReasons[reason] || 0) + 1;
    
    // Update statistics
    this._updateStatistics(imagePath, 'skipped', { reason });
    
    // Log with timestamp
    this._addLogEntry('skip', `Skipped: ${imagePath}`, { reason });
    
    console.log(`⊘ Skipped: ${imagePath} (${reason})`);
  }

  /**
   * Records an error during processing
   * @param {string} imagePath - Path to image that failed
   * @param {string} error - Error message
   * @param {Object} errorContext - Additional error context
   */
  logError(imagePath, error, errorContext = {}) {
    this.results.errors++;
    
    // Categorize error
    const errorCategory = this._categorizeError(error);
    this.results.statistics.errorCategories[errorCategory] = (this.results.statistics.errorCategories[errorCategory] || 0) + 1;
    
    const errorDetail = {
      file: imagePath,
      error: error,
      category: errorCategory,
      timestamp: new Date().toISOString(),
      context: errorContext,
      troubleshooting: this._generateTroubleshootingInfo(error, errorCategory)
    };
    
    this.results.errorDetails.push(errorDetail);
    
    // Update statistics
    this._updateStatistics(imagePath, 'error', { error, category: errorCategory });
    
    // Log with timestamp
    this._addLogEntry('error', `Error: ${imagePath} - ${error}`, errorDetail);
    
    console.error(`✗ Error: ${imagePath} - ${error}`);
  }

  /**
   * Sets total number of images found
   * @param {number} total - Total image count
   */
  setTotal(total) {
    this.results.totalImages = total;
  }

  /**
   * Generates final processing report
   * @returns {Object} Processing results summary
   */
  generateReport() {
    if (this.startTime) {
      this.results.processingTime = Date.now() - this.startTime;
    }

    const report = {
      ...this.results,
      processingTimeFormatted: this._formatTime(this.results.processingTime),
      successRate: this.results.totalImages > 0 
        ? ((this.results.processed / this.results.totalImages) * 100).toFixed(1) + '%'
        : '0%'
    };

    return report;
  }

  /**
   * Exports results to a file
   * @param {string} outputPath - Path to save report
   * @returns {Promise<void>}
   */
  async exportResults(outputPath = 'watermarking-report.json') {
    const report = this.generateReport();
    const reportJson = JSON.stringify(report, null, 2);
    
    await writeFile(outputPath, reportJson);
    console.log(`\n📊 Report saved to: ${outputPath}`);
  }

  /**
   * Prints summary to console
   */
  printSummary() {
    const report = this.generateReport();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎨 WATERMARKING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Total Images Found: ${report.totalImages}`);
    console.log(`Successfully Processed: ${report.processed}`);
    console.log(`Skipped: ${report.skipped}`);
    console.log(`Errors: ${report.errors}`);
    console.log(`Success Rate: ${report.successRate}`);
    console.log(`Processing Time: ${report.processingTimeFormatted}`);
    
    // Print detailed statistics
    if (report.statistics) {
      console.log('\n📊 DETAILED STATISTICS:');
      
      // Format breakdown
      if (Object.keys(report.statistics.formatBreakdown).length > 0) {
        console.log('  Format Breakdown:');
        Object.entries(report.statistics.formatBreakdown).forEach(([format, count]) => {
          console.log(`    • ${format.toUpperCase()}: ${count} images`);
        });
      }
      
      // Size breakdown
      if (Object.keys(report.statistics.sizeBreakdown).length > 0) {
        console.log('  Size Breakdown:');
        Object.entries(report.statistics.sizeBreakdown).forEach(([category, count]) => {
          console.log(`    • ${category}: ${count} images`);
        });
      }
      
      // Processing performance
      if (report.statistics.processingTimes.length > 0) {
        console.log(`  Average Processing Time: ${this._formatTime(report.statistics.averageProcessingTime)}`);
        
        if (report.statistics.largestImage) {
          const largest = report.statistics.largestImage;
          console.log(`  Largest Image: ${largest.width}x${largest.height} (${largest.path})`);
        }
        
        if (report.statistics.smallestImage) {
          const smallest = report.statistics.smallestImage;
          console.log(`  Smallest Image: ${smallest.width}x${smallest.height} (${smallest.path})`);
        }
      }
      
      // Skip reasons
      if (Object.keys(report.statistics.skippedReasons).length > 0) {
        console.log('  Skip Reasons:');
        Object.entries(report.statistics.skippedReasons).forEach(([reason, count]) => {
          console.log(`    • ${reason}: ${count} images`);
        });
      }
      
      // Error categories
      if (Object.keys(report.statistics.errorCategories).length > 0) {
        console.log('  Error Categories:');
        Object.entries(report.statistics.errorCategories).forEach(([category, count]) => {
          console.log(`    • ${category}: ${count} errors`);
        });
      }
    }
    
    // Print consistency results if available
    if (report.consistencyResults) {
      console.log('\n🔍 CONSISTENCY VALIDATION:');
      if (report.consistencyResults.isConsistent) {
        console.log('  ✅ All images processed with consistent configuration');
      } else {
        console.log('  ⚠️  Consistency issues detected:');
        console.log(`    • Position variations: ${report.consistencyResults.statistics.positionVariations}`);
        console.log(`    • Sizing variations: ${report.consistencyResults.statistics.sizingVariations}`);
        console.log(`    • Styling variations: ${report.consistencyResults.statistics.stylingVariations}`);
        console.log(`    • Path issues: ${report.consistencyResults.statistics.pathIssues}`);
      }
    }

    // Print reference validation results if available
    if (report.referenceValidation) {
      console.log('\n🔗 REFERENCE VALIDATION:');
      
      // Path consistency
      if (report.referenceValidation.pathValidation.pathsUnchanged) {
        console.log('  ✅ File paths remain unchanged after processing');
      } else {
        console.log('  ⚠️  Path consistency issues:');
        report.referenceValidation.pathValidation.changedPaths.forEach(change => {
          console.log(`    • ${change.status}: ${change.original || change.processed}`);
        });
      }
      
      // Reference functionality
      if (report.referenceValidation.referenceValidation.valid) {
        console.log('  ✅ All image references remain functional');
      } else {
        console.log('  ⚠️  Broken references detected:');
        report.referenceValidation.referenceValidation.brokenReferences.forEach(ref => {
          console.log(`    • ${ref.imagePath} (in ${ref.reference.sourceFile})`);
        });
      }
      
      // Reference summary
      const refSummary = report.referenceValidation.referenceSummary;
      console.log(`  📊 Found ${refSummary.totalReferences} references across ${refSummary.totalImages} images`);
    }
    
    if (report.errorDetails.length > 0) {
      console.log('\n❌ ERRORS WITH TROUBLESHOOTING:');
      report.errorDetails.forEach(error => {
        console.log(`  • ${error.file}: ${error.error}`);
        if (error.troubleshooting && error.troubleshooting.suggestions) {
          console.log(`    Category: ${error.category}`);
          console.log(`    Suggestions:`);
          error.troubleshooting.suggestions.forEach(suggestion => {
            console.log(`      - ${suggestion}`);
          });
        }
      });
    }
    
    console.log('='.repeat(50));
  }

  /**
   * Gets list of successfully processed images
   * @returns {Array<string>} Array of processed image paths
   */
  getProcessedImages() {
    return [...this.results.processedImages];
  }

  /**
   * Adds consistency validation results to the report
   * @param {Object} consistencyResults - Consistency validation results
   */
  addConsistencyResults(consistencyResults) {
    this.results.consistencyResults = consistencyResults;
  }

  /**
   * Adds reference validation results to the report
   * @param {Object} referenceValidation - Reference validation results
   */
  addReferenceValidation(referenceValidation) {
    this.results.referenceValidation = referenceValidation;
  }

  /**
   * Updates detailed statistics for processed images
   * @private
   */
  _updateStatistics(imagePath, action, details = {}) {
    const ext = imagePath.split('.').pop().toLowerCase();
    
    // Track format breakdown
    this.results.statistics.formatBreakdown[ext] = (this.results.statistics.formatBreakdown[ext] || 0) + 1;
    
    // Track processing times if available
    if (details.processingResult && details.processingResult.processingTime) {
      this.results.statistics.processingTimes.push(details.processingResult.processingTime);
      
      // Calculate average processing time
      const times = this.results.statistics.processingTimes;
      this.results.statistics.averageProcessingTime = times.reduce((a, b) => a + b, 0) / times.length;
    }
    
    // Track image sizes if available
    if (details.processingResult && details.processingResult.metadata) {
      const { width, height } = details.processingResult.metadata;
      const size = width * height;
      
      if (!this.results.statistics.largestImage || size > this.results.statistics.largestImage.size) {
        this.results.statistics.largestImage = { path: imagePath, size, width, height };
      }
      
      if (!this.results.statistics.smallestImage || size < this.results.statistics.smallestImage.size) {
        this.results.statistics.smallestImage = { path: imagePath, size, width, height };
      }
      
      // Categorize by size
      const sizeCategory = this._getSizeCategory(size);
      this.results.statistics.sizeBreakdown[sizeCategory] = (this.results.statistics.sizeBreakdown[sizeCategory] || 0) + 1;
    }
  }

  /**
   * Categorizes errors for better reporting
   * @private
   */
  _categorizeError(error) {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('permission') || errorLower.includes('access')) {
      return 'Permission Error';
    } else if (errorLower.includes('corrupt') || errorLower.includes('invalid') || errorLower.includes('malformed')) {
      return 'Corrupted File';
    } else if (errorLower.includes('memory') || errorLower.includes('heap')) {
      return 'Memory Error';
    } else if (errorLower.includes('format') || errorLower.includes('unsupported')) {
      return 'Format Error';
    } else if (errorLower.includes('network') || errorLower.includes('timeout')) {
      return 'Network Error';
    } else if (errorLower.includes('space') || errorLower.includes('disk')) {
      return 'Storage Error';
    } else {
      return 'Processing Error';
    }
  }

  /**
   * Generates troubleshooting information for errors
   * @private
   */
  _generateTroubleshootingInfo(error, category) {
    const troubleshooting = {
      category,
      suggestions: []
    };

    switch (category) {
      case 'Permission Error':
        troubleshooting.suggestions = [
          'Check file permissions and ensure read/write access',
          'Run the script with appropriate user privileges',
          'Verify the file is not locked by another process'
        ];
        break;
      case 'Corrupted File':
        troubleshooting.suggestions = [
          'Verify the image file is not corrupted',
          'Try opening the file in an image viewer',
          'Check if the file was properly downloaded/transferred',
          'Consider re-obtaining the original image'
        ];
        break;
      case 'Memory Error':
        troubleshooting.suggestions = [
          'Process images in smaller batches',
          'Increase available system memory',
          'Close other memory-intensive applications',
          'Consider processing large images separately'
        ];
        break;
      case 'Format Error':
        troubleshooting.suggestions = [
          'Verify the image format is supported (JPG, PNG, WebP, SVG)',
          'Check if the file extension matches the actual format',
          'Convert the image to a supported format if needed'
        ];
        break;
      case 'Storage Error':
        troubleshooting.suggestions = [
          'Free up disk space',
          'Check if the backup directory has sufficient space',
          'Verify write permissions to the target directory'
        ];
        break;
      default:
        troubleshooting.suggestions = [
          'Check the error message for specific details',
          'Verify the image file is accessible and valid',
          'Try processing the image individually to isolate the issue',
          'Check system resources and permissions'
        ];
    }

    return troubleshooting;
  }

  /**
   * Categorizes image size for statistics
   * @private
   */
  _getSizeCategory(pixelCount) {
    if (pixelCount < 100000) return 'Small (< 100K pixels)';
    if (pixelCount < 1000000) return 'Medium (100K - 1M pixels)';
    if (pixelCount < 5000000) return 'Large (1M - 5M pixels)';
    return 'Very Large (> 5M pixels)';
  }

  /**
   * Adds a detailed log entry with timestamp
   * @private
   */
  _addLogEntry(level, message, details = {}) {
    this.logEntries.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      sessionId: this.sessionId
    });
  }

  /**
   * Generates a unique session ID
   * @private
   */
  _generateSessionId() {
    return `watermark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Exports detailed logs to a file
   * @param {string} outputPath - Path to save detailed logs
   * @returns {Promise<void>}
   */
  async exportDetailedLogs(outputPath = 'watermarking-detailed-logs.json') {
    const detailedLogs = {
      sessionId: this.sessionId,
      startTime: this.startTime ? new Date(this.startTime).toISOString() : null,
      endTime: new Date().toISOString(),
      logEntries: this.logEntries,
      statistics: this.results.statistics
    };
    
    const logsJson = JSON.stringify(detailedLogs, null, 2);
    await writeFile(outputPath, logsJson);
    console.log(`📋 Detailed logs saved to: ${outputPath}`);
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
}