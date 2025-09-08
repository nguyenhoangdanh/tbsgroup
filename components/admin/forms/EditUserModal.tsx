import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { z } from 'zod';

// Edit user validation schema (no password)
const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

interface EditUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({ 
  user,
  isOpen, 
  onClose, 
  onSuccess 
}: EditUserModalProps) {
  const [formData, setFormData] = useState<EditUserFormData>({
    firstName: '',
    lastName: '',
    role: 'ADMIN',
    status: 'ACTIVE',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof EditUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      editUserSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      onSuccess();
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  if (!user) return null;

  const canModifyRole = user.role !== 'SUPER_ADMIN' || formData.role === 'SUPER_ADMIN';
  const isLastSuperAdmin = user.role === 'SUPER_ADMIN' && formData.role !== 'SUPER_ADMIN';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Admin User"
      description={`Update details for ${user.email}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {errors.submit}
          </motion.div>
        )}

        {/* Role Change Warning */}
        {isLastSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm"
          >
            <p className="font-medium">⚠️ Role Change Warning</p>
            <p>You are about to remove Super Admin privileges from this user. Make sure there is at least one other Super Admin in the system.</p>
          </motion.div>
        )}

        {/* Account Information */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-900 mb-2">Account Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Email:</span>
              <span className="text-neutral-900 font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Created:</span>
              <span className="text-neutral-900">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Last Updated:</span>
              <span className="text-neutral-900">{new Date(user.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Email address cannot be changed. Contact system administrator if email change is required.
          </p>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-900">Personal Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={formData.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
              error={errors.firstName}
              placeholder="John"
              required
            />
            
            <Input
              label="Last Name *"
              value={formData.lastName}
              onChange={(value) => handleInputChange('lastName', value)}
              error={errors.lastName}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        {/* Permissions & Status */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-900">Permissions & Status</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`input ${!canModifyRole ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                required
                disabled={!canModifyRole}
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              {errors.role && <p className="error-text">{errors.role}</p>}
              {!canModifyRole ? (
                <p className="helper-text text-amber-600">
                  Current user role cannot be downgraded
                </p>
              ) : (
                <p className="helper-text">
                  {formData.role === 'SUPER_ADMIN' 
                    ? 'Full access to all features including user management' 
                    : 'Access to inquiries and basic features only'
                  }
                </p>
              )}
            </div>
            
            <div>
              <label className="label">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="input"
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status && <p className="error-text">{errors.status}</p>}
              <p className="helper-text">
                {formData.status === 'ACTIVE' 
                  ? 'User can sign in and access the admin panel' 
                  : 'User account is disabled'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Password Change Note */}
        <div className="bg-accent-light border border-slate-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-accent">Password Management</p>
              <p className="text-sm text-accent mt-1">
                To change the user's password, use the separate "Change Password" option from the user actions menu. 
                This ensures proper security protocols are followed.
              </p>
            </div>
          </div>
        </div>

        {/* Change Log Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-slate-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-800">Audit Trail</p>
              <p className="text-sm text-neutral-600 mt-1">
                All user modifications are logged for security and compliance purposes. 
                The change will be recorded with timestamp and the administrator who made the change.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="outline"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
