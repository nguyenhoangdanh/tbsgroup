import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://tbs-handbag.vercel.app';
  const locales = ['vi', 'en', 'id'];
  const routes = ['', '/products', '/strengths', '/contact'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale and route
  locales.forEach(locale => {
    routes.forEach(route => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: locales.reduce((acc, loc) => {
            acc[loc] = `${baseUrl}/${loc}${route}`;
            return acc;
          }, {} as Record<string, string>)
        }
      });
    });
  });

  return sitemapEntries;
}