/**
 * Projects Page - Showcase of Professional Development Work
 * Displays portfolio projects with filtering and detailed information
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Simple Projects Grid Component (inline to avoid dependencies)
function SimpleProjectsGrid() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  // Static projects data (fallback if API fails)
  const staticProjects = [
    {
      id: '1',
      title: 'E-Commerce Platform',
      slug: 'ecommerce-platform',
      description: 'A full-featured e-commerce platform with user authentication, payment processing, inventory management, and admin dashboard. Built with modern technologies for scalability and performance.',
      technologies: ['Next.js', 'React', 'Node.js', 'Express', 'MongoDB', 'Stripe API', 'JWT Authentication', 'Tailwind CSS', 'Vercel', 'Cloudinary'],
      category: 'Full Stack',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/ecommerce-platform',
      liveUrl: 'http://localhost:3000/projects/ecommerce-platform',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: '2',
      title: 'Task Management Dashboard',
      slug: 'task-management-dashboard',
      description: 'A collaborative project management tool with real-time updates, team collaboration features, and advanced analytics. Perfect for agile development teams and project tracking.',
      technologies: ['React', 'TypeScript', 'Node.js', 'Socket.io', 'PostgreSQL', 'Prisma', 'Chart.js', 'Material-UI', 'JWT', 'AWS S3', 'Docker'],
      category: 'Full Stack',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/task-management',
      liveUrl: 'http://localhost:5175',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: '3',
      title: 'Social Media Analytics Platform',
      slug: 'social-media-analytics',
      description: 'A comprehensive analytics platform that aggregates data from multiple social media APIs, providing insights, trends analysis, and automated reporting for businesses and influencers.',
      technologies: ['Next.js', 'Python', 'FastAPI', 'Redis', 'PostgreSQL', 'D3.js', 'Chart.js', 'TensorFlow', 'Docker', 'AWS Lambda', 'Celery', 'React Query'],
      category: 'Full Stack',
      featured: true,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/social-analytics',
      liveUrl: 'http://localhost:5176',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: '4',
      title: 'Real Estate Management System',
      slug: 'real-estate-management',
      description: 'A comprehensive property management platform for real estate agencies, featuring property listings, client management, virtual tours, and automated marketing tools.',
      technologies: ['React Native', 'Next.js', 'Node.js', 'MongoDB', 'Mapbox API', 'Cloudinary', 'SendGrid', 'Stripe', 'DocuSign API', 'Firebase', 'Expo'],
      category: 'Full Stack',
      featured: false,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/real-estate-platform',
      liveUrl: 'http://localhost:5173',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: '5',
      title: 'Learning Management System (LMS)',
      slug: 'learning-management-system',
      description: 'An educational platform with course creation tools, student progress tracking, interactive assessments, and video streaming capabilities for online learning.',
      technologies: ['Next.js', 'React', 'Node.js', 'Express', 'PostgreSQL', 'AWS S3', 'CloudFront', 'Stripe', 'Socket.io', 'FFmpeg', 'PDF-lib', 'Chart.js'],
      category: 'Full Stack',
      featured: false,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/lms-platform',
      liveUrl: 'http://localhost:5177',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: '6',
      title: 'Cryptocurrency Portfolio Tracker',
      slug: 'crypto-portfolio-tracker',
      description: 'A real-time cryptocurrency portfolio management application with price tracking, profit/loss analysis, news integration, and advanced charting capabilities.',
      technologies: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Redis', 'PostgreSQL', 'TradingView Charts', 'CoinGecko API', 'Web3.js', 'PWA'],
      category: 'Frontend',
      featured: false,
      status: 'completed',
      githubUrl: 'https://github.com/Knightcoredev/crypto-tracker',
      liveUrl: 'http://localhost:5174',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop&crop=center'
    }
  ];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try API first, fallback to static data
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        
        console.log('Fetching projects from:', `/api/projects-static?${params}`);
        
        const response = await fetch(`/api/projects-static?${params}`);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          
          if (data.success) {
            setProjects(data.data.projects);
            return; // Success, exit early
          }
        }
      } catch (apiError) {
        console.log('API failed, using static data:', apiError.message);
      }
      
      // Fallback to static data
      console.log('Using static projects data');
      let filteredProjects = [...staticProjects];
      
      // Apply category filter
      if (selectedCategory !== 'all') {
        filteredProjects = filteredProjects.filter(
          project => project.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      
      setProjects(filteredProjects);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Full Stack', 'Frontend', 'Backend'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Projects</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category === 'all' ? 'All Projects' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Project Image */}
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                {project.imageUrl || project.images?.[0] ? (
                  <img
                    src={project.imageUrl || project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="text-white text-center absolute inset-0 flex flex-col items-center justify-center" style={{ display: project.imageUrl || project.images?.[0] ? 'none' : 'flex' }}>
                  <div className="text-4xl mb-2">💻</div>
                  <div className="text-sm font-medium">{project.category}</div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Project Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {project.category}
                  </span>
                  {project.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  <Link 
                    href={`/projects/${project.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {project.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>
                
                {/* Technologies */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 4).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Project Links */}
                <div className="flex gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-800 text-white text-center py-2 px-3 rounded text-sm hover:bg-gray-900 transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                  <Link
                    href={`/projects/${project.slug}`}
                    className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              {selectedCategory !== 'all' 
                ? 'Try selecting a different category.' 
                : 'Projects will be displayed here once available.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsIndex() {
  return (
    <>
      <Head>
        <title>Portfolio Projects - Prince F. Obieze | Full Stack Developer</title>
        <meta 
          name="description" 
          content="Explore my professional development projects including e-commerce platforms, task management systems, social media analytics, and more. Full-stack solutions built with modern technologies." 
        />
        <meta 
          name="keywords" 
          content="full stack developer, React projects, Next.js applications, Node.js backend, e-commerce platform, task management, social media analytics, real estate management, LMS platform, cryptocurrency tracker" 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content="Professional Development Projects - Prince F. Obieze" />
        <meta property="og:description" content="Showcase of full-stack development projects and professional applications" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/projects" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Professional Development Projects - Prince F. Obieze" />
        <meta name="twitter:description" content="Showcase of full-stack development projects and professional applications" />
        
        {/* Structured Data for Projects */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Professional Development Projects",
              "description": "Portfolio of full-stack development projects by Prince F. Obieze",
              "author": {
                "@type": "Person",
                "name": "Prince F. Obieze",
                "jobTitle": "Full Stack Developer",
                "email": "devcore556@gmail.com",
                "url": "https://yourdomain.com"
              },
              "mainEntity": {
                "@type": "ItemList",
                "name": "Development Projects",
                "description": "Professional software development projects showcasing full-stack expertise",
                "numberOfItems": 6,
                "itemListElement": [
                  {
                    "@type": "SoftwareApplication",
                    "name": "E-Commerce Platform",
                    "description": "Full-featured e-commerce platform with payment processing and admin dashboard",
                    "applicationCategory": "BusinessApplication",
                    "operatingSystem": "Web Browser",
                    "programmingLanguage": ["JavaScript", "React", "Node.js"]
                  },
                  {
                    "@type": "SoftwareApplication", 
                    "name": "Task Management Dashboard",
                    "description": "Collaborative project management tool with real-time updates",
                    "applicationCategory": "BusinessApplication",
                    "operatingSystem": "Web Browser",
                    "programmingLanguage": ["TypeScript", "React", "Node.js"]
                  },
                  {
                    "@type": "SoftwareApplication",
                    "name": "Social Media Analytics Platform", 
                    "description": "Analytics platform for social media data aggregation and insights",
                    "applicationCategory": "BusinessApplication",
                    "operatingSystem": "Web Browser",
                    "programmingLanguage": ["JavaScript", "Python", "React"]
                  }
                ]
              }
            })
          }}
        />
      </Head>

      <main className="projects-page">
        {/* Hero Section */}
        <section className="projects-hero">
          <div className="hero-background">
            <div className="hero-pattern"></div>
          </div>
          
          <div className="hero-content">
            <div className="hero-text">
              <h1>Professional Projects</h1>
              <p>
                Showcasing my expertise in full-stack development through real-world applications. 
                Each project demonstrates different aspects of modern web development, from e-commerce 
                platforms to data analytics dashboards.
              </p>
              
              <div className="hero-highlights">
                <div className="highlight">
                  <span className="highlight-icon">🚀</span>
                  <span>6+ Major Projects</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">⚡</span>
                  <span>Modern Tech Stack</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">🎯</span>
                  <span>Production Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="projects-section">
          <SimpleProjectsGrid />
        </section>

        {/* Skills Showcase */}
        <section className="skills-showcase">
          <div className="skills-container">
            <h2>Technologies & Skills Demonstrated</h2>
            <p>These projects showcase my proficiency across the full development stack</p>
            
            <div className="skills-grid">
              <div className="skill-category">
                <h3>Frontend Development</h3>
                <div className="skills-list">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">Next.js</span>
                  <span className="skill-tag">TypeScript</span>
                  <span className="skill-tag">Tailwind CSS</span>
                  <span className="skill-tag">Material-UI</span>
                  <span className="skill-tag">Chart.js</span>
                  <span className="skill-tag">D3.js</span>
                </div>
              </div>

              <div className="skill-category">
                <h3>Backend Development</h3>
                <div className="skills-list">
                  <span className="skill-tag">Node.js</span>
                  <span className="skill-tag">Express</span>
                  <span className="skill-tag">FastAPI</span>
                  <span className="skill-tag">Python</span>
                  <span className="skill-tag">Socket.io</span>
                  <span className="skill-tag">JWT</span>
                  <span className="skill-tag">RESTful APIs</span>
                </div>
              </div>

              <div className="skill-category">
                <h3>Database & Storage</h3>
                <div className="skills-list">
                  <span className="skill-tag">MongoDB</span>
                  <span className="skill-tag">PostgreSQL</span>
                  <span className="skill-tag">SQLite</span>
                  <span className="skill-tag">Redis</span>
                  <span className="skill-tag">Prisma</span>
                  <span className="skill-tag">AWS S3</span>
                  <span className="skill-tag">Cloudinary</span>
                </div>
              </div>

              <div className="skill-category">
                <h3>DevOps & Deployment</h3>
                <div className="skills-list">
                  <span className="skill-tag">Vercel</span>
                  <span className="skill-tag">Docker</span>
                  <span className="skill-tag">AWS Lambda</span>
                  <span className="skill-tag">CloudFront</span>
                  <span className="skill-tag">Git</span>
                  <span className="skill-tag">CI/CD</span>
                  <span className="skill-tag">Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .projects-page {
          min-height: 100vh;
        }

        .projects-hero {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6rem 0 4rem;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
        }

        .hero-pattern {
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, white 2px, transparent 2px);
          background-size: 50px 50px;
          background-position: 0 0, 25px 25px;
        }

        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
        }

        .hero-text h1 {
          font-size: 4rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero-text p {
          font-size: 1.3rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .hero-highlights {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .highlight {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .highlight-icon {
          font-size: 1.2rem;
        }

        .projects-section {
          background: #f8fafc;
          padding: 4rem 0;
        }

        .skills-showcase {
          background: white;
          padding: 4rem 0;
        }

        .skills-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
        }

        .skills-container h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .skills-container p {
          font-size: 1.2rem;
          color: #6b7280;
          margin-bottom: 3rem;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .skill-category {
          background: #f8fafc;
          padding: 2rem;
          border-radius: 12px;
          text-align: left;
        }

        .skill-category h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .hero-text h1 {
            font-size: 2.5rem;
          }

          .hero-text p {
            font-size: 1.1rem;
          }

          .hero-highlights {
            flex-direction: column;
            align-items: center;
          }

          .skills-container h2 {
            font-size: 2rem;
          }

          .skills-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}