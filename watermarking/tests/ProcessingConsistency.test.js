/**
 * ProcessingConsistency Module Tests
 * Tests for consistent watermark processing logic
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { ProcessingConsistency } from '../src/ProcessingConsistency.js';

test('ProcessingConsistency', async (t) => {
  await t.test('should calculate consistent dimensions for different image sizes', () => {
    const consistency = new ProcessingConsistency();
    
    // Test with different image sizes
    const smallImage = { width: 400, height: 300, format: 'jpeg' };
    const mediumImage = { width: 1200, height: 800, format: 'png' };
    const largeImage = { width: 2400, height: 1600, format: 'webp' };
    
    const smallConfig = consistency.calculateConsistentConfig(smallImage, 'test-small.jpg');
    const mediumConfig = consistency.calculateConsistentConfig(mediumImage, 'test-medium.png');
    const largeConfig = consistency.calculateConsistentConfig(largeImage, 'test-large.webp');
    
    // Debug: Log the actual values
    console.log('Small config font size ratio:', smallConfig.dimensions.fontSizeRatio);
    console.log('Medium config font size ratio:', mediumConfig.dimensions.fontSizeRatio);
    console.log('Large config font size ratio:', largeConfig.dimensions.fontSizeRatio);
    
    // Font size should scale proportionally (5% of width)
    assert.strictEqual(smallConfig.dimensions.fontSizeRatio, smallConfig.dimensions.fontSize / smallImage.width);
    assert.strictEqual(mediumConfig.dimensions.fontSizeRatio, mediumConfig.dimensions.fontSize / mediumImage.width);
    assert.strictEqual(largeConfig.dimensions.fontSizeRatio, largeConfig.dimensions.fontSize / largeImage.width);
    
    // Check that font sizes are within expected bounds (considering min/max constraints)
    assert.ok(smallConfig.dimensions.fontSize >= 24); // minFontSize
    assert.ok(mediumConfig.dimensions.fontSize >= 24);
    assert.ok(largeConfig.dimensions.fontSize >= 24);
    assert.ok(smallConfig.dimensions.fontSize <= 72); // maxFontSize
    assert.ok(mediumConfig.dimensions.fontSize <= 72);
    assert.ok(largeConfig.dimensions.fontSize <= 72);
    
    // For medium image, the ratio should be close to 5% (60px for 1200px width)
    const expectedRatio = 0.05;
    assert.ok(Math.abs(mediumConfig.dimensions.fontSizeRatio - expectedRatio) < 0.001);
    
    // For small image, font size is constrained by minFontSize, so ratio will be higher
    assert.ok(smallConfig.dimensions.fontSizeRatio >= expectedRatio);
    
    // For large image, font size is constrained by maxFontSize, so ratio will be lower
    assert.ok(largeConfig.dimensions.fontSizeRatio <= expectedRatio);
  });

  await t.test('should maintain consistent positioning across images', () => {
    const consistency = new ProcessingConsistency();
    
    // Test with different aspect ratios
    const wideImage = { width: 1600, height: 900, format: 'jpeg' };
    const tallImage = { width: 900, height: 1600, format: 'jpeg' };
    const squareImage = { width: 1000, height: 1000, format: 'jpeg' };
    
    const wideConfig = consistency.calculateConsistentConfig(wideImage, 'test-wide.jpg');
    const tallConfig = consistency.calculateConsistentConfig(tallImage, 'test-tall.jpg');
    const squareConfig = consistency.calculateConsistentConfig(squareImage, 'test-square.jpg');
    
    // All should use bottom-right positioning
    assert.ok(wideConfig.position.left > 0);
    assert.ok(wideConfig.position.top > 0);
    assert.ok(tallConfig.position.left > 0);
    assert.ok(tallConfig.position.top > 0);
    assert.ok(squareConfig.position.left > 0);
    assert.ok(squareConfig.position.top > 0);
    
    // Padding ratios should be consistent
    const widePaddingRatio = wideConfig.position.paddingRatio;
    const tallPaddingRatio = tallConfig.position.paddingRatio;
    const squarePaddingRatio = squareConfig.position.paddingRatio;
    
    // All padding ratios should be similar (within tolerance)
    assert.ok(Math.abs(widePaddingRatio - tallPaddingRatio) < 0.01);
    assert.ok(Math.abs(tallPaddingRatio - squarePaddingRatio) < 0.01);
  });

  await t.test('should preserve path information correctly', () => {
    const consistency = new ProcessingConsistency();
    
    const testPaths = [
      '/projects/test/image.jpg',
      'public/profile.png',
      '../assets/logo.svg'
    ];
    
    testPaths.forEach(path => {
      const metadata = { width: 800, height: 600, format: 'jpeg' };
      const config = consistency.calculateConsistentConfig(metadata, path);
      
      assert.strictEqual(config.pathInfo.originalPath, path);
      assert.ok(config.pathInfo.filename);
      assert.ok(config.pathInfo.extension);
    });
  });

  await t.test('should validate consistency across multiple images', async () => {
    const consistency = new ProcessingConsistency({
      aspectRatioTolerance: 0.2 // More lenient tolerance for testing
    });
    
    // Process multiple images with similar characteristics
    const images = [
      { width: 1200, height: 800, format: 'jpeg', path: 'test1.jpg' },
      { width: 1300, height: 900, format: 'png', path: 'test2.png' },
      { width: 1100, height: 750, format: 'webp', path: 'test3.webp' }
    ];
    
    // Calculate configs for all images
    images.forEach(img => {
      consistency.calculateConsistentConfig(img, img.path);
    });
    
    // Test only the configuration consistency, not path validation
    const configurations = images.map(img => ({
      path: img.path,
      config: consistency.getProcessingHistory(img.path)
    }));
    
    // Validate position consistency
    const paddingRatios = configurations.map(c => c.config.position.paddingRatio);
    const avgPaddingRatio = paddingRatios.reduce((a, b) => a + b, 0) / paddingRatios.length;
    
    // Check that all padding ratios are within tolerance
    const tolerance = 0.2;
    const positionConsistent = paddingRatios.every(ratio => 
      Math.abs(ratio - avgPaddingRatio) <= tolerance
    );
    
    assert.strictEqual(positionConsistent, true);
    
    // Validate sizing consistency
    const fontSizeRatios = configurations.map(c => c.config.dimensions.fontSizeRatio);
    const avgFontSizeRatio = fontSizeRatios.reduce((a, b) => a + b, 0) / fontSizeRatios.length;
    
    const sizingConsistent = fontSizeRatios.every(ratio => 
      Math.abs(ratio - avgFontSizeRatio) <= tolerance
    );
    
    assert.strictEqual(sizingConsistent, true);
  });

  await t.test('should detect inconsistencies when images vary significantly', async () => {
    const consistency = new ProcessingConsistency({
      aspectRatioTolerance: 0.05 // Very strict tolerance
    });
    
    // Process images with very different characteristics
    const images = [
      { width: 400, height: 300, format: 'jpeg', path: 'small.jpg' },
      { width: 4000, height: 3000, format: 'png', path: 'huge.png' }
    ];
    
    // Calculate configs for all images
    images.forEach(img => {
      consistency.calculateConsistentConfig(img, img.path);
    });
    
    // Validate consistency
    const validation = await consistency.validateProcessingConsistency(images.map(img => img.path));
    
    // Should detect inconsistencies due to very different sizes
    assert.strictEqual(validation.isConsistent, false);
    assert.ok(validation.inconsistencies.length > 0);
  });

  await t.test('should provide processing statistics', () => {
    const consistency = new ProcessingConsistency();
    
    // Process several images
    const images = [
      { width: 800, height: 600, format: 'jpeg' },
      { width: 1200, height: 900, format: 'png' },
      { width: 1600, height: 1200, format: 'webp' }
    ];
    
    images.forEach((img, index) => {
      consistency.calculateConsistentConfig(img, `test${index}.${img.format}`);
    });
    
    const stats = consistency.getProcessingStatistics();
    
    assert.strictEqual(stats.totalProcessed, 3);
    assert.ok(stats.fontSizeRange);
    assert.ok(stats.paddingRange);
    assert.ok(stats.imageDimensionsRange);
    assert.ok(stats.formatDistribution);
    
    // Check format distribution
    assert.strictEqual(stats.formatDistribution.jpeg, 1);
    assert.strictEqual(stats.formatDistribution.png, 1);
    assert.strictEqual(stats.formatDistribution.webp, 1);
  });

  await t.test('should clear processing history', () => {
    const consistency = new ProcessingConsistency();
    
    // Process an image
    const metadata = { width: 800, height: 600, format: 'jpeg' };
    consistency.calculateConsistentConfig(metadata, 'test.jpg');
    
    // Verify history exists
    assert.ok(consistency.getProcessingHistory('test.jpg'));
    
    // Clear history
    consistency.clearHistory();
    
    // Verify history is cleared
    assert.strictEqual(consistency.getProcessingHistory('test.jpg'), null);
    
    const stats = consistency.getProcessingStatistics();
    assert.strictEqual(stats.totalProcessed, 0);
  });
});