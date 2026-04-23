'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/SectionHeader';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import type { ProjectData } from '@/components/ProjectModal';

type Category = 'all' | 'cv3d' | 'robotics' | 'ai' | 'generative';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  const items = t.raw('items') as ProjectData[];
  const filters = t.raw('filters') as Record<string, string>;

  const filtered =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.category === activeFilter);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {(Object.keys(filters) as Category[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              activeFilter === key
                ? 'bg-accent text-bg-primary border-accent'
                : 'border-border text-text-secondary hover:border-accent/30 hover:text-text-primary'
            }`}
          >
            {filters[key]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filtered.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectCard
              title={item.title}
              description={item.description}
              tech={item.tech}
              image={item.image}
              github={item.github || undefined}
              demo={item.demo || undefined}
              paper={item.paper || undefined}
              video={item.video || undefined}
              featured={item.featured}
              category={item.category}
              index={index}
              onClick={() => setSelectedProject(item)}
            />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted text-sm mt-12">No projects in this category yet.</p>
      )}

      {/* Disclaimer */}
      <div className="mt-14 flex flex-col items-center gap-2 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/8 border border-accent/20">
          <span className="text-accent text-sm">⚡</span>
          <p className="text-sm text-text-secondary">
            <span className="text-text-primary font-medium">Portfolio in progress</span> — I&apos;m actively open-sourcing projects to GitHub and adding new case studies here over time.
          </p>
        </div>
        <p className="text-xs text-text-muted mt-1">
          Private projects are available as <span className="text-accent font-medium">live demos on request</span> — feel free to reach out.
        </p>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
