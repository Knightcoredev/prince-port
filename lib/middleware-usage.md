# Middleware Usage Guide

This document explains how to use the authentication and other middleware in the portfolio application.

## Available Middleware

### Authentication Middleware

#### `withAuth(handler)`
Requires user to be authenticated. Attaches `req.user` and `req.session` to the request.

```javascript
import { withAuth } from '../../../lib/middleware';

async function handler(req, res) {
  // req.user is available here
  console.log('Authenticated user:', req.user.username);
  
  return res.json({ success: true, user: req.user });
}

export default withAuth(handler);
```

#### `withAdminAuth(handler)`
Requires user to be authenticated AND have admin role.

```javascript
import { withAdminAuth } from '../../../lib/middleware';

async function handler(req, res) {
  // Only admin users can reach this point
  return res.json({ success: true, message: 'Admin access granted' });
}

export default withAdminAuth(handler);
```

#### `withOptionalAuth(handler)`
Attaches user data if authenticated, but doesn't require authentication.

```javascript
import { withOptionalAuth } from '../../../lib/middleware';

async function handler(req, res) {
  if (req.user) {
    console.log('User is logged in:', req.user.username);
  } else {
    console.log('Anonymous user');
  }
  
  return res.json({ success: true });
}

export default withOptionalAuth(handler);
```

### Other Middleware

#### `withMethods(allowedMethods)`
Restricts endpoint to specific HTTP methods.

```javascript
import { withMethods } from '../../../lib/middleware';

async function handler(req, res) {
  // Only GET and POST requests allowed
  return res.json({ method: req.method });
}

export default withMethods(['GET', 'POST'])(handler);
```

#### `withRateLimit(options)`
Implements rate limiting per IP address.

```javascript
import { withRateLimit } from '../../../lib/middleware';

async function handler(req, res) {
  return res.json({ success: true });
}

// Allow 10 requests per 5 minutes
export default withRateLimit({
  maxRequests: 10,
  windowMs: 5 * 60 * 1000
})(handler);
```

#### `withErrorHandling(handler)`
Catches and formats errors consistently.

```javascript
import { withErrorHandling } from '../../../lib/middleware';

async function handler(req, res) {
  // Any thrown errors will be caught and formatted
  throw new Error('Something went wrong');
}

export default withErrorHandling(handler);
```

### Composing Middleware

Use the `compose` function to apply multiple middleware:

```javascript
import { compose, withAdminAuth, withMethods, withRateLimit, withErrorHandling } from '../../../lib/middleware';

async function handler(req, res) {
  return res.json({ success: true });
}

export default compose(
  withMethods(['POST']),
  withRateLimit({ maxRequests: 5, windowMs: 60000 }),
  withAdminAuth,
  withErrorHandling
)(handler);
```

## Frontend Authentication

### Higher-Order Components

#### `withAuth(Component, options)`
Protects pages that require authentication.

```javascript
import withAuth from '../../components/auth/withAuth';

function AdminDashboard({ user }) {
  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
    </div>
  );
}

export default withAuth(AdminDashboard, {
  redirectTo: '/admin/login',
  requireAdmin: true
});
```

#### `withAdminAuth(Component)`
Shortcut for admin-only pages.

```javascript
import { withAdminAuth } from '../../components/auth/withAuth';

function AdminPanel({ user }) {
  return <div>Admin Panel</div>;
}

export default withAdminAuth(AdminPanel);
```

### Authentication Hook

Use the `useAuth` hook in components:

```javascript
import { useAuth } from '../../components/auth/withAuth';

function LoginForm() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();
  
  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    if (result.success) {
      console.log('Login successful');
    } else {
      console.error('Login failed:', result.error);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user.username}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }
  
  return <LoginForm onLogin={handleLogin} />;
}
```

### Session Management

Initialize session management for admin pages:

```javascript
import { initializeSessionManagement } from '../../lib/session';
import { useEffect } from 'react';

function AdminLayout({ children }) {
  useEffect(() => {
    initializeSessionManagement();
  }, []);
  
  return <div>{children}</div>;
}
```

## API Route Examples

### Public Endpoint
```javascript
// pages/api/blog/index.js
import { withMethods, withErrorHandling, compose } from '../../../lib/middleware';

async function handler(req, res) {
  // Public blog posts
  return res.json({ posts: [] });
}

export default compose(
  withMethods(['GET']),
  withErrorHandling
)(handler);
```

### Admin-Only Endpoint
```javascript
// pages/api/admin/users.js
import { withAdminAuth, withMethods, withErrorHandling, compose } from '../../../lib/middleware';

async function handler(req, res) {
  // Only admins can access this
  return res.json({ users: [], requestedBy: req.user.username });
}

export default compose(
  withMethods(['GET', 'POST']),
  withAdminAuth,
  withErrorHandling
)(handler);
```

### Mixed Access Endpoint
```javascript
// pages/api/blog/[id].js
import { withOptionalAuth, withMethods, withErrorHandling, compose } from '../../../lib/middleware';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Public access - anyone can read
    return res.json({ post: {} });
  }
  
  if (req.method === 'PUT' || req.method === 'DELETE') {
    // Check if user is admin for modifications
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' }
      });
    }
    
    return res.json({ success: true });
  }
}

export default compose(
  withMethods(['GET', 'PUT', 'DELETE']),
  withOptionalAuth,
  withErrorHandling
)(handler);
```

## Error Responses

All middleware follows a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Additional details (development only)"
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `SESSION_EXPIRED`: Session has expired
- `SESSION_TIMEOUT`: Session timed out due to inactivity
- `FORBIDDEN`: Insufficient permissions
- `METHOD_NOT_ALLOWED`: HTTP method not allowed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_SERVER_ERROR`: Server error occurred

## Security Features

1. **Session Timeout**: Sessions expire after 24 hours of inactivity
2. **Rate Limiting**: Prevents abuse with configurable limits
3. **CSRF Protection**: Secure cookies with SameSite=Strict
4. **Role-Based Access**: Admin-only routes and functions
5. **Input Validation**: Consistent validation middleware
6. **Error Handling**: Secure error responses without sensitive data
7. **Session Management**: Automatic session extension and expiry warnings