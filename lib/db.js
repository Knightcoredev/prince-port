const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');

// Data directory path
const DATA_DIR = path.join(process.cwd(), 'data');

// Validation schemas
const blogPostSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required().min(1).max(200),
  slug: Joi.string().required().pattern(/^[a-z0-9-]+$/),
  content: Joi.string().required(),
  excerpt: Joi.string().max(500),
  featuredImage: Joi.string().allow(''),
  categories: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  status: Joi.string().valid('draft', 'published').default('draft'),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date()),
  readingTime: Joi.number().min(0)
});

const projectSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required().min(1).max(100),
  description: Joi.string().required().max(500),
  longDescription: Joi.string().allow(''),
  technologies: Joi.array().items(Joi.string()).required(),
  category: Joi.string().required(),
  images: Joi.array().items(Joi.string()),
  liveUrl: Joi.string().uri().allow(''),
  githubUrl: Joi.string().uri().allow(''),
  featured: Joi.boolean().default(false),
  order: Joi.number().min(0).default(0),
  createdAt: Joi.date().default(() => new Date())
});

const contactSubmissionSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required().min(1).max(100),
  email: Joi.string().email().required(),
  subject: Joi.string().max(200).allow(''),
  message: Joi.string().required().min(10).max(2000),
  status: Joi.string().valid('unread', 'read', 'responded').default('unread'),
  submittedAt: Joi.date().default(() => new Date()),
  ipAddress: Joi.string().ip()
});

const userSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().required().min(3).max(50),
  passwordHash: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin').default('admin'),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date()),
  lastLogin: Joi.date().allow(null)
});

// Schema mapping
const schemas = {
  'blog-posts': blogPostSchema,
  'projects': projectSchema,
  'contacts': contactSubmissionSchema,
  'users': userSchema
};

/**
 * Ensure data directory and file exist
 */
async function ensureDataFile(filename) {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify([], null, 2));
  }
  
  return filePath;
}

/**
 * Read data from JSON file
 */
async function readData(filename) {
  try {
    const filePath = await ensureDataFile(filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

/**
 * Write data to JSON file
 */
async function writeData(filename, data) {
  try {
    const filePath = await ensureDataFile(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

/**
 * Validate data against schema
 */
function validateData(filename, data) {
  const schema = schemas[filename];
  if (!schema) {
    throw new Error(`No schema found for ${filename}`);
  }
  
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  
  return value;
}

/**
 * Create a new record
 */
async function create(filename, data) {
  try {
    // Validate data
    const validatedData = validateData(filename, data);
    
    // Read existing data
    const records = await readData(filename);
    
    // Check for duplicate ID
    if (records.find(record => record.id === validatedData.id)) {
      throw new Error(`Record with ID ${validatedData.id} already exists`);
    }
    
    // Add new record
    records.push(validatedData);
    
    // Write back to file
    const success = await writeData(filename, records);
    if (!success) {
      throw new Error('Failed to write data');
    }
    
    return validatedData;
  } catch (error) {
    throw new Error(`Create operation failed: ${error.message}`);
  }
}

/**
 * Read records with optional filtering
 */
async function read(filename, filter = {}) {
  try {
    const records = await readData(filename);
    
    if (Object.keys(filter).length === 0) {
      return records;
    }
    
    return records.filter(record => {
      return Object.entries(filter).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(record[key]);
        }
        return record[key] === value;
      });
    });
  } catch (error) {
    throw new Error(`Read operation failed: ${error.message}`);
  }
}

/**
 * Update a record by ID
 */
async function update(filename, id, updateData) {
  try {
    const records = await readData(filename);
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found`);
    }
    
    // Merge existing data with updates
    const updatedRecord = { ...records[index], ...updateData, updatedAt: new Date() };
    
    // Validate updated data
    const validatedData = validateData(filename, updatedRecord);
    
    // Update record
    records[index] = validatedData;
    
    // Write back to file
    const success = await writeData(filename, records);
    if (!success) {
      throw new Error('Failed to write data');
    }
    
    return validatedData;
  } catch (error) {
    throw new Error(`Update operation failed: ${error.message}`);
  }
}

/**
 * Delete a record by ID
 */
async function deleteRecord(filename, id) {
  try {
    const records = await readData(filename);
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found`);
    }
    
    const deletedRecord = records[index];
    records.splice(index, 1);
    
    // Write back to file
    const success = await writeData(filename, records);
    if (!success) {
      throw new Error('Failed to write data');
    }
    
    return deletedRecord;
  } catch (error) {
    throw new Error(`Delete operation failed: ${error.message}`);
  }
}

/**
 * Find a single record by ID
 */
async function findById(filename, id) {
  try {
    const records = await readData(filename);
    return records.find(record => record.id === id) || null;
  } catch (error) {
    throw new Error(`Find operation failed: ${error.message}`);
  }
}

/**
 * Find a single record by field
 */
async function findOne(filename, filter) {
  try {
    const records = await read(filename, filter);
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    throw new Error(`FindOne operation failed: ${error.message}`);
  }
}

/**
 * Create backup of data file
 */
async function createBackup(filename) {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const backupPath = path.join(DATA_DIR, `${filename}_backup_${Date.now()}.json`);
    
    const data = await fs.readFile(filePath, 'utf8');
    await fs.writeFile(backupPath, data);
    
    return backupPath;
  } catch (error) {
    throw new Error(`Backup operation failed: ${error.message}`);
  }
}

/**
 * Restore data from backup
 */
async function restoreFromBackup(filename, backupPath) {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const backupData = await fs.readFile(backupPath, 'utf8');
    
    // Validate backup data
    const data = JSON.parse(backupData);
    if (!Array.isArray(data)) {
      throw new Error('Invalid backup data format');
    }
    
    await fs.writeFile(filePath, backupData);
    return true;
  } catch (error) {
    throw new Error(`Restore operation failed: ${error.message}`);
  }
}

/**
 * Get database statistics
 */
async function getStats() {
  try {
    const stats = {};
    const files = ['blog-posts', 'projects', 'contacts', 'users'];
    
    for (const file of files) {
      const records = await readData(file);
      stats[file] = {
        count: records.length,
        lastModified: new Date().toISOString()
      };
    }
    
    return stats;
  } catch (error) {
    throw new Error(`Stats operation failed: ${error.message}`);
  }
}

module.exports = {
  create,
  read,
  update,
  deleteRecord,
  findById,
  findOne,
  createBackup,
  restoreFromBackup,
  getStats,
  validateData,
  schemas
};