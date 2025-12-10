/**
 * WatermarkProcessor Module
 * Applies P.F.O watermarks using Sharp library with consistent processing
 */

import sharp from 'sharp';
import { ProcessingConsistency } from './ProcessingConsistency.js';

export class WatermarkProcessor {
  constructor(config = {}) {
    this.config = {
      text: 'P.F.O',
      position: 'bottom-right',
      padding: 20,
      fontSize: '5%', // Percentage of image width
      minFontSize: 24,
      color: 'rgba(255, 255, 255, 0.8)',
      shadow: {
        blur: 2,
        color: 'rgba(0, 0, 0, 0.5)'
      },
      ...config
    };
    
    // Initialize processing consistency manager
    this.consistencyManager = new ProcessingConsistency(config.consistency);
  }

  /**
   * Applies watermark to an image with consistent processing and adaptive styling
   * @param {string} imagePath - Path to image file
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result with consistency information
   */
  async applyWatermark(imagePath, options = {}) {
    // Read the image file into a buffer first to avoid file handle issues
    const fs = await import('fs/promises');
    const imageBuffer = await fs.readFile(imagePath);
    
    let image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Store original metadata for preservation validation
    const originalMetadata = { ...metadata };
    
    // Detect and validate image format
    const formatInfo = this._detectImageFormat(imagePath, metadata);
    if (!formatInfo.supported) {
      throw new Error(`Unsupported image format: ${formatInfo.format}`);
    }
    
    // Calculate consistent watermark configuration
    const consistentConfig = this.consistencyManager.calculateConsistentConfig(metadata, imagePath);
    
    // Use consistent dimensions and position
    const watermarkDimensions = consistentConfig.dimensions;
    const position = consistentConfig.position;
    
    // Analyze background for adaptive styling (while maintaining consistency)
    const backgroundAnalysis = await this._analyzeBackground(image, position, watermarkDimensions);
    const adaptiveStyle = this._calculateAdaptiveStyle(backgroundAnalysis, consistentConfig.styling);
    
    // Generate watermark buffer directly using Sharp instead of SVG
    const watermarkBuffer = await this._generateWatermarkBuffer(watermarkDimensions, adaptiveStyle);
    
    // Apply format-specific processing
    const processedBuffer = await this._processImageByFormat(
      image, 
      watermarkBuffer, 
      position, 
      formatInfo, 
      originalMetadata
    );
    
    // Ensure Sharp instance is properly closed before writing to file
    if (image) {
      image.destroy();
      image = null;
    }
    
    // Write the processed buffer to the original file (preserving path)
    await fs.writeFile(imagePath, processedBuffer);
    
    // Small delay to ensure file handle is released on Windows
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Validate image preservation
    const preservationResult = await this.consistencyManager.validateImagePreservation(imagePath, originalMetadata);
    
    return {
      success: true,
      imagePath,
      formatInfo,
      consistentConfig,
      preservationResult,
      originalMetadata,
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Generates watermark buffer directly using Sharp
   * @param {Object} dimensions - Watermark dimensions
   * @param {Object} adaptiveStyle - Adaptive styling options
   * @returns {Promise<Buffer>} Watermark buffer
   */
  async _generateWatermarkBuffer(dimensions, adaptiveStyle = {}) {
    const { width, height, fontSize } = dimensions;
    const {
      textColor = this.config.color,
      shadowColor = this.config.shadow.color,
      shadowBlur = this.config.shadow.blur,
      shadowOffset = { x: 2, y: 2 }
    } = adaptiveStyle;

    // Create a transparent PNG with the watermark text
    // For now, create a simple colored rectangle as watermark
    // This avoids SVG complexity and should preserve image dimensions
    const watermarkSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="transparent"/>
        <text x="50%" y="50%" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold"
              fill="${textColor}" 
              text-anchor="middle" 
              dominant-baseline="central"
              letter-spacing="1px">
          ${this.config.text}
        </text>
      </svg>
    `;

    // Convert SVG to PNG buffer using Sharp
    return await sharp(Buffer.from(watermarkSvg))
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();
  }

  /**
   * Generates P.F.O watermark SVG with adaptive styling
   * @param {Object} dimensions - Watermark dimensions object
   * @param {Object} adaptiveStyle - Adaptive styling parameters
   * @returns {string} SVG markup
   */
  _generateWatermarkSVG(dimensions, adaptiveStyle = {}) {
    const { width, height, fontSize } = dimensions;
    const {
      textColor = this.config.color,
      shadowColor = this.config.shadow.color,
      shadowBlur = this.config.shadow.blur,
      shadowOffset = { x: 2, y: 2 },
      useOutline = false,
      outlineColor = 'rgba(0, 0, 0, 0.8)',
      outlineWidth = 1
    } = adaptiveStyle;
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="${shadowOffset.x}" dy="${shadowOffset.y}" 
                         stdDeviation="${shadowBlur}" 
                         flood-color="${shadowColor}" 
                         flood-opacity="0.9"/>
          </filter>
          ${useOutline ? `
          <filter id="outline" x="-50%" y="-50%" width="200%" height="200%">
            <feMorphology operator="dilate" radius="${outlineWidth}"/>
            <feFlood flood-color="${outlineColor}"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          ` : ''}
        </defs>
        <rect width="100%" height="100%" fill="transparent"/>
        ${useOutline ? `
        <text x="50%" y="50%" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold"
              fill="${outlineColor}" 
              text-anchor="middle" 
              dominant-baseline="central"
              letter-spacing="1px"
              stroke="${outlineColor}"
              stroke-width="${outlineWidth}">
          ${this.config.text}
        </text>
        ` : ''}
        <text x="50%" y="50%" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold"
              fill="${textColor}" 
              text-anchor="middle" 
              dominant-baseline="central"
              filter="url(#shadow)"
              letter-spacing="1px">
          ${this.config.text}
        </text>
      </svg>
    `;
  }

  /**
   * Calculates watermark dimensions based on image size
   * @param {Object} metadata - Image metadata
   * @returns {Object} Watermark dimensions
   */
  _calculateWatermarkDimensions(metadata) {
    const { width: imageWidth, height: imageHeight } = metadata;
    
    // Calculate font size as percentage of image width, with min/max constraints
    const baseSize = Math.floor(imageWidth * 0.05); // 5% of width
    const fontSize = Math.max(this.config.minFontSize, Math.min(baseSize, 72)); // Max 72px
    
    // Calculate watermark container dimensions
    // P.F.O is roughly 3 characters wide, account for letter spacing
    const textWidth = fontSize * 2.8; // Adjusted for P.F.O character width
    const textHeight = fontSize * 1.2; // Height with some padding
    
    // Add padding around text for better visibility
    const width = Math.ceil(textWidth + (fontSize * 0.4));
    const height = Math.ceil(textHeight + (fontSize * 0.3));
    
    return {
      width,
      height,
      fontSize,
      textWidth,
      textHeight
    };
  }

  /**
   * Calculates optimal watermark position for bottom-right placement
   * @param {Object} metadata - Image metadata
   * @param {Object} dimensions - Watermark dimensions
   * @returns {Object} Position coordinates
   */
  _calculatePosition(metadata, dimensions) {
    const { width: imageWidth, height: imageHeight } = metadata;
    const { width: watermarkWidth, height: watermarkHeight } = dimensions;
    
    // Position in bottom-right corner with padding
    const left = imageWidth - watermarkWidth - this.config.padding;
    const top = imageHeight - watermarkHeight - this.config.padding;
    
    // Ensure watermark doesn't go outside image bounds
    return {
      top: Math.max(0, top),
      left: Math.max(0, left)
    };
  }

  /**
   * Analyzes background area where watermark will be placed
   * @param {Object} image - Sharp image object
   * @param {Object} position - Watermark position
   * @param {Object} dimensions - Watermark dimensions
   * @returns {Promise<Object>} Background analysis results
   */
  async _analyzeBackground(image, position, dimensions) {
    try {
      // Extract the region where watermark will be placed
      const region = await image
        .extract({
          left: position.left,
          top: position.top,
          width: dimensions.width,
          height: dimensions.height
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = region;
      const { channels } = info;
      
      // Calculate average brightness and contrast
      let totalBrightness = 0;
      let pixelCount = 0;
      const brightnesses = [];
      
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate luminance using standard formula
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        brightnesses.push(brightness);
        totalBrightness += brightness;
        pixelCount++;
      }
      
      const avgBrightness = totalBrightness / pixelCount;
      
      // Calculate contrast (standard deviation of brightness)
      const variance = brightnesses.reduce((sum, brightness) => {
        return sum + Math.pow(brightness - avgBrightness, 2);
      }, 0) / pixelCount;
      const contrast = Math.sqrt(variance);
      
      return {
        avgBrightness,
        contrast,
        isDark: avgBrightness < 0.5,
        isLight: avgBrightness > 0.7,
        hasLowContrast: contrast < 0.1,
        hasHighContrast: contrast > 0.3
      };
    } catch (error) {
      // Fallback to default analysis if extraction fails
      return {
        avgBrightness: 0.5,
        contrast: 0.2,
        isDark: false,
        isLight: false,
        hasLowContrast: false,
        hasHighContrast: false
      };
    }
  }

  /**
   * Calculates adaptive styling based on background analysis while maintaining consistency
   * @param {Object} backgroundAnalysis - Background analysis results
   * @param {Object} baseStyle - Base consistent styling from consistency manager
   * @returns {Object} Adaptive styling parameters
   */
  _calculateAdaptiveStyle(backgroundAnalysis, baseStyle = {}) {
    const {
      avgBrightness,
      contrast,
      isDark,
      isLight,
      hasLowContrast,
      hasHighContrast
    } = backgroundAnalysis;

    // Start with consistent base styling
    let textColor = baseStyle.textColor || this.config.color;
    let shadowColor = baseStyle.shadowColor || this.config.shadow.color;
    let shadowBlur = baseStyle.shadowBlur || this.config.shadow.blur;
    let shadowOffset = baseStyle.shadowOffset || { x: 2, y: 2 };
    let useOutline = false;
    let outlineColor = 'rgba(0, 0, 0, 0.8)';
    let outlineWidth = 1;

    // Adjust for dark backgrounds
    if (isDark) {
      textColor = 'rgba(255, 255, 255, 0.95)'; // More opaque white
      shadowColor = 'rgba(0, 0, 0, 0.8)'; // Stronger shadow
      shadowBlur = 3;
      shadowOffset = { x: 2, y: 2 };
    }
    
    // Adjust for light backgrounds
    if (isLight) {
      textColor = 'rgba(255, 255, 255, 0.9)'; // Slightly transparent white
      shadowColor = 'rgba(0, 0, 0, 0.9)'; // Very strong shadow
      shadowBlur = 4;
      shadowOffset = { x: 3, y: 3 };
      useOutline = true; // Add outline for better visibility
      outlineColor = 'rgba(0, 0, 0, 0.7)';
      outlineWidth = 1.5;
    }
    
    // Adjust for low contrast backgrounds
    if (hasLowContrast) {
      useOutline = true;
      outlineWidth = 2;
      shadowBlur = Math.max(shadowBlur, 4);
      
      if (avgBrightness > 0.5) {
        // Light low-contrast background
        outlineColor = 'rgba(0, 0, 0, 0.8)';
        textColor = 'rgba(255, 255, 255, 0.95)';
      } else {
        // Dark low-contrast background
        outlineColor = 'rgba(255, 255, 255, 0.3)';
        textColor = 'rgba(255, 255, 255, 0.95)';
      }
    }
    
    // Adjust for high contrast backgrounds
    if (hasHighContrast) {
      shadowBlur = Math.max(shadowBlur, 5);
      shadowOffset = { x: 4, y: 4 };
      useOutline = true;
      outlineWidth = 2;
    }

    return {
      textColor,
      shadowColor,
      shadowBlur,
      shadowOffset,
      useOutline,
      outlineColor,
      outlineWidth
    };
  }

  /**
   * Validates processing consistency across multiple processed images
   * @param {Array<string>} imagePaths - Array of processed image paths
   * @returns {Promise<Object>} Consistency validation results
   */
  async validateProcessingConsistency(imagePaths) {
    return await this.consistencyManager.validateProcessingConsistency(imagePaths);
  }

  /**
   * Gets processing statistics for consistency analysis
   * @returns {Object} Processing statistics
   */
  getProcessingStatistics() {
    return this.consistencyManager.getProcessingStatistics();
  }

  /**
   * Gets processing history for a specific image
   * @param {string} imagePath - Path to image
   * @returns {Object|null} Processing configuration or null if not found
   */
  getProcessingHistory(imagePath) {
    return this.consistencyManager.getProcessingHistory(imagePath);
  }

  /**
   * Processes multiple images with consistent configuration
   * @param {Array<string>} imagePaths - Array of image paths to process
   * @param {Object} options - Processing options
   * @returns {Promise<Array<Object>>} Array of processing results
   */
  async processImageBatch(imagePaths, options = {}) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      try {
        const result = await this.applyWatermark(imagePath, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          imagePath,
          error: error.message,
          processedAt: new Date().toISOString()
        });
      }
    }
    
    // Validate consistency across the batch
    const consistencyValidation = await this.validateProcessingConsistency(
      results.filter(r => r.success).map(r => r.imagePath)
    );
    
    return {
      results,
      consistencyValidation,
      statistics: this.getProcessingStatistics()
    };
  }

