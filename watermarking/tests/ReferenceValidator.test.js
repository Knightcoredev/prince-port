/**
 * ReferenceValidator Tests
 * Tests for image reference scanning and validation functionality
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { ReferenceValidator } from '../src/ReferenceValidator.js';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('ReferenceValidator', () => {
  let validator;
  let testDir;

  beforeEach(async () => {
    validator = new ReferenceValidator();
    testDir = join(process.cwd(), 'test-temp');
    
    // Create test directory structure
    await mkdir(testDir, { recursive: true });
    await mkdir(join(testDir, 'src'), { recursive: true });
    await mkdir(join(testDir, 'public'), { recursive: true });
    await mkdir(join(testDir, 'projects', 'test-project'), { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('scanCodeFilesForImageReferences', () => {
    it('should find image references in JavaScript files', async () => {
      // Create test JavaScript file with image references
      const jsContent = `
        import logo from './logo.png';
        const heroImage = require('../public/hero.jpg');
        const profilePic = '/profile.jpg';
        
        function Component() {
          return <img src="./banner.webp" alt="Banner" />;
        }
      `;
      
      await writeFile(join(testDir, 'src', 'test.js'), jsContent);
      
      // Create referenced image files
      await writeFile(join(testDir, 'src', 'logo.png'), 'fake-image-content');
      await writeFile(join(testDir, 'public', 'hero.jpg'), 'fake-image-content');
      await writeFile(join(testDir, 'public', 'profile.jpg'), 'fake-image-content');
      await writeFile(join(testDir, 'src', 'banner.webp'), 'fake-image-content');
      
      const references = await validator.scanCodeFilesForImageReferences(testDir);
      
      assert(references.size > 0, 'Should find image references');
      
      // Check that references were found
      const allReferences = Array.from(references.values()).flat();
      assert(allReferences.length > 0, 'Should have reference entries');
      
      // Verify reference types
      const types = allReferences.map(ref => ref.type);
      assert(types.includes('import'), 'Should find import references');
      assert(types.includes('require'), 'Should find require references');
    });

    it('should find image references in HTML files', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .hero { background-image: url('./hero-bg.jpg'); }
          </style>
        </head>
        <body>
          <img src="./logo.png" alt="Logo" />
          <picture>
            <source src="./banner.webp" />
          </picture>
        </body>
        </html>
      `;
      
      await writeFile(join(testDir, 'index.html'), htmlContent);
      
      // Create referenced image files
      await writeFile(join(testDir, 'hero-bg.jpg'), 'fake-image-content');
      await writeFile(join(testDir, 'logo.png'), 'fake-image-content');
      await writeFile(join(testDir, 'banner.webp'), 'fake-image-content');
      
      const references = await validator.scanCodeFilesForImageReferences(testDir);
      
      assert(references.size > 0, 'Should find image references in HTML');
      
      const allReferences = Array.from(references.values()).flat();
      const types = allReferences.map(ref => ref.type);
      assert(types.includes('img_tag'), 'Should find img tag references');
      assert(types.includes('css_background'), 'Should find CSS background references');
    });

    it('should find image references in CSS files', async () => {
      const cssContent = `
        .background {
          background-image: url('./bg.png');
        }
        
        .icon::before {
          content: url('../icons/arrow.svg');
        }
      `;
      
      await writeFile(join(testDir, 'styles.css'), cssContent);
      
      // Create referenced image files
      await writeFile(join(testDir, 'bg.png'), 'fake-image-content');
      await mkdir(join(testDir, 'icons'), { recursive: true });
      await writeFile(join(testDir, 'icons', 'arrow.svg'), 'fake-svg-content');
      
      const references = await validator.scanCodeFilesForImageReferences(testDir);
      
      assert(references.size > 0, 'Should find image references in CSS');
      
      const allReferences = Array.from(references.values()).flat();
      const types = allReferences.map(ref => ref.type);
      assert(types.includes('css_background'), 'Should find CSS background references');
    });
  });

  describe('validateProcessedImageReferences', () => {
    it('should validate that processed images maintain functionality', async () => {
      // Create test file with image reference
      const jsContent = `import logo from './logo.png';`;
      await writeFile(join(testDir, 'src', 'test.js'), jsContent);
      
      // Create the referenced image
      const imagePath = join(testDir, 'src', 'logo.png');
      await writeFile(imagePath, 'fake-image-content');
      
      // Scan for references first
      await validator.scanCodeFilesForImageReferences(testDir);
      
      // Validate the processed image (same path, simulating in-place processing)
      const result = await validator.validateProcessedImageReferences([imagePath], testDir);
      
      assert.strictEqual(result.valid, true, 'References should be valid');
      assert.strictEqual(result.brokenReferences.length, 0, 'Should have no broken references');
      assert(result.summary.validReferences > 0, 'Should have valid references');
    });

    it('should detect broken references after processing', async () => {
      // Create test file with image reference
      const jsContent = `import logo from './logo.png';`;
      await writeFile(join(testDir, 'src', 'test.js'), jsContent);
      
      // Create the referenced image
      const imagePath = join(testDir, 'src', 'logo.png');
      await writeFile(imagePath, 'fake-image-content');
      
      // Scan for references first
      await validator.scanCodeFilesForImageReferences(testDir);
      
      // Remove the image to simulate broken reference
      await rm(imagePath);
      
      // Validate the processed image
      const result = await validator.validateProcessedImageReferences([imagePath], testDir);
      
      assert.strictEqual(result.valid, false, 'Should detect broken references');
      assert(result.brokenReferences.length > 0, 'Should have broken references');
      assert(result.summary.brokenReferences > 0, 'Summary should show broken references');
    });
  });

  describe('validatePathConsistency', () => {
    it('should validate that file paths remain unchanged', () => {
      const originalPaths = [
        '/path/to/image1.jpg',
        '/path/to/image2.png',
        '/path/to/image3.webp'
      ];
      
      const processedPaths = [
        '/path/to/image1.jpg',
        '/path/to/image2.png',
        '/path/to/image3.webp'
      ];
      
      const result = validator.validatePathConsistency(originalPaths, processedPaths);
      
      assert.strictEqual(result.pathsUnchanged, true, 'Paths should remain unchanged');
      assert.strictEqual(result.changedPaths.length, 0, 'Should have no changed paths');
    });

    it('should detect missing paths after processing', () => {
      const originalPaths = [
        '/path/to/image1.jpg',
        '/path/to/image2.png',
        '/path/to/image3.webp'
      ];
      
      const processedPaths = [
        '/path/to/image1.jpg',
        '/path/to/image2.png'
        // image3.webp is missing
      ];
      
      const result = validator.validatePathConsistency(originalPaths, processedPaths);
      
      assert.strictEqual(result.pathsUnchanged, false, 'Should detect path changes');
      assert(result.changedPaths.length > 0, 'Should have changed paths');
      assert.strictEqual(result.changedPaths[0].status, 'missing', 'Should detect missing paths');
    });

    it('should detect unexpected new paths', () => {
      const originalPaths = [
        '/path/to/image1.jpg',
        '/path/to/image2.png'
      ];
      
      const processedPaths = [
        '/path/to/image1.jpg',
        '/path/to/image2.png',
        '/path/to/image3.webp' // unexpected new path
      ];
      
      const result = validator.validatePathConsistency(originalPaths, processedPaths);
      
      assert.strictEqual(result.pathsUnchanged, false, 'Should detect path changes');
      assert(result.changedPaths.length > 0, 'Should have changed paths');
      assert.strictEqual(result.changedPaths[0].status, 'unexpected', 'Should detect unexpected paths');
    });
  });

  describe('getReferenceSummary', () => {
    it('should provide summary statistics', async () => {
      // Create test files with references
      const jsContent = `
        import logo from './logo.png';
        const hero = require('./hero.jpg');
      `;
      
      await writeFile(join(testDir, 'src', 'test.js'), jsContent);
      await writeFile(join(testDir, 'src', 'logo.png'), 'fake-content');
      await writeFile(join(testDir, 'src', 'hero.jpg'), 'fake-content');
      
      await validator.scanCodeFilesForImageReferences(testDir);
      
      const summary = validator.getReferenceSummary();
      
      assert(summary.totalImages > 0, 'Should have images in summary');
      assert(summary.totalReferences > 0, 'Should have references in summary');
      assert(summary.referencesByType !== undefined, 'Should have references by type');
      assert(summary.imagesByProject !== undefined, 'Should have images by project');
    });
  });

  describe('edge cases', () => {
    it('should handle files with no image references', async () => {
      const jsContent = `
        const message = "Hello World";
        console.log(message);
      `;
      
      await writeFile(join(testDir, 'src', 'test.js'), jsContent);
      
      const references = await validator.scanCodeFilesForImageReferences(testDir);
      
      // Should not crash and should return empty or minimal results
      assert(references !== undefined, 'Should return references object');
    });

    it('should handle invalid file paths gracefully', async () => {
      const jsContent = `import logo from './nonexistent.png';`;
      await writeFile(join(testDir, 'src', 'test.js'), jsContent);
      
      // Don't create the referenced file
      
      const references = await validator.scanCodeFilesForImageReferences(testDir);
      
      // Should still find the reference even if file doesn't exist
      assert(references.size > 0, 'Should find references even if files do not exist');
    });

    it('should skip excluded directories', async () => {
      // Create files in excluded directory
      await mkdir(join(testDir, 'node_modules', 'package'), { recursive: true });
      await writeFile(join(testDir, 'node_modules', 'package', 'test.js'), 'import logo from "./logo.png";');
      await writeFile(join(testDir, 'node_modules', 'package', 'logo.png'), 'fake-content');
      
      const references = await validator.scanCodeFilesForImageReferences(testDir);
      
      // Should not find references in node_modules
      const allReferences = Array.from(references.values()).flat();
      const nodeModulesRefs = allReferences.filter(ref => ref.sourceFile.includes('node_modules'));
      assert.strictEqual(nodeModulesRefs.length, 0, 'Should not scan excluded directories');
    });
  });
});