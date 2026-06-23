import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import PageTransition from '@/components/PageTransition';
import { getLatestCvPath } from '@/lib/cv';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'fr')) {
    notFound();
  }

  // Enable static rendering by setting the locale early
  setRequestLocale(locale);

  const messages = await getMessages();
  const cvHref = await getLatestCvPath();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ScrollProgressBar />
      <ParticleBackground />
      <Navbar cvHref={cvHref} />
      <PageTransition>
        <main className="relative z-10 min-h-screen pt-16 xl:pr-0">
          {children}
        </main>
      </PageTransition>
      <Footer />
    </NextIntlClientProvider>
  );
}