  /**
   * Detects image format and determines processing capabilities
   * @param {string} imagePath - Path to image file
   * @param {Object} metadata - Sharp metadata object
   * @returns {Object} Format information and processing options
   */
  _detectImageFormat(imagePath, metadata) {
    // Extract extension from path
    const extension = imagePath.split('.').pop().toLowerCase();
    const format = metadata.format || extension;
    
    const formatMap = {
      'jpg': { format: 'jpeg', supported: true, hasTransparency: false },
      'jpeg': { format: 'jpeg', supported: true, hasTransparency: false },
      'png': { format: 'png', supported: true, hasTransparency: true },
      'webp': { format: 'webp', supported: true, hasTransparency: true },
      'svg': { format: 'svg', supported: true, hasTransparency: true, isVector: true }
    };
    
    const formatInfo = formatMap[format] || formatMap[extension.slice(1)];
    
    return {
      format,
      extension,
      supported: !!formatInfo,
      hasTransparency: formatInfo?.hasTransparency || false,
      isVector: formatInfo?.isVector || false,
      sharpFormat: formatInfo?.format || format
    };
  }

  /**
   * Processes image with format-specific optimizations
   * @param {Object} image - Sharp image object
   * @param {string} watermarkSvg - SVG watermark markup
   * @param {Object} position - Watermark position
   * @param {Object} formatInfo - Format information
   * @param {Object} originalMetadata - Original image metadata
   * @returns {Promise<Buffer>} Processed image buffer
   */
  async _processImageByFormat(image, watermarkBuffer, position, formatInfo, originalMetadata) {
    // watermarkBuffer is already a Buffer from _generateWatermarkBuffer
    
    switch (formatInfo.sharpFormat) {
      case 'jpeg':
        return await this._processJPEG(image, watermarkBuffer, position, originalMetadata);
      
      case 'png':
        return await this._processPNG(image, watermarkBuffer, position, originalMetadata);
      
      case 'webp':
        return await this._processWebP(image, watermarkBuffer, position, originalMetadata);
      
      case 'svg':
        return await this._processSVG(image, watermarkBuffer, position, originalMetadata);
      
      default:
        // Fallback to generic processing
        return await image
          .composite([{
            input: watermarkBuffer,
            top: position.top,
            left: position.left,
            blend: 'over'
          }])
          .toBuffer();
    }
  }

  /**
   * Processes JPEG images with quality preservation
   * @param {Object} image - Sharp image object
   * @param {Buffer} watermarkBuffer - Watermark buffer
   * @param {Object} position - Watermark position
   * @param {Object} originalMetadata - Original metadata
   * @returns {Promise<Buffer>} Processed JPEG buffer
   */
  async _processJPEG(image, watermarkBuffer, position, originalMetadata) {
    // Preserve original JPEG quality if available
    const quality = originalMetadata.density ? 
      Math.min(95, Math.max(80, Math.round(originalMetadata.density / 10))) : 90;
    
    return await image
      .resize(originalMetadata.width, originalMetadata.height, { fit: 'fill' })
      .composite([{
        input: watermarkBuffer,
        top: position.top,
        left: position.left,
        blend: 'over'
      }])
      .jpeg({ 
        quality,
        progressive: true,
        mozjpeg: true // Use mozjpeg encoder for better compression
      })
      .toBuffer();
  }

  /**
   * Processes PNG images with transparency handling
   * @param {Object} image - Sharp image object
   * @param {Buffer} watermarkBuffer - Watermark buffer
   * @param {Object} position - Watermark position
   * @param {Object} originalMetadata - Original metadata
   * @returns {Promise<Buffer>} Processed PNG buffer
   */
  async _processPNG(image, watermarkBuffer, position, originalMetadata) {
    // Preserve transparency and use appropriate compression
    const hasAlpha = originalMetadata.channels === 4;
    
    return await image
      .resize(originalMetadata.width, originalMetadata.height, { fit: 'fill' })
      .composite([{
        input: watermarkBuffer,
        top: position.top,
        left: position.left,
        blend: 'over'
      }])
      .png({ 
        compressionLevel: 6, // Balanced compression
        adaptiveFiltering: true,
        palette: !hasAlpha, // Use palette for non-alpha images
        quality: 90,
        effort: 7 // Higher effort for better compression
      })
      .toBuffer();
  }

