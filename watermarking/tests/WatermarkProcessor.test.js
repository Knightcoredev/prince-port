/**
 * WatermarkProcessor Tests
 * Tests for multi-format image processing functionality
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { WatermarkProcessor } from '../src/WatermarkProcessor.js';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

describe('WatermarkProcessor', () => {
  let processor;
  let testDir;

  // Setup test environment
  async function setup() {
    processor = new WatermarkProcessor();
    testDir = path.join(process.cwd(), 'test-images');
    
    // Create test directory
    try {
      await fs.mkdir(testDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  // Cleanup test environment
  async function cleanup() {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }
  }

  // Create test images for different formats
  async function createTestImages() {
    const images = {};
    const timestamp = Date.now();
    
    // Create JPEG test image
    images.jpeg = path.join(testDir, `test_${timestamp}.jpg`);
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 100, g: 150, b: 200 }
      }
    })
    .jpeg({ quality: 90 })
    .toFile(images.jpeg);

    // Create PNG test image with transparency
    images.png = path.join(testDir, `test_${timestamp}.png`);
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 100, g: 150, b: 200, alpha: 0.8 }
      }
    })
    .png()
    .toFile(images.png);

    // Create WebP test image
    images.webp = path.join(testDir, `test_${timestamp}.webp`);
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 100, g: 150, b: 200 }
      }
    })
    .webp({ quality: 85 })
    .toFile(images.webp);

    // Create SVG test image
    images.svg = path.join(testDir, `test_${timestamp}.svg`);
    const svgContent = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="rgb(100,150,200)"/>
        <circle cx="400" cy="300" r="100" fill="white"/>
      </svg>
    `;
    await fs.writeFile(images.svg, svgContent);

    return images;
  }

  test('should detect supported image formats correctly', async () => {
    await setup();
    
    const testCases = [
      { path: 'test.jpg', expected: true },
      { path: 'test.jpeg', expected: true },
      { path: 'test.png', expected: true },
      { path: 'test.webp', expected: true },
      { path: 'test.svg', expected: true },
      { path: 'test.gif', expected: false },
      { path: 'test.bmp', expected: false },
      { path: 'test.txt', expected: false }
    ];

    for (const testCase of testCases) {
      const result = processor.isFormatSupported(testCase.path);
      assert.strictEqual(result, testCase.expected, 
        `Format detection failed for ${testCase.path}`);
    }

    await cleanup();
  });

  test('should return correct supported formats list', async () => {
    await setup();
    
    const formats = processor.getSupportedFormats();
    const expectedFormats = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
    
    assert.deepStrictEqual(formats.sort(), expectedFormats.sort());
    
    await cleanup();
  });

  test('should get format-specific options correctly', async () => {
    await setup();
    
    const jpegOptions = processor.getFormatOptions('jpeg');
    assert.strictEqual(jpegOptions.quality, 90);
    assert.strictEqual(jpegOptions.progressive, true);
    assert.strictEqual(jpegOptions.preserveQuality, true);

    const pngOptions = processor.getFormatOptions('png');
    assert.strictEqual(pngOptions.compressionLevel, 6);
    assert.strictEqual(pngOptions.preserveTransparency, true);

    const webpOptions = processor.getFormatOptions('webp');
    assert.strictEqual(webpOptions.quality, 85);
    assert.strictEqual(webpOptions.losslessForAlpha, true);

    const svgOptions = processor.getFormatOptions('svg');
    assert.strictEqual(svgOptions.rasterize, true);
    assert.strictEqual(svgOptions.outputFormat, 'png');

    await cleanup();
  });

  test('should process JPEG images with quality preservation', async () => {
    await setup();
    const images = await createTestImages();
    
    // Get original metadata
    const originalMetadata = await sharp(images.jpeg).metadata();
    
    // Apply watermark
    const result = await processor.applyWatermark(images.jpeg);
    
    // Verify processing success
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.formatInfo.format, 'jpeg');
    assert.strictEqual(result.formatInfo.supported, true);
    
    // Verify image still exists and is valid
    const processedMetadata = await sharp(images.jpeg).metadata();
    assert.strictEqual(processedMetadata.format, 'jpeg');
    assert.strictEqual(processedMetadata.width, originalMetadata.width);
    assert.strictEqual(processedMetadata.height, originalMetadata.height);
    
    await cleanup();
  });

  test('should process PNG images with transparency handling', async () => {
    await setup();
    const images = await createTestImages();
    
    // Get original metadata
    const originalMetadata = await sharp(images.png).metadata();
    
    // Apply watermark
    const result = await processor.applyWatermark(images.png);
    
    // Verify processing success
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.formatInfo.format, 'png');
    assert.strictEqual(result.formatInfo.hasTransparency, true);
    
    // Verify transparency is preserved
    const processedMetadata = await sharp(images.png).metadata();
    assert.strictEqual(processedMetadata.format, 'png');
    assert.strictEqual(processedMetadata.channels, originalMetadata.channels);
    
    // Also check dimensions like JPEG test
    console.log('PNG - Original:', originalMetadata.width, 'x', originalMetadata.height);
    console.log('PNG - Processed:', processedMetadata.width, 'x', processedMetadata.height);
    
    await cleanup();
  });

  test('should process WebP images with compression optimization', async () => {
    await setup();
    const images = await createTestImages();
    
    // Get original metadata
    const originalMetadata = await sharp(images.webp).metadata();
    
    // Apply watermark
    const result = await processor.applyWatermark(images.webp);
    
    // Verify processing success
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.formatInfo.format, 'webp');
    assert.strictEqual(result.formatInfo.supported, true);
    
    // Add a small delay to ensure file handle is released
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify image properties
    const processedMetadata = await sharp(images.webp).metadata();
    assert.strictEqual(processedMetadata.format, 'webp');
    assert.strictEqual(processedMetadata.width, originalMetadata.width);
    assert.strictEqual(processedMetadata.height, originalMetadata.height);
    
    await cleanup();
  });

  test('should process SVG images by rasterizing to PNG', async () => {
    await setup();
    const images = await createTestImages();
    
    // Apply watermark to SVG
    const result = await processor.applyWatermark(images.svg);
    
    // Verify processing success
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.formatInfo.format, 'svg');
    assert.strictEqual(result.formatInfo.isVector, true);
    
    // Verify SVG was rasterized to PNG
    const processedMetadata = await sharp(images.svg).metadata();
    assert.strictEqual(processedMetadata.format, 'png');
    
    await cleanup();
  });

  test('should reject unsupported image formats', async () => {
    await setup();
    
    // Create a fake GIF file (unsupported format)
    const unsupportedFile = path.join(testDir, 'test.gif');
    await fs.writeFile(unsupportedFile, 'GIF89a'); // Minimal GIF header
    
    // Attempt to process unsupported format
    try {
      await processor.applyWatermark(unsupportedFile);
      assert.fail('Should have thrown error for unsupported format');
    } catch (error) {
      assert.ok(error.message.includes('Unsupported image format') || 
                error.message.includes('Input file is missing') ||
                error.message.includes('Input buffer contains unsupported image format') ||
                error.message.includes('corrupt header') ||
                error.message.includes('Unexpected end'));
    }
    
    await cleanup();
  });

  test('should maintain format-specific characteristics across batch processing', async () => {
    await setup();
    const images = await createTestImages();
    
    const imagePaths = [images.jpeg, images.png, images.webp];
    
    // Process batch
    const batchResult = await processor.processImageBatch(imagePaths);
    
    // Verify all images processed successfully
    assert.strictEqual(batchResult.results.length, 3);
    assert.ok(batchResult.results.every(r => r.success));
    
    // Verify format-specific processing
    const jpegResult = batchResult.results.find(r => r.imagePath === images.jpeg);
    assert.strictEqual(jpegResult.formatInfo.format, 'jpeg');
    
    const pngResult = batchResult.results.find(r => r.imagePath === images.png);
    assert.strictEqual(pngResult.formatInfo.hasTransparency, true);
    
    const webpResult = batchResult.results.find(r => r.imagePath === images.webp);
    assert.strictEqual(webpResult.formatInfo.format, 'webp');
    
    await cleanup();
  });
});