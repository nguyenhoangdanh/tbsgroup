import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ModalProps } from '@/types/ui';
import Button from './Button';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  footer,
  className,
  children,
  ...props
}) => {
  // Handle escape key press
  useEffect(() => {
    if (!closeOnEsc) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEsc, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        duration: 0.3,
        bounce: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal">
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleBackdropClick}
          />

          {/* Modal Container */}
          <div className="modal-container">
            <motion.div
              className={clsx(
                'modal-content w-full',
                sizeClasses[size],
                className
              )}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              {...props}
            >
              {/* Header */}
              {(title || description) && (
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {title && (
                        <h3 className="text-lg font-semibold text-slate-900">
                          {title}
                        </h3>
                      )}
                      {description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {description}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="ml-4 -mr-2 text-slate-400 hover:text-slate-600"
                      icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;