import ProductsManager from '@/components/admin/ProductsManager';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminProductsPage({ params }: PageProps) {
  return <ProductsManager locale={params.locale} />;
}