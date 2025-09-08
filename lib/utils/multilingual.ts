import { useLocale } from 'next-intl';

// Utility type for multilingual content
export interface MultilingualContent {
  vi: string;
  en: string;
  id: string;
}

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
  content: MultilingualContent | undefined, 
  locale: 'vi' | 'en' | 'id' = 'vi'
): string {
  if (!content) return '';
  return content[locale] || content.en || content.vi || '';
}

export function createMultilingualContent(
  vi: string = '',
  en: string = '',
  id: string = ''
): MultilingualContent {
  return { vi, en, id };
}