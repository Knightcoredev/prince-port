import { extractTokenFromRequest, validateSession } from '../../../lib/auth';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed'
      }
    });
  }

  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_SESSION',
          message: 'No session token found'
        }
      });
    }

    // Validate session
    const session = await validateSession(token);
    
    if (!session || !session.isValid) {
      // Clear invalid session cookie
      res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict');
      
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Session is invalid or expired'
        }
      });
    }

    // Return session information
    return res.status(200).json({
      success: true,
      data: {
        user: session.user,
        authenticated: true,
        message: 'Session is valid'
      }
    });
  } catch (error) {
    console.error('Session check API error:', error);
    
    // Clear potentially corrupted session cookie
    res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict');
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred during session validation'
      }
    });
  }
}