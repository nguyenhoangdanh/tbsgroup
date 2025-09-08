import React, { useState } from 'react';
import { MultilingualContent } from '@/lib/utils/multilingual';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Category {
  id: string;
  name: MultilingualContent;
  slug: string;
  description?: MultilingualContent;
  thumbnail?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

interface CategoryFormData {
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
  thumbnail?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  sortOrder: number;
}

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  locale: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
  locale
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: {
      vi: category?.name?.vi || '',
      en: category?.name?.en || '',
      id: category?.name?.id || '',
    },
    slug: category?.slug || '',
    description: {
      vi: category?.description?.vi || '',
      en: category?.description?.en || '',
      id: category?.description?.id || '',
    },
    thumbnail: category?.thumbnail || '',
    status: category?.status || 'ACTIVE',
    sortOrder: category?.sortOrder || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      ...(lang === 'vi' && !category && { slug: generateSlug(value) })
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

    // Validate thumbnail URL
    if (formData.thumbnail && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.thumbnail)) {
      newErrors.thumbnail = 'Please enter a valid image URL';
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
        thumbnail: '',
        status: 'ACTIVE',
        sortOrder: 0,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={category ? 'Edit Category' : 'Create Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Category Name *</h4>
          
          <Input
            label="Vietnamese"
            value={formData.name.vi}
            onChange={(value) => handleNameChange('vi', value)}
            error={errors['name.vi']}
            placeholder="Tên danh mục tiếng Việt"
            required
          />
          
          <Input
            label="English"
            value={formData.name.en}
            onChange={(value) => handleNameChange('en', value)}
            error={errors['name.en']}
            placeholder="Category name in English"
            required
          />
          
          <Input
            label="Indonesian"
            value={formData.name.id}
            onChange={(value) => handleNameChange('id', value)}
            error={errors['name.id']}
            placeholder="Nama kategori dalam bahasa Indonesia"
            required
          />
        </div>

        {/* Slug and Thumbnail */}
        <div className="space-y-4">
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(value) => setFormData(prev => ({ ...prev, slug: value }))}
            error={errors.slug}
            placeholder="category-slug"
            helperText="URL-friendly identifier"
            required
          />

          <Input
            label="Thumbnail Image URL"
            value={formData.thumbnail}
            onChange={(value) => setFormData(prev => ({ ...prev, thumbnail: value }))}
            error={errors.thumbnail}
            placeholder="https://example.com/image.jpg"
            helperText="Optional: URL to category thumbnail image"
          />
          
          {/* Image preview */}
          {formData.thumbnail && (
            <div className="mt-2">
              <img
                src={formData.thumbnail}
                alt="Category thumbnail preview"
                className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900">Description</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Vietnamese
              </label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={formData.description?.vi || ''}
                onChange={(e) => handleDescriptionChange('vi', e.target.value)}
                placeholder="Mô tả danh mục tiếng Việt"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                English
              </label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={formData.description?.en || ''}
                onChange={(e) => handleDescriptionChange('en', e.target.value)}
                placeholder="Category description in English"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Indonesian
              </label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={formData.description?.id || ''}
                onChange={(e) => handleDescriptionChange('id', e.target.value)}
                placeholder="Deskripsi kategori dalam bahasa Indonesia"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Status and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryForm;