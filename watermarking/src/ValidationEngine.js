/**
 * ValidationEngine Module
 * Validates image integrity before/after processing
 */

import sharp from 'sharp';
import { access, constants, stat } from 'fs/promises';
import path from 'path';

export class ValidationEngine {
  constructor() {
    this.watermarkSignature = 'P.F.O';
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'svg'];
  }

  /**
   * Validates image file integrity and format
   * @param {string} imagePath - Path to image file
   * @returns {Promise<{isValid: boolean, error?: string, metadata?: object}>} Validation result
   */
  async validateImage(imagePath) {
    try {
      // Check if file exists and is readable
      await access(imagePath, constants.R_OK);
      
      // Check file size (avoid empty files)
      const stats = await stat(imagePath);
      if (stats.size === 0) {
        return { isValid: false, error: 'File is empty' };
      }
      
      // Validate file format by extension
      const formatValid = this.validateFileFormat(imagePath);
      if (!formatValid.isValid) {
        return formatValid;
      }
      
      // For SVG files, use different validation
      if (path.extname(imagePath).toLowerCase() === '.svg') {
        return this.validateSVGFile(imagePath);
      }
      
      // Try to read image metadata with Sharp for raster images
      const metadata = await sharp(imagePath).metadata();
      
      // Basic validation checks
      const isValid = metadata.width > 0 && 
                     metadata.height > 0 && 
                     metadata.format !== undefined;
      
      if (!isValid) {
        return { isValid: false, error: 'Invalid image dimensions or format' };
      }
      
      return { isValid: true, metadata };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Validates file format based on extension
   * @param {string} imagePath - Path to image file
   * @returns {{isValid: boolean, error?: string}} Format validation result
   */
  validateFileFormat(imagePath) {
    const ext = path.extname(imagePath).toLowerCase().replace('.', '');
    
    if (!this.supportedFormats.includes(ext)) {
      return { 
        isValid: false, 
        error: `Unsupported format: ${ext}. Supported formats: ${this.supportedFormats.join(', ')}` 
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validates SVG file by checking basic structure
   * @param {string} svgPath - Path to SVG file
   * @returns {Promise<{isValid: boolean, error?: string}>} SVG validation result
   */
  async validateSVGFile(svgPath) {
    try {
      const { readFile } = await import('fs/promises');
      const content = await readFile(svgPath, 'utf8');
      
      // Basic SVG validation - check for SVG tags
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        return { isValid: false, error: 'Invalid SVG structure' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: `SVG validation failed: ${error.message}` };
    }
  }

  /**
   * Compares images before and after processing
   * @param {string} originalPath - Original image path
   * @param {string} processedPath - Processed image path
   * @returns {Promise<boolean>} True if processing was successful
   */
  async compareImages(originalPath, processedPath) {
    try {
      const originalMeta = await sharp(originalPath).metadata();
      const processedMeta = await sharp(processedPath).metadata();
      
      // Ensure dimensions are preserved
      return originalMeta.width === processedMeta.width &&
             originalMeta.height === processedMeta.height;
    } catch (error) {
      console.warn('Image comparison failed:', error.message);
      return false;
    }
  }

  /**
   * Checks if image already has a P.F.O watermark
   * @param {string} imagePath - Path to image file
   * @returns {Promise<{hasWatermark: boolean, confidence?: number, error?: string}>} Watermark detection result
   */
  async checkWatermarkExists(imagePath) {
    try {
      // Handle SVG files differently
      if (path.extname(imagePath).toLowerCase() === '.svg') {
        return this.checkSVGWatermark(imagePath);
      }
      
      // For raster images, analyze the bottom-right corner
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Extract bottom-right corner (20% of width and height)
      const cornerWidth = Math.floor(metadata.width * 0.2);
      const cornerHeight = Math.floor(metadata.height * 0.2);
      const left = metadata.width - cornerWidth;
      const top = metadata.height - cornerHeight;
      
      // Extract the corner region
      const cornerBuffer = await image
        .extract({ left, top, width: cornerWidth, height: cornerHeight })
        .raw()
        .toBuffer();
      
      // Analyze pixel patterns for watermark detection
      const hasWatermark = this.analyzeCornerForWatermark(cornerBuffer, cornerWidth, cornerHeight);
      
      return { hasWatermark, confidence: hasWatermark ? 0.8 : 0.2 };
    } catch (error) {
      return { hasWatermark: false, error: error.message };
    }
  }

  /**
   * Checks SVG files for existing P.F.O watermark
   * @param {string} svgPath - Path to SVG file
   * @returns {Promise<{hasWatermark: boolean, confidence?: number}>} SVG watermark detection result
   */
  async checkSVGWatermark(svgPath) {
    try {
      const { readFile } = await import('fs/promises');
      const content = await readFile(svgPath, 'utf8');
      
      // Look for P.F.O text in the SVG content
      const hasWatermarkText = content.includes('P.F.O') || 
                              content.includes('P F O') ||
                              content.includes('PFO');
      
      return { hasWatermark: hasWatermarkText, confidence: hasWatermarkText ? 0.9 : 0.1 };
    } catch (error) {
      return { hasWatermark: false, error: error.message };
    }
  }

  /**
   * Analyzes corner pixels for watermark patterns
   * @param {Buffer} cornerBuffer - Raw pixel data from corner
   * @param {number} width - Corner width
   * @param {number} height - Corner height
   * @returns {boolean} True if watermark patterns detected
   */
  analyzeCornerForWatermark(cornerBuffer, width, height) {
    // Simple heuristic: look for semi-transparent white pixels that might indicate text
    const pixelCount = width * height;
    let suspiciousPixels = 0;
    
    // Assuming RGB format (3 bytes per pixel)
    for (let i = 0; i < cornerBuffer.length; i += 3) {
      const r = cornerBuffer[i];
      const g = cornerBuffer[i + 1];
      const b = cornerBuffer[i + 2];
      
      // Look for light-colored pixels that might be watermark text
      if (r > 200 && g > 200 && b > 200) {
        suspiciousPixels++;
      }
    }
    
    // If more than 5% of corner pixels are light-colored, might be a watermark
    const suspiciousRatio = suspiciousPixels / pixelCount;
    return suspiciousRatio > 0.05 && suspiciousRatio < 0.3;
  }

  /**
   * Validates multiple images in batch
   * @param {string[]} imagePaths - Array of image paths
   * @returns {Promise<Array<{path: string, isValid: boolean, hasWatermark?: boolean, error?: string}>>} Batch validation results
   */
  async validateImageBatch(imagePaths) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      try {
        const validation = await this.validateImage(imagePath);
        const watermarkCheck = validation.isValid ? await this.checkWatermarkExists(imagePath) : { hasWatermark: false };
        
        results.push({
          path: imagePath,
          isValid: validation.isValid,
          hasWatermark: watermarkCheck.hasWatermark,
          error: validation.error || watermarkCheck.error,
          metadata: validation.metadata
        });
      } catch (error) {
        results.push({
          path: imagePath,
          isValid: false,
          hasWatermark: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
}