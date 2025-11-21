#!/usr/bin/env node

/**
 * Data Backup Script
 * Creates backups of all data files with timestamp
 */

const fs = require('fs').promises;
const path = require('path');
const { createBackup, getStats } = require('../lib/db');

/**
 * Create backup of all data files
 */
async function backupAllData() {
  try {
    console.log('💾 Starting data backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', timestamp);
    
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });
    
    const dataFiles = ['blog-posts', 'projects', 'contacts', 'users'];
    const backupPaths = [];
    
    for (const file of dataFiles) {
      try {
        const sourcePath = path.join(process.cwd(), 'data', `${file}.json`);
        const backupPath = path.join(backupDir, `${file}.json`);
        
        // Copy file to backup directory
        const data = await fs.readFile(sourcePath, 'utf8');
        await fs.writeFile(backupPath, data);
        
        backupPaths.push(backupPath);
        console.log(`   ✅ Backed up: ${file}.json`);
        
      } catch (error) {
        console.log(`   ⚠️  Skipped: ${file}.json (${error.message})`);
      }
    }
    
    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      files: dataFiles,
      backupDir,
      stats: await getStats()
    };
    
    await fs.writeFile(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`\n🎉 Backup completed successfully!`);
    console.log(`📁 Backup location: ${backupDir}`);
    console.log(`📊 Files backed up: ${backupPaths.length}`);
    
    return backupDir;
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

/**
 * Clean old backups (keep last N backups)
 */
async function cleanOldBackups(keepCount = 10) {
  try {
    console.log(`🧹 Cleaning old backups (keeping last ${keepCount})...`);
    
    const backupsDir = path.join(process.cwd(), 'backups');
    
    try {
      const entries = await fs.readdir(backupsDir, { withFileTypes: true });
      const backupDirs = entries
        .filter(entry => entry.isDirectory())
        .map(entry => ({
          name: entry.name,
          path: path.join(backupsDir, entry.name)
        }))
        .sort((a, b) => b.name.localeCompare(a.name)); // Sort by timestamp (newest first)
      
      if (backupDirs.length <= keepCount) {
        console.log('   No old backups to clean');
        return;
      }
      
      const toDelete = backupDirs.slice(keepCount);
      
      for (const backup of toDelete) {
        await fs.rm(backup.path, { recursive: true, force: true });
        console.log(`   🗑️  Deleted: ${backup.name}`);
      }
      
      console.log(`✅ Cleaned ${toDelete.length} old backups`);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('   No backups directory found');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to clean old backups:', error.message);
  }
}

/**
 * List available backups
 */
async function listBackups() {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    
    const backups = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(backupsDir, entry.name, 'manifest.json');
        
        try {
          const manifestData = await fs.readFile(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestData);
          backups.push({
            name: entry.name,
            ...manifest
          });
        } catch {
          // Backup without manifest
          backups.push({
            name: entry.name,
            timestamp: entry.name,
            files: ['unknown']
          });
        }
      }
    }
    
    return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Main backup function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'backup';
    
    switch (command) {
      case 'backup':
        await backupAllData();
        await cleanOldBackups();
        break;
        
      case 'list':
        const backups = await listBackups();
        console.log('\n📋 Available backups:');
        if (backups.length === 0) {
          console.log('   No backups found');
        } else {
          backups.forEach((backup, index) => {
            console.log(`   ${index + 1}. ${backup.name} (${backup.files?.length || 0} files)`);
          });
        }
        break;
        
      case 'clean':
        const keepCount = parseInt(args[1]) || 5;
        await cleanOldBackups(keepCount);
        break;
        
      default:
        console.log('Usage:');
        console.log('  node backup-data.js backup  - Create new backup');
        console.log('  node backup-data.js list    - List available backups');
        console.log('  node backup-data.js clean [count] - Clean old backups (default: keep 5)');
    }
    
  } catch (error) {
    console.error('\n💥 Backup operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  backupAllData,
  cleanOldBackups,
  listBackups
};