  /**
   * Processes WebP images with compression optimization
   * @param {Object} image - Sharp image object
   * @param {Buffer} watermarkBuffer - Watermark buffer
   * @param {Object} position - Watermark position
   * @param {Object} originalMetadata - Original metadata
   * @returns {Promise<Buffer>} Processed WebP buffer
   */
  async _processWebP(image, watermarkBuffer, position, originalMetadata) {
    // Use lossless for images with transparency, lossy for others
    const hasAlpha = originalMetadata.channels === 4;
    
    if (hasAlpha) {
      return await image
        .resize(originalMetadata.width, originalMetadata.height, { fit: 'fill' })
        .composite([{
          input: watermarkBuffer,
          top: position.top,
          left: position.left,
          blend: 'over'
        }])
        .webp({ 
          lossless: true,
          effort: 6,
          smartSubsample: true
        })
        .toBuffer();
    } else {
      return await image
        .resize(originalMetadata.width, originalMetadata.height, { fit: 'fill' })
        .composite([{
          input: watermarkBuffer,
          top: position.top,
          left: position.left,
          blend: 'over'
        }])
        .webp({ 
          quality: 85,
          effort: 6,
          smartSubsample: true,
          reductionEffort: 6
        })
        .toBuffer();
    }
  }

  /**
   * Processes SVG files with appropriate watermarking
   * @param {Object} image - Sharp image object (rasterized SVG)
   * @param {string} watermarkSvg - Watermark SVG markup
   * @param {Object} position - Watermark position
   * @param {Object} originalMetadata - Original metadata
   * @returns {Promise<Buffer>} Processed SVG or PNG buffer
   */
  async _processSVG(image, watermarkBuffer, position, originalMetadata) {
    // For SVG files, we have two options:
    // 1. Rasterize to PNG with watermark (safer, more compatible)
    // 2. Modify SVG source directly (preserves vector nature but more complex)
    
    // Option 1: Rasterize to high-quality PNG
    // This ensures watermark is permanently embedded and widely compatible
    const rasterizedBuffer = await image
      .resize(originalMetadata.width, originalMetadata.height, { fit: 'fill' })
      .composite([{
        input: watermarkBuffer,
        top: position.top,
        left: position.left,
        blend: 'over'
      }])
      .png({ 
        compressionLevel: 6,
        adaptiveFiltering: true,
        quality: 95,
        effort: 8 // Maximum effort for SVG conversion
      })
      .toBuffer();
    
    return rasterizedBuffer;
  }

