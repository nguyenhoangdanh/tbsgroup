import InquiriesViewer from '@/components/admin/InquiriesViewer';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminInquiriesPage({ params }: PageProps) {
  return <InquiriesViewer locale={params.locale} />;
}