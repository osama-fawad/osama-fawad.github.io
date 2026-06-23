import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const BASE_URL = 'https://osama-fawad.github.io';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Muhammad Osama Fawad — ML/CV Engineer & Robotics Researcher',
    template: '%s | Osama Fawad',
  },
  description:
    'ML/CV Engineer & Robotics Researcher with 5+ years of R&D experience. Expert in Computer Vision, SLAM, 3D Reconstruction, Deep Learning, and LLM/Agentic AI. Erasmus Mundus Scholar (VIBOT). Open to roles in CV, Robotics & AI.',
  keywords: [
    'Muhammad Osama Fawad',
    'Computer Vision Engineer',
    'Robotics Engineer',
    'Machine Learning Engineer',
    'Deep Learning',
    'SLAM',
    '3D Reconstruction',
    'LLMs',
    'Agentic AI',
    'Autonomous Systems',
    'PyTorch',
    'Erasmus Mundus',
    'VIBOT',
  ],
  authors: [{ name: 'Muhammad Osama Fawad', url: BASE_URL }],
  creator: 'Muhammad Osama Fawad',
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Osama Fawad',
    title: 'Muhammad Osama Fawad — ML/CV Engineer & Robotics Researcher',
    description:
      'ML/CV Engineer & Robotics Researcher. Expert in Computer Vision, SLAM, 3D Reconstruction, Deep Learning & LLM systems. Erasmus Mundus Scholar. 5+ years industry R&D.',
    images: [
      {
        url: '/images/osama_headshot.png',
        width: 800,
        height: 800,
        alt: 'Muhammad Osama Fawad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muhammad Osama Fawad — ML/CV Engineer & Robotics Researcher',
    description:
      'ML/CV Engineer & Robotics Researcher with 5+ years R&D experience. Expert in CV, SLAM, 3D Vision, Deep Learning & LLMs.',
    images: ['/images/osama_headshot.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-primary text-text-primary antialiased">{children}</body>
    </html>
  );
}
