import type { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  locale?: string;
  type?: 'website' | 'article' | 'organization';
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image = '/og-image.png',
  url,
  locale = 'vi',
  type = 'website'
}: SEOConfig): Metadata {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://tbs-handbag.vercel.app';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'vi': `${baseUrl}/vi`,
        'en': `${baseUrl}/en`,
        'id': `${baseUrl}/id`,
        'x-default': `${baseUrl}/vi`,
      },
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'TBS Group Handbag Division',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: type === 'organization' ? 'website' : type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TBS Group Handbag Division',
    description: 'Premium handbag collections with global vision and artisanal excellence',
    url: process.env.NEXTAUTH_URL || 'https://tbs-handbag.vercel.app',
    logo: `${process.env.NEXTAUTH_URL || 'https://tbs-handbag.vercel.app'}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Vietnamese', 'English', 'Indonesian'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
    },
  };
}

export function generateProductCollectionSchema(collections: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'TBS Handbag Collections',
    description: 'Premium handbag collections featuring urban elegance, sustainable heritage, and seasonal innovation',
    itemListElement: collections.map((collection, index) => ({
      '@type': 'Product',
      position: index + 1,
      name: collection.name,
      description: collection.description,
      image: collection.image,
      brand: {
        '@type': 'Brand',
        name: 'TBS Group',
      },
    })),
  };
}