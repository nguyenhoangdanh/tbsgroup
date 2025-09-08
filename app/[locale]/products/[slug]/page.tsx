import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { MotionStagger } from '@/components/MotionStagger';
import { Link } from '@/lib/i18n/routing';
import { generateSEOMetadata } from '@/lib/seo';
import { getLocalizedContent, formatPrice } from '@/lib/utils';

async function getProduct(slug: string) {
  try {
    const response = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/products/${slug}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  const productData = await getProduct(slug);
  
  if (!productData) {
    return generateSEOMetadata({
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
      locale,
      url: `/${locale}/products/${slug}`,
    });
  }

  const { product } = productData;
  const name = getLocalizedContent(product.name, locale);
  const description = getLocalizedContent(product.description, locale) || getLocalizedContent(product.shortDesc, locale);
  const seoTitle = getLocalizedContent(product.seoTitle, locale);
  const seoDesc = getLocalizedContent(product.seoDesc, locale);

  return generateSEOMetadata({
    title: seoTitle || `${name} - TBS Group Handbag Division`,
    description: seoDesc || description || `Premium ${name.toLowerCase()} with exceptional quality and craftsmanship.`,
    keywords: [name.toLowerCase(), 'handbag', 'premium', 'quality', 'artisanal'],
    locale,
    url: `/${locale}/products/${slug}`,
    image: product.images?.[0],
  });
}

export default async function ProductPage({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  const t = useTranslations();
  const productData = await getProduct(slug);

  if (!productData) {
    notFound();
  }

  const { product, relatedProducts } = productData;
  const productName = getLocalizedContent(product.name, locale);
  const productDescription = getLocalizedContent(product.description, locale);
  const productShortDesc = getLocalizedContent(product.shortDesc, locale);
  const categoryName = getLocalizedContent(product.category?.name, locale);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <section className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto container-padding">
          <nav className="text-sm text-gray-600">
            <Link href="/products" className="hover:text-brand-primary">
              {t('products.title')}
            </Link>
            {product.category && (
              <>
                <span className="mx-2">→</span>
                <Link href={`/categories/${product.category.slug}`} className="hover:text-brand-primary">
                  {categoryName}
                </Link>
              </>
            )}
            <span className="mx-2">→</span>
            <span className="text-brand-primary">{productName}</span>
          </nav>
        </div>
      </section>

      {/* Product Details */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Gallery */}
            <MotionFadeIn>
              <div className="space-y-4">
                {product.images && product.images.length > 0 ? (
                  <>
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={productName}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images.slice(1, 5).map((image: string, index: number) => (
                          <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={image} 
                              alt={`${productName} ${index + 2}`}
                              className="w-full h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-4xl font-serif">
                      {productName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </MotionFadeIn>

            {/* Product Info */}
            <MotionFadeIn delay={0.2}>
              <div className="space-y-6">
                <div>
                  {product.featured && (
                    <span className="inline-block bg-brand-accent text-white px-3 py-1 text-sm font-medium rounded mb-4">
                      {t('products.featured')}
                    </span>
                  )}
                  
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-primary mb-4">
                    {productName}
                  </h1>
                  
                  {productShortDesc && (
                    <p className="text-lg text-gray-600 mb-6">
                      {productShortDesc}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="pb-6 border-b border-gray-200">
                  {product.price ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl font-bold text-brand-primary">
                        {formatPrice(product.price, locale)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xl text-gray-500 line-through">
                          {formatPrice(product.originalPrice, locale)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-brand-accent">
                      {t('products.contactForPrice')}
                    </span>
                  )}
                </div>

                {/* Specifications */}
                {product.specifications && (
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="font-serif text-xl font-bold text-brand-primary mb-4">
                      {t('products.specifications')}
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="font-medium">
                            {getLocalizedContent(value, locale)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-4">
                  <Link 
                    href={`/contact?product=${product.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    {t('products.requestConsultation')}
                  </Link>
                  
                  <Link 
                    href="/contact"
                    className="btn-secondary w-full text-center block"
                  >
                    {t('products.generalInquiry')}
                  </Link>
                </div>
              </div>
            </MotionFadeIn>
          </div>
        </div>
      </section>

      {/* Product Description */}
      {productDescription && (
        <section className="section-spacing bg-gray-50">
          <div className="max-w-7xl mx-auto container-padding">
            <MotionFadeIn>
              <div className="max-w-4xl mx-auto">
                <h2 className="font-serif text-3xl font-bold text-brand-primary mb-6 text-center">
                  {t('products.description')}
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                  <p>{productDescription}</p>
                </div>
              </div>
            </MotionFadeIn>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="section-spacing">
          <div className="max-w-7xl mx-auto container-padding">
            <MotionFadeIn>
              <h2 className="font-serif text-3xl font-bold text-brand-primary mb-8 text-center">
                {t('products.relatedProducts')}
              </h2>
            </MotionFadeIn>
            
            <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct: any) => {
                const relatedName = getLocalizedContent(relatedProduct.name, locale);
                const relatedDesc = getLocalizedContent(relatedProduct.shortDesc, locale);
                
                return (
                  <Link 
                    key={relatedProduct.id} 
                    href={`/products/${relatedProduct.slug}`}
                    className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      {relatedProduct.images?.[0] ? (
                        <img 
                          src={relatedProduct.images[0]} 
                          alt={relatedName}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-serif">
                            {relatedName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-bold text-brand-primary mb-2 group-hover:text-brand-accent transition-colors line-clamp-2">
                        {relatedName}
                      </h3>
                      
                      {relatedProduct.price ? (
                        <span className="text-lg font-bold text-brand-primary">
                          {formatPrice(relatedProduct.price, locale)}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-brand-accent">
                          {t('products.contactForPrice')}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </MotionStagger>
          </div>
        </section>
      )}
    </div>
  );
}