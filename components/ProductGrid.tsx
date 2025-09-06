'use client';

import { useTranslations } from 'next-intl';
import { MotionFadeIn } from './MotionFadeIn';
import { MotionStagger, MotionStaggerItem } from './MotionStagger';
import { motion } from 'framer-motion';

const collections = [
  {
    id: 'premium',
    image: '/images/collection-premium.jpg',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'sustainable',
    image: '/images/collection-sustainable.jpg',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    id: 'seasonal',
    image: '/images/collection-seasonal.jpg',
    gradient: 'from-orange-500 to-red-500',
  },
];

export function ProductGrid() {
  const t = useTranslations('collections');

  return (
    <section className="section-spacing bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <MotionFadeIn>
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-brand-primary mb-6">
              {t('title')}
            </h2>
            <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full"></div>
          </div>
        </MotionFadeIn>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {collections.map((collection, index) => (
            <MotionStaggerItem key={collection.id}>
              <motion.div
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
                className="card group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${collection.gradient} flex items-center justify-center`}>
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl font-bold">
                          {collection.id === 'premium' ? 'P' : collection.id === 'sustainable' ? 'S' : 'I'}
                        </span>
                      </div>
                      <div className="text-sm opacity-80">Collection</div>
                    </div>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <h3 className="font-serif text-xl lg:text-2xl font-bold text-brand-primary mb-3 group-hover:text-brand-accent transition-colors duration-300">
                    {t(`${collection.id}.title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`${collection.id}.description`)}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className="h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent group-hover:via-brand-primary transition-colors duration-300"></div>
              </motion.div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}