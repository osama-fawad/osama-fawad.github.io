'use client';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const MOBILE_BREAKPOINT = 768;

export default function ParticleBackground() {
  const [init, setInit] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', motionHandler);

    const updateMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    updateMobile();
    window.addEventListener('resize', updateMobile);

    return () => {
      mq.removeEventListener('change', motionHandler);
      window.removeEventListener('resize', updateMobile);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, [reducedMotion]);

  if (reducedMotion) return null;

  const particleCount = isMobile ? 50 : 110;
  const speed = isMobile ? 0.45 : 0.8;
  const linkOpacity = isMobile ? 0.12 : 0.12;
  const particleOpacityMax = isMobile ? 0.28 : 0.3;

  return (
    <>
      {/* Static ambient glow — always visible on mobile, complements lighter particles */}
      <div
        className="fixed inset-0 z-0 pointer-events-none md:hidden"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0,255,153,0.14) 0%, transparent 58%), radial-gradient(ellipse 70% 45% at 85% 95%, rgba(0,255,153,0.08) 0%, transparent 52%)',
        }}
      />

      {init && (
        <Particles
          id="tsparticles"
          options={{
            background: { color: { value: 'transparent' } },
            fpsLimit: isMobile ? 30 : 40,
            interactivity: {
              events: {
                onHover: { enable: !isMobile, mode: ['grab', 'bubble', 'attract'] },
                onClick: { enable: true, mode: ['push', 'repulse'] },
                resize: { enable: true },
              },
              modes: {
                grab: { distance: 160, links: { opacity: 0.5 } },
                bubble: { distance: 180, size: 5, duration: 0.3, opacity: 0.7 },
                attract: { distance: 220, duration: 0.4, factor: 4 },
                push: { quantity: isMobile ? 8 : 6 },
                repulse: { distance: isMobile ? 100 : 120, duration: 0.4 },
              },
            },
            particles: {
              color: { value: ['#00ff99', '#00dd88', '#00ffaa'] },
              links: {
                color: '#00ff99',
                distance: 150,
                enable: true,
                opacity: linkOpacity,
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
              opacity: { value: { min: 0.08, max: particleOpacityMax } },
              shape: { type: 'circle' },
              size: { value: { min: 0.8, max: isMobile ? 2.8 : 2.5 } },
            },
            detectRetina: true,
          }}
        />
      )}
    </>
  );
}
