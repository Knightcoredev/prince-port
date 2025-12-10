/**
 * ProcessingConsistency Module
 * Ensures uniform watermark positioning, styling, and image preservation
 */

import { ValidationEngine } from './ValidationEngine.js';
import path from 'path';

export class ProcessingConsistency {
  constructor(config = {}) {
    this.config = {
      // Consistent positioning rules
      position: 'bottom-right',
      padding: 20,
      paddingRatio: 0.02, // 2% of image dimensions as minimum padding
      
      // Consistent sizing rules
      fontSizeRatio: 0.05, // 5% of image width
      minFontSize: 24,
      maxFontSize: 72,
      aspectRatioTolerance: 0.1, // 10% tolerance for aspect ratio variations
      
      // Consistent styling rules
      baseColor: 'rgba(255, 255, 255, 0.8)',
      baseShadow: {
        blur: 2,
        color: 'rgba(0, 0, 0, 0.5)',
        offset: { x: 2, y: 2 }
      },
      
      // Path preservation rules
      preserveExtension: true,
      preserveDirectory: true,
      preserveFilename: true,
      
      ...config
    };
    
    this.validationEngine = new ValidationEngine();
    this.processingHistory = new Map(); // Track processing consistency
  }

  /**
   * Calculates consistent watermark configuration for an image
   * @param {Object} imageMetadata - Image metadata from Sharp
   * @param {string} imagePath - Path to the image file
   * @returns {Object} Consistent watermark configuration
   */
  calculateConsistentConfig(imageMetadata, imagePath) {
    const { width, height, format } = imageMetadata;
    
    // Calculate consistent dimensions
    const dimensions = this._calculateConsistentDimensions(width, height);
    
    // Calculate consistent position
    const position = this._calculateConsistentPosition(width, height, dimensions);
    
    // Calculate consistent styling
    const styling = this._calculateConsistentStyling(width, height, format);
    
    // Generate path preservation info
    const pathInfo = this._generatePathPreservationInfo(imagePath);
    
    const config = {
      dimensions,
      position,
      styling,
      pathInfo,
      imageMetadata: { width, height, format },
      timestamp: new Date().toISOString()
    };
    
    // Store in processing history for consistency tracking
    this.processingHistory.set(imagePath, config);
    
    return config;
  }

  /**
   * Validates processing consistency across multiple images
   * @param {Array<string>} imagePaths - Array of processed image paths
   * @returns {Promise<Object>} Consistency validation results
   */
  async validateProcessingConsistency(imagePaths) {
    const results = {
      isConsistent: true,
      inconsistencies: [],
      statistics: {
        totalImages: imagePaths.length,
        positionVariations: 0,
        sizingVariations: 0,
        stylingVariations: 0,
        pathIssues: 0
      }
    };

    const configurations = [];
    
    // Collect all configurations
    for (const imagePath of imagePaths) {
      if (this.processingHistory.has(imagePath)) {
        configurations.push({
          path: imagePath,
          config: this.processingHistory.get(imagePath)
        });
      }
    }

    if (configurations.length < 2) {
      return results; // Need at least 2 images to compare consistency
    }

    // Validate position consistency
    const positionConsistency = this._validatePositionConsistency(configurations);
    if (!positionConsistency.isConsistent) {
      results.isConsistent = false;
      results.inconsistencies.push(...positionConsistency.issues);
      results.statistics.positionVariations = positionConsistency.variations;
    }

    // Validate sizing consistency
    const sizingConsistency = this._validateSizingConsistency(configurations);
    if (!sizingConsistency.isConsistent) {
      results.isConsistent = false;
      results.inconsistencies.push(...sizingConsistency.issues);
      results.statistics.sizingVariations = sizingConsistency.variations;
    }

    // Validate styling consistency
    const stylingConsistency = this._validateStylingConsistency(configurations);
    if (!stylingConsistency.isConsistent) {
      results.isConsistent = false;
      results.inconsistencies.push(...stylingConsistency.issues);
      results.statistics.stylingVariations = stylingConsistency.variations;
    }

    // Validate path preservation
    const pathConsistency = await this._validatePathPreservation(imagePaths);
    if (!pathConsistency.isConsistent) {
      results.isConsistent = false;
      results.inconsistencies.push(...pathConsistency.issues);
      results.statistics.pathIssues = pathConsistency.issues.length;
    }

    return results;
  }

