/**
 * Static Blog API - Simple JSON response for immediate deployment
 * Use this until SQLite database is properly set up
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Static blog posts data
  const posts = [
    {
      id: '1',
      title: 'Welcome to My Portfolio',
      slug: 'welcome-to-my-portfolio',
      excerpt: 'Welcome to my portfolio! I\'m Prince F. Obieze, a passionate full-stack developer specializing in modern web technologies.',
      content: `
        <h2>Hello and Welcome!</h2>
        <p>I'm excited to share my journey as a full-stack developer with you. This portfolio showcases my skills, projects, and passion for creating innovative web solutions.</p>
        
        <h3>What I Do</h3>
        <ul>
          <li>Full-stack web development with React and Next.js</li>
          <li>Backend development with Node.js and databases</li>
          <li>Mobile-responsive design and user experience</li>
          <li>API development and integration</li>
        </ul>
        
        <h3>My Tech Stack</h3>
        <p>I work with modern technologies including:</p>
        <ul>
          <li><strong>Frontend:</strong> React, Next.js, JavaScript, HTML5, CSS3</li>
          <li><strong>Backend:</strong> Node.js, Express, SQLite, MongoDB</li>
          <li><strong>Tools:</strong> Git, Vercel, VS Code, Figma</li>
        </ul>
        
        <p>Stay tuned for more blog posts about my projects, learning experiences, and insights into web development!</p>
      `,
      featuredImage: '',
      categories: ['Web Development', 'Portfolio'],
      tags: ['React', 'Next.js', 'Full Stack'],
      status: 'published',
      readingTime: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Building Modern Web Applications',
      slug: 'building-modern-web-applications',
      excerpt: 'Exploring the latest trends and best practices in modern web development, from React hooks to serverless deployment.',
      content: `
        <h2>The Evolution of Web Development</h2>
        <p>Web development has evolved tremendously over the past few years. Today's developers have access to powerful tools and frameworks that make building complex applications more efficient than ever.</p>
        
        <h3>Key Technologies I Use</h3>
        <p>In my development workflow, I focus on:</p>
        <ul>
          <li><strong>React & Next.js:</strong> For building fast, SEO-friendly applications</li>
          <li><strong>TypeScript:</strong> For better code quality and developer experience</li>
          <li><strong>Tailwind CSS:</strong> For rapid, responsive styling</li>
          <li><strong>Vercel:</strong> For seamless deployment and hosting</li>
        </ul>
        
        <h3>Best Practices</h3>
        <p>Some principles I follow in every project:</p>
        <ul>
          <li>Mobile-first responsive design</li>
          <li>Performance optimization</li>
          <li>Accessibility compliance</li>
          <li>Clean, maintainable code</li>
          <li>Comprehensive testing</li>
        </ul>
        
        <p>These practices ensure that every application I build is not just functional, but also user-friendly and scalable.</p>
      `,
      featuredImage: '',
      categories: ['Web Development', 'Best Practices'],
      tags: ['React', 'Next.js', 'TypeScript', 'Performance'],
      status: 'published',
      readingTime: 3,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      publishedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  try {
    const { limit = 10, offset = 0 } = req.query;
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = posts.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: posts.length,
          hasMore: endIndex < posts.length
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to load blog posts'
      }
    });
  }
}