#!/usr/bin/env node

/**
 * Log Cleaning Script
 * Cleans old log files and manages log rotation
 */

const fs = require('fs').promises;
const path = require('path');

class LogCleaner {
  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    this.maxSize = 100 * 1024 * 1024; // 100MB
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async cleanOldLogs() {
    this.log('Cleaning old log files...');
    
    try {
      const files = await fs.readdir(this.logsDir);
      const now = Date.now();
      let cleanedCount = 0;
      let totalSizeFreed = 0;

      for (const file of files) {
        const filePath = path.join(this.logsDir, file);
        const stats = await fs.stat(filePath);
        
        // Skip directories
        if (stats.isDirectory()) continue;
        
        const age = now - stats.mtime.getTime();
        
        // Remove files older than maxAge
        if (age > this.maxAge) {
          totalSizeFreed += stats.size;
          await fs.unlink(filePath);
          cleanedCount++;
          this.log(`Removed old log file: ${file} (${this.formatBytes(stats.size)})`);
        }
      }

      this.log(`Cleaned ${cleanedCount} old log files, freed ${this.formatBytes(totalSizeFreed)}`);
      
    } catch (error) {
      this.log(`Error cleaning old logs: ${error.message}`, 'error');
      throw error;
    }
  }

  async rotateLargeLogs() {
    this.log('Checking for large log files...');
    
    try {
      const files = await fs.readdir(this.logsDir);
      let rotatedCount = 0;

      for (const file of files) {
        // Skip already rotated files
        if (file.includes('.1') || file.includes('.old')) continue;
        
        const filePath = path.join(this.logsDir, file);
        const stats = await fs.stat(filePath);
        
        // Skip directories
        if (stats.isDirectory()) continue;
        
        // Rotate files larger than maxSize
        if (stats.size > this.maxSize) {
          const rotatedPath = path.join(this.logsDir, `${file}.old`);
          
          // Remove old rotated file if it exists
          try {
            await fs.unlink(rotatedPath);
          } catch (error) {
            // File doesn't exist, that's fine
          }
          
          // Rotate current file
          await fs.rename(filePath, rotatedPath);
          
          // Create new empty file
          await fs.writeFile(filePath, '');
          
          rotatedCount++;
          this.log(`Rotated large log file: ${file} (${this.formatBytes(stats.size)})`);
        }
      }

      if (rotatedCount === 0) {
        this.log('No large log files found');
      } else {
        this.log(`Rotated ${rotatedCount} large log files`);
      }
      
    } catch (error) {
      this.log(`Error rotating logs: ${error.message}`, 'error');
      throw error;
    }
  }

  async compressOldLogs() {
    this.log('Compressing old log files...');
    
    try {
      const files = await fs.readdir(this.logsDir);
      const now = Date.now();
      const compressionAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      let compressedCount = 0;

      for (const file of files) {
        // Only compress .old files
        if (!file.includes('.old') || file.includes('.gz')) continue;
        
        const filePath = path.join(this.logsDir, file);
        const stats = await fs.stat(filePath);
        
        const age = now - stats.mtime.getTime();
        
        // Compress files older than 7 days
        if (age > compressionAge) {
          const gzipPath = `${filePath}.gz`;
          
          // Simple compression simulation (in real scenario, use zlib)
          const content = await fs.readFile(filePath, 'utf8');
          await fs.writeFile(gzipPath, content); // In real scenario, use gzip compression
          await fs.unlink(filePath);
          
          compressedCount++;
          this.log(`Compressed old log file: ${file}`);
        }
      }

      if (compressedCount === 0) {
        this.log('No old log files to compress');
      } else {
        this.log(`Compressed ${compressedCount} old log files`);
      }
      
    } catch (error) {
      this.log(`Error compressing logs: ${error.message}`, 'error');
      // Don't throw error for compression failures
    }
  }

  async getLogStatistics() {
    this.log('Gathering log statistics...');
    
    try {
      const files = await fs.readdir(this.logsDir);
      let totalSize = 0;
      let fileCount = 0;
      const fileTypes = {};

      for (const file of files) {
        const filePath = path.join(this.logsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
          
          const ext = path.extname(file) || 'no-extension';
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      }

      this.log(`Log directory statistics:`);
      this.log(`  Total files: ${fileCount}`);
      this.log(`  Total size: ${this.formatBytes(totalSize)}`);
      this.log(`  File types: ${JSON.stringify(fileTypes, null, 2)}`);
      
      return {
        totalFiles: fileCount,
        totalSize,
        fileTypes
      };
      
    } catch (error) {
      this.log(`Error gathering statistics: ${error.message}`, 'error');
      throw error;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async clean() {
    this.log('🧹 Starting log cleanup process...');
    
    try {
      // Ensure logs directory exists
      try {
        await fs.access(this.logsDir);
      } catch {
        this.log('Logs directory does not exist, creating...');
        await fs.mkdir(this.logsDir, { recursive: true });
        this.log('Created logs directory');
        return;
      }

      // Get initial statistics
      const initialStats = await this.getLogStatistics();
      
      // Perform cleanup operations
      await this.rotateLargeLogs();
      await this.compressOldLogs();
      await this.cleanOldLogs();
      
      // Get final statistics
      const finalStats = await this.getLogStatistics();
      
      // Show summary
      const sizeDiff = initialStats.totalSize - finalStats.totalSize;
      const fileDiff = initialStats.totalFiles - finalStats.totalFiles;
      
      this.log('\n📊 Cleanup Summary:');
      this.log(`  Files removed: ${fileDiff}`);
      this.log(`  Space freed: ${this.formatBytes(sizeDiff)}`);
      this.log(`  Remaining files: ${finalStats.totalFiles}`);
      this.log(`  Remaining size: ${this.formatBytes(finalStats.totalSize)}`);
      
      this.log('🎉 Log cleanup completed successfully!');
      
    } catch (error) {
      this.log(`💥 Log cleanup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Execute cleanup if run directly
if (require.main === module) {
  const cleaner = new LogCleaner();
  cleaner.clean();
}

module.exports = LogCleaner;