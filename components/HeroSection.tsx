'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { MotionFadeIn } from './MotionFadeIn';
import { MotionStagger, MotionStaggerItem } from './MotionStagger';
import { motion } from 'framer-motion';

export function HeroSection() {
  const t = useTranslations();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-neutral-50 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto container-padding text-center">
        <MotionStagger className="space-y-8">
          <MotionStaggerItem>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-brand-secondary leading-tight">
              {t('hero.title')}
            </h1>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <p className="text-lg md:text-xl text-brand-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/products" 
                className="inline-block btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('hero.cta.explore')}
              </Link>
            </motion.div>
          </MotionStaggerItem>
        </MotionStagger>

        {/* Hero Image */}
        <MotionFadeIn delay={0.6} className="mt-16 lg:mt-20">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="aspect-video bg-gradient-to-r from-brand-primary to-brand-accent rounded-2xl shadow-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">TBS</span>
                  </div>
                  <p className="text-xl font-medium">Premium Handbag Collections</p>
                </div>
              </div>
            </div>
          </motion.div>
        </MotionFadeIn>

        {/* Scroll Indicator */}
        <MotionFadeIn delay={1} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-400"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </MotionFadeIn>
      </div>
    </section>
  );
}