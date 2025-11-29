/**
 * Project Card Component
 * Displays individual project information in a card format
 */

import Link from 'next/link';
import { useState } from 'react';

export default function ProjectCard({ project }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="project-card">
      {/* Project Image */}
      <div className="project-image">
        {!imageError ? (
          <div className="image-container">
            <img
              src={project.imageUrl}
              alt={project.title}
              onError={handleImageError}
              className="image"
            />
            {/* Brand Watermark */}
            <div className="brand-watermark">
              <div className="brand-icon">PO</div>
            </div>
          </div>
        ) : (
          <div className="image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🚀</div>
              <div className="placeholder-text">{project.title}</div>
              {/* Brand Watermark for placeholder */}
              <div className="brand-watermark">
                <div className="brand-icon">PO</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Project Status Badge */}
        <div className="status-badge">
          <span className={`badge ${project.status}`}>
            {project.status === 'completed' ? '✅ Completed' : '🚧 In Progress'}
          </span>
        </div>

        {/* Featured Badge */}
        {project.featured && (
          <div className="featured-badge">
            <span className="badge featured">⭐ Featured</span>
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className="project-content">
        {/* Category */}
        <div className="project-category">
          <span className="category-tag">{project.category}</span>
        </div>

        {/* Title */}
        <h3 className="project-title">
          <Link href={`/projects/${project.slug}`}>
            {project.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="project-description">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="project-technologies">
          {project.technologies.slice(0, 4).map((tech, index) => {
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
              <span key={index} className="tech-tag">
                <span className="tech-icon">{getTechIcon(tech)}</span>
                {tech}
              </span>
            );
          })}
          {project.technologies.length > 4 && (
            <span className="tech-tag more">
              +{project.technologies.length - 4} more
            </span>
          )}
        </div>

        {/* Developer Credit */}
        <div className="developer-credit">
          <div className="developer-info">
            <div className="developer-avatar">PO</div>
            <span className="developer-name">Prince Obieze</span>
          </div>
        </div>

        {/* Project Links */}
        <div className="project-links">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link live"
            >
              <span className="link-icon">🌐</span>
              Live Demo
            </a>
          )}
          
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link github"
            >
              <span className="link-icon">🐙</span>
              GitHub
            </a>
          )}
          
          <Link href={`/projects/${project.slug}`} className="project-link details">
            <span className="link-icon">📋</span>
            Details
          </Link>
        </div>
      </div>

      <style jsx>{`
        .project-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .project-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .project-card:hover .image {
          transform: scale(1.05);
        }

        .brand-watermark {
          position: absolute;
          bottom: 8px;
          right: 8px;
          opacity: 0.9;
        }

        .brand-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-content {
          text-align: center;
          color: white;
        }

        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .placeholder-text {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          left: 12px;
        }

        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .badge.completed {
          background: rgba(34, 197, 94, 0.9);
          color: white;
        }

        .badge.in-progress {
          background: rgba(251, 191, 36, 0.9);
          color: white;
        }

        .badge.featured {
          background: rgba(168, 85, 247, 0.9);
          color: white;
        }

        .project-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .project-category {
          margin-bottom: 0.75rem;
        }

        .category-tag {
          background: #f3f4f6;
          color: #374151;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .project-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .project-title a {
          color: #1f2937;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .project-title a:hover {
          color: #4f46e5;
        }

        .project-description {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 1rem;
          flex: 1;
        }

        .project-technologies {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tech-tag {
          background: #e0e7ff;
          color: #4338ca;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tech-tag.more {
          background: #f3f4f6;
          color: #6b7280;
        }

        .tech-icon {
          font-size: 0.875rem;
        }

        .developer-credit {
          margin-bottom: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .developer-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .developer-avatar {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
        }

        .developer-name {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .project-links {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .project-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .project-link.live {
          background: #10b981;
          color: white;
        }

        .project-link.live:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .project-link.github {
          background: #374151;
          color: white;
        }

        .project-link.github:hover {
          background: #1f2937;
          transform: translateY(-1px);
        }

        .project-link.details {
          background: #f3f4f6;
          color: #374151;
          border-color: #d1d5db;
        }

        .project-link.details:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
          transform: translateY(-1px);
        }

        .link-icon {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .project-content {
            padding: 1rem;
          }

          .project-title {
            font-size: 1.25rem;
          }

          .project-links {
            flex-direction: column;
          }

          .project-link {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}