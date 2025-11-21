import { authenticateUser, getSessionCookieOptions, checkLoginRateLimit, clearLoginRateLimit } from '../../../lib/auth';
import { 
  withMethods, 
  withSanitization,
  withSecurityHeaders,
  withErrorHandling,
  compose 
} from '../../../lib/middleware';
import { securityLogger } from '../../../lib/logger';

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Username and password are required'
          }
        });
      }

      // Get client info for logging
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Check rate limiting
      try {
        checkLoginRateLimit(clientIP);
      } catch (rateLimitError) {
        // Log rate limit violation
        await securityLogger.logRateLimitViolation(clientIP, '/api/auth/login', 'login_attempts');
        
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: rateLimitError.message
          }
        });
      }

      // Authenticate user
      try {
        const authResult = await authenticateUser(username, password);
        
        // Log successful login
        await securityLogger.logSuccessfulLogin(authResult.user.id, clientIP, userAgent);
        
        // Clear rate limit on successful login
        clearLoginRateLimit(clientIP);
        
        // Set session cookie
        const cookieOptions = getSessionCookieOptions();
        res.setHeader('Set-Cookie', `session=${authResult.token}; ${Object.entries(cookieOptions).map(([key, value]) => `${key}=${value}`).join('; ')}`);
        
        return res.status(200).json({
          success: true,
          data: {
            user: authResult.user,
            message: 'Login successful'
          }
        });
      } catch (authError) {
        // Log failed login attempt
        await securityLogger.logFailedLogin(username, clientIP, authError.message, userAgent);
        
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Invalid credentials'
          }
        });
      }
    } catch (error) {
      console.error('Login API error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred'
        }
      });
    }
  }
}

export default compose(
  withMethods(['POST']),
  withSecurityHeaders,
  withSanitization(),
  withErrorHandling
)(handler);