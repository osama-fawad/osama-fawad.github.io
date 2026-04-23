'use client';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
  const [init, setInit] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    setIsMobile(window.innerWidth < 768);

    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, [reducedMotion]);

  if (!init || reducedMotion) return null;

  const particleCount = isMobile ? 35 : 110;
  const speed = isMobile ? 0.4 : 0.8;

  return (
    <Particles
      id="tsparticles"
      options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: isMobile ? 25 : 40,
        interactivity: {
          events: {
            onHover: { enable: !isMobile, mode: ['grab', 'bubble', 'attract'] },
            onClick: { enable: !isMobile, mode: ['push', 'repulse'] },
            resize: { enable: true },
          },
          modes: {
            grab: { distance: 160, links: { opacity: 0.5 } },
            bubble: { distance: 180, size: 5, duration: 0.3, opacity: 0.7 },
            attract: { distance: 220, duration: 0.4, factor: 4 },
            push: { quantity: 6 },
            repulse: { distance: 120, duration: 0.4 },
          },
        },
        particles: {
          color: { value: ['#00ff99', '#00dd88', '#00ffaa'] },
          links: {
            color: '#00ff99',
            distance: 150,
            enable: true,
            opacity: isMobile ? 0.08 : 0.12,
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: { default: 'bounce' },
            random: true,
            speed,
            straight: false,
            warp: false,
          },
          number: { density: { enable: true }, value: particleCount },
          opacity: { value: { min: 0.06, max: isMobile ? 0.2 : 0.3 } },
          shape: { type: 'circle' },
          size: { value: { min: 0.8, max: 2.5 } },
        },
        detectRetina: true,
      }}
    />
  );
}