  /**
   * Gets supported image formats
   * @returns {Array<string>} Array of supported format extensions
   */
  getSupportedFormats() {
    return ['jpg', 'jpeg', 'png', 'webp', 'svg'];
  }

  /**
   * Validates if image format is supported
   * @param {string} imagePath - Path to image file
   * @returns {boolean} True if format is supported
   */
  isFormatSupported(imagePath) {
    const extension = imagePath.split('.').pop().toLowerCase();
    return this.getSupportedFormats().includes(extension);
  }

  /**
   * Gets format-specific processing options
   * @param {string} format - Image format
   * @returns {Object} Format-specific options
   */
  getFormatOptions(format) {
    const options = {
      jpeg: {
        quality: 90,
        progressive: true,
        mozjpeg: true,
        preserveQuality: true
      },
      png: {
        compressionLevel: 6,
        adaptiveFiltering: true,
        preserveTransparency: true,
        effort: 7
      },
      webp: {
        quality: 85,
        effort: 6,
        smartSubsample: true,
        losslessForAlpha: true
      },
      svg: {
        rasterize: true,
        outputFormat: 'png',
        quality: 95,
        effort: 8
      }
    };
    
    return options[format] || {};
  }

  /**
   * Clears processing history (useful for testing or reset)
   */
  clearProcessingHistory() {
    this.consistencyManager.clearHistory();
  }
}