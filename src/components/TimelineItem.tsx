'use client';
import { motion } from 'framer-motion';

function renderRich(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer"
           className="text-accent hover:underline underline-offset-2">
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

interface TimelineItemProps {
  logo?: string;
  title: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  highlights?: string[];
  courses?: string[];
  tech?: string[];
  type?: 'master' | 'bachelor' | 'exchange' | 'work';
  index: number;
  url?: string;
}

export default function TimelineItem({
  logo,
  title,
  institution,
  period,
  location,
  description,
  highlights,
  courses,
  tech,
  type,
  index,
  url,
}: TimelineItemProps) {
  const BadgeColor: Record<string, string> = {
    exchange: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    master: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    bachelor: 'bg-accent-glow text-accent border-accent/20',
    work: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const badgeLabel: Record<string, string> = {
    exchange: 'Erasmus+',
    master: "Master's",
    bachelor: "Bachelor's",
    work: 'Industry',
  };

  const linkProps = url
    ? { href: url, target: '_blank' as const, rel: 'noopener noreferrer' }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="relative pl-8 pb-12 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
      {/* Timeline dot */}
      <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-bg-primary shadow-accent" />

      {/* Card — hover lifts and scales */}
      <motion.div
        whileHover={{ y: -4, scale: 1.012 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass rounded-xl p-6 border border-border hover:border-accent/35
                   transition-colors duration-300 group
                   hover:bg-white/[0.03]
                   hover:shadow-[0_12px_40px_rgba(0,255,153,0.20)]"
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">

          {/* Logo — clickable if url exists */}
          {logo && (
            linkProps ? (
              <a {...linkProps} className="flex-shrink-0 w-12 h-12 rounded-lg bg-bg-secondary border border-border
                                          flex items-center justify-center overflow-hidden
                                          hover:border-accent/40 transition-colors duration-200 cursor-pointer">
                <img src={logo} alt={institution} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              </a>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-bg-secondary border border-border flex items-center justify-center overflow-hidden">
                <img src={logo} alt={institution} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
            )
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              {/* Title (role / degree) — clickable if url exists */}
              {linkProps ? (
                <a
                  {...linkProps}
                  className="text-base font-semibold text-text-primary leading-snug
                             hover:text-accent transition-colors duration-200 cursor-pointer"
                >
                  {title}
                </a>
              ) : (
                <h3 className="text-base font-semibold text-text-primary leading-snug">{title}</h3>
              )}

              {type && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BadgeColor[type] ?? 'bg-bg-card text-text-muted border-border'}`}>
                  {badgeLabel[type]}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-text-secondary">
              {/* Institution — always a link when url exists */}
              {linkProps ? (
                <a {...linkProps} className="font-medium text-text-primary hover:text-accent transition-colors">
                  {institution}
                </a>
              ) : (
                <span className="font-medium text-text-primary">{institution}</span>
              )}
              <span>{location}</span>
              <span className="font-mono text-xs text-text-muted">{period}</span>
            </div>
          </div>
        </div>

        {description && (
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{renderRich(description)}</p>
        )}

        {highlights && highlights.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-accent" />
                <span>{renderRich(h)}</span>
              </li>
            ))}
          </ul>
        )}

        {courses && courses.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">Key Courses</p>
            <div className="flex flex-wrap gap-1.5">
              {courses.map((c) => (
                <span key={c} className="tech-tag">{c}</span>
              ))}
            </div>
          </div>
        )}

        {tech && tech.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">Technologies</p>
            <div className="flex flex-wrap gap-1.5">
              {tech.map((t) => (
                <span key={t} className="tech-tag">{t}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
