import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import SectionHeader from '@/components/SectionHeader';
import TimelineItem from '@/components/TimelineItem';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: `${t('title')} — Osama Fawad` };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations('about');
  const timeline = t.raw('timeline') as Array<{
    id: string;
    institution: string;
    degree: string;
    location: string;
    period: string;
    description: string;
    courses: string[];
    highlights: string[];
    logo: string;
    url?: string;
    type: 'master' | 'bachelor' | 'exchange';
  }>;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />
      <div className="relative">
        {timeline.map((item, index) => (
          <TimelineItem
            key={item.id}
            title={item.degree}
            institution={item.institution}
            period={item.period}
            location={item.location}
            description={item.description}
            courses={item.courses}
            highlights={item.highlights}
            logo={item.logo}
            url={item.url || undefined}
            type={item.type}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
