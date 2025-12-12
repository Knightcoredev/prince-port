/**
 * Formspree Contact Form - No SMTP Server Required
 * Professional contact form using Formspree service
 */

import { useState } from 'react';

export default function FormspreeContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace with your actual Formspree form ID
  const FORMSPREE_FORM_ID = 'your-form-id'; // Get this from formspree.io

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = {
    email: 'devcore556@gmail.com',
    linkedin: 'https://linkedin.com/in/your-profile',
    github: 'https://github.com/Knightcoredev'
  };

  return (
    <section className="formspree-contact">
      <div className="container">
        <div className="contact-wrapper">
          {/* Contact Form */}
          <div className="form-section">
            <h2>Send Me a Message</h2>
            <p>I'd love to hear about your project or opportunity!</p>

            {status === 'success' && (
              <div className="alert alert-success">
                ✅ Message sent successfully! I'll get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div className="alert alert-error">
                ❌ Something went wrong. Please try the email link below instead.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="Job Opportunity">Job Opportunity</option>
                  <option value="Freelance Project">Freelance Project</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell me about your project, opportunity, or what you'd like to discuss..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    📧 Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info Sidebar */}
          <div className="info-section">
            <h3>Other Ways to Reach Me</h3>
            
            <div className="contact-methods">
              <a 
                href={`mailto:${contactInfo.email}?subject=Portfolio Contact`}
                className="contact-method"
              >
                <span className="icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>{contactInfo.email}</p>
                </div>
              </a>

              <a 
                href={contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-method"
              >
                <span className="icon">💼</span>
                <div>
                  <strong>LinkedIn</strong>
                  <p>Professional network</p>
                </div>
              </a>

              <a 
                href={contactInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-method"
              >
                <span className="icon">🐙</span>
                <div>
                  <strong>GitHub</strong>
                  <p>View my code</p>
                </div>
              </a>
            </div>

            <div className="response-time">
              <h4>⏱️ Response Time</h4>
              <p>I typically respond within 24 hours during business days.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .formspree-contact {
          padding: 4rem 0;
          background: #f8fafc;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .contact-wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        .form-section {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-section h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }

        .form-section p {
          color: #4a5568;
          margin-bottom: 2rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .alert-success {
          background: #f0fff4;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }

        .alert-error {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4299e1;
        }

        .submit-btn {
          padding: 1rem 2rem;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          background: #3182ce;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .info-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          height: fit-content;
        }

        .info-section h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #2d3748;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .contact-method {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }

        .contact-method:hover {
          border-color: #4299e1;
          background: #f7fafc;
        }

        .contact-method .icon {
          font-size: 1.5rem;
        }

        .contact-method strong {
          display: block;
          color: #2d3748;
        }

        .contact-method p {
          margin: 0;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .response-time {
          padding: 1rem;
          background: #f7fafc;
          border-radius: 8px;
        }

        .response-time h4 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
        }

        .response-time p {
          margin: 0;
          color: #4a5568;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .contact-wrapper {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-section,
          .info-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}