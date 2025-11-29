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
      liveUrl: 'http://localhost:3000/projects/ecommerce-platform',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center'
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
      liveUrl: 'http://localhost:5175',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center'
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
      liveUrl: 'http://localhost:5176',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&crop=center'
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
      liveUrl: 'http://localhost:5173',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=600&fit=crop&crop=center'
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
      liveUrl: 'http://localhost:5177',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center'
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
      liveUrl: 'http://localhost:5174',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600&fit=crop&crop=center'
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
    },
    {
      id: '7',
      title: 'Business Consulting Website',
      slug: 'business-consulting-website',
      description: 'A professional business consulting website showcasing services, expertise, and client testimonials. Features modern design, lead generation forms, and conversion optimization.',
      longDescription: `
        A comprehensive business consulting website featuring:
        • Professional service showcase with detailed descriptions
        • Client testimonials and success stories
        • Lead generation and contact forms
        • Service booking and consultation scheduling
        • Team member profiles and expertise areas
        • Case studies and portfolio showcase
        • Blog integration for thought leadership
        • SEO-optimized content and structure
      `,
      technologies: [
        'React', 'Next.js', 'Tailwind CSS', 'Framer Motion',
        'React Hook Form', 'EmailJS', 'Vercel', 'Google Analytics'
      ],
      category: 'Business Website',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/business-consulting',
      liveUrl: 'http://localhost:5178',
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Professional Service Showcase',
        'Client Testimonials',
        'Lead Generation Forms',
        'Consultation Booking',
        'Team Profiles',
        'Case Studies',
        'Blog Integration',
        'SEO Optimization'
      ],
      challenges: [
        'Creating compelling business-focused content',
        'Optimizing for lead generation and conversions',
        'Building trust through professional design',
        'Implementing effective call-to-action strategies'
      ],
      learnings: [
        'Business website best practices',
        'Conversion rate optimization',
        'Professional web design principles',
        'Lead generation strategies'
      ],
      duration: '2 weeks',
      teamSize: 'Solo Project',
      createdAt: '2024-11-01',
      updatedAt: '2024-11-28'
    },
    {
      id: '8',
      title: 'SaaS Landing Page - CloudSync',
      slug: 'saas-landing-page',
      description: 'A high-converting SaaS landing page with modern animations, pricing tables, feature showcases, and optimized conversion funnels for cloud collaboration software.',
      longDescription: `
        A conversion-optimized SaaS landing page featuring:
        • Hero section with compelling value proposition
        • Feature showcase with interactive demonstrations
        • Social proof and customer testimonials
        • Tiered pricing with comparison tables
        • Free trial signup with minimal friction
        • Product screenshots and video demos
        • FAQ section addressing common concerns
        • Mobile-first responsive design
      `,
      technologies: [
        'React', 'Next.js', 'Tailwind CSS', 'Framer Motion',
        'React Hook Form', 'Stripe Integration', 'Analytics',
        'A/B Testing Tools'
      ],
      category: 'Landing Page',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/saas-landing',
      liveUrl: 'http://localhost:5179',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Compelling Hero Section',
        'Interactive Feature Demos',
        'Social Proof Integration',
        'Pricing Comparison Tables',
        'Frictionless Signup Flow',
        'Product Demonstrations',
        'FAQ Section',
        'Mobile Optimization'
      ],
      challenges: [
        'Optimizing conversion rates and user flow',
        'Creating engaging animations and interactions',
        'Building trust with potential customers',
        'Balancing information density with simplicity'
      ],
      learnings: [
        'Landing page optimization techniques',
        'SaaS marketing best practices',
        'Conversion funnel design',
        'A/B testing methodologies'
      ],
      duration: '2 weeks',
      teamSize: 'Solo Project',
      createdAt: '2024-11-05',
      updatedAt: '2024-11-28'
    },
    {
      id: '9',
      title: 'Fine Dining Restaurant Website',
      slug: 'restaurant-website',
      description: 'An elegant restaurant website featuring online reservations, menu showcase, chef profiles, and immersive dining experience presentation for upscale establishments.',
      longDescription: `
        A sophisticated restaurant website featuring:
        • Elegant design reflecting fine dining atmosphere
        • Interactive menu with detailed dish descriptions
        • Online reservation system with table management
        • Chef and staff profiles with culinary backgrounds
        • Photo gallery showcasing ambiance and cuisine
        • Customer reviews and testimonials
        • Event hosting and private dining information
        • Location, hours, and contact information
      `,
      technologies: [
        'React', 'Next.js', 'Tailwind CSS', 'Google Fonts',
        'Reservation API', 'Image Optimization', 'SEO',
        'Google Maps Integration'
      ],
      category: 'Business Website',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/restaurant-website',
      liveUrl: 'http://localhost:5180',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Elegant Visual Design',
        'Interactive Menu Display',
        'Online Reservation System',
        'Chef Profiles',
        'Photo Gallery',
        'Customer Reviews',
        'Event Information',
        'Location Integration'
      ],
      challenges: [
        'Creating an atmosphere that matches fine dining',
        'Designing intuitive reservation flow',
        'Showcasing culinary artistry through design',
        'Balancing elegance with functionality'
      ],
      learnings: [
        'Hospitality industry web design',
        'Luxury brand presentation online',
        'Reservation system integration',
        'Food photography optimization'
      ],
      duration: '2 weeks',
      teamSize: 'Solo Project',
      createdAt: '2024-11-10',
      updatedAt: '2024-11-28'
    },
    {
      id: '10',
      title: 'Fitness Landing Page - FitPro',
      slug: 'fitness-landing-page',
      description: 'A high-energy fitness landing page with transformation stories, workout programs, and membership conversion optimization for personal training and fitness coaching.',
      longDescription: `
        A conversion-focused fitness landing page featuring:
        • Motivational hero section with transformation promise
        • Before/after success stories and testimonials
        • Workout program showcase with detailed descriptions
        • Trainer profiles and credentials
        • Membership pricing with clear value propositions
        • Free trial offers and lead magnets
        • Progress tracking and app integration previews
        • Community and support system highlights
      `,
      technologies: [
        'React', 'Next.js', 'Tailwind CSS', 'Framer Motion',
        'Video Integration', 'Form Handling', 'Payment Processing',
        'Analytics Tracking'
      ],
      category: 'Landing Page',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/fitness-landing',
      liveUrl: 'http://localhost:5181',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1549476464-37392f717541?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Motivational Hero Design',
        'Success Story Showcases',
        'Program Descriptions',
        'Trainer Credentials',
        'Pricing Optimization',
        'Free Trial Offers',
        'App Integration Previews',
        'Community Highlights'
      ],
      challenges: [
        'Creating motivational and inspiring design',
        'Showcasing transformation results effectively',
        'Building trust in fitness expertise',
        'Optimizing for mobile fitness enthusiasts'
      ],
      learnings: [
        'Fitness industry marketing strategies',
        'Motivational design principles',
        'Health and wellness conversion optimization',
        'Mobile-first fitness user experience'
      ],
      duration: '2 weeks',
      teamSize: 'Solo Project',
      createdAt: '2024-11-15',
      updatedAt: '2024-11-28'
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

    // Get unique categories and technologies for filtering
    const categories = [...new Set(projects.map(p => p.category))];
    const technologies = [...new Set(projects.flatMap(p => p.technologies))];

    return res.status(200).json({
      success: true,
      data: {
        projects: paginatedProjects,
        categories,
        technologies,
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