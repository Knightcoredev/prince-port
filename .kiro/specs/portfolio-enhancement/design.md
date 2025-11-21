# Design Document

## Overview

The portfolio enhancement will transform the existing static Next.js portfolio into a dynamic content management system. The architecture will use Next.js API routes for backend functionality, a file-based database (JSON) for simplicity, and maintain the existing Tailwind CSS styling. The system will be organized into public-facing pages and protected admin routes with session-based authentication.

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Data Layer    │
│                 │    │                 │    │                 │
│ • Public Pages  │◄──►│ • Blog API      │◄──►│ • JSON Files    │
│ • Admin Panel   │    │ • Contact API   │    │ • File System   │
│ • Components    │    │ • Auth API      │    │ • Image Storage │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 13+ (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: JSON files with file system operations
- **Authentication**: NextAuth.js with credentials provider
- **Email**: Nodemailer with SMTP configuration
- **File Upload**: Multer for image handling
- **Rich Text**: React-Quill for blog post editing

## Components and Interfaces

### Frontend Components

#### Public Components
- **BlogList**: Displays paginated blog posts with filtering
- **BlogPost**: Individual blog post display with metadata
- **ProjectFilter**: Interactive project filtering interface
- **ContactForm**: Enhanced contact form with validation
- **SearchBar**: Global search functionality

#### Admin Components
- **AdminLayout**: Protected layout wrapper for admin pages
- **BlogEditor**: Rich text editor for blog post creation/editing
- **ProjectManager**: CRUD interface for project management
- **Dashboard**: Analytics and contact submissions overview
- **ImageUploader**: Drag-and-drop image upload component

### API Endpoints

#### Blog Management
```typescript
// GET /api/blog - Fetch published blog posts
// POST /api/blog - Create new blog post (admin)
// PUT /api/blog/[id] - Update blog post (admin)
// DELETE /api/blog/[id] - Delete blog post (admin)
// GET /api/blog/[slug] - Fetch single blog post
```

#### Project Management
```typescript
// GET /api/projects - Fetch all projects
// POST /api/projects - Create new project (admin)
// PUT /api/projects/[id] - Update project (admin)
// DELETE /api/projects/[id] - Delete project (admin)
```

#### Contact System
```typescript
// POST /api/contact - Submit contact form
// GET /api/contact/submissions - Fetch submissions (admin)
// PUT /api/contact/submissions/[id] - Mark as read (admin)
```

#### Authentication
```typescript
// POST /api/auth/login - Admin login
// POST /api/auth/logout - Admin logout
// GET /api/auth/session - Check session status
```

## Data Models

### Blog Post Model
```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  readingTime: number;
}
```

### Project Model
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: string;
  images: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
}
```

### Contact Submission Model
```typescript
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  submittedAt: Date;
  ipAddress: string;
}
```

### User Model
```typescript
interface User {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: 'admin';
  createdAt: Date;
  lastLogin?: Date;
}
```

## File Structure

```
portfolio-nextjs/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   ├── blog/
│   │   ├── projects/
│   │   └── contact/
│   ├── admin/
│   │   ├── dashboard.js
│   │   ├── blog/
│   │   └── projects/
│   ├── blog/
│   │   ├── index.js
│   │   └── [slug].js
│   └── index.js
├── components/
│   ├── admin/
│   ├── blog/
│   └── ui/
├── lib/
│   ├── db.js
│   ├── auth.js
│   ├── email.js
│   └── utils.js
├── data/
│   ├── blog-posts.json
│   ├── projects.json
│   ├── contacts.json
│   └── users.json
└── public/
    ├── uploads/
    └── images/
```

## Error Handling

### Client-Side Error Handling
- Form validation with real-time feedback
- Network error handling with retry mechanisms
- Loading states for all async operations
- Toast notifications for user feedback

### Server-Side Error Handling
- Input validation using Joi or Zod schemas
- Database operation error handling
- Email service failure handling
- File upload error management
- Authentication error responses

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Security Considerations

### Authentication & Authorization
- Password hashing with bcrypt (12+ rounds)
- Session-based authentication with secure cookies
- CSRF protection for admin forms
- Rate limiting on contact form and login attempts

### Data Validation
- Server-side validation for all inputs
- File upload restrictions (type, size)
- SQL injection prevention (though using JSON files)
- XSS prevention with content sanitization

### File Security
- Secure file upload handling
- Image optimization and validation
- Restricted file access patterns
- Regular cleanup of temporary files

## Performance Optimization

### Frontend Optimization
- Image optimization with Next.js Image component
- Code splitting for admin routes
- Static generation for blog posts
- Client-side caching for project filters

### Backend Optimization
- File-based caching for frequently accessed data
- Image resizing and compression
- Pagination for large datasets
- Efficient JSON file operations

## Testing Strategy

### Unit Testing
- API route testing with Jest and Supertest
- Component testing with React Testing Library
- Utility function testing
- Database operation testing

### Integration Testing
- End-to-end admin workflow testing
- Contact form submission testing
- Authentication flow testing
- File upload testing

### Manual Testing
- Cross-browser compatibility testing
- Mobile responsiveness testing
- Admin panel usability testing
- Performance testing under load

## Deployment Considerations

### Environment Configuration
- Separate configurations for development/production
- Environment variables for sensitive data
- SMTP configuration for email service
- File upload directory permissions

### Database Migration
- Initial data seeding scripts
- Backup and restore procedures
- Data validation scripts
- Version control for data schema

### Monitoring & Maintenance
- Error logging and monitoring
- Performance metrics tracking
- Regular backup procedures
- Security update procedures