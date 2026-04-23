'use client';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({ title, subtitle, align = 'left' }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}
    >
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
        {title}
        <span className="text-accent">.</span>
      </h2>
      {subtitle && (
        <p className="mt-2 text-text-secondary text-base">{subtitle}</p>
      )}
      <div className={`mt-4 h-px w-16 bg-accent ${align === 'center' ? 'mx-auto' : ''}`} />
    </motion.div>
  );
}
