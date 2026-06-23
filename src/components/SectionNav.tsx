'use client';
import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'hero',       label: 'Home' },
  { id: 'education',  label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects',   label: 'Projects' },
  { id: 'skills',     label: 'Skills' },
  { id: 'awards',     label: 'Awards' },
  { id: 'contact',    label: 'Contact' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

function dotClasses(isActive: boolean, isPast: boolean, compact: boolean) {
  if (isActive) {
    return compact
      ? 'w-2.5 h-2.5 bg-accent border-accent shadow-[0_0_8px_rgba(0,255,153,0.65)]'
      : 'w-3 h-3 bg-accent border-accent shadow-[0_0_10px_rgba(0,255,153,0.65)]';
  }
  if (isPast) {
    return compact
      ? 'w-2 h-2 bg-accent/55 border-accent/65'
      : 'w-2.5 h-2.5 bg-accent/50 border-accent/60 group-hover:bg-accent/65';
  }
  return compact
    ? 'w-2 h-2 bg-accent/15 border-accent/25'
    : 'w-2.5 h-2.5 bg-accent/10 border-accent/20 group-hover:border-accent/35';
}

function SectionDots({
  activeSection,
  showLabels,
  className,
}: {
  activeSection: string;
  showLabels: boolean;
  className?: string;
}) {
  const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection);
  const activeLabel = SECTIONS.find((s) => s.id === activeSection)?.label ?? '';

  return (
    <div className={className}>
      <div className={showLabels
        ? 'glass rounded-2xl border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.45)] px-4 py-5'
        : 'flex flex-row items-center gap-1.5'
      }>
        <div className={showLabels
          ? ''
          : 'glass rounded-full border border-white/[0.09] shadow-[0_4px_20px_rgba(0,0,0,0.35)] px-2 py-3'
        }>
          <div className="flex flex-col">
            {SECTIONS.map(({ id, label }, i) => {
              const isActive = id === activeSection;
              const isPast = i < activeIndex;
              const isLast = i === SECTIONS.length - 1;

              return (
                <div key={id} className="flex flex-col">
                  <button
                    onClick={() => scrollToSection(id)}
                    aria-label={`Go to ${label}`}
                    className={`flex items-center cursor-pointer group ${showLabels ? 'gap-3' : 'justify-center'}`}
                  >
                    <div className={`flex justify-center flex-shrink-0 ${showLabels ? 'w-4' : 'w-3'}`}>
                      <div
                        className={`rounded-full border transition-all duration-300 ${dotClasses(isActive, isPast, !showLabels)}`}
                      />
                    </div>

                    {showLabels && (
                      <span
                        className={`
                          text-[11px] font-medium whitespace-nowrap transition-colors duration-200
                          ${isActive
                            ? 'text-accent'
                            : isPast
                            ? 'text-text-secondary group-hover:text-text-primary'
                            : 'text-text-muted group-hover:text-text-secondary'}
                        `}
                      >
                        {label}
                      </span>
                    )}
                  </button>

                  {!isLast && (
                    <div className="flex">
                      <div className={`flex justify-center flex-shrink-0 ${showLabels ? 'w-4' : 'w-3'}`}>
                        <div
                          className={`
                            w-px transition-colors duration-500
                            ${showLabels ? 'h-7' : 'h-4'}
                            ${isPast ? 'bg-accent/50' : 'bg-accent/18'}
                          `}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!showLabels && (
          <span
            className="flex flex-col items-center gap-0.5 text-[11px] font-bold uppercase text-accent select-none tracking-wide pr-0.5"
            aria-hidden
          >
            {activeLabel.split('').map((char, i) => (
              <span key={`${char}-${i}`} className="leading-none">
                {char}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SectionNav() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 140;
      let current = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <SectionDots
        activeSection={activeSection}
        showLabels
        className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:block select-none"
      />
      <SectionDots
        activeSection={activeSection}
        showLabels={false}
        className="fixed right-1.5 top-1/2 -translate-y-1/2 z-40 xl:hidden select-none"
      />
    </>
  );
}
