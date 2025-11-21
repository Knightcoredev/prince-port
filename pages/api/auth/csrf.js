const { withAuth, withMethods, withErrorHandling, compose } = require('../../../lib/middleware');
const { csrfProtection } = require('../../../lib/security');

/**
 * Generate CSRF token for authenticated session
 */
async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // User is already authenticated via withAuth middleware
      const sessionId = req.user.id;
      
      // Generate CSRF token
      const csrfToken = csrfProtection.generateToken(sessionId);
      
      return res.status(200).json({
        success: true,
        data: {
          csrfToken,
          expiresIn: 3600 // 1 hour in seconds
        }
      });
    } catch (error) {
      console.error('CSRF token generation error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'CSRF_GENERATION_ERROR',
          message: 'Failed to generate CSRF token'
        }
      });
    }
  }
}

export default compose(
  withMethods(['GET']),
  withAuth,
  withErrorHandling
)(handler);