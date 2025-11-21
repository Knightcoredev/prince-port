#!/usr/bin/env node

/**
 * SQLite Database Initialization Script
 * Creates the database directory and initializes the SQLite database
 */

const fs = require('fs');
const path = require('path');

function createDirectories() {
  const directories = [
    './data',
    './backups',
    './logs'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`📁 Directory already exists: ${dir}`);
    }
  });
}

function createSQLiteSchema() {
  const schemaSQL = `
-- Portfolio Database Schema for SQLite3

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  author_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  technologies TEXT, -- JSON array as text
  github_url VARCHAR(255),
  live_url VARCHAR(255),
  image_url VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for session management)
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER,
  data TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  path VARCHAR(500) NOT NULL,
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Blog post tags table
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blog post tags relationship
CREATE TABLE IF NOT EXISTS blog_post_tags (
  blog_post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (blog_post_id, tag_id),
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Set WAL mode for better performance
PRAGMA journal_mode = WAL;

-- Set synchronous mode for balance between safety and performance
PRAGMA synchronous = NORMAL;
`;

  const schemaPath = './data/schema.sql';
  fs.writeFileSync(schemaPath, schemaSQL.trim());
  console.log(`✅ Created database schema: ${schemaPath}`);
}

function createInitialData() {
  const seedSQL = `
-- Initial data for portfolio

-- Insert default admin user (password should be hashed in real implementation)
INSERT OR IGNORE INTO users (username, email, password_hash, role) 
VALUES ('knightdev', 'knightdev@yourdomain.com', '$2b$12$placeholder_hash', 'admin');

-- Insert sample project
INSERT OR IGNORE INTO projects (title, description, technologies, github_url, featured, order_index)
VALUES (
  'Portfolio Website',
  'A modern portfolio website built with Next.js and SQLite',
  '["Next.js", "React", "SQLite", "Tailwind CSS"]',
  'https://github.com/yourusername/portfolio',
  TRUE,
  1
);

-- Insert sample blog post
INSERT OR IGNORE INTO blog_posts (title, slug, content, excerpt, status, author_id, published_at)
VALUES (
  'Welcome to My Portfolio',
  'welcome-to-my-portfolio',
  'This is the first blog post on my new portfolio website. Built with Next.js and SQLite for optimal performance.',
  'Welcome to my new portfolio website built with modern technologies.',
  'published',
  1,
  CURRENT_TIMESTAMP
);

-- Insert sample tags
INSERT OR IGNORE INTO tags (name, slug) VALUES 
('Web Development', 'web-development'),
('Next.js', 'nextjs'),
('React', 'react'),
('SQLite', 'sqlite');
`;

  const seedPath = './data/seed.sql';
  fs.writeFileSync(seedPath, seedSQL.trim());
  console.log(`✅ Created seed data: ${seedPath}`);
}

function main() {
  console.log('🚀 Initializing SQLite database for production...\n');
  
  try {
    createDirectories();
    createSQLiteSchema();
    createInitialData();
    
    console.log('\n✅ SQLite database initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Install sqlite3: npm install sqlite3');
    console.log('2. Run the schema: sqlite3 ./data/portfolio.db < ./data/schema.sql');
    console.log('3. Seed initial data: sqlite3 ./data/portfolio.db < ./data/seed.sql');
    console.log('4. Update your application to use SQLite instead of MongoDB');
    
  } catch (error) {
    console.error('❌ Error initializing SQLite database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createDirectories, createSQLiteSchema, createInitialData };