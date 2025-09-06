'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionFadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function MotionFadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '' 
}: MotionFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}