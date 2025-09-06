'use client';

import { useTranslations } from 'next-intl';
import { MotionFadeIn } from './MotionFadeIn';
import { MotionStagger, MotionStaggerItem } from './MotionStagger';
import { motion } from 'framer-motion';

const strengths = [
  {
    id: 'quality',
    icon: '🎯',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'materials',
    icon: '🌱',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'innovation',
    icon: '💡',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'network',
    icon: '🌐',
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: 'craftsmanship',
    icon: '✋',
    color: 'from-red-500 to-pink-600',
  },
];

export function StrengthsSection() {
  const t = useTranslations('strengths');

  return (
    <section className="section-spacing bg-gray-50">
      <div className="max-w-7xl mx-auto container-padding">
        <MotionFadeIn>
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-brand-primary mb-6">
              {t('title')}
            </h2>
            <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full"></div>
          </div>
        </MotionFadeIn>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {strengths.map((strength, index) => (
            <MotionStaggerItem key={strength.id}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 text-center group"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${strength.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <span className="text-2xl text-white">{strength.icon}</span>
                </motion.div>

                {/* Content */}
                <h3 className="font-bold text-lg text-brand-primary mb-3 group-hover:text-brand-accent transition-colors duration-300">
                  {t(`${strength.id}.title`)}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t(`${strength.id}.description`)}
                </p>

                {/* Bottom accent line */}
                <div className={`w-0 group-hover:w-full h-0.5 bg-gradient-to-r ${strength.color} mx-auto mt-6 transition-all duration-500`}></div>
              </motion.div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>

        {/* Call to Action */}
        <MotionFadeIn delay={0.5}>
          <div className="text-center mt-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="#contact" 
                className="inline-block btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('contact')}
              </a>
            </motion.div>
          </div>
        </MotionFadeIn>
      </div>
    </section>
  );
}