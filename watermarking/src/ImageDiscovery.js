/**
 * ImageDiscovery Module
 * Scans all portfolio projects for image files
 */

import { readdir, stat, access } from 'fs/promises';
import { join, extname, resolve } from 'path';

export class ImageDiscovery {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    this.excludedDirectories = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      '.vercel',
      '.vscode',
      'logs',
      'coverage'
    ];
  }

  /**
   * Finds all images in the portfolio projects
   * @param {string} rootPath - Root directory to scan (defaults to parent directory)
   * @returns {Promise<Array<Object>>} Array of image file objects with metadata
   */
  async findAllImages(rootPath = '../') {
    const imagePaths = [];
    const resolvedRootPath = resolve(rootPath);
    
    // Scan the main portfolio directories
    await this._scanPortfolioProjects(resolvedRootPath, imagePaths);
    await this._scanPublicDirectory(resolvedRootPath, imagePaths);
    
    return imagePaths;
  }

  /**
   * Scans all portfolio projects for images
   * @private
   */
  async _scanPortfolioProjects(rootPath, imagePaths) {
    const projectsPath = join(rootPath, 'projects');
    
    try {
      await access(projectsPath);
      const projects = await readdir(projectsPath);
      
      for (const project of projects) {
        const projectPath = join(projectsPath, project);
        const stats = await stat(projectPath);
        
        if (stats.isDirectory()) {
          console.log(`Scanning project: ${project}`);
          await this._scanDirectory(projectPath, imagePaths, `projects/${project}`);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan projects directory:`, error.message);
    }
  }

  /**
   * Scans the public directory for images
   * @private
   */
  async _scanPublicDirectory(rootPath, imagePaths) {
    const publicPath = join(rootPath, 'public');
    
    try {
      await access(publicPath);
      console.log('Scanning public directory');
      await this._scanDirectory(publicPath, imagePaths, 'public');
    } catch (error) {
      console.warn(`Warning: Could not scan public directory:`, error.message);
    }
  }

  /**
   * Filters files by supported image types
   * @param {string} filePath - File path to check
   * @returns {boolean} True if file is supported image format
   */
  filterImageTypes(filePath) {
    const ext = extname(filePath).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * Gets supported image formats
   * @returns {string[]} Array of supported file extensions
   */
  getSupportedFormats() {
    return [...this.supportedFormats];
  }

  /**
   * Recursively scans directory for image files
   * @private
   * @param {string} dirPath - Directory path to scan
   * @param {Array} imagePaths - Array to collect image paths
   * @param {string} relativePath - Relative path for context
   */
  async _scanDirectory(dirPath, imagePaths, relativePath = '') {
    try {
      const entries = await readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        
        try {
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            // Skip excluded directories
            if (!this._shouldSkipDirectory(entry)) {
              const newRelativePath = relativePath ? `${relativePath}/${entry}` : entry;
              await this._scanDirectory(fullPath, imagePaths, newRelativePath);
            }
          } else if (stats.isFile() && this.filterImageTypes(entry)) {
            const imageInfo = {
              path: fullPath,
              relativePath: relativePath ? `${relativePath}/${entry}` : entry,
              filename: entry,
              format: extname(entry).toLowerCase().substring(1),
              size: stats.size,
              lastModified: stats.mtime
            };
            imagePaths.push(imageInfo);
            console.log(`Found image: ${imageInfo.relativePath}`);
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
   * Determines if a directory should be skipped during scanning
   * @private
   * @param {string} dirName - Directory name to check
   * @returns {boolean} True if directory should be skipped
   */
  _shouldSkipDirectory(dirName) {
    return dirName.startsWith('.') || this.excludedDirectories.includes(dirName);
  }

  /**
   * Filters images by format
   * @param {Array<Object>} images - Array of image objects
   * @param {string|string[]} formats - Format(s) to filter by
   * @returns {Array<Object>} Filtered array of images
   */
  filterByFormat(images, formats) {
    const targetFormats = Array.isArray(formats) ? formats : [formats];
    const normalizedFormats = targetFormats.map(f => f.toLowerCase().replace('.', ''));
    
    return images.filter(image => normalizedFormats.includes(image.format));
  }

  /**
   * Gets statistics about discovered images
   * @param {Array<Object>} images - Array of image objects
   * @returns {Object} Statistics object
   */
  getImageStatistics(images) {
    const stats = {
      total: images.length,
      byFormat: {},
      totalSize: 0,
      byProject: {}
    };

    images.forEach(image => {
      // Count by format
      stats.byFormat[image.format] = (stats.byFormat[image.format] || 0) + 1;
      
      // Sum total size
      stats.totalSize += image.size;
      
      // Count by project
      const projectMatch = image.relativePath.match(/^projects\/([^\/]+)/);
      if (projectMatch) {
        const project = projectMatch[1];
        stats.byProject[project] = (stats.byProject[project] || 0) + 1;
      } else if (image.relativePath.startsWith('public/')) {
        stats.byProject['public'] = (stats.byProject['public'] || 0) + 1;
      }
    });

    return stats;
  }
}