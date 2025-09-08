import { useTranslations } from 'next-intl';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { MotionStagger } from '@/components/MotionStagger';
import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'About TBS Group Handbag Division - Our Story & Vision',
    description: 'Learn about TBS Group Handbag Division history, mission, vision, and commitment to artisanal excellence and sustainable fashion.',
    keywords: ['about', 'company', 'history', 'mission', 'vision', 'sustainable fashion'],
    locale,
    url: `/${locale}/about`,
  });
}

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-brand-primary text-white py-20">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </MotionFadeIn>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <MotionFadeIn>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-6">
                  {t('about.story.title')}
                </h2>
                <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <p>{t('about.story.paragraph1')}</p>
                  <p>{t('about.story.paragraph2')}</p>
                  <p>{t('about.story.paragraph3')}</p>
                </div>
              </div>
            </MotionFadeIn>
            <MotionFadeIn delay={0.2}>
              <div className="relative">
                <img 
                  src="/images/about/company-story.jpg" 
                  alt="TBS Group Story"
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            </MotionFadeIn>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <MotionStagger>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="font-serif text-2xl font-bold text-brand-primary mb-4">
                  {t('about.mission.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.mission.description')}
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="font-serif text-2xl font-bold text-brand-primary mb-4">
                  {t('about.vision.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.vision.description')}
                </p>
              </div>
            </div>
          </MotionStagger>
        </div>
      </section>

      {/* Values */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <MotionFadeIn>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-6">
                {t('about.values.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('about.values.subtitle')}
              </p>
            </div>
          </MotionFadeIn>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['excellence', 'innovation', 'sustainability', 'integrity'].map((value, index) => (
              <div key={value} className="text-center">
                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{index + 1}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-primary mb-2">
                  {t(`about.values.${value}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`about.values.${value}.description`)}
                </p>
              </div>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* Team & Leadership */}
      <section className="section-spacing bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto container-padding">
          <MotionFadeIn>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                {t('about.leadership.title')}
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                {t('about.leadership.subtitle')}
              </p>
            </div>
          </MotionFadeIn>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((member) => (
              <div key={member} className="text-center">
                <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="font-serif text-xl font-bold mb-2">
                  {t(`about.leadership.member${member}.name`)}
                </h3>
                <p className="text-brand-accent mb-2">
                  {t(`about.leadership.member${member}.position`)}
                </p>
                <p className="text-gray-200 text-sm">
                  {t(`about.leadership.member${member}.bio`)}
                </p>
              </div>
            ))}
          </MotionStagger>
        </div>
      </section>
    </div>
  );
}