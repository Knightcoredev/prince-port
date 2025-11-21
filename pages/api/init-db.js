/**
 * Database Initialization API Route
 * Call this once after deployment to set up SQLite database
 */

import database from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database (creates file if it doesn't exist)
    await database.connect();

    // Create tables
    const schema = `
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
        status VARCHAR(20) DEFAULT 'published',
        author_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        technologies TEXT,
        github_url VARCHAR(255),
        live_url VARCHAR(255),
        image_url VARCHAR(255),
        featured BOOLEAN DEFAULT FALSE,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute schema
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await database.run(statement);
      }
    }

    // Insert sample data
    await database.run(`
      INSERT OR IGNORE INTO users (id, username, email, password_hash, role) 
      VALUES (1, 'knightdev', 'devcore556@gmail.com', '$2b$12$placeholder', 'admin')
    `);

    await database.run(`
      INSERT OR IGNORE INTO blog_posts (title, slug, content, excerpt, status, author_id)
      VALUES (
        'Welcome to My Portfolio',
        'welcome-to-my-portfolio',
        'This is my first blog post! I''m excited to share my journey as a full-stack developer. Stay tuned for more updates about my projects and experiences.',
        'Welcome to my portfolio! Follow my journey as a developer.',
        'published',
        1
      )
    `);

    await database.run(`
      INSERT OR IGNORE INTO projects (title, description, technologies, github_url, featured, order_index)
      VALUES (
        'Portfolio Website',
        'A modern portfolio website built with Next.js, SQLite, and deployed on Vercel.',
        '["Next.js", "React", "SQLite", "Tailwind CSS", "Vercel"]',
        'https://github.com/Knightcoredev',
        1,
        1
      )
    `);

    res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize database',
      details: error.message 
    });
  }
}