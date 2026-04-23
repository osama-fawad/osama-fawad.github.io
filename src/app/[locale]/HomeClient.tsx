'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';

function renderRich(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-text-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline underline-offset-2">{link[1]}</a>;
    }
    return part;
  });
}
import TypewriterText from '@/components/TypewriterText';
import PhotoReveal from '@/components/PhotoReveal';
import SectionHeader from '@/components/SectionHeader';
import TimelineItem from '@/components/TimelineItem';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import SkillCategory from '@/components/SkillCategory';
import ContactForm from '@/components/ContactForm';
import SectionNav from '@/components/SectionNav';
import type { ProjectData } from '@/components/ProjectModal';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type EducationItem = {
  id: string; institution: string; degree: string; location: string;
  period: string; description: string; courses: string[]; highlights: string[];
  logo: string; url?: string; type: 'master' | 'bachelor' | 'exchange';
};
type JobItem = {
  id: string; company: string; role: string; location: string;
  period: string; description: string; highlights: string[];
  tech: string[]; logo: string; url: string;
};
type SkillCat = {
  id: string; title: string; icon: string;
  skills: string[];
};
type AwardItem = { id: string; title: string; org: string; year: string; description: string; type: string; };
type Category = 'all' | 'cv3d' | 'robotics' | 'ai' | 'generative';

