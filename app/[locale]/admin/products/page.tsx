import { ProductsPage } from '@/components/ProductsPage';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminProductsPage({ params }: PageProps) {
  return <ProductsPage locale={params.locale} />;
}