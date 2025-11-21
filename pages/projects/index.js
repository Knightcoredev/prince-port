/**
 * Projects Page - Showcase of Professional Development Work
 * Displays portfolio projects with filtering and detailed information
 */

import Head from 'next/head';
import ProjectsGrid from '../../components/projects/ProjectsGrid';

export default function ProjectsIndex() {
  return (
    <>
      <Head>
        <title>Projects - Prince F. Obieze | Full Stack Developer Portfolio</title>
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
          <ProjectsGrid />
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