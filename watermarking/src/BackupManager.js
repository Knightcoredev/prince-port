/**
 * BackupManager Module
 * Creates and manages image backups with timestamps
 * Implements requirements 1.4, 4.1, 4.2
 */

import { mkdir, copyFile, readdir, unlink, stat, access, rmdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { constants } from 'fs';

export class BackupManager {
  constructor(backupDir = '.backups') {
    this.backupDir = backupDir;
    this.backupRegistry = new Map(); // Track original -> backup path mappings
  }

  /**
   * Creates backup copy of an image with timestamp
   * @param {string} imagePath - Path to original image
   * @returns {Promise<string>} Path to backup file
   * @throws {Error} If backup creation fails
   */
  async createBackup(imagePath) {
    try {
      // Validate input file exists and is readable
      await this._validateImageFile(imagePath);
      
      // Generate timestamp for backup folder
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFolder = join(this.backupDir, timestamp);
      
      // Create backup directory structure
      await mkdir(backupFolder, { recursive: true });
      
      // Generate unique backup filename with original extension
      const fileName = basename(imagePath);
      const backupPath = join(backupFolder, fileName);
      
      // Copy original file to backup location
      await copyFile(imagePath, backupPath);
      
      // Verify backup was created successfully
      await this._validateImageFile(backupPath);
      
      // Register the backup mapping
      this.backupRegistry.set(imagePath, backupPath);
      
      console.log(`✓ Backup created: ${imagePath} -> ${backupPath}`);
      return backupPath;
      
    } catch (error) {
      const message = `Failed to create backup for ${imagePath}: ${error.message}`;
      console.error(`✗ ${message}`);
      throw new Error(message);
    }
  }

  /**
   * Restores image from backup
   * @param {string} originalPath - Original image path
   * @param {string} backupPath - Backup file path (optional, will use registry if not provided)
   * @returns {Promise<void>}
   * @throws {Error} If restore operation fails
   */
  async restoreFromBackup(originalPath, backupPath = null) {
    try {
      // Use registry to find backup if not provided
      const actualBackupPath = backupPath || this.backupRegistry.get(originalPath);
      
      if (!actualBackupPath) {
        throw new Error(`No backup found for ${originalPath}`);
      }
      
      // Validate backup file exists
      await this._validateImageFile(actualBackupPath);
      
      // Ensure target directory exists
      const targetDir = dirname(originalPath);
      await mkdir(targetDir, { recursive: true });
      
      // Restore from backup
      await copyFile(actualBackupPath, originalPath);
      
      // Verify restoration was successful
      await this._validateImageFile(originalPath);
      
      console.log(`✓ Restored: ${actualBackupPath} -> ${originalPath}`);
      
    } catch (error) {
      const message = `Failed to restore ${originalPath}: ${error.message}`;
      console.error(`✗ ${message}`);
      throw new Error(message);
    }
  }

  /**
   * Removes old backup folders (keeps last 5 by default)
   * @param {number} keepCount - Number of recent backups to keep (default: 5)
   * @returns {Promise<{deleted: number, kept: number, errors: string[]}>} Cleanup summary
   */
  async cleanupBackups(keepCount = 5) {
    const result = { deleted: 0, kept: 0, errors: [] };
    
    try {
      // Check if backup directory exists
      await access(this.backupDir, constants.F_OK);
      
      const backupFolders = await readdir(this.backupDir);
      
      // Filter and sort timestamp folders (ignore non-timestamp entries)
      const timestampFolders = backupFolders
        .filter(folder => /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/.test(folder))
        .sort()
        .reverse(); // Most recent first
      
      result.kept = Math.min(timestampFolders.length, keepCount);
      
      // Keep only the most recent backups
      const foldersToDelete = timestampFolders.slice(keepCount);
      
      for (const folder of foldersToDelete) {
        try {
          const folderPath = join(this.backupDir, folder);
          await this._deleteDirectory(folderPath);
          result.deleted++;
          console.log(`✓ Deleted old backup: ${folder}`);
        } catch (error) {
          const errorMsg = `Failed to delete backup ${folder}: ${error.message}`;
          result.errors.push(errorMsg);
          console.warn(`⚠ ${errorMsg}`);
        }
      }
      
      console.log(`✓ Cleanup complete: kept ${result.kept}, deleted ${result.deleted} backups`);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ℹ No backup directory found, nothing to cleanup');
      } else {
        const errorMsg = `Backup cleanup failed: ${error.message}`;
        result.errors.push(errorMsg);
        console.warn(`⚠ ${errorMsg}`);
      }
    }
    
    return result;
  }

  /**
   * Gets backup path for a given original image path
   * @param {string} originalPath - Original image path
   * @returns {string|null} Backup path or null if not found
   */
  getBackupPath(originalPath) {
    return this.backupRegistry.get(originalPath) || null;
  }

  /**
   * Lists all backup folders with their creation times
   * @returns {Promise<Array<{folder: string, created: Date, size: number}>>}
   */
  async listBackups() {
    const backups = [];
    
    try {
      await access(this.backupDir, constants.F_OK);
      const folders = await readdir(this.backupDir);
      
      for (const folder of folders) {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/.test(folder)) {
          try {
            const folderPath = join(this.backupDir, folder);
            const stats = await stat(folderPath);
            const created = new Date(folder.replace(/-/g, ':').replace('T', 'T').slice(0, 19));
            
            backups.push({
              folder,
              created,
              size: stats.size || 0
            });
          } catch (error) {
            console.warn(`Warning: Could not read backup folder ${folder}:`, error.message);
          }
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Warning: Could not list backups:', error.message);
      }
    }
    
    return backups.sort((a, b) => b.created - a.created);
  }

  /**
   * Validates that an image file exists and is readable
   * @private
   * @param {string} imagePath - Path to image file
   * @throws {Error} If file is invalid or inaccessible
   */
  async _validateImageFile(imagePath) {
    try {
      await access(imagePath, constants.F_OK | constants.R_OK);
      const stats = await stat(imagePath);
      
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${imagePath}`);
      }
      
      if (stats.size === 0) {
        throw new Error(`File is empty: ${imagePath}`);
      }
      
      // Validate file extension
      const ext = extname(imagePath).toLowerCase();
      const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
      
      if (!supportedFormats.includes(ext)) {
        throw new Error(`Unsupported image format: ${ext}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${imagePath}`);
      } else if (error.code === 'EACCES') {
        throw new Error(`Permission denied: ${imagePath}`);
      }
      throw error;
    }
  }

  /**
   * Recursively deletes a directory and all its contents
   * @private
   * @param {string} dirPath - Directory path to delete
   */
  async _deleteDirectory(dirPath) {
    try {
      const entries = await readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await this._deleteDirectory(fullPath);
        } else {
          await unlink(fullPath);
        }
      }
      
      // Remove the directory itself
      await rmdir(dirPath);
    } catch (error) {
      throw new Error(`Could not delete directory ${dirPath}: ${error.message}`);
    }
  }
}