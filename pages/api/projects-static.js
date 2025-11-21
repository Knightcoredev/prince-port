/**
 * Static Projects API - Professional portfolio projects
 * Showcases full-stack development skills and expertise
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Professional projects showcasing full-stack skills
  const projects = [
    {
      id: '1',
      title: 'E-Commerce Platform',
      slug: 'ecommerce-platform',
      description: 'A full-featured e-commerce platform with user authentication, payment processing, inventory management, and admin dashboard. Built with modern technologies for scalability and performance.',
      longDescription: `
        A comprehensive e-commerce solution featuring:
        • User registration, authentication, and profile management
        • Product catalog with search, filtering, and categories
        • Shopping cart and wishlist functionality
        • Secure payment processing with Stripe integration
        • Order tracking and management system
        • Admin dashboard for inventory and order management
        • Responsive design optimized for all devices
        • SEO-friendly product pages and blog integration
      `,
      technologies: [
        'Next.js', 'React', 'Node.js', 'Express', 'MongoDB', 
        'Stripe API', 'JWT Authentication', 'Tailwind CSS', 
        'Vercel', 'Cloudinary'
      ],
      category: 'Full Stack',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/ecommerce-platform',
      liveUrl: 'https://ecommerce-demo.vercel.app',
      imageUrl: '/images/projects/ecommerce-platform.jpg',
      images: [
        '/images/projects/ecommerce-1.jpg',
        '/images/projects/ecommerce-2.jpg',
        '/images/projects/ecommerce-3.jpg'
      ],
      features: [
        'User Authentication & Authorization',
        'Product Management System',
        'Shopping Cart & Checkout',
        'Payment Processing (Stripe)',
        'Order Management',
        'Admin Dashboard',
        'Responsive Design',
        'SEO Optimization'
      ],
      challenges: [
        'Implementing secure payment processing',
        'Building scalable inventory management',
        'Optimizing performance for large product catalogs',
        'Creating intuitive admin interfaces'
      ],
      learnings: [
        'Advanced React patterns and state management',
        'Payment gateway integration best practices',
        'Database optimization for e-commerce',
        'Security considerations for financial transactions'
      ],
      duration: '3 months',
      teamSize: 'Solo Project',
      createdAt: '2024-01-15',
      updatedAt: '2024-03-20'
    },
    {
      id: '2',
      title: 'Task Management Dashboard',
      slug: 'task-management-dashboard',
      description: 'A collaborative project management tool with real-time updates, team collaboration features, and advanced analytics. Perfect for agile development teams and project tracking.',
      longDescription: `
        A comprehensive project management solution featuring:
        • Real-time collaboration with WebSocket integration
        • Kanban boards with drag-and-drop functionality
        • Team member management and role-based permissions
        • Time tracking and productivity analytics
        • File sharing and document management
        • Notification system for project updates
        • Advanced reporting and data visualization
        • Mobile-responsive design for on-the-go management
      `,
      technologies: [
        'React', 'TypeScript', 'Node.js', 'Socket.io', 
        'PostgreSQL', 'Prisma', 'Chart.js', 'Material-UI',
        'JWT', 'AWS S3', 'Docker'
      ],
      category: 'Full Stack',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/task-management',
      liveUrl: 'https://taskflow-pro.vercel.app',
      imageUrl: '/images/projects/task-management.jpg',
      images: [
        '/images/projects/task-1.jpg',
        '/images/projects/task-2.jpg',
        '/images/projects/task-3.jpg'
      ],
      features: [
        'Real-time Collaboration',
        'Kanban Board Interface',
        'Team Management',
        'Time Tracking',
        'File Upload & Sharing',
        'Analytics Dashboard',
        'Notification System',
        'Mobile Responsive'
      ],
      challenges: [
        'Implementing real-time synchronization',
        'Building complex drag-and-drop interfaces',
        'Optimizing database queries for analytics',
        'Managing WebSocket connections at scale'
      ],
      learnings: [
        'Real-time application architecture',
        'Advanced TypeScript patterns',
        'Database design for complex relationships',
        'Performance optimization techniques'
      ],
      duration: '4 months',
      teamSize: 'Solo Project',
      createdAt: '2024-02-01',
      updatedAt: '2024-05-15'
    },
    {
      id: '3',
      title: 'Social Media Analytics Platform',
      slug: 'social-media-analytics',
      description: 'A comprehensive analytics platform that aggregates data from multiple social media APIs, providing insights, trends analysis, and automated reporting for businesses and influencers.',
      longDescription: `
        An advanced analytics platform featuring:
        • Multi-platform social media integration (Twitter, Instagram, Facebook)
        • Real-time data collection and processing
        • Advanced data visualization and trend analysis
        • Automated report generation and scheduling
        • Competitor analysis and benchmarking
        • Sentiment analysis using AI/ML algorithms
        • Custom dashboard creation and sharing
        • API for third-party integrations
      `,
      technologies: [
        'Next.js', 'Python', 'FastAPI', 'Redis', 'PostgreSQL',
        'D3.js', 'Chart.js', 'TensorFlow', 'Docker', 
        'AWS Lambda', 'Celery', 'React Query'
      ],
      category: 'Full Stack',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/social-analytics',
      liveUrl: 'https://social-insights-pro.vercel.app',
      imageUrl: '/images/projects/social-analytics.jpg',
      images: [
        '/images/projects/social-1.jpg',
        '/images/projects/social-2.jpg',
        '/images/projects/social-3.jpg'
      ],
      features: [
        'Multi-Platform Integration',
        'Real-time Data Processing',
        'Advanced Visualizations',
        'Automated Reporting',
        'Sentiment Analysis',
        'Competitor Tracking',
        'Custom Dashboards',
        'API Access'
      ],
      challenges: [
        'Handling large volumes of real-time data',
        'Integrating multiple social media APIs',
        'Building complex data visualizations',
        'Implementing machine learning for sentiment analysis'
      ],
      learnings: [
        'Big data processing techniques',
        'API integration and rate limiting',
        'Machine learning implementation',
        'Microservices architecture'
      ],
      duration: '5 months',
      teamSize: 'Solo Project',
      createdAt: '2024-03-01',
      updatedAt: '2024-07-30'
    },
    {
      id: '4',
      title: 'Real Estate Management System',
      slug: 'real-estate-management',
      description: 'A comprehensive property management platform for real estate agencies, featuring property listings, client management, virtual tours, and automated marketing tools.',
      longDescription: `
        A complete real estate solution featuring:
        • Property listing management with advanced search
        • Client relationship management (CRM) system
        • Virtual tour integration and 360° property views
        • Automated email marketing and lead nurturing
        • Financial tracking and commission calculations
        • Document management and e-signature integration
        • Mobile app for agents and property viewing
        • Integration with MLS and property databases
      `,
      technologies: [
        'React Native', 'Next.js', 'Node.js', 'MongoDB',
        'Mapbox API', 'Cloudinary', 'SendGrid', 'Stripe',
        'DocuSign API', 'Firebase', 'Expo'
      ],
      category: 'Full Stack',
      featured: false,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/real-estate-platform',
      liveUrl: 'https://realestate-pro.vercel.app',
      imageUrl: '/images/projects/real-estate.jpg',
      images: [
        '/images/projects/realestate-1.jpg',
        '/images/projects/realestate-2.jpg',
        '/images/projects/realestate-3.jpg'
      ],
      features: [
        'Property Listings Management',
        'CRM System',
        'Virtual Tours',
        'Email Marketing Automation',
        'Financial Tracking',
        'Document Management',
        'Mobile Application',
        'MLS Integration'
      ],
      challenges: [
        'Building cross-platform mobile application',
        'Integrating multiple third-party services',
        'Handling large image and video files',
        'Creating intuitive user interfaces for complex workflows'
      ],
      learnings: [
        'React Native development',
        'Cross-platform mobile architecture',
        'Third-party API integration',
        'File upload and processing optimization'
      ],
      duration: '6 months',
      teamSize: 'Solo Project',
      createdAt: '2024-04-01',
      updatedAt: '2024-09-15'
    },
    {
      id: '5',
      title: 'Learning Management System (LMS)',
      slug: 'learning-management-system',
      description: 'An educational platform with course creation tools, student progress tracking, interactive assessments, and video streaming capabilities for online learning.',
      longDescription: `
        A comprehensive educational platform featuring:
        • Course creation and management tools for instructors
        • Video streaming with adaptive quality and subtitles
        • Interactive quizzes and assessment system
        • Student progress tracking and analytics
        • Discussion forums and peer-to-peer learning
        • Certificate generation and verification
        • Payment processing for course purchases
        • Mobile-responsive design for learning on-the-go
      `,
      technologies: [
        'Next.js', 'React', 'Node.js', 'Express', 'PostgreSQL',
        'AWS S3', 'CloudFront', 'Stripe', 'Socket.io',
        'FFmpeg', 'PDF-lib', 'Chart.js'
      ],
      category: 'Full Stack',
      featured: false,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/lms-platform',
      liveUrl: 'https://edulearn-pro.vercel.app',
      imageUrl: '/images/projects/lms-platform.jpg',
      images: [
        '/images/projects/lms-1.jpg',
        '/images/projects/lms-2.jpg',
        '/images/projects/lms-3.jpg'
      ],
      features: [
        'Course Creation Tools',
        'Video Streaming',
        'Interactive Assessments',
        'Progress Tracking',
        'Discussion Forums',
        'Certificate Generation',
        'Payment Processing',
        'Mobile Responsive'
      ],
      challenges: [
        'Implementing video streaming with quality adaptation',
        'Building complex assessment and grading systems',
        'Creating engaging user interfaces for learning',
        'Optimizing performance for large video files'
      ],
      learnings: [
        'Video processing and streaming',
        'Educational technology best practices',
        'Complex state management patterns',
        'Performance optimization for media-heavy applications'
      ],
      duration: '4 months',
      teamSize: 'Solo Project',
      createdAt: '2024-05-01',
      updatedAt: '2024-08-30'
    },
    {
      id: '6',
      title: 'Cryptocurrency Portfolio Tracker',
      slug: 'crypto-portfolio-tracker',
      description: 'A real-time cryptocurrency portfolio management application with price tracking, profit/loss analysis, news integration, and advanced charting capabilities.',
      longDescription: `
        A sophisticated crypto tracking platform featuring:
        • Real-time price tracking for 1000+ cryptocurrencies
        • Portfolio management with profit/loss calculations
        • Advanced charting with technical indicators
        • News aggregation and sentiment analysis
        • Price alerts and notification system
        • DeFi protocol integration and yield tracking
        • Tax reporting and transaction history
        • Dark/light theme with customizable dashboard
      `,
      technologies: [
        'React', 'TypeScript', 'Node.js', 'WebSocket',
        'Redis', 'PostgreSQL', 'TradingView Charts',
        'CoinGecko API', 'Web3.js', 'PWA'
      ],
      category: 'Frontend',
      featured: false,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/crypto-tracker',
      liveUrl: 'https://cryptofolio-pro.vercel.app',
      imageUrl: '/images/projects/crypto-tracker.jpg',
      images: [
        '/images/projects/crypto-1.jpg',
        '/images/projects/crypto-2.jpg',
        '/images/projects/crypto-3.jpg'
      ],
      features: [
        'Real-time Price Tracking',
        'Portfolio Management',
        'Advanced Charting',
        'News Integration',
        'Price Alerts',
        'DeFi Integration',
        'Tax Reporting',
        'PWA Support'
      ],
      challenges: [
        'Handling real-time data streams efficiently',
        'Building complex financial calculations',
        'Integrating multiple cryptocurrency APIs',
        'Creating responsive chart interfaces'
      ],
      learnings: [
        'Real-time data handling with WebSockets',
        'Financial application development',
        'Cryptocurrency and blockchain integration',
        'Progressive Web App development'
      ],
      duration: '3 months',
      teamSize: 'Solo Project',
      createdAt: '2024-06-01',
      updatedAt: '2024-08-15'
    }
  ];

  try {
    const { 
      category, 
      featured, 
      limit = 20, 
      offset = 0 
    } = req.query;

    let filteredProjects = [...projects];

    // Filter by category
    if (category && category !== 'all') {
      filteredProjects = filteredProjects.filter(
        project => project.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by featured status
    if (featured === 'true') {
      filteredProjects = filteredProjects.filter(project => project.featured);
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    // Get unique categories for filtering
    const categories = [...new Set(projects.map(p => p.category))];

    return res.status(200).json({
      success: true,
      data: {
        projects: paginatedProjects,
        categories,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: filteredProjects.length,
          hasMore: endIndex < filteredProjects.length
        },
        stats: {
          totalProjects: projects.length,
          featuredProjects: projects.filter(p => p.featured).length,
          completedProjects: projects.filter(p => p.status === 'completed').length
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to load projects'
      }
    });
  }
}