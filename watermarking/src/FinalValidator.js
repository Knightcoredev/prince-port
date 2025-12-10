/**
 * FinalValidator Module
 * Comprehensive validation for all processed images
 * Validates Requirements: 1.5, 2.4, 4.4
 */

import { ValidationEngine } from './ValidationEngine.js';
import { ImageDiscovery } from './ImageDiscovery.js';
import { ReferenceValidator } from './ReferenceValidator.js';
import { ProcessingConsistency } from './ProcessingConsistency.js';
import { ReportGenerator } from './ReportGenerator.js';
import { promises as fs } from 'fs';
import path from 'path';

export class FinalValidator {
  constructor() {
    this.validationEngine = new ValidationEngine();
    this.imageDiscovery = new ImageDiscovery();
    this.referenceValidator = new ReferenceValidator();
    this.processingConsistency = new ProcessingConsistency();
    this.reportGenerator = new ReportGenerator();
    
    this.validationResults = {
      totalImages: 0,
      validImages: 0,
      invalidImages: 0,
      duplicateWatermarks: 0,
      functionalityIssues: 0,
      consistencyIssues: 0,
      validationErrors: [],
      detailedResults: []
    };
  }

  /**
   * Run comprehensive validation on all processed images
   * @param {string} rootPath - Root directory to validate
   * @param {string[]} processedImagePaths - Array of processed image paths
   * @returns {Promise<Object>} Comprehensive validation results
   */
  async validateAllProcessedImages(rootPath = '../', processedImagePaths = null) {
    console.log('🔍 Starting comprehensive validation of processed images...');
    this.reportGenerator.startTiming();

    try {
      // Get list of processed images
      let imagesToValidate = processedImagePaths;
      
      if (!imagesToValidate) {
        // Load from previous processing report if available
        imagesToValidate = await this._loadProcessedImagesFromReport();
      }
      
      if (!imagesToValidate || imagesToValidate.length === 0) {
        // Discover all images and check which ones have watermarks
        console.log('📋 No processed image list found, discovering watermarked images...');
        const allImages = await this.imageDiscovery.findAllImages(rootPath);
        imagesToValidate = await this._findWatermarkedImages(allImages);
      }

      this.validationResults.totalImages = imagesToValidate.length;
      console.log(`📊 Found ${imagesToValidate.length} images to validate`);

      if (imagesToValidate.length === 0) {
        console.log('ℹ️  No processed images found to validate');
        return this.validationResults;
      }

      // Step 1: Validate image integrity and watermark presence
      console.log('\n🔍 Step 1: Validating image integrity and watermark presence...');
      await this._validateImageIntegrity(imagesToValidate);

      // Step 2: Check for duplicate watermarks
      console.log('\n🔍 Step 2: Checking for duplicate watermarks...');
      await this._checkDuplicateWatermarks(imagesToValidate);

      // Step 3: Validate functionality preservation
      console.log('\n🔍 Step 3: Validating functionality preservation...');
      await this._validateFunctionalityPreservation(rootPath, imagesToValidate);

      // Step 4: Validate processing consistency
      console.log('\n🔍 Step 4: Validating processing consistency...');
      await this._validateProcessingConsistency(imagesToValidate);

      // Generate final validation report
      const finalReport = this._generateValidationReport();
      
      console.log('\n✅ Comprehensive validation completed');
      return finalReport;

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      this.validationResults.validationErrors.push({
        type: 'system_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Validate image integrity and watermark presence
   * @private
   */
  async _validateImageIntegrity(imagePaths) {
    for (const imagePath of imagePaths) {
      try {
        // Validate image file integrity
        const validation = await this.validationEngine.validateImage(imagePath);
        
        if (!validation.isValid) {
          this.validationResults.invalidImages++;
          this.validationResults.validationErrors.push({
            type: 'integrity_failure',
            imagePath,
            message: `Image integrity validation failed: ${validation.error}`,
            timestamp: new Date().toISOString()
          });
          
          this.validationResults.detailedResults.push({
            imagePath,
            status: 'invalid',
            issues: [`Integrity failure: ${validation.error}`],
            hasWatermark: false,
            functionalityPreserved: false
          });
          
          console.log(`❌ ${imagePath} - Integrity validation failed: ${validation.error}`);
          continue;
        }

        // Check watermark presence
        const watermarkCheck = await this.validationEngine.checkWatermarkExists(imagePath);
        
        if (watermarkCheck.error) {
          this.validationResults.validationErrors.push({
            type: 'watermark_detection_error',
            imagePath,
            message: `Watermark detection failed: ${watermarkCheck.error}`,
            timestamp: new Date().toISOString()
          });
        }

        const hasWatermark = watermarkCheck.hasWatermark;
        
        if (hasWatermark) {
          this.validationResults.validImages++;
          console.log(`✅ ${imagePath} - Valid with watermark`);
        } else {
          this.validationResults.invalidImages++;
          this.validationResults.validationErrors.push({
            type: 'missing_watermark',
            imagePath,
            message: 'Expected watermark not found in processed image',
            timestamp: new Date().toISOString()
          });
          console.log(`⚠️  ${imagePath} - Missing expected watermark`);
        }

        this.validationResults.detailedResults.push({
          imagePath,
          status: hasWatermark ? 'valid' : 'missing_watermark',
          issues: hasWatermark ? [] : ['Missing expected watermark'],
          hasWatermark,
          functionalityPreserved: null, // Will be set in functionality validation
          metadata: validation.metadata
        });

      } catch (error) {
        this.validationResults.invalidImages++;
        this.validationResults.validationErrors.push({
          type: 'validation_error',
          imagePath,
          message: `Validation error: ${error.message}`,
          timestamp: new Date().toISOString()
        });
        
        console.log(`❌ ${imagePath} - Validation error: ${error.message}`);
      }
    }
  }

  /**
   * Check for duplicate watermarks on images
   * @private
   */
  async _checkDuplicateWatermarks(imagePaths) {
    for (const imagePath of imagePaths) {
      try {
        // Use a more sophisticated duplicate detection method
        const duplicateCheck = await this._detectDuplicateWatermarks(imagePath);
        
        if (duplicateCheck.hasDuplicates) {
          this.validationResults.duplicateWatermarks++;
          this.validationResults.validationErrors.push({
            type: 'duplicate_watermark',
            imagePath,
            message: `Duplicate watermarks detected: ${duplicateCheck.details}`,
            timestamp: new Date().toISOString()
          });
          
          // Update detailed results
          const result = this.validationResults.detailedResults.find(r => r.imagePath === imagePath);
          if (result) {
            result.issues.push(`Duplicate watermarks: ${duplicateCheck.details}`);
            result.status = 'duplicate_watermarks';
          }
          
          console.log(`⚠️  ${imagePath} - Duplicate watermarks detected: ${duplicateCheck.details}`);
        } else {
          console.log(`✅ ${imagePath} - No duplicate watermarks`);
        }

      } catch (error) {
        this.validationResults.validationErrors.push({
          type: 'duplicate_check_error',
          imagePath,
          message: `Duplicate watermark check failed: ${error.message}`,
          timestamp: new Date().toISOString()
        });
        
        console.log(`⚠️  ${imagePath} - Duplicate check failed: ${error.message}`);
      }
    }
  }

  /**
   * Validate that functionality is preserved after processing
   * @private
   */
  async _validateFunctionalityPreservation(rootPath, imagePaths) {
    try {
      // Scan for image references
      await this.referenceValidator.scanCodeFilesForImageReferences(rootPath);
      
      // Validate that processed images maintain functionality
      const referenceValidation = await this.referenceValidator.validateProcessedImageReferences(imagePaths, rootPath);
      
      if (!referenceValidation.valid) {
        this.validationResults.functionalityIssues = referenceValidation.brokenReferences.length;
        
        referenceValidation.brokenReferences.forEach(ref => {
          this.validationResults.validationErrors.push({
            type: 'functionality_issue',
            imagePath: ref.imagePath,
            message: `Broken reference: ${ref.issue} (in ${ref.reference.sourceFile})`,
            timestamp: new Date().toISOString(),
            sourceFile: ref.reference.sourceFile,
            referenceType: ref.reference.type
          });
          
          // Update detailed results
          const result = this.validationResults.detailedResults.find(r => r.imagePath === ref.imagePath);
          if (result) {
            result.issues.push(`Broken reference in ${ref.reference.sourceFile}`);
            result.functionalityPreserved = false;
          }
          
          console.log(`❌ ${ref.imagePath} - Broken reference in ${ref.reference.sourceFile}: ${ref.issue}`);
        });
      } else {
        console.log('✅ All image references remain functional');
        
        // Mark all images as having preserved functionality
        this.validationResults.detailedResults.forEach(result => {
          if (result.functionalityPreserved === null) {
            result.functionalityPreserved = true;
          }
        });
      }

    } catch (error) {
      this.validationResults.validationErrors.push({
        type: 'functionality_validation_error',
        message: `Functionality validation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`⚠️  Functionality validation failed: ${error.message}`);
    }
  }

  /**
   * Validate processing consistency across all images
   * @private
   */
  async _validateProcessingConsistency(imagePaths) {
    try {
      const consistencyResults = await this.processingConsistency.validateProcessingConsistency(imagePaths);
      
      if (!consistencyResults.isConsistent) {
        this.validationResults.consistencyIssues = consistencyResults.inconsistencies.length;
        
        consistencyResults.inconsistencies.forEach(issue => {
          this.validationResults.validationErrors.push({
            type: 'consistency_issue',
            message: issue,
            timestamp: new Date().toISOString()
          });
        });
        
        console.log('⚠️  Processing consistency issues detected:');
        consistencyResults.inconsistencies.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      } else {
        console.log('✅ Processing consistency validated successfully');
      }

    } catch (error) {
      this.validationResults.validationErrors.push({
        type: 'consistency_validation_error',
        message: `Consistency validation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`⚠️  Consistency validation failed: ${error.message}`);
    }
  }

  /**
   * Detect duplicate watermarks on a single image
   * @private
   */
  async _detectDuplicateWatermarks(imagePath) {
    try {
      // For SVG files, check for multiple P.F.O occurrences
      if (path.extname(imagePath).toLowerCase() === '.svg') {
        const content = await fs.readFile(imagePath, 'utf8');
        const pfoMatches = (content.match(/P\.F\.O/g) || []).length;
        const pfoAltMatches = (content.match(/P F O/g) || []).length;
        const pfoSimpleMatches = (content.match(/PFO/g) || []).length;
        
        const totalMatches = pfoMatches + pfoAltMatches + pfoSimpleMatches;
        
        if (totalMatches > 1) {
          return {
            hasDuplicates: true,
            details: `Found ${totalMatches} watermark instances in SVG`
          };
        }
      } else {
        // For raster images, analyze multiple corner regions for watermark patterns
        const sharp = (await import('sharp')).default;
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        
        // Check all four corners for watermark patterns
        const corners = [
          { name: 'bottom-right', left: Math.floor(metadata.width * 0.8), top: Math.floor(metadata.height * 0.8) },
          { name: 'bottom-left', left: 0, top: Math.floor(metadata.height * 0.8) },
          { name: 'top-right', left: Math.floor(metadata.width * 0.8), top: 0 },
          { name: 'top-left', left: 0, top: 0 }
        ];
        
        let watermarkCorners = 0;
        
        for (const corner of corners) {
          const cornerWidth = Math.floor(metadata.width * 0.2);
          const cornerHeight = Math.floor(metadata.height * 0.2);
          
          try {
            const cornerBuffer = await image
              .extract({ 
                left: corner.left, 
                top: corner.top, 
                width: cornerWidth, 
                height: cornerHeight 
              })
              .raw()
              .toBuffer();
            
            const hasWatermarkPattern = this.validationEngine.analyzeCornerForWatermark(cornerBuffer, cornerWidth, cornerHeight);
            
            if (hasWatermarkPattern) {
              watermarkCorners++;
            }
          } catch (extractError) {
            // Skip this corner if extraction fails
            continue;
          }
        }
        
        if (watermarkCorners > 1) {
          return {
            hasDuplicates: true,
            details: `Found watermark patterns in ${watermarkCorners} corners`
          };
        }
      }
      
      return { hasDuplicates: false };
      
    } catch (error) {
      throw new Error(`Duplicate detection failed: ${error.message}`);
    }
  }

  /**
   * Load processed images from previous report
   * @private
   */
  async _loadProcessedImagesFromReport() {
    try {
      const reportPath = path.join(process.cwd(), 'watermarking-report.json');
      const reportContent = await fs.readFile(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      return report.processedImages || [];
    } catch (error) {
      console.log('ℹ️  No previous processing report found');
      return null;
    }
  }

  /**
   * Find images that have watermarks
   * @private
   */
  async _findWatermarkedImages(allImages) {
    const watermarkedImages = [];
    
    console.log('🔍 Checking images for existing watermarks...');
    
    for (const imageInfo of allImages) {
      const imagePath = imageInfo.path || imageInfo;
      
      try {
        const watermarkCheck = await this.validationEngine.checkWatermarkExists(imagePath);
        
        if (watermarkCheck.hasWatermark) {
          watermarkedImages.push(imagePath);
        }
      } catch (error) {
        // Skip images that can't be checked
        continue;
      }
    }
    
    return watermarkedImages;
  }

  /**
   * Generate comprehensive validation report
   * @private
   */
  _generateValidationReport() {
    const processingTime = Date.now() - this.reportGenerator.startTime;
    
    const report = {
      ...this.validationResults,
      processingTime,
      processingTimeFormatted: this._formatTime(processingTime),
      timestamp: new Date().toISOString(),
      summary: {
        validationPassed: this.validationResults.validationErrors.length === 0,
        successRate: this.validationResults.totalImages > 0 
          ? ((this.validationResults.validImages / this.validationResults.totalImages) * 100).toFixed(1) + '%'
          : '0%',
        criticalIssues: this.validationResults.duplicateWatermarks + this.validationResults.functionalityIssues,
        totalIssues: this.validationResults.validationErrors.length
      }
    };

    return report;
  }

  /**
   * Print validation summary to console
   */
  printValidationSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 FINAL VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Images Validated: ${report.totalImages}`);
    console.log(`Valid Images: ${report.validImages}`);
    console.log(`Invalid Images: ${report.invalidImages}`);
    console.log(`Duplicate Watermarks: ${report.duplicateWatermarks}`);
    console.log(`Functionality Issues: ${report.functionalityIssues}`);
    console.log(`Consistency Issues: ${report.consistencyIssues}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`Processing Time: ${report.processingTimeFormatted}`);
    
    if (report.summary.validationPassed) {
      console.log('\n✅ VALIDATION PASSED - All processed images are valid');
    } else {
      console.log('\n⚠️  VALIDATION ISSUES DETECTED');
      console.log(`   Critical Issues: ${report.summary.criticalIssues}`);
      console.log(`   Total Issues: ${report.summary.totalIssues}`);
      
      // Group errors by type
      const errorsByType = {};
      report.validationErrors.forEach(error => {
        if (!errorsByType[error.type]) {
          errorsByType[error.type] = [];
        }
        errorsByType[error.type].push(error);
      });
      
      console.log('\n📋 ISSUES BY TYPE:');
      Object.entries(errorsByType).forEach(([type, errors]) => {
        console.log(`  ${type}: ${errors.length} issues`);
        errors.slice(0, 3).forEach(error => {
          console.log(`    - ${error.imagePath || 'System'}: ${error.message}`);
        });
        if (errors.length > 3) {
          console.log(`    ... and ${errors.length - 3} more`);
        }
      });
    }
    
    console.log('='.repeat(60));
  }

  /**
   * Export validation results to file
   */
  async exportValidationResults(outputPath = 'final-validation-report.json') {
    const report = this._generateValidationReport();
    const reportJson = JSON.stringify(report, null, 2);
    
    await fs.writeFile(outputPath, reportJson);
    console.log(`📊 Final validation report saved to: ${outputPath}`);
    
    return report;
  }

  /**
   * Format milliseconds to human readable time
   * @private
   */
  _formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
}