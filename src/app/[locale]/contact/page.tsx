import { getTranslations, setRequestLocale } from 'next-intl/server';
import ContactPageContent from './ContactPageContent';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: `${t('title')} — Osama Fawad` };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactPageContent />;
}
