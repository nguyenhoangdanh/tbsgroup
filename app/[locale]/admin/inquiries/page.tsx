import { InquiriesPage } from '@/components/InquiriesPage';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminInquiriesPage({ params }: PageProps) {
  return <InquiriesPage locale={params.locale} />;
}