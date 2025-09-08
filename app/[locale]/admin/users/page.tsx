import { UsersPage } from '@/components/UsersPage';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminUsersPage({ params }: PageProps) {
  return <UsersPage locale={params.locale} />;
}