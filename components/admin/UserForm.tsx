'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Modal, 
  Input, 
  Button, 
  Badge
} from '@/components/ui';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  password?: string;
  confirmPassword?: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  currentUser: AdminUser;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  currentUser
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || 'ADMIN',
    isActive: user?.isActive ?? true,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Password validation (only for new users or when changing password)
    if (!user || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Role validation - prevent users from changing their own role or deactivating themselves
    if (user && user.id === currentUser.id) {
      if (formData.role !== user.role) {
        newErrors.role = 'You cannot change your own role';
      }
      if (!formData.isActive) {
        newErrors.isActive = 'You cannot deactivate your own account';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Don't send password fields if they're empty (for existing users)
      const submitData = { ...formData };
      if (user && !formData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'ADMIN',
        isActive: true,
        password: '',
        confirmPassword: '',
      });
      setErrors({});
      setShowPassword(false);
      onClose();
    }
  };

  const isEditingSelf: boolean = !!(user && user.id === currentUser.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={user ? 'Edit User' : 'Create User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-900">Basic Information</h4>
          
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, email: value }));
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: '' }));
              }
            }}
            error={errors.email}
            placeholder="user@example.com"
            required
            disabled={!!user} // Email cannot be changed for existing users
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, firstName: value }));
                if (errors.firstName) {
                  setErrors(prev => ({ ...prev, firstName: '' }));
                }
              }}
              error={errors.firstName}
              placeholder="John"
              required
            />
            
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, lastName: value }));
                if (errors.lastName) {
                  setErrors(prev => ({ ...prev, lastName: '' }));
                }
              }}
              error={errors.lastName}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-900">
              {user ? 'Change Password (Optional)' : 'Password'}
            </h4>
            {user && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-accent hover:text-accent-light"
              >
                {showPassword ? 'Hide' : 'Change Password'}
              </button>
            )}
          </div>
          
          {(!user || showPassword) && (
            <div className="space-y-4">
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, password: value }));
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                error={errors.password}
                placeholder="••••••••"
                required={!user}
                helperText="At least 8 characters with uppercase, lowercase, and number"
              />
              
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, confirmPassword: value }));
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                error={errors.confirmPassword}
                placeholder="••••••••"
                required={!user || showPassword}
              />
            </div>
          )}
        </div>

        {/* Role and Status */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-900">Permissions & Status</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <div className="space-y-2">
              {(['ADMIN', 'SUPER_ADMIN'] as const).map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' 
                    }))}
                    disabled={isEditingSelf}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={role === 'SUPER_ADMIN' ? 'warning' : 'info'}
                    >
                      {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </Badge>
                    <span className="text-sm text-neutral-600">
                      {role === 'SUPER_ADMIN' 
                        ? 'Full access to all features'
                        : 'View-only access to most features'
                      }
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
            {isEditingSelf && (
              <p className="mt-1 text-sm text-slate-500">
                You cannot change your own role
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isActive: e.target.checked 
                }))}
                disabled={isEditingSelf}
                className="rounded border-slate-300 text-neutral-600"
              />
              <span className="text-sm font-medium text-slate-700">Active Account</span>
            </label>
            <p className="text-xs text-slate-500 mt-1">
              {isEditingSelf 
                ? 'You cannot deactivate your own account'
                : 'Inactive users cannot sign in'
              }
            </p>
            {errors.isActive && (
              <p className="mt-1 text-sm text-red-600">{errors.isActive}</p>
            )}
          </div>
        </div>

        {/* Warning for editing self */}
        {isEditingSelf && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Editing Your Own Account
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Some restrictions apply when editing your own account for security reasons.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
