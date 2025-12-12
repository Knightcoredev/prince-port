/**
 * Simple Contact Component - No SMTP Required
 * Perfect for job portfolios
 */

import { useState } from 'react';

export default function SimpleContact() {
  const [copied, setCopied] = useState('');

  const contactInfo = {
    email: 'devcore556@gmail.com',
    linkedin: 'https://linkedin.com/in/your-profile',
    github: 'https://github.com/Knightcoredev',
    phone: '+2348105396757'
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.log('Copy failed');
    }
  };

  return (
    <section className="contact-section">
      <div className="container">
        <h2 className="section-title">Let's Connect</h2>
        <p className="section-subtitle">
          I'm always open to discussing new opportunities and interesting projects!
        </p>

        {/* Primary Contact Methods */}
        <div className="contact-grid">
          {/* Email */}
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <h3>Email</h3>
            <p>Drop me a line anytime</p>
            <div className="contact-actions">
              <a 
                href={`mailto:${contactInfo.email}?subject=Job Opportunity&body=Hi Prince,%0D%0A%0D%0AI came across your portfolio and would like to discuss...`}
                className="btn-primary"
              >
                Send Email
              </a>
              <button 
                onClick={() => copyToClipboard(contactInfo.email, 'email')}
                className="btn-secondary"
              >
                {copied === 'email' ? '✓ Copied!' : 'Copy Email'}
              </button>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="contact-card">
            <div className="contact-icon">💼</div>
            <h3>LinkedIn</h3>
            <p>Let's connect professionally</p>
            <div className="contact-actions">
              <a 
                href={contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                View Profile
              </a>
              <button 
                onClick={() => copyToClipboard(contactInfo.linkedin, 'linkedin')}
                className="btn-secondary"
              >
                {copied === 'linkedin' ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* GitHub */}
          <div className="contact-card">
            <div className="contact-icon">🐙</div>
            <h3>GitHub</h3>
            <p>Check out my code</p>
            <div className="contact-actions">
              <a 
                href={contactInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                View GitHub
              </a>
              <button 
                onClick={() => copyToClipboard(contactInfo.github, 'github')}
                className="btn-secondary"
              >
                {copied === 'github' ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="contact-card">
            <div className="contact-icon">📱</div>
            <h3>Phone</h3>
            <p>Call or text me</p>
            <div className="contact-actions">
              <a 
                href={`tel:${contactInfo.phone}`}
                className="btn-primary"
              >
                Call Now
              </a>
              <button 
                onClick={() => copyToClipboard(contactInfo.phone, 'phone')}
                className="btn-secondary"
              >
                {copied === 'phone' ? '✓ Copied!' : 'Copy Number'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="quick-contact">
          <p>Prefer a quick message?</p>
          <div className="quick-actions">
            <a 
              href={`mailto:${contactInfo.email}?subject=Quick Question`}
              className="quick-btn"
            >
              📧 Quick Email
            </a>
            <a 
              href={`${contactInfo.linkedin}/overlay/contact-info/`}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-btn"
            >
              💼 LinkedIn Message
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        .section-subtitle {
          text-align: center;
          font-size: 1.2rem;
          color: #4a5568;
          margin-bottom: 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .contact-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.2s ease;
        }

        .contact-card:hover {
          transform: translateY(-4px);
        }

        .contact-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .contact-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }

        .contact-card p {
          color: #4a5568;
          margin-bottom: 1.5rem;
        }

        .contact-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: #4299e1;
          color: white;
        }

        .btn-primary:hover {
          background: #3182ce;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
        }

        .quick-contact {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .quick-contact p {
          margin-bottom: 1rem;
          color: #4a5568;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .quick-btn {
          padding: 0.5rem 1rem;
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          text-decoration: none;
          color: #4a5568;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .quick-btn:hover {
          border-color: #4299e1;
          color: #4299e1;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .contact-actions {
            flex-direction: column;
          }
          
          .quick-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}