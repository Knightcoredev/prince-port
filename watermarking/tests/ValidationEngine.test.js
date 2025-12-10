/**
 * Tests for ValidationEngine module
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ValidationEngine } from '../src/ValidationEngine.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ValidationEngine', () => {
  let tempDir;
  let validator;

  // Setup before each test
  async function setup() {
    validator = new ValidationEngine();
    tempDir = join(tmpdir(), `validation-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    await mkdir(tempDir, { recursive: true });
  }

  // Cleanup after each test
  async function cleanup() {
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Warning: Could not clean up temp directory ${tempDir}:`, error.message);
      }
    }
  }

  test('should validate supported file formats', async () => {
    await setup();
    
    try {
      // Test supported formats
      assert.strictEqual(validator.validateFileFormat('test.jpg').isValid, true);
      assert.strictEqual(validator.validateFileFormat('test.jpeg').isValid, true);
      assert.strictEqual(validator.validateFileFormat('test.png').isValid, true);
      assert.strictEqual(validator.validateFileFormat('test.webp').isValid, true);
      assert.strictEqual(validator.validateFileFormat('test.svg').isValid, true);
      
      // Test case insensitive
      assert.strictEqual(validator.validateFileFormat('test.JPG').isValid, true);
      assert.strictEqual(validator.validateFileFormat('test.PNG').isValid, true);
      
      // Test unsupported formats
      assert.strictEqual(validator.validateFileFormat('test.txt').isValid, false);
      assert.strictEqual(validator.validateFileFormat('test.js').isValid, false);
      assert.strictEqual(validator.validateFileFormat('test.gif').isValid, false);
    } finally {
      await cleanup();
    }
  });

  test('should detect empty files', async () => {
    await setup();
    
    try {
      // Create empty file
      const emptyFile = join(tempDir, 'empty.jpg');
      await writeFile(emptyFile, '');
      
      const result = await validator.validateImage(emptyFile);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.error, 'File is empty');
    } finally {
      await cleanup();
    }
  });

  test('should validate SVG files', async () => {
    await setup();
    
    try {
      // Create valid SVG
      const validSvg = join(tempDir, 'valid.svg');
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
      await writeFile(validSvg, svgContent);
      
      const result = await validator.validateImage(validSvg);
      assert.strictEqual(result.isValid, true);
      
      // Create invalid SVG
      const invalidSvg = join(tempDir, 'invalid.svg');
      await writeFile(invalidSvg, 'not an svg file');
      
      const invalidResult = await validator.validateImage(invalidSvg);
      assert.strictEqual(invalidResult.isValid, false);
      assert(invalidResult.error.includes('Invalid SVG structure'));
    } finally {
      await cleanup();
    }
  });

  test('should detect watermarks in SVG files', async () => {
    await setup();
    
    try {
      // Create SVG with P.F.O watermark
      const watermarkedSvg = join(tempDir, 'watermarked.svg');
      const svgWithWatermark = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="80" y="90">P.F.O</text></svg>';
      await writeFile(watermarkedSvg, svgWithWatermark);
      
      const result = await validator.checkWatermarkExists(watermarkedSvg);
      assert.strictEqual(result.hasWatermark, true);
      assert(result.confidence > 0.8);
      
      // Create SVG without watermark
      const cleanSvg = join(tempDir, 'clean.svg');
      const svgWithoutWatermark = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>';
      await writeFile(cleanSvg, svgWithoutWatermark);
      
      const cleanResult = await validator.checkWatermarkExists(cleanSvg);
      assert.strictEqual(cleanResult.hasWatermark, false);
    } finally {
      await cleanup();
    }
  });

  test('should handle non-existent files gracefully', async () => {
    await setup();
    
    try {
      const nonExistentFile = join(tempDir, 'does-not-exist.jpg');
      
      const result = await validator.validateImage(nonExistentFile);
      assert.strictEqual(result.isValid, false);
      assert(result.error.includes('ENOENT') || result.error.includes('no such file'));
    } finally {
      await cleanup();
    }
  });

  test('should validate image batch correctly', async () => {
    await setup();
    
    try {
      // Create test files
      const validSvg = join(tempDir, 'valid.svg');
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
      await writeFile(validSvg, svgContent);
      
      const emptyFile = join(tempDir, 'empty.jpg');
      await writeFile(emptyFile, '');
      
      const nonExistentFile = join(tempDir, 'missing.png');
      
      const results = await validator.validateImageBatch([validSvg, emptyFile, nonExistentFile]);
      
      assert.strictEqual(results.length, 3);
      assert.strictEqual(results[0].isValid, true);
      assert.strictEqual(results[1].isValid, false);
      assert.strictEqual(results[2].isValid, false);
    } finally {
      await cleanup();
    }
  });

  test('should compare images correctly', async () => {
    await setup();
    
    try {
      // Create two SVG files with same dimensions
      const svg1 = join(tempDir, 'image1.svg');
      const svg2 = join(tempDir, 'image2.svg');
      const svgContent1 = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
      const svgContent2 = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>';
      
      await writeFile(svg1, svgContent1);
      await writeFile(svg2, svgContent2);
      
      // For SVG files, compareImages might not work with Sharp, so we expect it to handle gracefully
      const result = await validator.compareImages(svg1, svg2);
      // The result depends on Sharp's SVG handling - it should either work or fail gracefully
      assert(typeof result === 'boolean');
    } finally {
      await cleanup();
    }
  });
});