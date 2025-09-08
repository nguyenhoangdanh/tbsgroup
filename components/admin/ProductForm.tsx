'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MultilingualContent } from '@/lib/utils/multilingual';
import { getLocalizedContent } from '@/lib/utils';
import { 
  Modal, 
  Input, 
  Button, 
  Badge,
  Loading,
  Card
} from '@/components/ui';

interface Category {
  id: string;
  name: MultilingualContent;
  slug: string;
}

interface Product {
  id: string;
  name: MultilingualContent;
  slug: string;
  description?: MultilingualContent;
  shortDesc?: MultilingualContent;
  price?: number;
  originalPrice?: number;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category: Category;
}

interface ProductFormData {
  name: {
    vi: string;
    en: string;
    id: string;
  };
  slug: string;
  description?: {
    vi: string;
    en: string;
    id: string;
  };
  shortDesc?: {
    vi: string;
    en: string;
    id: string;
  };
  price?: number;
  originalPrice?: number;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured: boolean;
  sortOrder: number;
  categoryId: string;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  locale: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  locale
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: {
      vi: product?.name?.vi || '',
      en: product?.name?.en || '',
      id: product?.name?.id || '',
    },
    slug: product?.slug || '',
    description: {
      vi: product?.description?.vi || '',
      en: product?.description?.en || '',
      id: product?.description?.id || '',
    },
    shortDesc: {
      vi: product?.shortDesc?.vi || '',
      en: product?.shortDesc?.en || '',
      id: product?.shortDesc?.id || '',
    },
    price: product?.price || undefined,
    originalPrice: product?.originalPrice || undefined,
    images: product?.images || [],
    status: product?.status || 'ACTIVE',
    featured: product?.featured || false,
    sortOrder: product?.sortOrder || 0,
    categoryId: product?.categoryId || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState('');

