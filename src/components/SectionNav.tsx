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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const activeIndex = SECTIONS.findIndex(s => s.id === activeSection);

  return (
    /* Only render when there is side-margin space (≥ 1280 px) */
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:block select-none">
      <div className="glass rounded-2xl border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.45)] px-4 py-5">
        <div className="flex flex-col">
          {SECTIONS.map(({ id, label }, i) => {
            const isActive = id === activeSection;
            const isPast   = i < activeIndex;
            const isLast   = i === SECTIONS.length - 1;

            return (
              <div key={id} className="flex flex-col">
                {/* Row: dot + label */}
                <button
                  onClick={() => scrollTo(id)}
                  aria-label={`Go to ${label}`}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {/* Fixed-width wrapper keeps the connector line centred regardless of dot size */}
                  <div className="w-4 flex justify-center flex-shrink-0">
                    <div className={`
                      rounded-full border transition-all duration-300
                      ${isActive
                        ? 'w-3 h-3 bg-accent border-accent shadow-[0_0_10px_rgba(0,255,153,0.65)]'
                        : isPast
                        ? 'w-2.5 h-2.5 bg-accent/35 border-accent/50 group-hover:bg-accent/60 group-hover:border-accent/70'
                        : 'w-2.5 h-2.5 bg-bg-secondary border-border group-hover:border-text-muted'}
                    `} />
                  </div>

                  {/* Label — always visible */}
                  <span className={`
                    text-[11px] font-medium whitespace-nowrap transition-colors duration-200
                    ${isActive
                      ? 'text-accent'
                      : isPast
                      ? 'text-text-secondary group-hover:text-text-primary'
                      : 'text-text-muted group-hover:text-text-secondary'}
                  `}>
                    {label}
                  </span>
                </button>

                {/* Connector segment between this dot and the next */}
                {!isLast && (
                  <div className="flex">
                    <div className="w-4 flex justify-center flex-shrink-0">
                      <div className={`
                        w-px h-7 transition-colors duration-500
                        ${isPast ? 'bg-accent/35' : 'bg-border/35'}
                      `} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
