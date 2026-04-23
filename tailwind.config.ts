import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#111111',
          card: '#161616',
          cardHover: '#1c1c1c',
        },
        accent: {
          DEFAULT: '#00ff99',
          dim: '#00cc77',
          muted: '#00e68a',
          glow: 'rgba(0,255,153,0.15)',
          glowStrong: 'rgba(0,255,153,0.35)',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#c0c0c0',
          muted: '#888888',
        },
        border: {
          DEFAULT: '#252525',
          accent: 'rgba(0,255,153,0.25)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'subtle-float': 'subtleFloat 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'blink': 'blink 1.1s step-end infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,255,153,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(0,255,153,0.35), 0 0 80px rgba(0,255,153,0.1)' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-radial': 'radial-gradient(ellipse at center, rgba(0,255,153,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(0,255,153,0.08)',
        'accent': '0 0 20px rgba(0,255,153,0.2)',
        'accent-strong': '0 0 40px rgba(0,255,153,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
