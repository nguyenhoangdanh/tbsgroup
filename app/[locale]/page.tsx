import { useTranslations } from 'next-intl';
import { HeroSection } from '@/components/HeroSection';
import { ProductGrid } from '@/components/ProductGrid';
import { StrengthsSection } from '@/components/StrengthsSection';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { Link } from '@/lib/i18n/routing';
import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'TBS Group Handbag Division - Artisanal Excellence, Global Vision',
    description: 'Premium handbag collections with artisanal excellence and global vision. Discover our urban elegance, sustainable heritage, and seasonal innovation collections.',
    keywords: ['handbag', 'premium', 'artisanal', 'sustainable', 'fashion'],
    locale,
    url: `/${locale}`,
  });
}

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      <HeroSection />
      
      {/* About Section */}
      <section className="section-spacing bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <MotionFadeIn>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-6">
                {t('about.title')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {t('about.description')}
              </p>
              <Link 
                href="/strengths" 
                className="btn-secondary inline-block"
              >
                Learn More About Our Strengths
              </Link>
            </div>
          </MotionFadeIn>
        </div>
      </section>

      {/* Collections Preview */}
      <ProductGrid />

      {/* Strengths Preview */}
      <StrengthsSection />

      {/* Contact CTA */}
      <section className="section-spacing bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl mb-8 text-gray-200">
              Get in touch with our team for consultation and custom solutions.
            </p>
            <Link 
              href="/contact" 
              className="btn-primary bg-brand-accent hover:bg-brand-accent/90 text-white inline-block"
            >
              {t('hero.cta.contact')}
            </Link>
          </MotionFadeIn>
        </div>
      </section>
    </>
  );
}