import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminDashboard } from './AdminDashboard';
import { generateSEOMetadata } from '@/lib/seo';

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

export default async function AdminPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  return <AdminDashboard locale={locale} />;
}