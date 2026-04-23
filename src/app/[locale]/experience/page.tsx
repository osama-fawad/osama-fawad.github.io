import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import SectionHeader from '@/components/SectionHeader';
import TimelineItem from '@/components/TimelineItem';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'experience' });
  return { title: `${t('title')} — Osama Fawad` };
}

export default async function ExperiencePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ExperienceContent />;
}

function ExperienceContent() {
  const t = useTranslations('experience');
  const jobs = t.raw('jobs') as Array<{
    id: string;
    company: string;
    role: string;
    location: string;
    period: string;
    description: string;
    highlights: string[];
    tech: string[];
    logo: string;
    url: string;
  }>;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />
      <div className="relative">
        {jobs.map((job, index) => (
          <TimelineItem
            key={job.id}
            title={job.role}
            institution={job.company}
            period={job.period}
            location={job.location}
            description={job.description}
            highlights={job.highlights}
            tech={job.tech}
            logo={job.logo}
            type="work"
            index={index}
            url={job.url || undefined}
          />
        ))}
      </div>
    </section>
  );
}
