import { extractTokenFromRequest, validateSession } from '../../../lib/auth';
import { 
  withMethods, 
  withSecurityHeaders,
  withErrorHandling,
  compose 
} from '../../../lib/middleware';
import { securityLogger } from '../../../lib/logger';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed'
      }
    });
  }

  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);
    
    // Validate session (optional - we'll logout regardless)
    let user = null;
    if (token) {
      const session = await validateSession(token);
      user = session?.user || null;
    }

    // Clear session cookie by setting it to expire immediately
    res.setHeader('Set-Cookie', [
      'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
      // Also clear any potential token cookie
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict'
    ]);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Logout successful',
        user: user ? { username: user.username } : null
      }
    });
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, we should still clear the cookies
    res.setHeader('Set-Cookie', [
      'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict'
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Logout completed (with errors)',
        error: 'Session cleanup encountered issues but logout was processed'
      }
    });
  }
}