'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary text-white">
      <div className="max-w-7xl mx-auto container-padding section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TBS</span>
              </div>
              <span className="font-serif text-xl font-bold">
                TBS Group
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Navigation</h3>
            <div className="space-y-2">
              <Link 
                href="/" 
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Products
              </Link>
              <Link 
                href="/strengths" 
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Strengths
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>Email: info@tbs-handbag.com</p>
              <p>Phone: +84 (0) 123 456 789</p>
              <p>Address: Hanoi, Vietnam</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {t('company')}. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}