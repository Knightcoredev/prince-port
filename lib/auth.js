const bcrypt = require('bcrypt');
const { sign, verify } = require('jsonwebtoken');
const { findOne, update } = require('./db');

// Configuration
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  try {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verify a password against its hash
 */
async function verifyPassword(password, hash) {
  try {
    if (!password || !hash) {
      return false;
    }
    
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate JWT token for user session
 */
function generateToken(payload, expiresIn = '24h') {
  try {
    const token = sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

/**
 * Verify and decode JWT token
 */
function verifyToken(token) {
  try {
    if (!token) {
      return null;
    }
    
    const decoded = verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Authenticate user with username and password
 */
async function authenticateUser(username, password) {
  try {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Find user by username
    const user = await findOne('users', { username });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await update('users', user.id, { lastLogin: new Date() });
    
    // Generate session token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = generateToken(tokenPayload);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Create session data for authenticated user
 */
function createSession(user, token) {
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    token,
    expiresAt: new Date(Date.now() + SESSION_DURATION),
    createdAt: new Date()
  };
}

/**
 * Validate session token and return user data
 */
async function validateSession(token) {
  try {
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    // Check if user still exists
    const user = await findOne('users', { id: decoded.userId });
    if (!user) {
      return null;
    }
    
    // Check token expiration (additional check beyond JWT expiry)
    const tokenAge = Date.now() - (decoded.iat * 1000);
    if (tokenAge > SESSION_DURATION) {
      return null;
    }
    
    // Check session timeout based on last activity
    if (user.lastLogin) {
      const lastActivity = new Date(user.lastLogin).getTime();
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      if (timeSinceLastActivity > SESSION_DURATION) {
        return null;
      }
    }
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      },
      isValid: true,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
      sessionAge: tokenAge
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
function hasRole(user, requiredRole) {
  if (!user || !user.role) {
    return false;
  }
  
  // For now, we only have 'admin' role
  return user.role === requiredRole;
}

/**
 * Check if user is admin
 */
function isAdmin(user) {
  return hasRole(user, 'admin');
}

/**
 * Generate secure session cookie options
 */
function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION,
    path: '/'
  };
}

/**
 * Extract token from request headers or cookies
 */
function extractTokenFromRequest(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  if (req.cookies && req.cookies.session) {
    return req.cookies.session;
  }
  
  return null;
}

/**
 * Middleware to protect routes requiring authentication
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractTokenFromRequest(req);
    const session = await validateSession(token);
    
    if (!session || !session.isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    // Attach user to request
    req.user = session.user;
    
    if (next) {
      next();
    }
    
    return session.user;
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error'
      }
    });
  }
}

/**
 * Middleware to protect admin-only routes
 */
async function requireAdmin(req, res, next) {
  try {
    const user = await requireAuth(req, res);
    
    if (!user) {
      return; // requireAuth already sent response
    }
    
    if (!isAdmin(user)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
    
    if (next) {
      next();
    }
    
    return user;
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authorization error'
      }
    });
  }
}

/**
 * Generate a secure random string for tokens
 */
function generateSecureToken(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Rate limiting helper for login attempts
 */
const loginAttempts = new Map();

function checkLoginRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window has passed
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }
  
  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    const remainingTime = Math.ceil((attempts.resetTime - now) / 1000 / 60);
    throw new Error(`Too many login attempts. Try again in ${remainingTime} minutes.`);
  }
  
  // Increment attempt count
  attempts.count++;
  loginAttempts.set(identifier, attempts);
  
  return true;
}

/**
 * Clear login rate limit for identifier
 */
function clearLoginRateLimit(identifier) {
  loginAttempts.delete(identifier);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateUser,
  createSession,
  validateSession,
  hasRole,
  isAdmin,
  getSessionCookieOptions,
  extractTokenFromRequest,
  requireAuth,
  requireAdmin,
  generateSecureToken,
  checkLoginRateLimit,
  clearLoginRateLimit
};