import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { generateSEOMetadata } from '@/lib/seo';
import '../../globals.css';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'Admin Dashboard - TBS Group Handbag Division',
    description: 'Admin dashboard for managing customer inquiries and consultation requests.',
    locale,
    url: `/${locale}/admin`,
  });
}

export default async function AdminLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className="h-full bg-gray-50 overflow-hidden">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <div className="h-full">
              {children}
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}