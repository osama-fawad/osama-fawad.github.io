import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border bg-bg-secondary/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-muted">
        <p>
          © {year} Muhammad Osama Fawad. {t('rights')}.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/osama-fawad"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors duration-200"
            aria-label="GitHub"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/osamafawad/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors duration-200"
            aria-label="LinkedIn"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
