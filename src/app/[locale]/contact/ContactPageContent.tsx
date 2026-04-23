'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/SectionHeader';
import ContactForm from '@/components/ContactForm';

/* Shared classes so every tile is consistent */
const TILE = `group glass rounded-2xl border border-accent/10 p-5
              shadow-[0_12px_40px_rgba(0,255,153,0.06)]
              hover:border-accent/35
              hover:shadow-[0_16px_50px_rgba(0,255,153,0.22)]
              hover:bg-accent/[0.08]
              transition-colors`;

const HOVER = { y: -5, scale: 1.018, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } };

export default function ContactPageContent() {
  const t = useTranslations('contact');
  const info = t.raw('info') as { location: string; email: string; whatsapp: string };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 relative">
      {/* Background World Map */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1000 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 320 C150 200 300 180 420 250 C520 300 620 260 760 220 C820 200 900 240 950 280" fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="1.5" />
          <path d="M120 260 C160 240 190 230 230 240 C260 245 300 260 340 255 C380 250 415 265 455 270" fill="none" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
          <path d="M520 210 C560 200 600 205 635 215 C665 225 700 230 740 225 C780 220 820 230 860 245" fill="none" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
          <path d="M220 110 C260 120 300 135 340 145 C380 155 420 165 460 170" fill="none" stroke="rgba(56,189,248,0.14)" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10">
        <SectionHeader title={t('title')} subtitle={t('subtitle')} />

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-stretch">

          {/* Left: Contact Tiles */}
          <div className="grid gap-4">

            {/* Location */}
            <motion.div whileHover={HOVER} className={TILE}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent
                                group-hover:scale-110 group-hover:bg-accent/20
                                transition-all duration-300 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">Location</p>
                  <p className="text-sm font-semibold text-text-primary">{info.location}</p>
                </div>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div whileHover={HOVER} className={TILE}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent
                                group-hover:scale-110 group-hover:bg-accent/20
                                transition-all duration-300 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v16H4z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">Email</p>
                  <a href={`mailto:${info.email}`} className="text-sm font-semibold text-text-primary hover:text-accent transition-colors">{info.email}</a>
                </div>
              </div>
            </motion.div>

            {/* Phone / WhatsApp */}
            <motion.div whileHover={HOVER} className={TILE}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent
                                group-hover:scale-110 group-hover:bg-accent/20
                                transition-all duration-300 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">Phone</p>
                  <a href="https://wa.me/33666101247" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-text-primary hover:text-accent transition-colors">{info.whatsapp}</a>
                </div>
              </div>
            </motion.div>

            {/* LinkedIn */}
            <motion.a
              href="https://www.linkedin.com/in/osamafawad/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={HOVER}
              className={TILE + ' block'}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent
                                group-hover:scale-110 group-hover:bg-accent/20
                                transition-all duration-300 flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">LinkedIn</p>
                  <p className="text-sm font-semibold text-text-primary">{t('social.linkedin')}</p>
                </div>
              </div>
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/osama-fawad"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={HOVER}
              className={TILE + ' block'}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent
                                group-hover:scale-110 group-hover:bg-accent/20
                                transition-all duration-300 flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-1">GitHub</p>
                  <p className="text-sm font-semibold text-text-primary">{t('social.github')}</p>
                </div>
              </div>
            </motion.a>

          </div>

          {/* Right: Form */}
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
  );
}
