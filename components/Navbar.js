import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.pathname]);

  const isActive = (path) => {
    if (path === '/' && router.pathname === '/') return true;
    if (path !== '/' && router.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: '/#services', label: 'Services', isHash: true },
    { href: '/projects', label: 'Projects', isHash: false },
    { href: '/blog', label: 'Blog', isHash: false },
    { href: '/#contact', label: 'Contact', isHash: true }
  ];

  const handleNavClick = (href, isHash) => {
    if (isHash && router.pathname === '/') {
      // Smooth scroll to section on home page
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (isHash) {
      // Navigate to home page with hash
      router.push(href);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`w-full fixed top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-semibold hover:text-indigo-600 transition-colors">
            Prince F. Obieze
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.isHash ? (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href, link.isHash)}
                  className={`hover:text-indigo-600 transition-colors ${
                    router.pathname === '/' && link.href.includes('services') ? 'text-indigo-600' : ''
                  }`}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-indigo-600 transition-colors ${
                    isActive(link.href) ? 'text-indigo-600 font-medium' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => handleNavClick('/#contact', true)}
            className="hidden md:inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Hire Me
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-3 border-t border-gray-100 mt-4">
            {navLinks.map((link) => (
              link.isHash ? (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href, link.isHash)}
                  className={`block w-full text-left py-2 hover:text-indigo-600 transition-colors ${
                    router.pathname === '/' && link.href.includes('services') ? 'text-indigo-600' : ''
                  }`}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2 hover:text-indigo-600 transition-colors ${
                    isActive(link.href) ? 'text-indigo-600 font-medium' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
            <button
              onClick={() => handleNavClick('/#contact', true)}
              className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Hire Me
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}