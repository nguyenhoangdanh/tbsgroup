import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface Product {
  id: string;
  name: {
    vi: string;
    en: string;
    id: string;
  };
  slug: string;
  images: string[];
  price?: number;
  category: {
    name: {
      vi: string;
      en: string;
      id: string;
    };
  };
}

interface DeleteProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteProductDialog({ 
  product,
  isOpen, 
  onClose, 
  onSuccess 
}: DeleteProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!product) return;

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
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

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Product"
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
            Are you sure you want to delete this product?
          </h3>
          
          <div className="bg-slate-50 rounded-lg p-4 text-left mb-4">
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              {product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name.en}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 mb-2">Product Details:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li><strong>English:</strong> {product.name.en}</li>
                  <li><strong>Vietnamese:</strong> {product.name.vi}</li>
                  <li><strong>Indonesian:</strong> {product.name.id}</li>
                  <li><strong>Slug:</strong> {product.slug}</li>
                  <li><strong>Category:</strong> {product.category.name.en}</li>
                  {product.price && (
                    <li><strong>Price:</strong> ${product.price.toFixed(2)}</li>
                  )}
                  <li><strong>Images:</strong> {product.images.length} image{product.images.length !== 1 ? 's' : ''}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning Message */}
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
                  This action cannot be undone. The product will be permanently deleted from the system, including all its images, specifications, and related data.
                </p>
                <div className="mt-2">
                  <p className="text-xs text-amber-600">
                    • All customer inquiries related to this product will remain but lose product reference
                  </p>
                  <p className="text-xs text-amber-600">
                    • Product images on external servers will not be deleted automatically
                  </p>
                  <p className="text-xs text-amber-600">
                    • This action will be logged for audit purposes
                  </p>
                </div>
              </div>
            </div>
          </div>
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
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}