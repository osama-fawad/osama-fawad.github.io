import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import SectionHeader from '@/components/SectionHeader';
import SkillCategory from '@/components/SkillCategory';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'skills' });
  return { title: `${t('title')} — Osama Fawad` };
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SkillsContent />;
}

function SkillsContent() {
  const t = useTranslations('skills');
  const categories = t.raw('categories') as Array<{
    id: string;
    title: string;
    icon: string;
    skills: string[];
  }>;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, index) => (
          <SkillCategory
            key={cat.id}
            title={cat.title}
            icon={cat.icon}
            skills={cat.skills}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
