import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { z } from 'zod';

// Category validation schema
const categorySchema = z.object({
  name: z.object({
    vi: z.string().min(1, 'Vietnamese name is required'),
    en: z.string().min(1, 'English name is required'),
    id: z.string().min(1, 'Indonesian name is required'),
  }),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.object({
    vi: z.string().optional(),
    en: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  thumbnail: z.string().url().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  sortOrder: z.number().min(0, 'Sort order must be >= 0'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: {
    vi: string;
    en: string;
    id: string;
  };
  slug: string;
  description?: {
    vi?: string;
    en?: string;
    id?: string;
  };
  thumbnail?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  sortOrder: number;
  createdAt: string;
  _count?: {
    products: number;
  };
}

interface EditCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoryModal({ 
  category,
  isOpen, 
  onClose, 
  onSuccess 
}: EditCategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: { vi: '', en: '', id: '' },
    slug: '',
    description: { vi: '', en: '', id: '' },
    thumbnail: '',
    status: 'ACTIVE',
    sortOrder: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || { vi: '', en: '', id: '' },
        thumbnail: category.thumbnail || '',
        status: category.status,
        sortOrder: category.sortOrder,
      });
    }
  }, [category]);

  // Auto-generate slug from Vietnamese name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleNameChange = (lang: 'vi' | 'en' | 'id', value: string) => {
    setFormData(prev => ({
      ...prev,
      name: { ...prev.name, [lang]: value },
      // Auto-generate slug from Vietnamese name
      ...(lang === 'vi' && { slug: generateSlug(value) })
    }));
    
    // Clear name errors
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
      description: { ...prev.description, [lang]: value }
    }));
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
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
      categorySchema.parse(formData);
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
    
    if (!category || !validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
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

  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Category"
      description={`Update details for "${category.name.en}"`}
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

        {/* Product Count Warning */}
        {category._count && category._count.products > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm"
          >
            <p className="font-medium">⚠️ This category has {category._count.products} products</p>
            <p>Changes to this category will affect all associated products.</p>
          </motion.div>
        )}

        {/* Multi-language Names */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Category Names (Multi-language)</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Vietnamese Name *"
              value={formData.name.vi}
              onChange={(value) => handleNameChange('vi', value)}
              error={errors['name.vi']}
              placeholder="Tên danh mục (Tiếng Việt)"
              required
            />
            
            <Input
              label="English Name *"
              value={formData.name.en}
              onChange={(value) => handleNameChange('en', value)}
              error={errors['name.en']}
              placeholder="Category name (English)"
              required
            />
            
            <Input
              label="Indonesian Name *"
              value={formData.name.id}
              onChange={(value) => handleNameChange('id', value)}
              error={errors['name.id']}
              placeholder="Nama kategori (Bahasa Indonesia)"
              required
            />
          </div>
        </div>

        {/* Slug */}
        <Input
          label="URL Slug *"
          value={formData.slug}
          onChange={(value) => handleInputChange('slug', value)}
          error={errors.slug}
          placeholder="category-url-slug"
          helperText="Use lowercase letters, numbers, and hyphens only."
          required
        />

        {/* Multi-language Descriptions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Descriptions (Optional)</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">Vietnamese Description</label>
              <textarea
                value={formData.description?.vi || ''}
                onChange={(e) => handleDescriptionChange('vi', e.target.value)}
                className="textarea"
                rows={3}
                placeholder="Mô tả danh mục (Tiếng Việt)"
              />
            </div>
            
            <div>
              <label className="label">English Description</label>
              <textarea
                value={formData.description?.en || ''}
                onChange={(e) => handleDescriptionChange('en', e.target.value)}
                className="textarea"
                rows={3}
                placeholder="Category description (English)"
              />
            </div>
            
            <div>
              <label className="label">Indonesian Description</label>
              <textarea
                value={formData.description?.id || ''}
                onChange={(e) => handleDescriptionChange('id', e.target.value)}
                className="textarea"
                rows={3}
                placeholder="Deskripsi kategori (Bahasa Indonesia)"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail URL */}
        <Input
          label="Thumbnail URL"
          type="url"
          value={formData.thumbnail}
          onChange={(value) => handleInputChange('thumbnail', value)}
          error={errors.thumbnail}
          placeholder="https://example.com/image.jpg"
          helperText="Optional thumbnail image URL"
        />

        {/* Status and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="DRAFT">Draft</option>
            </select>
            {errors.status && <p className="error-text">{errors.status}</p>}
          </div>
          
          <Input
            label="Sort Order *"
            type="number"
            value={formData.sortOrder.toString()}
            onChange={(value) => handleInputChange('sortOrder', parseInt(value) || 0)}
            error={errors.sortOrder}
            placeholder="0"
            helperText="Lower numbers appear first"
            required
          />
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
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}