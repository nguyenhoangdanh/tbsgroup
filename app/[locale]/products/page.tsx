import { useTranslations } from 'next-intl';
import { ProductGrid } from '@/components/ProductGrid';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { generateSEOMetadata, generateProductCollectionSchema } from '@/lib/seo';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'Our Collections - TBS Group Handbag Division',
    description: 'Explore our premium handbag collections: Premium Urban Elegance, Sustainable Heritage, and Seasonal Innovation. Artisanal excellence meets modern design.',
    keywords: ['handbag collections', 'premium bags', 'urban elegance', 'sustainable fashion', 'seasonal designs'],
    locale,
    url: `/${locale}/products`,
  });
}

const collections = [
  {
    name: 'Premium Urban Elegance',
    description: 'For the modern, dynamic woman with elegant and sophisticated style.',
    image: '/images/collection-premium.jpg',
  },
  {
    name: 'Sustainable Heritage',
    description: 'Sustainable collection, demonstrating our commitment to the environment and future.',
    image: '/images/collection-sustainable.jpg',
  },
  {
    name: 'Seasonal Innovation',
    description: 'Latest designs following seasonal fashion trends.',
    image: '/images/collection-seasonal.jpg',
  },
];

export default function ProductsPage() {
  const t = useTranslations();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductCollectionSchema(collections))
        }}
      />
      
      <div className="pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="section-spacing bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto container-padding text-center">
            <MotionFadeIn>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-primary mb-6">
                {t('collections.title')}
              </h1>
              <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover our carefully curated collections that blend traditional craftsmanship 
                with contemporary design, sustainability, and innovation.
              </p>
            </MotionFadeIn>
          </div>
        </section>

        {/* Collections Grid */}
        <ProductGrid />

        {/* Additional Details */}
        <section className="section-spacing bg-gray-50">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <MotionFadeIn>
                <div>
                  <h2 className="font-serif text-3xl font-bold text-brand-primary mb-6">
                    Crafted with Precision
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Each collection represents our commitment to excellence, combining the finest materials 
                    with innovative design techniques. Our artisans bring decades of experience to every piece, 
                    ensuring that each handbag meets our rigorous standards for quality and durability.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    From concept to completion, we maintain strict quality control processes and sustainable 
                    practices that reflect our values and respect for both our customers and the environment.
                  </p>
                </div>
              </MotionFadeIn>
              
              <MotionFadeIn delay={0.2}>
                <div className="aspect-video bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">✨</span>
                    </div>
                    <p className="text-xl font-medium">Quality Craftsmanship</p>
                  </div>
                </div>
              </MotionFadeIn>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}