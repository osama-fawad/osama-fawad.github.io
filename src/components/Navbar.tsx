'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { routing } from '@/i18n/routing';

const NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'experience', href: '/experience' },
  { key: 'projects', href: '/projects' },
  { key: 'skills', href: '/skills' },
  { key: 'awards', href: '/awards' },
  { key: 'contact', href: '/contact' },
] as const;

export default function Navbar({ cvHref }: { cvHref: string }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const switchLocale = (newLocale: string) => {
    // Strip current locale prefix and replace
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/') || `/${newLocale}`);
  };

  const isActive = (href: string) => {
    const localePrefix = `/${locale}`;
    // Home is only active on the exact locale root (e.g. /en), not every sub-page
    if (href === '/') return pathname === localePrefix;
    const fullPath = `${localePrefix}${href}`;
    return pathname === fullPath || pathname.startsWith(fullPath + '/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-primary/90 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(0,255,153,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href={`/${locale}`}
          className="font-mono text-xl font-bold text-accent hover:text-glow transition-all duration-200"
        >
          Osama<span className="text-text-secondary">.</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ key, href }) => (
            <a
              key={key}
              href={`/${locale}${href}`}
              className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive(href)
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-accent'
              }`}
            >
              {t(key as keyof typeof t)}
              {isActive(href) && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-px bg-accent"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Right side: Lang toggle + CV download */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-bg-card rounded-lg p-1 border border-border">
            {routing.locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  locale === loc
                    ? 'bg-accent text-bg-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-label={`Switch to ${loc === 'en' ? 'English' : 'Français'}`}
              >
                <img
                  src={loc === 'en' ? 'https://flagcdn.com/w20/gb.png' : 'https://flagcdn.com/w20/fr.png'}
                  alt={loc === 'en' ? 'English' : 'Français'}
                  className="w-5 h-auto rounded-sm"
                  width={20}
                  height={14}
                />
                <span className="text-[13px]">{loc.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <a
            href={cvHref}
            download
            className="px-4 py-2 text-sm font-medium bg-accent text-bg-primary rounded-lg hover:bg-accent-muted transition-colors duration-200"
          >
            {t('downloadCV')}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`block h-0.5 w-5 bg-text-primary transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-5 bg-text-primary transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-text-primary transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-bg-secondary border-b border-border overflow-hidden"
          >
            <nav className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ key, href }) => (
                <a
                  key={key}
                  href={`/${locale}${href}`}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'text-accent bg-accent-glow'
                      : 'text-text-secondary hover:text-accent hover:bg-bg-card'
                  }`}
                >
                  {t(key as keyof typeof t)}
                </a>
              ))}

              {/* Language toggle mobile */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <span className="text-xs text-text-muted">Language:</span>
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      locale === loc
                        ? 'bg-accent text-bg-primary'
                        : 'text-text-secondary bg-bg-card border border-border'
                    }`}
                  >
                    <img
                      src={loc === 'en' ? 'https://flagcdn.com/w20/gb.png' : 'https://flagcdn.com/w20/fr.png'}
                      alt={loc === 'en' ? 'English' : 'Français'}
                      className="w-4 h-auto"
                      width={16}
                      height={11}
                    />
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>

              <a
                href={cvHref}
                download
                className="mt-2 px-3 py-2.5 text-sm font-medium bg-accent text-bg-primary rounded-md text-center"
              >
                {t('downloadCV')}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
