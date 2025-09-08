import CategoriesManager from '@/components/admin/CategoriesManagerComplete';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminCategoriesPage({ params }: PageProps) {
  return <CategoriesManager locale={params.locale} />;
}