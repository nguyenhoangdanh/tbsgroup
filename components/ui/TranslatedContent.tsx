'use client';

import { MultilingualContent, useTranslatedContent } from '@/lib/utils/multilingual';

interface TranslatedTextProps {
  content: MultilingualContent | string;
  className?: string;
}

export function TranslatedText({ content, className }: TranslatedTextProps) {
  const { getTranslatedText } = useTranslatedContent();
  
  return (
    <span className={className}>
      {getTranslatedText(content)}
    </span>
  );
}

interface TranslatedContentProps {
  content: MultilingualContent | string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  children?: never;
}

export function TranslatedContent({ 
  content, 
  as: Component = 'span', 
  className 
}: TranslatedContentProps) {
  const { getTranslatedText } = useTranslatedContent();
  
  return (
    <Component className={className}>
      {getTranslatedText(content)}
    </Component>
  );
}