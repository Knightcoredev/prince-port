#!/usr/bin/env node

/**
 * SQLite Database Backup Script
 * Creates backups of the SQLite database with timestamp
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function loadEnvFile(envPath = '.env.production') {
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file not found: ${envPath}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

function createBackup() {
  const envVars = loadEnvFile();
  const dbPath = envVars.SQLITE_DB_PATH || './data/portfolio.db';
  const backupDir = envVars.SQLITE_BACKUP_PATH || './backups/';
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Database file not found: ${dbPath}`);
    process.exit(1);
  }

  // Create timestamp for backup filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFileName = `portfolio-backup-${timestamp}.db`;
  const backupPath = path.join(backupDir, backupFileName);

  try {
    // Copy the database file
    fs.copyFileSync(dbPath, backupPath);
    
    // Also create a SQL dump for additional safety
    const sqlDumpPath = path.join(backupDir, `portfolio-backup-${timestamp}.sql`);
    const dumpCommand = `sqlite3 "${dbPath}" .dump > "${sqlDumpPath}"`;
    
    execSync(dumpCommand, { stdio: 'inherit' });
    
    console.log(`✅ Database backup created successfully:`);
    console.log(`   Binary backup: ${backupPath}`);
    console.log(`   SQL dump: ${sqlDumpPath}`);
    
    // Clean up old backups (keep only last N backups)
    cleanupOldBackups(backupDir, parseInt(envVars.BACKUP_RETENTION || '7'));
    
    return { backupPath, sqlDumpPath };
    
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
  }
}

function cleanupOldBackups(backupDir, retentionDays) {
  try {
    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(file => 
      file.startsWith('portfolio-backup-') && (file.endsWith('.db') || file.endsWith('.sql'))
    );
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    let deletedCount = 0;
    
    backupFiles.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old backup files`);
    }
    
  } catch (error) {
    console.warn('⚠️  Warning: Could not clean up old backups:', error.message);
  }
}

function restoreBackup(backupPath) {
  const envVars = loadEnvFile();
  const dbPath = envVars.SQLITE_DB_PATH || './data/portfolio.db';
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup file not found: ${backupPath}`);
    process.exit(1);
  }
  
  try {
    // Create a backup of current database before restoring
    if (fs.existsSync(dbPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const currentBackupPath = `${dbPath}.backup-${timestamp}`;
      fs.copyFileSync(dbPath, currentBackupPath);
      console.log(`📦 Current database backed up to: ${currentBackupPath}`);
    }
    
    // Restore from backup
    if (backupPath.endsWith('.sql')) {
      // Restore from SQL dump
      const restoreCommand = `sqlite3 "${dbPath}" < "${backupPath}"`;
      execSync(restoreCommand, { stdio: 'inherit' });
    } else {
      // Restore from binary backup
      fs.copyFileSync(backupPath, dbPath);
    }
    
    console.log(`✅ Database restored successfully from: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error.message);
    process.exit(1);
  }
}

function listBackups() {
  const envVars = loadEnvFile();
  const backupDir = envVars.SQLITE_BACKUP_PATH || './backups/';
  
  if (!fs.existsSync(backupDir)) {
    console.log('📁 No backup directory found');
    return;
  }
  
  const files = fs.readdirSync(backupDir);
  const backupFiles = files.filter(file => 
    file.startsWith('portfolio-backup-') && (file.endsWith('.db') || file.endsWith('.sql'))
  );
  
  if (backupFiles.length === 0) {
    console.log('📁 No backup files found');
    return;
  }
  
  console.log('📦 Available backups:');
  backupFiles
    .sort()
    .reverse()
    .forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`   ${file} (${size} KB) - ${stats.mtime.toISOString()}`);
    });
}

function main() {
  const command = process.argv[2];
  const argument = process.argv[3];
  
  switch (command) {
    case 'create':
    case 'backup':
      console.log('🔄 Creating database backup...');
      createBackup();
      break;
      
    case 'restore':
      if (!argument) {
        console.error('❌ Please provide backup file path');
        console.log('Usage: node backup-sqlite.js restore <backup-file-path>');
        process.exit(1);
      }
      console.log(`🔄 Restoring database from: ${argument}`);
      restoreBackup(argument);
      break;
      
    case 'list':
      listBackups();
      break;
      
    default:
      console.log('SQLite Backup Management');
      console.log('');
      console.log('Usage:');
      console.log('  node backup-sqlite.js create     - Create a new backup');
      console.log('  node backup-sqlite.js restore <file> - Restore from backup');
      console.log('  node backup-sqlite.js list       - List available backups');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = { createBackup, restoreBackup, listBackups, cleanupOldBackups };