import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { 
  withAdminAuth, 
  withMethods, 
  withErrorHandling, 
  withCSRF,
  withSecurityHeaders,
  withFileUploadSecurity,
  compose 
} from '../../../lib/middleware';
import { ALLOWED_IMAGE_TYPES, generateSecureFilename } from '../../../lib/security';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'blog');

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Generate unique filename
 */
function generateFileName(originalName) {
  return generateSecureFilename(originalName, 'blog');
}

/**
 * Optimize and resize image
 */
async function optimizeImage(inputPath, outputPath, options = {}) {
  const { width = 1200, quality = 85 } = options;
  
  try {
    await sharp(inputPath)
      .resize(width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality })
      .toFile(outputPath);
    
    // Remove original file
    await fs.unlink(inputPath);
    
    return true;
  } catch (error) {
    console.error('Image optimization failed:', error);
    // If optimization fails, keep original
    try {
      await fs.rename(inputPath, outputPath);
      return true;
    } catch (renameError) {
      console.error('File rename failed:', renameError);
      return false;
    }
  }
}

/**
 * Validate uploaded file
 */
function validateFile(file) {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  return true;
}

/**
 * Handle file upload
 */
async function handleUpload(req, res) {
  try {
    await ensureUploadDir();
    
    const form = new IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      allowEmptyFiles: false,
      maxFiles: 1
    });
    
    const [fields, files] = await form.parse(req);
    
    if (!files.image || !files.image[0]) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No image file provided'
        }
      });
    }
    
    const file = files.image[0];
    
    // Validate file
    validateFile(file);
    
    // Generate unique filename
    const fileName = generateFileName(file.originalFilename);
    const tempPath = file.filepath;
    const finalPath = path.join(UPLOAD_DIR, fileName);
    
    // Optimize and move file
    const success = await optimizeImage(tempPath, finalPath);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to process uploaded image'
        }
      });
    }
    
    // Return public URL
    const publicUrl = `/uploads/blog/${fileName}`;
    
    return res.status(200).json({
      success: true,
      data: {
        url: publicUrl,
        filename: fileName,
        originalName: file.originalFilename,
        size: file.size,
        message: 'Image uploaded successfully'
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message || 'Failed to upload image'
      }
    });
  }
}

// POST /api/blog/upload - Upload blog image (admin only)
async function handler(req, res) {
  if (req.method === 'POST') {
    return await handleUpload(req, res);
  }
}

export default compose(
  withMethods(['POST']),
  withSecurityHeaders,
  withCSRF,
  withAdminAuth,
  withFileUploadSecurity({
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1
  }),
  withErrorHandling
)(handler);