import { CategoriesPage } from '@/components/CategoriesPage';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminCategoriesPage({ params }: PageProps) {
  return <CategoriesPage locale={params.locale} />;
}