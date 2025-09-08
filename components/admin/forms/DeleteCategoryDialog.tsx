import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface Category {
  id: string;
  name: {
    vi: string;
    en: string;
    id: string;
  };
  slug: string;
  createdAt: string;
  _count?: {
    products: number;
  };
}

interface DeleteCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCategoryDialog({ 
  category,
  isOpen, 
  onClose, 
  onSuccess 
}: DeleteCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!category) return;

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  if (!category) return null;

  const hasProducts = category._count && category._count.products > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Category"
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Confirmation Message */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Are you sure you want to delete this category?
          </h3>
          
          <div className="bg-slate-50 rounded-lg p-4 text-left mb-4">
            <p className="text-sm font-medium text-slate-900">Category Details:</p>
            <ul className="mt-2 text-sm text-slate-600 space-y-1">
              <li><strong>English:</strong> {category.name.en}</li>
              <li><strong>Vietnamese:</strong> {category.name.vi}</li>
              <li><strong>Indonesian:</strong> {category.name.id}</li>
              <li><strong>Slug:</strong> {category.slug}</li>
            </ul>
          </div>

          {/* Products Warning */}
          {hasProducts ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-left"
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    ⚠️ Cannot Delete Category
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    This category has <strong>{category._count?.products} product(s)</strong> associated with it. 
                    You must move or delete all products from this category before you can delete it.
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    To proceed: Go to Products → Filter by this category → Move products to another category or delete them.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Permanent Action
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    This action cannot be undone. The category will be permanently deleted from the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          {hasProducts ? (
            <Button
              variant="outline"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              Cannot Delete
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Category'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}