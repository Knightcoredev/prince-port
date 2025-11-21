const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Image optimization utilities using Sharp
 */

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const OPTIMIZED_DIR = path.join(UPLOAD_DIR, 'optimized');

/**
 * Ensure upload directories exist
 */
async function ensureUploadDirs() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
  
  try {
    await fs.access(OPTIMIZED_DIR);
  } catch {
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });
  }
}

/**
 * Optimize image with multiple size variants
 */
async function optimizeImage(inputBuffer, filename, options = {}) {
  const {
    quality = 85,
    formats = ['webp', 'jpeg'],
    sizes = [
      { width: 1920, height: 1080, suffix: 'xl' },
      { width: 1200, height: 675, suffix: 'lg' },
      { width: 800, height: 450, suffix: 'md' },
      { width: 400, height: 225, suffix: 'sm' },
      { width: 200, height: 113, suffix: 'xs' }
    ],
    progressive = true,
    removeMetadata = true
  } = options;

  await ensureUploadDirs();
  
  const baseName = path.parse(filename).name;
  const results = [];

  try {
    // Get original image metadata
    const metadata = await sharp(inputBuffer).metadata();
    
    for (const format of formats) {
      for (const size of sizes) {
        // Skip if original is smaller than target size
        if (metadata.width < size.width && metadata.height < size.height) {
          continue;
        }
        
        const outputFilename = `${baseName}-${size.suffix}.${format}`;
        const outputPath = path.join(OPTIMIZED_DIR, outputFilename);
        
        let pipeline = sharp(inputBuffer)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          });
        
        if (removeMetadata) {
          pipeline = pipeline.removeMetadata();
        }
        
        if (format === 'jpeg') {
          pipeline = pipeline.jpeg({
            quality,
            progressive,
            mozjpeg: true
          });
        } else if (format === 'webp') {
          pipeline = pipeline.webp({
            quality,
            effort: 6
          });
        } else if (format === 'png') {
          pipeline = pipeline.png({
            quality,
            progressive,
            compressionLevel: 9
          });
        }
        
        await pipeline.toFile(outputPath);
        
        // Get file stats
        const stats = await fs.stat(outputPath);
        
        results.push({
          filename: outputFilename,
          path: `/uploads/optimized/${outputFilename}`,
          format,
          width: size.width,
          height: size.height,
          size: stats.size,
          suffix: size.suffix
        });
      }
    }
    
    // Also create a thumbnail
    const thumbnailFilename = `${baseName}-thumb.webp`;
    const thumbnailPath = path.join(OPTIMIZED_DIR, thumbnailFilename);
    
    await sharp(inputBuffer)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    
    const thumbStats = await fs.stat(thumbnailPath);
    results.push({
      filename: thumbnailFilename,
      path: `/uploads/optimized/${thumbnailFilename}`,
      format: 'webp',
      width: 150,
      height: 150,
      size: thumbStats.size,
      suffix: 'thumb'
    });
    
    return {
      success: true,
      original: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: inputBuffer.length
      },
      optimized: results
    };
    
  } catch (error) {
    console.error('Image optimization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate responsive image srcSet
 */
function generateSrcSet(optimizedImages, format = 'webp') {
  const images = optimizedImages.filter(img => img.format === format);
  
  return images
    .sort((a, b) => a.width - b.width)
    .map(img => `${img.path} ${img.width}w`)
    .join(', ');
}

/**
 * Generate picture element HTML
 */
function generatePictureElement(optimizedImages, alt = '', className = '') {
  const webpSrcSet = generateSrcSet(optimizedImages, 'webp');
  const jpegSrcSet = generateSrcSet(optimizedImages, 'jpeg');
  
  const fallbackImage = optimizedImages.find(img => 
    img.format === 'jpeg' && img.suffix === 'md'
  ) || optimizedImages[0];
  
  return `
    <picture class="${className}">
      <source srcset="${webpSrcSet}" type="image/webp">
      <source srcset="${jpegSrcSet}" type="image/jpeg">
      <img src="${fallbackImage.path}" alt="${alt}" loading="lazy">
    </picture>
  `;
}

/**
 * Clean up old optimized images
 */
async function cleanupOldImages(keepDays = 30) {
  try {
    await ensureUploadDirs();
    
    const files = await fs.readdir(OPTIMIZED_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    
    for (const file of files) {
      const filePath = path.join(OPTIMIZED_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * Get image dimensions without loading full image
 */
async function getImageDimensions(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  } catch (error) {
    return null;
  }
}

/**
 * Compress existing image
 */
async function compressImage(inputPath, outputPath, options = {}) {
  const {
    quality = 85,
    format = 'webp',
    maxWidth = 1920,
    maxHeight = 1080
  } = options;
  
  try {
    let pipeline = sharp(inputPath);
    
    // Resize if too large
    const metadata = await pipeline.metadata();
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Apply format and compression
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, progressive: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality, progressive: true });
    }
    
    await pipeline.toFile(outputPath);
    
    const stats = await fs.stat(outputPath);
    return {
      success: true,
      size: stats.size,
      path: outputPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  optimizeImage,
  generateSrcSet,
  generatePictureElement,
  cleanupOldImages,
  getImageDimensions,
  compressImage,
  ensureUploadDirs
};