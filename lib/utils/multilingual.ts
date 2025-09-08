import { useLocale } from 'next-intl';

// Utility type for multilingual content
export type MultilingualContent = {
  vi: string;
  en: string;
  id: string;
};

// Hook to get translated content based on current locale
export function useTranslatedContent() {
  const locale = useLocale() as 'vi' | 'en' | 'id';
  
  const getTranslatedText = (content: MultilingualContent | string): string => {
    if (typeof content === 'string') {
      return content;
    }
    return content[locale] || content.vi || content.en || '';
  };

  return { getTranslatedText, locale };
}

// Server-side function to get translated content
export function getTranslatedContent(
  content: MultilingualContent | string, 
  locale: 'vi' | 'en' | 'id' = 'vi'
): string {
  if (typeof content === 'string') {
    return content;
  }
  return content[locale] || content.vi || content.en || '';
}