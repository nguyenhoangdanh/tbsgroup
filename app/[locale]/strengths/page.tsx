import { useTranslations } from 'next-intl';
import { StrengthsSection } from '@/components/StrengthsSection';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { MotionStagger, MotionStaggerItem } from '@/components/MotionStagger';
import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'Our Strengths - TBS Group Handbag Division',
    description: 'Discover our core strengths: Quality Control, Sustainable Materials, Design Innovation, Global Supply Network, and Skilled Craftsmanship.',
    keywords: ['quality control', 'sustainable materials', 'design innovation', 'global supply', 'craftsmanship'],
    locale,
    url: `/${locale}/strengths`,
  });
}

const strengthDetails = [
  {
    id: 'quality',
    icon: '🎯',
    details: [
      'Multi-stage quality inspection process',
      'ISO 9001:2015 certified facilities',
      'Advanced testing equipment',
      'Continuous improvement protocols'
    ]
  },
  {
    id: 'materials',
    icon: '🌱',
    details: [
      'Eco-friendly leather alternatives',
      'Recycled and renewable materials',
      'Sustainable sourcing partnerships',
      'Environmental impact assessment'
    ]
  },
  {
    id: 'innovation',
    icon: '💡',
    details: [
      'In-house design team',
      'Trend research and analysis',
      'Prototype development lab',
      'Customer feedback integration'
    ]
  },
  {
    id: 'network',
    icon: '🌐',
    details: [
      'Global supplier network',
      'Strategic partnerships',
      'Efficient logistics system',
      'Real-time supply chain monitoring'
    ]
  },
  {
    id: 'craftsmanship',
    icon: '✋',
    details: [
      'Master craftsmen with 20+ years experience',
      'Traditional techniques preserved',
      'Continuous skills development',
      'Attention to finest details'
    ]
  },
];

export default function StrengthsPage() {
  const t = useTranslations('strengths');

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero Section */}
      <section className="section-spacing bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-primary mb-6">
              {t('title')}
            </h1>
            <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our competitive advantages are built on decades of experience, continuous innovation, 
              and an unwavering commitment to excellence in every aspect of our operations.
            </p>
          </MotionFadeIn>
        </div>
      </section>

      {/* Strengths Overview */}
      <StrengthsSection />

      {/* Detailed Strengths */}
      <section className="section-spacing bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <MotionStagger className="space-y-16">
            {strengthDetails.map((strength, index) => (
              <MotionStaggerItem key={strength.id}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}>
                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-brand-primary to-brand-accent rounded-xl flex items-center justify-center text-white text-2xl">
                        {strength.icon}
                      </div>
                      <h2 className="font-serif text-2xl lg:text-3xl font-bold text-brand-primary">
                        {t(`${strength.id}.title`)}
                      </h2>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {t(`${strength.id}.description`)}
                    </p>
                    
                    <ul className="space-y-3">
                      {strength.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Visual */}
                  <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-4">{strength.icon}</div>
                        <p className="font-medium">{t(`${strength.id}.title`)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Experience Our Excellence
            </h2>
            <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Let us demonstrate how our strengths can benefit your next project. 
              Contact us for a consultation.
            </p>
            <a 
              href="/contact" 
              className="btn-primary bg-brand-accent hover:bg-brand-accent/90 text-white inline-block"
            >
              Get in Touch
            </a>
          </MotionFadeIn>
        </div>
      </section>
    </div>
  );
}