/**
 * Contact Page - No SMTP Required
 * Uses simple contact methods perfect for job portfolios
 */

import Head from 'next/head';
import ContactHero from '../components/contact/ContactHero';
import SimpleContact from '../components/contact/SimpleContact';
// import FormspreeContact from '../components/contact/FormspreeContact'; // Uncomment if you want to use Formspree

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact - [Your Name] | Full Stack Developer</title>
        <meta 
          name="description" 
          content="Get in touch with [Your Name] for job opportunities, freelance projects, or collaborations. Quick response guaranteed!" 
        />
        <meta name="keywords" content="contact, hire developer, job opportunity, freelance, collaboration" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Contact [Your Name] - Full Stack Developer" />
        <meta property="og:description" content="Ready to work together? Let's discuss your next project!" />
        <meta property="og:type" content="website" />
        
        {/* Structured Data for Contact */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "[Your Name]",
              "jobTitle": "Full Stack Developer",
              "email": "devcore556@gmail.com",
              "url": "https://yourdomain.com",
              "sameAs": [
                "https://linkedin.com/in/your-profile",
                "https://github.com/Knightcoredev"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "devcore556@gmail.com",
                "contactType": "Professional"
              }
            })
          }}
        />
      </Head>

      <main>
        <ContactHero />
        <SimpleContact />
        
        {/* 
          Uncomment below if you want to use Formspree contact form instead:
          <FormspreeContact />
        */}
        
        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-grid">
              <div className="faq-item">
                <h3>🚀 What type of projects do you work on?</h3>
                <p>I specialize in full-stack web applications, e-commerce sites, portfolio websites, and custom business solutions using modern technologies like React, Next.js, Node.js, and various databases.</p>
              </div>

              <div className="faq-item">
                <h3>⏱️ How quickly do you respond?</h3>
                <p>I typically respond to all inquiries within 24 hours during business days. For urgent matters, feel free to mention it in your message subject line.</p>
              </div>

              <div className="faq-item">
                <h3>💼 Are you available for full-time positions?</h3>
                <p>Yes! I'm open to both full-time opportunities and freelance projects. Let me know what you have in mind and we can discuss the details.</p>
              </div>

              <div className="faq-item">
                <h3>🌍 Do you work remotely?</h3>
                <p>Absolutely! I have extensive experience working with remote teams and clients worldwide. I'm comfortable with various collaboration tools and time zones.</p>
              </div>

              <div className="faq-item">
                <h3>💰 How do you handle project pricing?</h3>
                <p>Pricing depends on project scope, timeline, and requirements. I provide detailed quotes after understanding your specific needs. I'm transparent about costs upfront.</p>
              </div>

              <div className="faq-item">
                <h3>🔧 What's your development process?</h3>
                <p>I follow agile methodologies with regular check-ins, use version control (Git), write clean documented code, and ensure thorough testing before delivery.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .faq-section {
          padding: 4rem 0;
          background: white;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .faq-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #2d3748;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .faq-item {
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #4299e1;
        }

        .faq-item h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        .faq-item p {
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .faq-grid {
            grid-template-columns: 1fr;
          }
          
          .faq-section h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
}