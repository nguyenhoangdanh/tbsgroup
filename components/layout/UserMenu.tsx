import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { UserMenuProps } from '@/types/admin';
import Button from '../ui/Button';

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onProfileClick,
  onSettingsClick,
  onLogout,
  isOpen: controlledOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(controlledOpen);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync with controlled state
  useEffect(() => {
    setIsOpen(controlledOpen);
  }, [controlledOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (!newState) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.15,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.1,
        ease: 'easeIn',
      },
    },
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
      >
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
          <span className="text-slate-600 font-medium text-sm">
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block text-sm">
          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-medium text-slate-900">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  onProfileClick();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>

              <button
                onClick={() => {
                  onSettingsClick();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <div className="border-t border-slate-200 my-1"></div>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;