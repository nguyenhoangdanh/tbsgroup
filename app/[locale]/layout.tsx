import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo';
import '../globals.css';

// For the build environment, we'll use system fonts instead of Google Fonts
// In production, you can restore the Google Fonts imports

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'TBS Group Handbag Division - Premium Handbag Collections',
    description: 'Discover premium handcrafted handbag collections with artisanal excellence and global vision. TBS Group Handbag Division offers sustainable heritage and seasonal innovation.',
    keywords: ['handbag', 'premium', 'artisanal', 'sustainable', 'fashion', 'TBS Group'],
    locale,
    url: `/${locale}`,
  });
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className="font-sans">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema())
          }}
        />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}