'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function MotionStagger({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}: MotionStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}