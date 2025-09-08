import UsersManager from '@/components/admin/UsersManager';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminUsersPage({ params }: PageProps) {
  return <UsersManager locale={params.locale} />;
}