  // Fetch categories for dropdown
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/admin/categories?pageSize=100&status=ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Auto-generate slug from Vietnamese name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (lang: 'vi' | 'en' | 'id', value: string) => {
    setFormData(prev => ({
      ...prev,
      name: {
        ...prev.name,
        [lang]: value
      },
      // Auto-generate slug from Vietnamese name
      ...(lang === 'vi' && !product && { slug: generateSlug(value) })
    }));
    
    // Clear name error
    if (errors[`name.${lang}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`name.${lang}`];
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (lang: 'vi' | 'en' | 'id', value: string) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description!,
        [lang]: value
      }
    }));
  };

  const handleShortDescChange = (lang: 'vi' | 'en' | 'id', value: string) => {
    setFormData(prev => ({
      ...prev,
      shortDesc: {
        ...prev.shortDesc!,
        [lang]: value
      }
    }));
  };

  const handleAddImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.name.vi.trim()) {
      newErrors['name.vi'] = 'Vietnamese name is required';
    }
    if (!formData.name.en.trim()) {
      newErrors['name.en'] = 'English name is required';
    }
    if (!formData.name.id.trim()) {
      newErrors['name.id'] = 'Indonesian name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    // Validate price
    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'Price must be positive';
    }
    if (formData.originalPrice !== undefined && formData.originalPrice < 0) {
      newErrors.originalPrice = 'Original price must be positive';
    }
    if (formData.price && formData.originalPrice && formData.price > formData.originalPrice) {
      newErrors.price = 'Price cannot be higher than original price';
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
      await onSubmit(formData);
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
        name: { vi: '', en: '', id: '' },
        slug: '',
        description: { vi: '', en: '', id: '' },
        shortDesc: { vi: '', en: '', id: '' },
        price: undefined,
        originalPrice: undefined,
        images: [],
        status: 'ACTIVE',
        featured: false,
        sortOrder: 0,
        categoryId: '',
      });
      setErrors({});
      setImageInput('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? 'Edit Product' : 'Create Product'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Product Name *</h4>
          
          <Input
            label="Vietnamese"
            value={formData.name.vi}
            onChange={(value) => handleNameChange('vi', value)}
            error={errors['name.vi']}
            placeholder="Tên sản phẩm tiếng Việt"
            required
          />
          
          <Input
            label="English"
            value={formData.name.en}
            onChange={(value) => handleNameChange('en', value)}
            error={errors['name.en']}
            placeholder="Product name in English"
            required
          />
          
          <Input
            label="Indonesian"
            value={formData.name.id}
            onChange={(value) => handleNameChange('id', value)}
            error={errors['name.id']}
            placeholder="Nama produk dalam bahasa Indonesia"
            required
          />
        </div>

        {/* Slug and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(value) => setFormData(prev => ({ ...prev, slug: value }))}
            error={errors.slug}
            placeholder="product-slug"
            helperText="URL-friendly identifier"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category *
            </label>
            {loadingCategories ? (
              <div className="h-10 bg-slate-100 rounded animate-pulse"></div>
            ) : (
              <select
                className={`input ${errors.categoryId ? 'border-red-300' : ''}`}
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getLocalizedContent(category.name, locale as 'vi' | 'en' | 'id')}
                  </option>
                ))}
              </select>
            )}
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Short Description</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Vietnamese
              </label>
              <textarea
                className="input min-h-[60px] resize-y"
                value={formData.shortDesc?.vi || ''}
                onChange={(e) => handleShortDescChange('vi', e.target.value)}
                placeholder="Mô tả ngắn tiếng Việt"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                English
              </label>
              <textarea
                className="input min-h-[60px] resize-y"
                value={formData.shortDesc?.en || ''}
                onChange={(e) => handleShortDescChange('en', e.target.value)}
                placeholder="Short description in English"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Indonesian
              </label>
              <textarea
                className="input min-h-[60px] resize-y"
                value={formData.shortDesc?.id || ''}
                onChange={(e) => handleShortDescChange('id', e.target.value)}
                placeholder="Deskripsi singkat dalam bahasa Indonesia"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Full Description</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Vietnamese
              </label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={formData.description?.vi || ''}
                onChange={(e) => handleDescriptionChange('vi', e.target.value)}
                placeholder="Mô tả chi tiết tiếng Việt"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                English
              </label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={formData.description?.en || ''}
                onChange={(e) => handleDescriptionChange('en', e.target.value)}
                placeholder="Detailed description in English"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Indonesian
              </label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={formData.description?.id || ''}
                onChange={(e) => handleDescriptionChange('id', e.target.value)}
                placeholder="Deskripsi detail dalam bahasa Indonesia"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Price (VND)"
            type="number"
            value={formData.price?.toString() || ''}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              price: value ? parseFloat(value) : undefined 
            }))}
            error={errors.price}
            placeholder="0"
            helperText="Leave empty for 'Contact for price'"
          />

          <Input
            label="Original Price (VND)"
            type="number"
            value={formData.originalPrice?.toString() || ''}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              originalPrice: value ? parseFloat(value) : undefined 
            }))}
            error={errors.originalPrice}
            placeholder="0"
            helperText="For showing discounts"
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Product Images</h4>
          
          {/* Add new image */}
          <div className="flex space-x-2">
            <Input
              value={imageInput}
              onChange={setImageInput}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddImage}
              disabled={!imageInput.trim()}
            >
              Add
            </Button>
          </div>

          {/* Images list */}
          {formData.images.length > 0 && (
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="flex-1 text-sm text-slate-600 truncate">
                    {image}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {['ACTIVE', 'INACTIVE', 'DRAFT'].map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'DRAFT' 
                    }))}
                    className="mr-2"
                  />
                  <Badge
                    variant={
                      status === 'ACTIVE' ? 'success' : 
                      status === 'INACTIVE' ? 'neutral' : 'warning'
                    }
                  >
                    {status}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  featured: e.target.checked 
                }))}
                className="rounded border-slate-300 text-slate-600"
              />
              <span className="text-sm font-medium text-slate-700">Featured Product</span>
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Show on homepage and featured sections
            </p>
          </div>

          <Input
            label="Sort Order"
            type="number"
            value={formData.sortOrder.toString()}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              sortOrder: parseInt(value) || 0 
            }))}
            placeholder="0"
            helperText="Lower numbers appear first"
          />
        </div>

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
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;