/* ─── Award type config — mirrors awards/page.tsx exactly ────────────────── */
const AWARD_TYPE: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  scholarship: {
    label: 'Scholarship', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  competition: {
    label: 'Competition', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  grant: {
    label: 'Grant', color: 'text-accent', bg: 'bg-accent/10 border-accent/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  award: {
    label: 'Award', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
};

/* ─── Section divider ────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

/* ─── "View all" link ────────────────────────────────────────────────────── */
function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-10 flex justify-center">
      <a
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:text-accent hover:border-accent/30 transition-all duration-200"
      >
        {label}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
      </a>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function HomeClient({ cvHref }: { cvHref: string }) {
  const t        = useTranslations('home');
  const tAbout   = useTranslations('about');
  const tExp     = useTranslations('experience');
  const tProj    = useTranslations('projects');
  const tSkills  = useTranslations('skills');
  const tAwards  = useTranslations('awards');
  const tContact = useTranslations('contact');
  const locale   = useLocale();

  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [projectFilter, setProjectFilter]     = useState<Category>('all');
  const [photoReplayKey, setPhotoReplayKey]   = useState(0);

  const roles      = t.raw('roles') as string[];
  const highlights = t.raw('highlights') as Record<string, { value: string; label: string; sublabel?: string }>;

  const educationTimeline = tAbout.raw('timeline')   as EducationItem[];
  const jobs              = tExp.raw('jobs')          as JobItem[];
  const allProjects       = tProj.raw('items')        as ProjectData[];
  const projectFilters    = tProj.raw('filters')      as Record<string, string>;
  const skillCategories   = tSkills.raw('categories') as SkillCat[];
  const awards            = tAwards.raw('items')      as AwardItem[];
  const contactInfo       = tContact.raw('info')      as { location: string; email: string; whatsapp: string };

  const filteredProjects = projectFilter === 'all'
    ? allProjects
    : allProjects.filter((p) => p.category === projectFilter);

  return (
    <div className="relative flex flex-col">

      {/* Sticky section navigator (right side, lg+ only) */}
      <SectionNav />

      {/* ═══════════════════════════════════════════════════════ HERO */}
      <div id="hero" className="min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-6 w-full py-16 grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 mb-6 rounded-full border border-accent/25 bg-accent-glow text-sm text-accent font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {t('locationBadge')}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-text-secondary text-lg mb-1"
            >
              {t('greeting')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-snug"
            >
              <span className="block text-3xl md:text-[2.6rem] lg:text-5xl font-medium text-text-secondary mb-0.5">Muhammad</span>
              <span className="block text-3xl md:text-[2.6rem] lg:text-5xl font-bold text-text-primary mb-0.5">Osama</span>
              <span className="block text-3xl md:text-[2.6rem] lg:text-5xl font-bold text-accent">Fawad</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xl md:text-2xl font-medium text-text-secondary mb-6 min-h-[2rem] flex flex-wrap items-center gap-x-2"
            >
              <span className="text-[#c0c0c0] text-base">{t('tagline')}</span>
              <TypewriterText words={roles} className="text-accent font-semibold" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-[#c8c8c8] text-base leading-relaxed mb-6 max-w-lg"
            >
              {renderRich(t('description'))}
            </motion.p>

            {/* Inline stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="flex flex-nowrap items-stretch gap-5 mb-8"
            >
              {Object.entries(highlights).map(([key, item], i, arr) => (
                <div key={key} className="flex items-stretch gap-5 flex-1">
                  <div className="flex flex-col justify-center border-l-2 border-accent/60 pl-3 flex-1">
                    <span className={`font-bold text-accent leading-none mb-0.5 ${
                      key === 'industry' ? 'text-2xl' : 'text-xl'
                    }`}>
                      {item.value}
                    </span>
                    <span className="text-[11px] font-semibold text-text-secondary leading-snug whitespace-nowrap">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-[10px] text-text-muted font-mono mt-0.5 whitespace-nowrap">{item.sublabel}</span>
                    )}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px bg-border/50 self-stretch flex-shrink-0" />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Five equal-weight action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="flex flex-wrap items-center gap-2"
            >
              <a
                href={`/${locale}/contact`}
                className="px-4 py-2.5 bg-accent text-bg-primary font-semibold rounded-lg text-sm
                           hover:bg-accent-muted transition-colors duration-200"
              >
                {t('ctaContact')}
              </a>

              <a
                href={`/${locale}/projects`}
                className="px-4 py-2.5 border border-accent/40 text-accent font-semibold rounded-lg text-sm
                           hover:bg-accent-glow transition-colors duration-200"
              >
                {t('ctaProjects')}
              </a>

              <a
                href={cvHref}
                download
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border
                           text-text-secondary font-semibold rounded-lg text-sm
                           hover:border-accent/30 hover:text-text-primary transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('ctaCV')}
              </a>

              <a
                href="https://github.com/osama-fawad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border
                           text-text-secondary font-semibold rounded-lg text-sm
                           hover:border-accent/30 hover:text-accent hover:bg-accent/[0.06]
                           transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/osamafawad/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border
                           text-text-secondary font-semibold rounded-lg text-sm
                           hover:border-accent/30 hover:text-accent hover:bg-accent/[0.06]
                           transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </motion.div>

            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                         border border-accent/25 bg-accent/[0.07] text-accent text-xs font-medium
                         w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
              {t('available')} and Collaborations
            </motion.div>
          </div>

          {/* Right: Photo — stereo point-cloud reconstruction */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[460px] md:h-[580px] lg:h-[640px] flex flex-col items-center justify-center gap-3"
          >
            <PhotoReveal
              key={photoReplayKey}
              src="/images/osama_headshot.png"
              alt="Osama Fawad"
              photoSize={372}
              imgStyle={{
                filter: 'brightness(1.05) contrast(1.06) saturate(0.92)',
                transform: 'scale(1.06) translateY(7%)',
                transformOrigin: 'center',
              }}
            />

            {/* Replay control — blends into the theme */}
            <button
              type="button"
              onClick={() => setPhotoReplayKey((k) => k + 1)}
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                         border border-accent/25 bg-accent/[0.05] backdrop-blur-sm
                         font-mono text-[10px] tracking-[0.22em] uppercase text-accent/75
                         hover:text-accent hover:border-accent/55 hover:bg-accent/[0.1]
                         transition-colors duration-300"
              aria-label="Replay portrait reconstruction animation"
            >
              <svg
                className="w-3.5 h-3.5 transition-transform duration-700 group-hover:rotate-[360deg]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Replay Scan
            </button>
          </motion.div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════ EDUCATION
           Mirrors: about/page.tsx → max-w-4xl mx-auto px-6 py-16        */}
      <Divider />
      <section id="education" className="max-w-7xl mx-auto px-6 py-16 w-full">
        <SectionHeader title={tAbout('title')} subtitle={tAbout('subtitle')} />
        <div className="relative">
          {educationTimeline.map((item, index) => (
            <TimelineItem
              key={item.id}
              title={item.degree}
              institution={item.institution}
              period={item.period}
              location={item.location}
              description={item.description}
              courses={item.courses}
              highlights={item.highlights}
              logo={item.logo}
              url={item.url || undefined}
              type={item.type}
              index={index}
            />
          ))}
        </div>
        <ViewAll href={`/${locale}/about`} label="View full education" />
      </section>

      {/* ════════════════════════════════════════════════ EXPERIENCE
           Mirrors: experience/page.tsx → max-w-4xl mx-auto px-6 py-16  */}
      <Divider />
      <section id="experience" className="max-w-7xl mx-auto px-6 py-16 w-full">
        <SectionHeader title={tExp('title')} subtitle={tExp('subtitle')} />
        <div className="relative">
          {jobs.map((job, index) => (
            <TimelineItem
              key={job.id}
              title={job.role}
              institution={job.company}
              period={job.period}
              location={job.location}
              description={job.description}
              highlights={job.highlights}
              tech={job.tech}
              logo={job.logo}
              type="work"
              index={index}
              url={job.url || undefined}
            />
          ))}
        </div>
        <ViewAll href={`/${locale}/experience`} label="View full experience" />
      </section>

      {/* ══════════════════════════════════════════════════ PROJECTS
           Mirrors: projects/page.tsx → max-w-7xl mx-auto px-6 py-16    */}
      <Divider />
      <section id="projects" className="max-w-7xl mx-auto px-6 py-16 w-full">
        <SectionHeader title={tProj('title')} subtitle={tProj('subtitle')} />

        {/* Filter tabs — identical to projects/page.tsx */}
        <div className="flex flex-wrap gap-2 mb-10">
          {(Object.keys(projectFilters) as Category[]).map((key) => (
            <button
              key={key}
              onClick={() => setProjectFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                projectFilter === key
                  ? 'bg-accent text-bg-primary border-accent'
                  : 'border-border text-text-secondary hover:border-accent/30 hover:text-text-primary'
              }`}
            >
              {projectFilters[key]}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((item, index) => (
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

        {filteredProjects.length === 0 && (
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

        <ViewAll href={`/${locale}/projects`} label="Open full projects page" />
      </section>

      {/* ════════════════════════════════════════════════════ SKILLS
           Mirrors: skills/page.tsx → max-w-7xl mx-auto px-6 py-16      */}
      <Divider />
      <section id="skills" className="max-w-7xl mx-auto px-6 py-16 w-full">
        <SectionHeader title={tSkills('title')} subtitle={tSkills('subtitle')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {skillCategories.map((cat, index) => (
            <SkillCategory
              key={cat.id}
              title={cat.title}
              icon={cat.icon}
              skills={cat.skills}
              index={index}
            />
          ))}
        </div>
        <ViewAll href={`/${locale}/skills`} label="View full skills breakdown" />
      </section>

      {/* ══════════════════════════════════════════════════ AWARDS
           Mirrors: awards/page.tsx → max-w-5xl mx-auto px-6 py-16      */}
      <Divider />
      <section id="awards" className="max-w-7xl mx-auto px-6 py-16 w-full">
        <SectionHeader title={tAwards('title')} subtitle={tAwards('subtitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {awards.map((item, index) => {
            const cfg = AWARD_TYPE[item.type] ?? AWARD_TYPE.award;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (index % 2) * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -5, scale: 1.015, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                className="glass rounded-xl p-6 border border-border hover:border-accent/35
                           transition-colors duration-300
                           hover:bg-white/[0.03]
                           hover:shadow-[0_12px_40px_rgba(0,255,153,0.20)] group flex gap-5"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${cfg.bg} ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors duration-200">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs font-mono text-text-muted">{item.year}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-text-secondary mb-2">{item.org}</p>
                  <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <ViewAll href={`/${locale}/awards`} label="View all distinctions" />
      </section>

      {/* ════════════════════════════════════════════════ CONTACT
           Mirrors: ContactPageContent → max-w-5xl mx-auto px-6 py-12   */}
      <Divider />
      <section id="contact" className="max-w-7xl mx-auto px-6 py-12 w-full relative">

        {/* Decorative background lines — same as ContactPageContent */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 1000 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 320 C150 200 300 180 420 250 C520 300 620 260 760 220 C820 200 900 240 950 280" fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="1.5" />
            <path d="M120 260 C160 240 190 230 230 240 C260 245 300 260 340 255 C380 250 415 265 455 270" fill="none" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
            <path d="M520 210 C560 200 600 205 635 215 C665 225 700 230 740 225 C780 220 820 230 860 245" fill="none" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10">
          <SectionHeader title={tContact('title')} subtitle={tContact('subtitle')} />

          <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-stretch">
            {/* Left: contact info tiles — mirrors ContactPageContent exactly */}
            <div className="grid gap-4">

              {/* Location */}
              <motion.div
                whileHover={{ y: -5, scale: 1.018, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                className="group glass rounded-2xl border border-accent/10 p-5
                           shadow-[0_12px_40px_rgba(0,255,153,0.06)]
                           hover:border-accent/35 hover:shadow-[0_16px_50px_rgba(0,255,153,0.22)]
                           hover:bg-accent/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent flex-shrink-0
                                  group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">Location</p>
                    <p className="text-sm font-semibold text-text-primary">{contactInfo.location}</p>
                  </div>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                whileHover={{ y: -5, scale: 1.018, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                className="group glass rounded-2xl border border-accent/10 p-5
                           shadow-[0_12px_40px_rgba(0,255,153,0.06)]
                           hover:border-accent/35 hover:shadow-[0_16px_50px_rgba(0,255,153,0.22)]
                           hover:bg-accent/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent flex-shrink-0
                                  group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">Email</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-sm font-semibold text-text-primary hover:text-accent transition-colors">{contactInfo.email}</a>
                  </div>
                </div>
              </motion.div>

              {/* WhatsApp */}
              <motion.div
                whileHover={{ y: -5, scale: 1.018, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                className="group glass rounded-2xl border border-accent/10 p-5
                           shadow-[0_12px_40px_rgba(0,255,153,0.06)]
                           hover:border-accent/35 hover:shadow-[0_16px_50px_rgba(0,255,153,0.22)]
                           hover:bg-accent/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent flex-shrink-0
                                  group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">Phone</p>
                    <a href="https://wa.me/33666101247" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-text-primary hover:text-accent transition-colors">{contactInfo.whatsapp}</a>
                  </div>
                </div>
              </motion.div>

              {/* LinkedIn */}
              <motion.a
                href="https://www.linkedin.com/in/osamafawad/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.018, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                className="group glass rounded-2xl border border-accent/10 p-5 block
                           shadow-[0_12px_40px_rgba(0,255,153,0.06)]
                           hover:border-accent/35 hover:shadow-[0_16px_50px_rgba(0,255,153,0.22)]
                           hover:bg-accent/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent flex-shrink-0
                                  group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">LinkedIn</p>
                    <p className="text-sm font-semibold text-text-primary">{tContact('social.linkedin')}</p>
                  </div>
                </div>
              </motion.a>

              {/* GitHub */}
              <motion.a
                href="https://github.com/osama-fawad"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.018, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                className="group glass rounded-2xl border border-accent/10 p-5 block
                           shadow-[0_12px_40px_rgba(0,255,153,0.06)]
                           hover:border-accent/35 hover:shadow-[0_16px_50px_rgba(0,255,153,0.22)]
                           hover:bg-accent/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent flex-shrink-0
                                  group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">GitHub</p>
                    <p className="text-sm font-semibold text-text-primary">{tContact('social.github')}</p>
                  </div>
                </div>
              </motion.a>
            </div>

            {/* Right: form — mirrors ContactPageContent exactly */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-[2rem] p-7 border border-accent/15 shadow-[0_30px_90px_rgba(0,255,153,0.12)]"
            >
              <div className="mb-5">
                <p className="text-sm uppercase tracking-[0.35em] text-accent font-medium mb-2">Send a message</p>
                <h3 className="text-xl font-semibold text-text-primary">Get in touch</h3>
                <p className="text-sm text-text-secondary mt-2">Send me a message and I'll respond as soon as possible.</p>
              </div>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Project detail modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
