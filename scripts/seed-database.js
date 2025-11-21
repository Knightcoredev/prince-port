#!/usr/bin/env node

/**
 * Database Seeding Script
 * Seeds the database with initial data for production deployment
 */

const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const { create, read } = require('../lib/db');

// Default admin credentials (should be changed after first login)
const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
  password: process.env.ADMIN_PASSWORD || 'admin123!@#'
};

// Sample blog posts for demonstration
const SAMPLE_BLOG_POSTS = [
  {
    id: `blog-${Date.now()}-1`,
    title: 'Welcome to My Portfolio Blog',
    slug: 'welcome-to-my-portfolio-blog',
    content: `<h2>Welcome to My Blog</h2>
    <p>This is the first post on my portfolio blog. Here I'll be sharing insights about web development, technology trends, and my journey as a developer.</p>
    <p>Stay tuned for more exciting content!</p>`,
    excerpt: 'Welcome to my portfolio blog where I share insights about web development and technology.',
    featuredImage: '',
    categories: ['General', 'Welcome'],
    tags: ['introduction', 'blog', 'portfolio'],
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
    readingTime: 1
  }
];

// Sample projects for demonstration
const SAMPLE_PROJECTS = [
  {
    id: `project-${Date.now()}-1`,
    title: 'Portfolio Website',
    description: 'A modern, responsive portfolio website built with Next.js and Tailwind CSS.',
    longDescription: 'This portfolio website showcases my skills and projects with a clean, modern design. Built with Next.js for optimal performance and SEO, styled with Tailwind CSS for responsive design, and includes a content management system for easy updates.',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'Node.js'],
    category: 'Web Development',
    images: [],
    liveUrl: process.env.APP_URL || 'https://your-domain.com',
    githubUrl: '',
    featured: true,
    order: 1,
    createdAt: new Date()
  }
];

/**
 * Create admin user if it doesn't exist
 */
async function seedAdminUser() {
  try {
    console.log('🔐 Seeding admin user...');
    
    // Check if admin user already exists
    const existingUsers = await read('users');
    const adminExists = existingUsers.find(user => user.username === DEFAULT_ADMIN.username);
    
    if (adminExists) {
      console.log('✅ Admin user already exists, skipping...');
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
    
    // Create admin user
    const adminUser = {
      id: `admin-${Date.now()}`,
      username: DEFAULT_ADMIN.username,
      passwordHash,
      email: DEFAULT_ADMIN.email,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };
    
    await create('users', adminUser);
    console.log('✅ Admin user created successfully');
    console.log(`   Username: ${DEFAULT_ADMIN.username}`);
    console.log(`   Email: ${DEFAULT_ADMIN.email}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
    console.log('⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message);
    throw error;
  }
}

/**
 * Seed sample blog posts
 */
async function seedBlogPosts() {
  try {
    console.log('📝 Seeding sample blog posts...');
    
    const existingPosts = await read('blog-posts');
    
    if (existingPosts.length > 0) {
      console.log('✅ Blog posts already exist, skipping...');
      return;
    }
    
    for (const post of SAMPLE_BLOG_POSTS) {
      await create('blog-posts', post);
    }
    
    console.log(`✅ Seeded ${SAMPLE_BLOG_POSTS.length} sample blog posts`);
    
  } catch (error) {
    console.error('❌ Failed to seed blog posts:', error.message);
    throw error;
  }
}

/**
 * Seed sample projects
 */
async function seedProjects() {
  try {
    console.log('🚀 Seeding sample projects...');
    
    const existingProjects = await read('projects');
    
    if (existingProjects.length > 0) {
      console.log('✅ Projects already exist, skipping...');
      return;
    }
    
    for (const project of SAMPLE_PROJECTS) {
      await create('projects', project);
    }
    
    console.log(`✅ Seeded ${SAMPLE_PROJECTS.length} sample projects`);
    
  } catch (error) {
    console.error('❌ Failed to seed projects:', error.message);
    throw error;
  }
}

/**
 * Ensure required directories exist
 */
async function ensureDirectories() {
  try {
    console.log('📁 Creating required directories...');
    
    const directories = [
      'data',
      'logs',
      'public/uploads',
      'public/uploads/blog',
      'public/uploads/projects'
    ];
    
    for (const dir of directories) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`   Created: ${dir}`);
      }
    }
    
    console.log('✅ All directories ready');
    
  } catch (error) {
    console.error('❌ Failed to create directories:', error.message);
    throw error;
  }
}

/**
 * Create initial configuration files
 */
async function createConfigFiles() {
  try {
    console.log('⚙️  Creating configuration files...');
    
    // Create .env.local if it doesn't exist
    const envLocalPath = path.join(process.cwd(), '.env.local');
    try {
      await fs.access(envLocalPath);
    } catch {
      const envTemplate = await fs.readFile(path.join(process.cwd(), '.env.local.example'), 'utf8');
      await fs.writeFile(envLocalPath, envTemplate);
      console.log('   Created: .env.local');
    }
    
    console.log('✅ Configuration files ready');
    
  } catch (error) {
    console.error('❌ Failed to create configuration files:', error.message);
    // Don't throw error for this, it's not critical
  }
}

/**
 * Main seeding function
 */
async function main() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await ensureDirectories();
    await createConfigFiles();
    await seedAdminUser();
    await seedBlogPosts();
    await seedProjects();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update environment variables in .env.production');
    console.log('2. Change default admin password after first login');
    console.log('3. Add your own projects and blog posts');
    console.log('4. Configure SMTP settings for contact form');
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  main();
}

module.exports = {
  seedAdminUser,
  seedBlogPosts,
  seedProjects,
  ensureDirectories,
  createConfigFiles
};