  /**
   * Ensures image dimensions and paths are preserved after processing
   * @param {string} originalPath - Original image path
   * @param {Object} originalMetadata - Original image metadata
   * @returns {Promise<Object>} Preservation validation result
   */
  async validateImagePreservation(originalPath, originalMetadata) {
    try {
      // Validate file still exists at original path
      const validation = await this.validationEngine.validateImage(originalPath);
      if (!validation.isValid) {
        return {
          isPreserved: false,
          issues: [`Image no longer valid at original path: ${originalPath}`]
        };
      }

      const currentMetadata = validation.metadata;
      const issues = [];

      // Check dimension preservation
      if (currentMetadata.width !== originalMetadata.width) {
        issues.push(`Width changed from ${originalMetadata.width} to ${currentMetadata.width}`);
      }
      
      if (currentMetadata.height !== originalMetadata.height) {
        issues.push(`Height changed from ${originalMetadata.height} to ${currentMetadata.height}`);
      }

      // Check format preservation (for non-SVG files)
      if (originalMetadata.format !== 'svg' && currentMetadata.format !== originalMetadata.format) {
        issues.push(`Format changed from ${originalMetadata.format} to ${currentMetadata.format}`);
      }

      return {
        isPreserved: issues.length === 0,
        issues,
        originalMetadata,
        currentMetadata
      };
    } catch (error) {
      return {
        isPreserved: false,
        issues: [`Validation error: ${error.message}`]
      };
    }
  }

  /**
   * Gets processing statistics for consistency analysis
   * @returns {Object} Processing statistics
   */
  getProcessingStatistics() {
    const configs = Array.from(this.processingHistory.values());
    
    if (configs.length === 0) {
      return { totalProcessed: 0 };
    }

    // Calculate statistics
    const fontSizes = configs.map(c => c.dimensions.fontSize);
    const paddingValues = configs.map(c => c.position.padding);
    const imageWidths = configs.map(c => c.imageMetadata.width);
    const imageHeights = configs.map(c => c.imageMetadata.height);

    return {
      totalProcessed: configs.length,
      fontSizeRange: {
        min: Math.min(...fontSizes),
        max: Math.max(...fontSizes),
        avg: fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length
      },
      paddingRange: {
        min: Math.min(...paddingValues),
        max: Math.max(...paddingValues),
        avg: paddingValues.reduce((a, b) => a + b, 0) / paddingValues.length
      },
      imageDimensionsRange: {
        width: { min: Math.min(...imageWidths), max: Math.max(...imageWidths) },
        height: { min: Math.min(...imageHeights), max: Math.max(...imageHeights) }
      },
      formatDistribution: this._calculateFormatDistribution(configs)
    };
  }

  /**
   * Calculates consistent dimensions based on image size
   * @private
   */
  _calculateConsistentDimensions(imageWidth, imageHeight) {
    // Calculate font size using consistent ratio
    const baseFontSize = Math.floor(imageWidth * this.config.fontSizeRatio);
    const fontSize = Math.max(
      this.config.minFontSize, 
      Math.min(baseFontSize, this.config.maxFontSize)
    );

    // Calculate watermark container dimensions with consistent ratios
    const textWidth = fontSize * 2.8; // P.F.O character width ratio
    const textHeight = fontSize * 1.2; // Height ratio
    
    // Add consistent padding around text
    const width = Math.ceil(textWidth + (fontSize * 0.4));
    const height = Math.ceil(textHeight + (fontSize * 0.3));

    return {
      width,
      height,
      fontSize,
      textWidth,
      textHeight,
      fontSizeRatio: fontSize / imageWidth // Store actual ratio for consistency checking
    };
  }

  /**
   * Calculates consistent position with adaptive padding
   * @private
   */
  _calculateConsistentPosition(imageWidth, imageHeight, dimensions) {
    // Use adaptive padding based on image size
    const adaptivePadding = Math.max(
      this.config.padding,
      Math.floor(Math.min(imageWidth, imageHeight) * this.config.paddingRatio)
    );

    // Consistent bottom-right positioning
    const left = imageWidth - dimensions.width - adaptivePadding;
    const top = imageHeight - dimensions.height - adaptivePadding;

    return {
      top: Math.max(0, top),
      left: Math.max(0, left),
      padding: adaptivePadding,
      paddingRatio: adaptivePadding / Math.min(imageWidth, imageHeight) // Store ratio for consistency
    };
  }

