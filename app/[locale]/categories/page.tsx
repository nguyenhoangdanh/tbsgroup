import { useTranslations } from 'next-intl';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { MotionStagger } from '@/components/MotionStagger';
import { Link } from '@/lib/i18n/routing';
import { generateSEOMetadata } from '@/lib/seo';

// This would typically fetch from API
async function getCategories() {
  try {
    const response = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'force-cache',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'All Categories - TBS Group Handbag Division',
    description: 'Browse all our premium handbag categories including luxury handbags, leather wallets, and travel bags. Find the perfect accessory for every occasion.',
    keywords: ['categories', 'handbags', 'leather wallets', 'travel bags', 'premium accessories'],
    locale,
    url: `/${locale}/categories`,
  });
}

export default async function CategoriesPage() {
  const t = useTranslations();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-brand-primary text-white py-20">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('categories.title')}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </MotionFadeIn>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category: any) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  {category.thumbnail ? (
                    <img 
                      src={category.thumbnail} 
                      alt={category.name.vi || category.name.en || category.name.id}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                      <span className="text-white text-2xl font-serif">
                        {(category.name.vi || category.name.en || category.name.id).charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-brand-primary mb-2 group-hover:text-brand-accent transition-colors">
                    {category.name.vi || category.name.en || category.name.id}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 mb-4">
                      {category.description.vi || category.description.en || category.description.id}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category._count?.products || 0} {t('categories.products')}
                    </span>
                    <span className="text-brand-accent font-medium group-hover:translate-x-1 transition-transform">
                      {t('categories.viewProducts')} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </MotionStagger>

          {categories.length === 0 && (
            <MotionFadeIn>
              <div className="text-center py-12">
                <h3 className="font-serif text-2xl text-gray-500 mb-4">
                  {t('categories.noCategories')}
                </h3>
                <p className="text-gray-400">
                  {t('categories.noCategoriesDesc')}
                </p>
              </div>
            </MotionFadeIn>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-6">
              {t('categories.cta.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('categories.cta.description')}
            </p>
            <Link 
              href="/contact" 
              className="btn-primary"
            >
              {t('categories.cta.button')}
            </Link>
          </MotionFadeIn>
        </div>
      </section>
    </div>
  );
}