/**
 * SQLite Database Connection Utility
 * Provides a simple interface for database operations
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.SQLITE_DB_PATH || './data/portfolio.db';
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected && this.db) {
      return this.db;
    }

    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error connecting to SQLite database:', err.message);
          reject(err);
          return;
        }

        console.log('Connected to SQLite database');
        this.isConnected = true;

        // Configure SQLite for optimal performance
        this.configureSQLite()
          .then(() => resolve(this.db))
          .catch(reject);
      });
    });
  }

  async configureSQLite() {
    const configurations = [
      // Enable foreign key constraints
      'PRAGMA foreign_keys = ON',
      
      // Set WAL mode for better concurrency
      `PRAGMA journal_mode = ${process.env.SQLITE_JOURNAL_MODE || 'WAL'}`,
      
      // Set synchronous mode
      `PRAGMA synchronous = ${process.env.SQLITE_SYNCHRONOUS || 'NORMAL'}`,
      
      // Set cache size (in KB)
      `PRAGMA cache_size = ${process.env.SQLITE_CACHE_SIZE || '2000'}`,
      
      // Set busy timeout
      `PRAGMA busy_timeout = ${process.env.SQLITE_TIMEOUT || '30000'}`
    ];

    for (const pragma of configurations) {
      await this.run(pragma);
    }
  }

  async run(sql, params = []) {
    if (!this.db) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async get(sql, params = []) {
    if (!this.db) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    if (!this.db) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  async close() {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('SQLite database connection closed');
        this.isConnected = false;
        this.db = null;
        resolve();
      });
    });
  }

  // Transaction support
  async beginTransaction() {
    await this.run('BEGIN TRANSACTION');
  }

  async commit() {
    await this.run('COMMIT');
  }

  async rollback() {
    await this.run('ROLLBACK');
  }

  // Helper method for transactions
  async transaction(callback) {
    try {
      await this.beginTransaction();
      const result = await callback(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.get('SELECT 1 as health');
      return result && result.health === 1;
    } catch (error) {
      console.error('Database health check failed:', error.message);
      return false;
    }
  }

  // Get database info
  async getInfo() {
    try {
      const [
        userVersion,
        journalMode,
        synchronous,
        cacheSize,
        foreignKeys
      ] = await Promise.all([
        this.get('PRAGMA user_version'),
        this.get('PRAGMA journal_mode'),
        this.get('PRAGMA synchronous'),
        this.get('PRAGMA cache_size'),
        this.get('PRAGMA foreign_keys')
      ]);

      return {
        userVersion: userVersion.user_version,
        journalMode: journalMode.journal_mode,
        synchronous: synchronous.synchronous,
        cacheSize: cacheSize.cache_size,
        foreignKeys: foreignKeys.foreign_keys === 1,
        dbPath: this.dbPath,
        isConnected: this.isConnected
      };
    } catch (error) {
      console.error('Error getting database info:', error.message);
      return null;
    }
  }
}

// Create a singleton instance
const database = new Database();

module.exports = database;