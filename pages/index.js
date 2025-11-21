import Head from 'next/head'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import ErrorBoundary, { PageErrorFallback } from '../components/ErrorBoundary'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>Prince F. Obieze — Full-stack Developer</title>
        <meta name="description" content="Full-stack web developer specializing in React, Next.js, Node.js, and modern web technologies. Available for freelance projects and consulting." />
        <meta name="keywords" content="full-stack developer, React, Next.js, Node.js, JavaScript, web development, freelance" />
        <meta name="author" content="Prince F. Obieze" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourportfolio.com/" />
        <meta property="og:title" content="Prince F. Obieze — Full-stack Developer" />
        <meta property="og:description" content="Full-stack web developer specializing in React, Next.js, Node.js, and modern web technologies." />
        <meta property="og:image" content="/profile.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://yourportfolio.com/" />
        <meta property="twitter:title" content="Prince F. Obieze — Full-stack Developer" />
        <meta property="twitter:description" content="Full-stack web developer specializing in React, Next.js, Node.js, and modern web technologies." />
        <meta property="twitter:image" content="/profile.jpg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>

      <Navbar />
      
      <main className="pt-20"> {/* Account for fixed navbar */}
        <ErrorBoundary fallback={PageErrorFallback}>
          <Hero />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={PageErrorFallback}>
          <Services />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={PageErrorFallback}>
          <Projects />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={PageErrorFallback}>
          <Contact />
        </ErrorBoundary>
      </main>
      
      <ErrorBoundary fallback={PageErrorFallback}>
        <Footer />
      </ErrorBoundary>
    </div>
  )
}