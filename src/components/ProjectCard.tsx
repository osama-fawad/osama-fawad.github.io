'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ProjectData } from '@/components/ProjectModal';

interface ProjectCardProps extends Omit<ProjectData, 'id'> {
  index: number;
  onClick: () => void;
}

export default function ProjectCard({
  title,
  description,
  tech,
  image,
  github,
  demo,
  paper,
  video,
  featured,
  category,
  index,
  onClick,
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  const isPublic = !!(github || demo || paper || video);
  const isNotionLink = demo?.includes('notion.site');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
      className={`group glass rounded-xl overflow-hidden border transition-colors duration-300 flex flex-col cursor-pointer
        ${featured
          ? 'border-accent/25 hover:border-accent/55 hover:shadow-[0_12px_40px_rgba(0,255,153,0.25)] hover:bg-white/[0.02]'
          : 'border-border hover:border-accent/35 hover:shadow-[0_12px_40px_rgba(0,255,153,0.20)] hover:bg-white/[0.03]'
        }`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-bg-secondary">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-105' : 'scale-100'}`}
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent transition-opacity duration-300 ${hovered ? 'opacity-90' : 'opacity-60'}`} />

        {/* Featured glow strip */}
        {featured && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {featured && (
            <span className="text-xs font-semibold px-2 py-0.5 bg-accent text-bg-primary rounded-full">
              Featured
            </span>
          )}
          {isPublic ? (
            <span className="text-xs font-medium px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full backdrop-blur-sm">
              Public
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 bg-bg-card/80 text-text-muted border border-border rounded-full backdrop-blur-sm">
              Private
            </span>
          )}
        </div>

        {/* Expand hint on hover */}
        <div className={`absolute bottom-3 right-3 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs font-mono text-accent bg-bg-card/80 backdrop-blur-sm border border-accent/20 px-2 py-0.5 rounded-full">
            click to expand
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className={`text-base font-semibold mb-2 transition-colors duration-200 leading-snug
          ${featured ? 'text-accent' : 'text-text-primary group-hover:text-accent'}`}>
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed flex-1 mb-4 line-clamp-3">
          {description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tech.slice(0, 5).map((t) => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
          {tech.length > 5 && (
            <span className="tech-tag text-text-muted">+{tech.length - 5}</span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-accent text-bg-primary hover:bg-accent-muted transition-colors duration-200 shadow-[0_8px_20px_rgba(0,255,153,0.25)]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub ↗
              </a>
            )}
            {demo && (
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-accent/45 text-accent hover:bg-accent-glow transition-all duration-200"
              >
                {isNotionLink ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.233-.887.654-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                )}
                {isNotionLink ? 'Notion ↗' : 'Demo ↗'}
              </a>
            )}
            {!github && !demo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted border border-border bg-bg-secondary/50">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                Demo on Request
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-[11px] text-text-muted font-mono">Click card for details</span>
        </div>
      </div>
    </motion.article>
  );
}
