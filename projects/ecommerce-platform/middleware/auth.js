// Stub authentication middleware for demo purposes
export function authenticate(handler) {
  return async (req, res) => {
    // Demo mode - create a fake user
    req.user = {
      id: 'demo-user-123',
      email: 'demo@example.com'
    };
    
    return handler(req, res);
  };
}
