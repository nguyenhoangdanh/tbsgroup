import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { MotionStagger } from '@/components/MotionStagger';
import { Link } from '@/lib/i18n/routing';
import { generateSEOMetadata } from '@/lib/seo';
import { getLocalizedContent, formatPrice } from '@/lib/utils';

async function getCategory(slug: string) {
  try {
    const response = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/categories/${slug}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function generateMetadata({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  const category = await getCategory(slug);
  
  if (!category) {
    return generateSEOMetadata({
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
      locale,
      url: `/${locale}/categories/${slug}`,
    });
  }

  const name = getLocalizedContent(category.name, locale);
  const description = getLocalizedContent(category.description, locale);

  return generateSEOMetadata({
    title: `${name} - TBS Group Handbag Division`,
    description: description || `Browse our ${name.toLowerCase()} collection featuring premium quality products.`,
    keywords: [name.toLowerCase(), 'handbags', 'premium', 'quality'],
    locale,
    url: `/${locale}/categories/${slug}`,
    image: category.thumbnail,
  });
}

export default async function CategoryPage({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  const t = useTranslations();
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const categoryName = getLocalizedContent(category.name, locale);
  const categoryDescription = getLocalizedContent(category.description, locale);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-brand-primary text-white py-20">
        <div className="max-w-7xl mx-auto container-padding">
          <MotionFadeIn>
            <nav className="text-sm text-gray-300 mb-4">
              <Link href="/categories" className="hover:text-white">
                {t('categories.title')}
              </Link>
              <span className="mx-2">→</span>
              <span>{categoryName}</span>
            </nav>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {categoryName}
            </h1>
            
            {categoryDescription && (
              <p className="text-xl text-gray-200 max-w-3xl">
                {categoryDescription}
              </p>
            )}
            
            <div className="mt-6 text-gray-300">
              {category._count?.products || 0} {t('categories.products')}
            </div>
          </MotionFadeIn>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          {category.products && category.products.length > 0 ? (
            <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {category.products.map((product: any) => {
                const productName = getLocalizedContent(product.name, locale);
                const productDesc = getLocalizedContent(product.shortDesc, locale);
                
                return (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200 relative">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={productName}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-serif">
                            {productName.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {product.featured && (
                        <div className="absolute top-3 left-3 bg-brand-accent text-white px-2 py-1 text-xs font-medium rounded">
                          {t('products.featured')}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-serif text-lg font-bold text-brand-primary mb-2 group-hover:text-brand-accent transition-colors line-clamp-2">
                        {productName}
                      </h3>
                      
                      {productDesc && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {productDesc}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {product.price ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-brand-primary">
                              {formatPrice(product.price, locale)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice, locale)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-brand-accent">
                            {t('products.contactForPrice')}
                          </span>
                        )}
                        
                        <span className="text-brand-accent font-medium group-hover:translate-x-1 transition-transform">
                          {t('products.viewDetails')} →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </MotionStagger>
          ) : (
            <MotionFadeIn>
              <div className="text-center py-12">
                <h3 className="font-serif text-2xl text-gray-500 mb-4">
                  {t('categories.noProducts')}
                </h3>
                <p className="text-gray-400 mb-8">
                  {t('categories.noProductsDesc')}
                </p>
                <Link href="/contact" className="btn-primary">
                  {t('categories.contactUs')}
                </Link>
              </div>
            </MotionFadeIn>
          )}
        </div>
      </section>

      {/* Related Categories */}
      <section className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-6">
              {t('categories.exploreMore')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('categories.exploreMoreDesc')}
            </p>
            <Link href="/categories" className="btn-secondary">
              {t('categories.viewAllCategories')}
            </Link>
          </MotionFadeIn>
        </div>
      </section>
    </div>
  );
}