  /**
   * Calculates consistent styling parameters
   * @private
   */
  _calculateConsistentStyling(imageWidth, imageHeight, format) {
    // Base styling that remains consistent
    const baseStyle = {
      textColor: this.config.baseColor,
      shadowColor: this.config.baseShadow.color,
      shadowBlur: this.config.baseShadow.blur,
      shadowOffset: { ...this.config.baseShadow.offset }
    };

    // Adjust shadow size proportionally for very large or small images
    const imageArea = imageWidth * imageHeight;
    const scaleFactor = Math.sqrt(imageArea / (1920 * 1080)); // Normalize to 1080p
    
    return {
      ...baseStyle,
      shadowBlur: Math.max(1, Math.round(baseStyle.shadowBlur * scaleFactor)),
      shadowOffset: {
        x: Math.max(1, Math.round(baseStyle.shadowOffset.x * scaleFactor)),
        y: Math.max(1, Math.round(baseStyle.shadowOffset.y * scaleFactor))
      },
      scaleFactor // Store for consistency checking
    };
  }

  /**
   * Generates path preservation information
   * @private
   */
  _generatePathPreservationInfo(imagePath) {
    const parsedPath = path.parse(imagePath);
    
    return {
      originalPath: imagePath,
      directory: parsedPath.dir,
      filename: parsedPath.name,
      extension: parsedPath.ext,
      fullPath: imagePath
    };
  }

  /**
   * Validates position consistency across configurations
   * @private
   */
  _validatePositionConsistency(configurations) {
    const paddingRatios = configurations.map(c => c.config.position.paddingRatio);
    const avgPaddingRatio = paddingRatios.reduce((a, b) => a + b, 0) / paddingRatios.length;
    
    const issues = [];
    let variations = 0;

    configurations.forEach(({ path, config }) => {
      const deviation = Math.abs(config.position.paddingRatio - avgPaddingRatio);
      if (deviation > this.config.aspectRatioTolerance) {
        issues.push(`Position inconsistency in ${path}: padding ratio ${config.position.paddingRatio} deviates from average ${avgPaddingRatio}`);
        variations++;
      }
    });

    return {
      isConsistent: issues.length === 0,
      issues,
      variations
    };
  }

  /**
   * Validates sizing consistency across configurations
   * @private
   */
  _validateSizingConsistency(configurations) {
    const fontSizeRatios = configurations.map(c => c.config.dimensions.fontSizeRatio);
    const avgFontSizeRatio = fontSizeRatios.reduce((a, b) => a + b, 0) / fontSizeRatios.length;
    
    const issues = [];
    let variations = 0;

    configurations.forEach(({ path, config }) => {
      const deviation = Math.abs(config.dimensions.fontSizeRatio - avgFontSizeRatio);
      if (deviation > this.config.aspectRatioTolerance) {
        issues.push(`Sizing inconsistency in ${path}: font size ratio ${config.dimensions.fontSizeRatio} deviates from average ${avgFontSizeRatio}`);
        variations++;
      }
    });

    return {
      isConsistent: issues.length === 0,
      issues,
      variations
    };
  }

  /**
   * Validates styling consistency across configurations
   * @private
   */
  _validateStylingConsistency(configurations) {
    const scaleFactors = configurations.map(c => c.config.styling.scaleFactor);
    const avgScaleFactor = scaleFactors.reduce((a, b) => a + b, 0) / scaleFactors.length;
    
    const issues = [];
    let variations = 0;

    configurations.forEach(({ path, config }) => {
      const deviation = Math.abs(config.styling.scaleFactor - avgScaleFactor);
      if (deviation > this.config.aspectRatioTolerance) {
        issues.push(`Styling inconsistency in ${path}: scale factor ${config.styling.scaleFactor} deviates from average ${avgScaleFactor}`);
        variations++;
      }
    });

    return {
      isConsistent: issues.length === 0,
      issues,
      variations
    };
  }

  /**
   * Validates path preservation across processed images
   * @private
   */
  async _validatePathPreservation(imagePaths) {
    const issues = [];
    
    for (const imagePath of imagePaths) {
      try {
        const validation = await this.validationEngine.validateImage(imagePath);
        if (!validation.isValid) {
          issues.push(`Path preservation failed: ${imagePath} is no longer valid`);
        }
      } catch (error) {
        issues.push(`Path validation error for ${imagePath}: ${error.message}`);
      }
    }

    return {
      isConsistent: issues.length === 0,
      issues
    };
  }

  /**
   * Calculates format distribution for statistics
   * @private
   */
  _calculateFormatDistribution(configs) {
    const distribution = {};
    configs.forEach(config => {
      const format = config.imageMetadata.format;
      distribution[format] = (distribution[format] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Clears processing history (useful for testing)
   */
  clearHistory() {
    this.processingHistory.clear();
  }

  /**
   * Gets processing history for a specific image
   * @param {string} imagePath - Path to image
   * @returns {Object|null} Processing configuration or null if not found
   */
  getProcessingHistory(imagePath) {
    return this.processingHistory.get(imagePath) || null;
  }
}