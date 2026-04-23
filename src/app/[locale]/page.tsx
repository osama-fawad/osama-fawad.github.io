import { getTranslations, setRequestLocale } from 'next-intl/server';
import HomeClient from './HomeClient';
import { getLatestCvPath } from '@/lib/cv';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: { absolute: "Osama Fawad's Portfolio" },
    description: t('description'),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cvHref = await getLatestCvPath();
  return <HomeClient cvHref={cvHref} />;
}
