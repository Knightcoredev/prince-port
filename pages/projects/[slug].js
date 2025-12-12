/**
 * Individual Project Detail Page
 * Shows comprehensive information about a specific project
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function ProjectDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all projects and find the one with matching slug
      const response = await fetch('/api/projects-static');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch project');
      }

      if (data.success) {
        const foundProject = data.data.projects.find(p => p.slug === slug);
        if (foundProject) {
          setProject(foundProject);
        } else {
          setError('Project not found');
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Project Not Found</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/projects" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ← Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{project.title} - [Your Name] | Full Stack Developer</title>
        <meta name="description" content={project.description} />
        <meta name="keywords" content={project.technologies.join(', ')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${project.title} - [Your Name]`} />
        <meta property="og:description" content={project.description} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={project.imageUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} - [Your Name]`} />
        <meta name="twitter:description" content={project.description} />
        <meta name="twitter:image" content={project.imageUrl} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "name": project.title,
              "description": project.description,
              "author": {
                "@type": "Person",
                "name": "[Your Name]"
              },
              "dateCreated": project.createdAt,
              "dateModified": project.updatedAt,
              "keywords": project.technologies.join(', '),
              "url": project.liveUrl,
              "sameAs": project.githubUrl
            })
          }}
        />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/projects" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Project Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {project.category}
                  </span>
                  {project.featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {project.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    PO
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Developed by</p>
                    <p className="font-semibold text-gray-900">[Your Name]</p>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {project.title}
                </h1>
                
                <p className="text-xl text-gray-600 mb-6">
                  {project.description}
                </p>

                {/* Project Links */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Live Demo
                    </a>
                  )}
                  
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View Source Code
                    </a>
                  )}
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium text-gray-900">{project.duration}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Team Size:</span>
                    <p className="font-medium text-gray-900">{project.teamSize}</p>
                  </div>
                </div>
              </div>

              {/* Project Image */}
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                  <Image
                    src={project.imageUrl || '/images/placeholder-project.jpg'}
                    alt={project.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-project.jpg';
                    }}
                  />
                  {/* Brand Watermark */}
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      PO
                    </div>
                    <span className="text-white text-sm font-medium">[Your Name]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Gallery */}
        {project.images && project.images.length > 0 && (
          <section className="py-12 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Project Gallery</h2>
              
              {/* Main Image */}
              <div className="mb-6">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={project.images[activeImageIndex] || '/images/placeholder-project.jpg'}
                    alt={`${project.title} - Image ${activeImageIndex + 1}`}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-project.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Thumbnail Navigation */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image || '/images/placeholder-project.jpg'}
                      alt={`${project.title} - Thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-project.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Project Details */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
                <div 
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: project.longDescription }}
                />

                {/* Features */}
                {project.features && project.features.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges & Learnings */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {project.challenges && project.challenges.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Challenges</h3>
                      <ul className="space-y-2">
                        {project.challenges.map((challenge, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-gray-600">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.learnings && project.learnings.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Key Learnings</h3>
                      <ul className="space-y-2">
                        {project.learnings.map((learning, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span className="text-gray-600">{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Technologies */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech, index) => {
                      const getTechIcon = (techName) => {
                        const name = techName.toLowerCase();
                        if (name.includes('react')) return '⚛️';
                        if (name.includes('next')) return '▲';
                        if (name.includes('node')) return '🟢';
                        if (name.includes('javascript') || name.includes('js')) return '🟨';
                        if (name.includes('typescript') || name.includes('ts')) return '🔷';
                        if (name.includes('tailwind')) return '🎨';
                        if (name.includes('css')) return '🎨';
                        if (name.includes('html')) return '🌐';
                        if (name.includes('python')) return '🐍';
                        if (name.includes('mongodb')) return '🍃';
                        if (name.includes('postgresql') || name.includes('postgres')) return '🐘';
                        if (name.includes('mysql')) return '🐬';
                        if (name.includes('redis')) return '🔴';
                        if (name.includes('docker')) return '🐳';
                        if (name.includes('aws')) return '☁️';
                        if (name.includes('vercel')) return '▲';
                        if (name.includes('firebase')) return '🔥';
                        if (name.includes('stripe')) return '💳';
                        if (name.includes('express')) return '🚂';
                        if (name.includes('vite')) return '⚡';
                        if (name.includes('webpack')) return '📦';
                        if (name.includes('git')) return '🌿';
                        return '🔧';
                      };

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 text-sm rounded-lg border hover:shadow-md transition-shadow"
                        >
                          <span className="text-lg">{getTechIcon(tech)}</span>
                          <span className="font-medium">{tech}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Developer Credit */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        PO
                      </div>
                      <span>Crafted with expertise by [Your Name]</span>
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Project Information</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500">Category</span>
                      <p className="font-medium text-gray-900">{project.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status</span>
                      <p className="font-medium text-gray-900 capitalize">{project.status}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Duration</span>
                      <p className="font-medium text-gray-900">{project.duration}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Team Size</span>
                      <p className="font-medium text-gray-900">{project.teamSize}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Completed</span>
                      <p className="font-medium text-gray-900">
                        {new Date(project.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Interested in Working Together?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              I'm always excited to take on new challenges and create innovative solutions. 
              Let's discuss your next project!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get In Touch
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
              >
                View More Projects
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}