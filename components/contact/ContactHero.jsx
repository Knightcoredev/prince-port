/**
 * Contact Hero Section - Simple and Professional
 * Perfect header for contact pages
 */

export default function ContactHero() {
  return (
    <section className="contact-hero">
      <div className="container">
        <div className="hero-content">
          <h1>Let's Work Together</h1>
          <p className="hero-subtitle">
            I'm always excited to take on new challenges and collaborate on interesting projects.
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">24h</span>
              <span className="stat-label">Response Time</span>
            </div>
            <div className="stat">
              <span className="stat-number">100+</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat">
              <span className="stat-number">5★</span>
              <span className="stat-label">Client Rating</span>
            </div>
          </div>

          <div className="hero-cta">
            <a 
              href="mailto:devcore556@gmail.com?subject=Let's Work Together&body=Hi Prince,%0D%0A%0D%0AI'd like to discuss..."
              className="cta-primary"
            >
              📧 Send Email Now
            </a>
            <a 
              href="https://linkedin.com/in/prince-obieze"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary"
            >
              💼 Connect on LinkedIn
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="contact-card-preview">
            <div className="card-header">
              <div className="avatar">PO</div>
              <div className="info">
                <h3>Prince F. Obieze</h3>
                <p>Full Stack Developer</p>
              </div>
            </div>
            <div className="card-content">
              <div className="contact-item">
                <span className="icon">📧</span>
                <span>devcore556@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="icon">💼</span>
                <span>LinkedIn Profile</span>
              </div>
              <div className="contact-item">
                <span className="icon">🐙</span>
                <span>GitHub Portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
        }

        .contact-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cta-primary,
        .cta-secondary {
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cta-primary {
          background: white;
          color: #667eea;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .cta-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .cta-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .contact-card-preview {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          color: #2d3748;
          max-width: 300px;
          width: 100%;
          transform: rotate(5deg);
          transition: transform 0.3s ease;
        }

        .contact-card-preview:hover {
          transform: rotate(0deg) scale(1.05);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.2rem;
          color: #2d3748;
        }

        .info p {
          margin: 0;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #4a5568;
        }

        .contact-item .icon {
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-cta {
            justify-content: center;
          }

          .contact-card-preview {
            transform: none;
            max-width: 280px;
          }

          .contact-card-preview:hover {
            transform: scale(1.02);
          }
        }

        @media (max-width: 480px) {
          .hero-cta {
            flex-direction: column;
            align-items: center;
          }

          .cta-primary,
          .cta-secondary {
            width: 100%;
            justify-content: center;
            max-width: 280px;
          }
        }
      `}</style>
    </section>
  );
}