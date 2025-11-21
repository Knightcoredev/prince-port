#!/usr/bin/env node

/**
 * Data Restoration Script
 * Restores data from backup files
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DataRestorer {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.dataDir = path.join(process.cwd(), 'data');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(file => file.endsWith('.tar.gz'))
        .map(file => {
          const stats = fs.stat(path.join(this.backupDir, file));
          return { file, stats };
        });

      return Promise.all(backups.map(async backup => ({
        file: backup.file,
        stats: await backup.stats
      })));
    } catch (error) {
      this.log(`Error listing backups: ${error.message}`, 'error');
      return [];
    }
  }

  async validateBackup(backupFile) {
    this.log(`Validating backup: ${backupFile}`);
    
    const backupPath = path.join(this.backupDir, backupFile);
    
    try {
      // Check if file exists
      await fs.access(backupPath);
      
      // Check file size
      const stats = await fs.stat(backupPath);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }
      
      // Test archive integrity (basic check)
      try {
        execSync(`tar -tzf "${backupPath}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Backup archive is corrupted');
      }
      
      this.log('Backup validation passed');
      return true;
    } catch (error) {
      this.log(`Backup validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async createBackupOfCurrent() {
    this.log('Creating backup of current data...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `pre-restore-${timestamp}.tar.gz`;
      const backupPath = path.join(this.backupDir, backupName);
      
      // Create backup directory if it doesn't exist
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Create backup of current data
      execSync(`tar -czf "${backupPath}" -C "${process.cwd()}" data`, { stdio: 'inherit' });
      
      this.log(`Current data backed up to: ${backupName}`);
      return backupName;
    } catch (error) {
      this.log(`Failed to backup current data: ${error.message}`, 'error');
      throw error;
    }
  }

  async restoreData(backupFile) {
    this.log(`Starting data restoration from: ${backupFile}`);
    
    const backupPath = path.join(this.backupDir, backupFile);
    
    try {
      // Validate backup first
      const isValid = await this.validateBackup(backupFile);
      if (!isValid) {
        throw new Error('Backup validation failed');
      }
      
      // Create backup of current data
      await this.createBackupOfCurrent();
      
      // Remove current data directory
      try {
        await fs.rm(this.dataDir, { recursive: true, force: true });
      } catch (error) {
        // Directory might not exist
      }
      
      // Extract backup
      this.log('Extracting backup data...');
      execSync(`tar -xzf "${backupPath}" -C "${process.cwd()}"`, { stdio: 'inherit' });
      
      // Verify restored data
      await this.verifyRestoredData();
      
      this.log('Data restoration completed successfully');
      
    } catch (error) {
      this.log(`Data restoration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async verifyRestoredData() {
    this.log('Verifying restored data...');
    
    const requiredFiles = [
      'data/users.json',
      'data/blog-posts.json',
      'data/projects.json',
      'data/contacts.json'
    ];

    for (const file of requiredFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        JSON.parse(content); // Validate JSON
        this.log(`Verified: ${file}`);
      } catch (error) {
        throw new Error(`Invalid restored file: ${file} - ${error.message}`);
      }
    }
    
    this.log('Data verification completed');
  }

  async restore(backupFile) {
    try {
      this.log('🔄 Starting data restoration process...');
      
      // If no backup file specified, list available backups
      if (!backupFile) {
        const backups = await this.listBackups();
        
        if (backups.length === 0) {
          this.log('No backup files found', 'error');
          process.exit(1);
        }
        
        this.log('Available backups:');
        backups.forEach((backup, index) => {
          const date = backup.stats.mtime.toISOString();
          const size = (backup.stats.size / 1024 / 1024).toFixed(2);
          console.log(`  ${index + 1}. ${backup.file} (${date}, ${size}MB)`);
        });
        
        this.log('Please specify a backup file: npm run restore -- backup-filename.tar.gz');
        process.exit(0);
      }
      
      await this.restoreData(backupFile);
      
      this.log('🎉 Data restoration completed successfully!');
      this.log('\n📋 Next steps:');
      this.log('1. Restart the application if it\'s running');
      this.log('2. Verify the restored data through the admin panel');
      this.log('3. Test all functionality to ensure everything works');
      
    } catch (error) {
      this.log(`💥 Data restoration failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Execute restoration if run directly
if (require.main === module) {
  const backupFile = process.argv[2];
  const restorer = new DataRestorer();
  restorer.restore(backupFile);
}

module.exports = DataRestorer;