/**
 * ReferenceValidator Module
 * Scans code files for image references and validates functionality preservation
 */

import { readdir, stat, readFile, access } from 'fs/promises';
import { join, extname, resolve, relative, dirname } from 'path';

export class ReferenceValidator {
  constructor() {
    this.codeFileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.css', '.scss', '.sass', '.json'];
    this.imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
    this.excludedDirectories = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      '.vercel',
      '.vscode',
      'logs',
      'coverage',
      '.backups'
    ];
    this.imageReferences = new Map(); // Map of image paths to their references
    this.brokenReferences = [];
  }

  /**
   * Scans all code files for image references
   * @param {string} rootPath - Root directory to scan
   * @returns {Promise<Map<string, Array<Object>>>} Map of image paths to reference objects
   */
  async scanCodeFilesForImageReferences(rootPath = '../') {
    const resolvedRootPath = resolve(rootPath);
    this.imageReferences.clear();
    this.brokenReferences = [];
    
    console.log('Starting code file scan for image references...');
    
    // Scan main portfolio directory
    await this._scanDirectoryForReferences(resolvedRootPath, resolvedRootPath);
    
    // Scan projects directory
    const projectsPath = join(resolvedRootPath, 'projects');
    try {
      await access(projectsPath);
      const projects = await readdir(projectsPath);
      
      for (const project of projects) {
        const projectPath = join(projectsPath, project);
        const stats = await stat(projectPath);
        
        if (stats.isDirectory()) {
          console.log(`Scanning project for references: ${project}`);
          await this._scanDirectoryForReferences(projectPath, resolvedRootPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan projects directory for references:`, error.message);
    }
    
    return this.imageReferences;
  }

  /**
   * Validates that processed images maintain functionality
   * @param {Array<string>} processedImagePaths - Array of processed image paths
   * @param {string} rootPath - Root directory path
   * @returns {Promise<{valid: boolean, brokenReferences: Array<Object>, summary: Object}>} Validation result
   */
  async validateProcessedImageReferences(processedImagePaths, rootPath = '../') {
    const resolvedRootPath = resolve(rootPath);
    const validationResults = {
      valid: true,
      brokenReferences: [],
      summary: {
        totalReferences: 0,
        validReferences: 0,
        brokenReferences: 0,
        processedImages: processedImagePaths.length
      }
    };

    // First scan for all references if not already done
    if (this.imageReferences.size === 0) {
      await this.scanCodeFilesForImageReferences(rootPath);
    }

    console.log('Validating image references after processing...');

    // Check each processed image's references
    for (const imagePath of processedImagePaths) {
      const normalizedImagePath = this._normalizeImagePath(imagePath, resolvedRootPath);
      const references = this.imageReferences.get(normalizedImagePath) || [];
      
      validationResults.summary.totalReferences += references.length;

      for (const reference of references) {
        const isValid = await this._validateReference(reference, resolvedRootPath);
        
        if (isValid) {
          validationResults.summary.validReferences++;
        } else {
          validationResults.summary.brokenReferences++;
          validationResults.brokenReferences.push({
            imagePath: normalizedImagePath,
            reference: reference,
            issue: 'Image file not found or inaccessible'
          });
          validationResults.valid = false;
        }
      }
    }

    return validationResults;
  }

  /**
   * Ensures file paths remain unchanged after processing
   * @param {Array<string>} originalPaths - Original image paths
   * @param {Array<string>} processedPaths - Processed image paths
   * @returns {{pathsUnchanged: boolean, changedPaths: Array<Object>}} Path validation result
   */
  validatePathConsistency(originalPaths, processedPaths) {
    const result = {
      pathsUnchanged: true,
      changedPaths: []
    };

    // Create sets for comparison
    const originalSet = new Set(originalPaths.map(p => resolve(p)));
    const processedSet = new Set(processedPaths.map(p => resolve(p)));

    // Check for missing paths
    for (const originalPath of originalSet) {
      if (!processedSet.has(originalPath)) {
        result.pathsUnchanged = false;
        result.changedPaths.push({
          original: originalPath,
          status: 'missing',
          issue: 'Original path not found in processed paths'
        });
      }
    }

    // Check for new paths (shouldn't happen in watermarking)
    for (const processedPath of processedSet) {
      if (!originalSet.has(processedPath)) {
        result.pathsUnchanged = false;
        result.changedPaths.push({
          processed: processedPath,
          status: 'unexpected',
          issue: 'New path found in processed paths'
        });
      }
    }

    return result;
  }

  /**
   * Gets all image references found during scanning
   * @returns {Map<string, Array<Object>>} Map of image paths to references
   */
  getImageReferences() {
    return new Map(this.imageReferences);
  }

  /**
   * Gets summary of reference scanning results
   * @returns {Object} Summary statistics
   */
  getReferenceSummary() {
    const summary = {
      totalImages: this.imageReferences.size,
      totalReferences: 0,
      referencesByType: {},
      imagesByProject: {}
    };

    for (const [imagePath, references] of this.imageReferences) {
      summary.totalReferences += references.length;
      
      // Count by reference type
      references.forEach(ref => {
        const type = ref.type || 'unknown';
        summary.referencesByType[type] = (summary.referencesByType[type] || 0) + 1;
      });

      // Count by project
      const projectMatch = imagePath.match(/projects\/([^\/]+)/);
      if (projectMatch) {
        const project = projectMatch[1];
        summary.imagesByProject[project] = (summary.imagesByProject[project] || 0) + 1;
      } else if (imagePath.includes('public/')) {
        summary.imagesByProject['public'] = (summary.imagesByProject['public'] || 0) + 1;
      }
    }

    return summary;
  }

  /**
   * Recursively scans directory for code files and extracts image references
   * @private
   */
  async _scanDirectoryForReferences(dirPath, rootPath) {
    try {
      const entries = await readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        
        try {
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            if (!this._shouldSkipDirectory(entry)) {
              await this._scanDirectoryForReferences(fullPath, rootPath);
            }
          } else if (stats.isFile() && this._isCodeFile(entry)) {
            await this._extractImageReferencesFromFile(fullPath, rootPath);
          }
        } catch (statError) {
          console.warn(`Warning: Could not stat ${fullPath}:`, statError.message);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Extracts image references from a single code file
   * @private
   */
  async _extractImageReferencesFromFile(filePath, rootPath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const relativePath = relative(rootPath, filePath);
      
      // Different patterns for different file types
      const patterns = this._getImageReferencePatterns(filePath);
      
      for (const pattern of patterns) {
        const matches = content.matchAll(pattern.regex);
        
        for (const match of matches) {
          const imagePath = match[1] || match[2]; // Different capture groups
          if (imagePath && this._isImagePath(imagePath)) {
            const resolvedImagePath = this._resolveImagePath(imagePath, filePath, rootPath);
            const normalizedPath = this._normalizeImagePath(resolvedImagePath, rootPath);
            
            if (!this.imageReferences.has(normalizedPath)) {
              this.imageReferences.set(normalizedPath, []);
            }
            
            this.imageReferences.get(normalizedPath).push({
              sourceFile: relativePath,
              line: this._getLineNumber(content, match.index),
              type: pattern.type,
              originalReference: imagePath,
              resolvedPath: resolvedImagePath
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    }
  }

  /**
   * Gets image reference patterns for different file types
   * @private
   */
  _getImageReferencePatterns(filePath) {
    const ext = extname(filePath).toLowerCase();
    const patterns = [];

    // JavaScript/TypeScript patterns
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      patterns.push(
        { regex: /import\s+.*?from\s+['"`]([^'"`]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]/gi, type: 'import' },
        { regex: /require\(['"`]([^'"`]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]\)/gi, type: 'require' },
        { regex: /src\s*=\s*['"`]([^'"`]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]/gi, type: 'src_attribute' },
        { regex: /['"`]([^'"`]*\/[^'"`]*\.(?:jpg|jpeg|png|webp|svg|gif))['"`]/gi, type: 'string_literal' }
      );
    }

    // HTML patterns
    if (ext === '.html') {
      patterns.push(
        { regex: /<img[^>]+src\s*=\s*['"`]([^'"`]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]/gi, type: 'img_tag' },
        { regex: /<source[^>]+src\s*=\s*['"`]([^'"`]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]/gi, type: 'source_tag' },
        { regex: /background-image\s*:\s*url\(['"`]?([^'"`\)]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]?\)/gi, type: 'css_background' }
      );
    }

    // CSS patterns
    if (['.css', '.scss', '.sass'].includes(ext)) {
      patterns.push(
        { regex: /background-image\s*:\s*url\(['"`]?([^'"`\)]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]?\)/gi, type: 'css_background' },
        { regex: /url\(['"`]?([^'"`\)]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]?\)/gi, type: 'css_url' }
      );
    }

    // JSON patterns (for configuration files)
    if (ext === '.json') {
      patterns.push(
        { regex: /['"`]([^'"`]+\.(?:jpg|jpeg|png|webp|svg|gif))['"`]/gi, type: 'json_value' }
      );
    }

    return patterns;
  }

  /**
   * Validates a single reference
   * @private
   */
  async _validateReference(reference, rootPath) {
    try {
      await access(reference.resolvedPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Resolves relative image path to absolute path
   * @private
   */
  _resolveImagePath(imagePath, sourceFilePath, rootPath) {
    // Handle absolute paths
    if (imagePath.startsWith('/')) {
      return join(rootPath, 'public', imagePath.substring(1));
    }
    
    // Handle relative paths
    if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
      return resolve(dirname(sourceFilePath), imagePath);
    }
    
    // Handle paths relative to public directory
    if (!imagePath.includes('/')) {
      return join(rootPath, 'public', imagePath);
    }
    
    // Default: resolve relative to source file
    return resolve(dirname(sourceFilePath), imagePath);
  }

  /**
   * Normalizes image path for consistent mapping
   * @private
   */
  _normalizeImagePath(imagePath, rootPath) {
    const resolved = resolve(imagePath);
    return relative(rootPath, resolved);
  }

  /**
   * Checks if file is a code file
   * @private
   */
  _isCodeFile(filename) {
    const ext = extname(filename).toLowerCase();
    return this.codeFileExtensions.includes(ext);
  }

  /**
   * Checks if path appears to be an image
   * @private
   */
  _isImagePath(path) {
    const ext = extname(path).toLowerCase();
    return this.imageExtensions.includes(ext);
  }

  /**
   * Determines if directory should be skipped
   * @private
   */
  _shouldSkipDirectory(dirName) {
    return dirName.startsWith('.') || this.excludedDirectories.includes(dirName);
  }

  /**
   * Gets line number for a match in content
   * @private
   */
  _getLineNumber(content, index) {
    const beforeMatch = content.substring(0, index);
    return beforeMatch.split('\n').length;
  }
}