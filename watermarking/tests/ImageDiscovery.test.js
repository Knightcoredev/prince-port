/**
 * Tests for ImageDiscovery module
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import { ImageDiscovery } from '../src/ImageDiscovery.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ImageDiscovery', () => {
  test('should filter supported image types correctly', () => {
    const discovery = new ImageDiscovery();
    
    assert.strictEqual(discovery.filterImageTypes('test.jpg'), true);
    assert.strictEqual(discovery.filterImageTypes('test.jpeg'), true);
    assert.strictEqual(discovery.filterImageTypes('test.png'), true);
    assert.strictEqual(discovery.filterImageTypes('test.webp'), true);
    assert.strictEqual(discovery.filterImageTypes('test.svg'), true);
    assert.strictEqual(discovery.filterImageTypes('test.txt'), false);
    assert.strictEqual(discovery.filterImageTypes('test.js'), false);
  });

  test('should handle case insensitive extensions', () => {
    const discovery = new ImageDiscovery();
    
    assert.strictEqual(discovery.filterImageTypes('test.JPG'), true);
    assert.strictEqual(discovery.filterImageTypes('test.PNG'), true);
    assert.strictEqual(discovery.filterImageTypes('test.JPEG'), true);
  });

  test('should return supported formats', () => {
    const discovery = new ImageDiscovery();
    const formats = discovery.getSupportedFormats();
    
    assert.deepStrictEqual(formats, ['.jpg', '.jpeg', '.png', '.webp', '.svg']);
  });

  test('should filter images by format', () => {
    const discovery = new ImageDiscovery();
    const images = [
      { format: 'jpg', filename: 'test1.jpg' },
      { format: 'png', filename: 'test2.png' },
      { format: 'svg', filename: 'test3.svg' },
      { format: 'webp', filename: 'test4.webp' }
    ];

    const jpgImages = discovery.filterByFormat(images, 'jpg');
    assert.strictEqual(jpgImages.length, 1);
    assert.strictEqual(jpgImages[0].filename, 'test1.jpg');

    const multipleFormats = discovery.filterByFormat(images, ['jpg', 'png']);
    assert.strictEqual(multipleFormats.length, 2);
  });

  test('should generate image statistics', () => {
    const discovery = new ImageDiscovery();
    const images = [
      { 
        format: 'jpg', 
        size: 1000, 
        relativePath: 'projects/test-project/image1.jpg' 
      },
      { 
        format: 'png', 
        size: 2000, 
        relativePath: 'projects/test-project/image2.png' 
      },
      { 
        format: 'jpg', 
        size: 1500, 
        relativePath: 'public/Profile.jpg' 
      }
    ];

    const stats = discovery.getImageStatistics(images);
    
    assert.strictEqual(stats.total, 3);
    assert.strictEqual(stats.byFormat.jpg, 2);
    assert.strictEqual(stats.byFormat.png, 1);
    assert.strictEqual(stats.totalSize, 4500);
    assert.strictEqual(stats.byProject['test-project'], 2);
    assert.strictEqual(stats.byProject['public'], 1);
  });

  test('should identify directories to skip', () => {
    const discovery = new ImageDiscovery();
    
    assert.strictEqual(discovery._shouldSkipDirectory('node_modules'), true);
    assert.strictEqual(discovery._shouldSkipDirectory('.git'), true);
    assert.strictEqual(discovery._shouldSkipDirectory('.next'), true);
    assert.strictEqual(discovery._shouldSkipDirectory('dist'), true);
    assert.strictEqual(discovery._shouldSkipDirectory('src'), false);
    assert.strictEqual(discovery._shouldSkipDirectory('components'), false);
  });

  /**
   * Property-Based Test for Discovery Completeness
   * Feature: image-watermarking, Property 7: Discovery Completeness
   * Validates: Requirements 2.1
   */
  test('Property 7: Discovery Completeness - should identify all images of supported formats in any directory structure', async () => {
    const discovery = new ImageDiscovery();
    
    // Generator for supported image extensions
    const supportedExtensions = fc.constantFrom('.jpg', '.jpeg', '.png', '.webp', '.svg');
    
    // Generator for unsupported extensions
    const unsupportedExtensions = fc.constantFrom('.txt', '.js', '.css', '.html', '.json', '.md');
    
    // Generator for directory names (avoiding excluded directories and invalid chars)
    const validDirNames = fc.stringOf(
      fc.char().filter(c => /[a-zA-Z0-9_-]/.test(c)), 
      { minLength: 1, maxLength: 10 }
    ).filter(s => s.trim().length > 0 && !discovery._shouldSkipDirectory(s));
    
    // Generator for file names without extension (alphanumeric + common chars, no leading/trailing spaces)
    const baseFileNames = fc.stringOf(
      fc.char().filter(c => /[a-zA-Z0-9_-]/.test(c)), 
      { minLength: 1, maxLength: 15 }
    ).filter(s => s.trim().length > 0);
    
    // Generator for image files (supported formats)
    const imageFileGen = fc.record({
      name: fc.tuple(baseFileNames, supportedExtensions).map(([base, ext]) => base + ext),
      content: fc.uint8Array({ minLength: 10, maxLength: 100 }) // Minimal file content
    });
    
    // Generator for non-image files (unsupported formats)
    const nonImageFileGen = fc.record({
      name: fc.tuple(baseFileNames, unsupportedExtensions).map(([base, ext]) => base + ext),
      content: fc.uint8Array({ minLength: 10, maxLength: 100 })
    });
    
    // Generator for directory structure with mixed files
    const directoryStructureGen = fc.record({
      imageFiles: fc.array(imageFileGen, { minLength: 1, maxLength: 5 }),
      nonImageFiles: fc.array(nonImageFileGen, { maxLength: 3 }),
      subdirs: fc.array(validDirNames, { maxLength: 2 })
    });

    await fc.assert(
      fc.asyncProperty(directoryStructureGen, async (structure) => {
        let tempDir;
        try {
          // Create temporary directory for testing
          tempDir = join(tmpdir(), `image-discovery-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
          await mkdir(tempDir, { recursive: true });
          
          // Create the expected directory structure (projects/ and public/)
          const projectsDir = join(tempDir, 'projects');
          const publicDir = join(tempDir, 'public');
          await mkdir(projectsDir, { recursive: true });
          await mkdir(publicDir, { recursive: true });
          
          // Track expected image files
          const expectedImages = new Set();
          
          // Create image files in public directory
          for (const imageFile of structure.imageFiles) {
            const filePath = join(publicDir, imageFile.name);
            await writeFile(filePath, imageFile.content);
            expectedImages.add(`public/${imageFile.name}`);
          }
          
          // Create non-image files in public directory
          for (const nonImageFile of structure.nonImageFiles) {
            const filePath = join(publicDir, nonImageFile.name);
            await writeFile(filePath, nonImageFile.content);
          }
          
          // Create project subdirectories with additional image files
          for (const subdir of structure.subdirs) {
            const projectSubdirPath = join(projectsDir, subdir);
            await mkdir(projectSubdirPath, { recursive: true });
            
            // Add some image files to project subdirectories
            if (structure.imageFiles.length > 0) {
              const subdirImageFile = structure.imageFiles[0]; // Use first image file as template
              const subdirFilePath = join(projectSubdirPath, `project_${subdirImageFile.name}`);
              await writeFile(subdirFilePath, subdirImageFile.content);
              expectedImages.add(`projects/${subdir}/project_${subdirImageFile.name}`);
            }
          }
          
          // Run discovery on the temporary directory
          const discoveredImages = await discovery.findAllImages(tempDir);
          
          // Extract just the filenames from discovered images for comparison
          const discoveredFileNames = new Set(discoveredImages.map(img => img.relativePath));
          
          // Verify that all expected images were discovered
          for (const expectedImage of expectedImages) {
            assert(discoveredFileNames.has(expectedImage), 
              `Expected image ${expectedImage} was not discovered. Found: ${Array.from(discoveredFileNames).join(', ')}`);
          }
          
          // Verify that only supported image formats were discovered
          for (const discoveredImage of discoveredImages) {
            const isSupported = discovery.filterImageTypes(discoveredImage.filename);
            assert(isSupported, 
              `Discovered file ${discoveredImage.filename} is not a supported image format`);
          }
          
          // Verify no non-image files were included
          const allDiscoveredNames = discoveredImages.map(img => img.filename);
          for (const nonImageFile of structure.nonImageFiles) {
            assert(!allDiscoveredNames.includes(nonImageFile.name), 
              `Non-image file ${nonImageFile.name} was incorrectly discovered as an image`);
          }
          
        } finally {
          // Clean up temporary directory
          if (tempDir) {
            try {
              await rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
              console.warn(`Warning: Could not clean up temp directory ${tempDir}:`, cleanupError.message);
            }
          }
        }
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });
});