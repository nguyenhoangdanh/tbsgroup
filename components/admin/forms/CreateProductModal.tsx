import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { z } from 'zod';

// Product validation schema
const productSchema = z.object({
  name: z.object({
    vi: z.string().min(1, 'Vietnamese name is required'),
    en: z.string().min(1, 'English name is required'),
    id: z.string().min(1, 'Indonesian name is required'),
  }),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  categoryId: z.string().min(1, 'Category is required'),
  shortDesc: z.object({
    vi: z.string().optional(),
    en: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  description: z.object({
    vi: z.string().optional(),
    en: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).max(10, 'Maximum 10 images allowed'),
  specifications: z.record(z.any()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  featured: z.boolean(),
  sortOrder: z.number().min(0, 'Sort order must be >= 0'),
  seoTitle: z.object({
    vi: z.string().optional(),
    en: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  seoDesc: z.object({
    vi: z.string().optional(),
    en: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: {
    vi: string;
    en: string;
    id: string;
  };
  status: string;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Product name, category, and descriptions' },
  { id: 2, title: 'Pricing & Images', description: 'Pricing, images, and featured status' },
  { id: 3, title: 'SEO & Specifications', description: 'SEO settings and product specifications' },
];

export default function CreateProductModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: { vi: '', en: '', id: '' },
    slug: '',
    categoryId: '',
    shortDesc: { vi: '', en: '', id: '' },
    description: { vi: '', en: '', id: '' },
    price: undefined,
    originalPrice: undefined,
    images: [],
    specifications: {},
    status: 'ACTIVE',
    featured: false,
    sortOrder: 0,
    seoTitle: { vi: '', en: '', id: '' },
    seoDesc: { vi: '', en: '', id: '' },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imageInputs, setImageInputs] = useState(['']);

  // Load categories when modal opens
  React.useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/admin/categories?status=ACTIVE&pageSize=100');
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

  const handleDescriptionChange = (field: 'shortDesc' | 'description' | 'seoTitle' | 'seoDesc', lang: 'vi' | 'en' | 'id', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value }
    }));
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
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

  const addImageInput = () => {
    if (imageInputs.length < 10) {
      setImageInputs(prev => [...prev, '']);
    }
  };

  const removeImageInput = (index: number) => {
    if (imageInputs.length > 1) {
      setImageInputs(prev => prev.filter((_, i) => i !== index));
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    setImageInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });

    setFormData(prev => {
      const newImages = [...prev.images];
      if (value.trim()) {
        newImages[index] = value.trim();
      } else {
        newImages.splice(index, 1);
      }
      return { ...prev, images: newImages.filter(Boolean) };
    });
  };

  const validateCurrentStep = () => {
    const stepSchemas = {
      1: z.object({
        name: productSchema.shape.name,
        slug: productSchema.shape.slug,
        categoryId: productSchema.shape.categoryId,
      }),
      2: z.object({
        price: productSchema.shape.price,
        originalPrice: productSchema.shape.originalPrice,
        images: productSchema.shape.images,
        featured: productSchema.shape.featured,
      }),
      3: z.object({
        status: productSchema.shape.status,
        sortOrder: productSchema.shape.sortOrder,
      }),
    };

    try {
      stepSchemas[currentStep as keyof typeof stepSchemas].parse(formData);
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

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const validateForm = () => {
    try {
      productSchema.parse(formData);
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Go back to the step with errors
      const errorFields = Object.keys(errors);
      if (errorFields.some(field => ['name', 'slug', 'categoryId'].includes(field.split('.')[0]))) {
        setCurrentStep(1);
      } else if (errorFields.some(field => ['price', 'originalPrice', 'images', 'featured'].includes(field))) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      // Reset form
      setFormData({
        name: { vi: '', en: '', id: '' },
        slug: '',
        categoryId: '',
        shortDesc: { vi: '', en: '', id: '' },
        description: { vi: '', en: '', id: '' },
        price: undefined,
        originalPrice: undefined,
        images: [],
        specifications: {},
        status: 'ACTIVE',
        featured: false,
        sortOrder: 0,
        seoTitle: { vi: '', en: '', id: '' },
        seoDesc: { vi: '', en: '', id: '' },
      });
      setCurrentStep(1);
      setImageInputs(['']);
      
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
      setCurrentStep(1);
      onClose();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Multi-language Names */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900">Product Names (Multi-language) *</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Vietnamese Name *"
                  value={formData.name.vi}
                  onChange={(value) => handleNameChange('vi', value)}
                  error={errors['name.vi']}
                  placeholder="Tên sản phẩm (Tiếng Việt)"
                  required
                />
                
                <Input
                  label="English Name *"
                  value={formData.name.en}
                  onChange={(value) => handleNameChange('en', value)}
                  error={errors['name.en']}
                  placeholder="Product name (English)"
                  required
                />
                
                <Input
                  label="Indonesian Name *"
                  value={formData.name.id}
                  onChange={(value) => handleNameChange('id', value)}
                  error={errors['name.id']}
                  placeholder="Nama produk (Bahasa Indonesia)"
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
              placeholder="product-url-slug"
              helperText="Auto-generated from Vietnamese name. Use lowercase letters, numbers, and hyphens only."
              required
            />

            {/* Category */}
            <div>
              <label className="label">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="input"
                required
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name.en} ({category.name.vi})
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="error-text">{errors.categoryId}</p>}
              {loadingCategories && <p className="helper-text">Loading categories...</p>}
            </div>

            {/* Short Descriptions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900">Short Descriptions (Optional)</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Vietnamese Short Description</label>
                  <textarea
                    value={formData.shortDesc?.vi || ''}
                    onChange={(e) => handleDescriptionChange('shortDesc', 'vi', e.target.value)}
                    className="textarea"
                    rows={2}
                    placeholder="Mô tả ngắn (Tiếng Việt)"
                  />
                </div>
                
                <div>
                  <label className="label">English Short Description</label>
                  <textarea
                    value={formData.shortDesc?.en || ''}
                    onChange={(e) => handleDescriptionChange('shortDesc', 'en', e.target.value)}
                    className="textarea"
                    rows={2}
                    placeholder="Short description (English)"
                  />
                </div>
                
                <div>
                  <label className="label">Indonesian Short Description</label>
                  <textarea
                    value={formData.shortDesc?.id || ''}
                    onChange={(e) => handleDescriptionChange('shortDesc', 'id', e.target.value)}
                    className="textarea"
                    rows={2}
                    placeholder="Deskripsi singkat (Bahasa Indonesia)"
                  />
                </div>
              </div>
            </div>

            {/* Full Descriptions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900">Full Descriptions (Optional)</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Vietnamese Description</label>
                  <textarea
                    value={formData.description?.vi || ''}
                    onChange={(e) => handleDescriptionChange('description', 'vi', e.target.value)}
                    className="textarea"
                    rows={4}
                    placeholder="Mô tả chi tiết (Tiếng Việt)"
                  />
                </div>
                
                <div>
                  <label className="label">English Description</label>
                  <textarea
                    value={formData.description?.en || ''}
                    onChange={(e) => handleDescriptionChange('description', 'en', e.target.value)}
                    className="textarea"
                    rows={4}
                    placeholder="Detailed description (English)"
                  />
                </div>
                
                <div>
                  <label className="label">Indonesian Description</label>
                  <textarea
                    value={formData.description?.id || ''}
                    onChange={(e) => handleDescriptionChange('description', 'id', e.target.value)}
                    className="textarea"
                    rows={4}
                    placeholder="Deskripsi detail (Bahasa Indonesia)"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                value={formData.price?.toString() || ''}
                onChange={(value) => handleInputChange('price', value ? parseFloat(value) : undefined)}
                error={errors.price}
                placeholder="0.00"
                helperText="Leave empty if price varies"
              />
              
              <Input
                label="Original Price (for discounts)"
                type="number"
                value={formData.originalPrice?.toString() || ''}
                onChange={(value) => handleInputChange('originalPrice', value ? parseFloat(value) : undefined)}
                error={errors.originalPrice}
                placeholder="0.00"
                helperText="Optional: Original price before discount"
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-900">Product Images</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addImageInput}
                  disabled={imageInputs.length >= 10}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Add Image
                </Button>
              </div>
              
              <div className="space-y-3">
                {imageInputs.map((imageUrl, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        label={`Image ${index + 1} URL`}
                        type="url"
                        value={imageUrl}
                        onChange={(value) => handleImageChange(index, value)}
                        placeholder="https://example.com/image.jpg"
                        error={errors.images && index === 0 ? errors.images : undefined}
                      />
                    </div>
                    
                    {imageInputs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImageInput(index)}
                        className="text-red-600 hover:bg-red-50 mt-6"
                        icon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Image Preview:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.slice(0, 6).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                  {formData.images.length > 6 && (
                    <p className="text-xs text-slate-500 mt-1">
                      +{formData.images.length - 6} more images
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-xs text-slate-500">
                Maximum 10 images. First image will be the main product image.
              </p>
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                Featured Product
              </label>
              <p className="text-xs text-slate-500 ml-2">
                (Featured products appear on homepage)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* SEO Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900">SEO Settings (Optional)</h4>
              
              {/* SEO Titles */}
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Vietnamese SEO Title"
                  value={formData.seoTitle?.vi || ''}
                  onChange={(value) => handleDescriptionChange('seoTitle', 'vi', value)}
                  placeholder="Tiêu đề SEO (Tiếng Việt)"
                  helperText="Recommended: 50-60 characters"
                />
                
                <Input
                  label="English SEO Title"
                  value={formData.seoTitle?.en || ''}
                  onChange={(value) => handleDescriptionChange('seoTitle', 'en', value)}
                  placeholder="SEO title (English)"
                  helperText="Recommended: 50-60 characters"
                />
                
                <Input
                  label="Indonesian SEO Title"
                  value={formData.seoTitle?.id || ''}
                  onChange={(value) => handleDescriptionChange('seoTitle', 'id', value)}
                  placeholder="Judul SEO (Bahasa Indonesia)"
                  helperText="Recommended: 50-60 characters"
                />
              </div>

              {/* SEO Descriptions */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Vietnamese SEO Description</label>
                  <textarea
                    value={formData.seoDesc?.vi || ''}
                    onChange={(e) => handleDescriptionChange('seoDesc', 'vi', e.target.value)}
                    className="textarea"
                    rows={2}
                    placeholder="Mô tả SEO (Tiếng Việt)"
                  />
                  <p className="helper-text">Recommended: 150-160 characters</p>
                </div>
                
                <div>
                  <label className="label">English SEO Description</label>
                  <textarea
                    value={formData.seoDesc?.en || ''}
                    onChange={(e) => handleDescriptionChange('seoDesc', 'en', e.target.value)}
                    className="textarea"
                    rows={2}
                    placeholder="SEO description (English)"
                  />
                  <p className="helper-text">Recommended: 150-160 characters</p>
                </div>
                
                <div>
                  <label className="label">Indonesian SEO Description</label>
                  <textarea
                    value={formData.seoDesc?.id || ''}
                    onChange={(e) => handleDescriptionChange('seoDesc', 'id', e.target.value)}
                    className="textarea"
                    rows={2}
                    placeholder="Deskripsi SEO (Bahasa Indonesia)"
                  />
                  <p className="helper-text">Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900">Product Specifications (Optional)</h4>
              <div>
                <label className="label">Specifications (JSON format)</label>
                <textarea
                  value={JSON.stringify(formData.specifications, null, 2)}
                  onChange={(e) => {
                    try {
                      const specs = JSON.parse(e.target.value);
                      handleInputChange('specifications', specs);
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="textarea font-mono text-xs"
                  rows={6}
                  placeholder={`{
  "material": "Genuine Leather",
  "dimensions": "30cm x 20cm x 10cm",
  "weight": "0.8kg",
  "color": "Black",
  "closure": "Zipper"
}`}
                />
                <p className="helper-text">Enter product specifications in JSON format</p>
              </div>
            </div>

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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Create New Product - Step ${currentStep} of 3`}
      description={STEPS[currentStep - 1].description}
      size="xl"
    >
      <div className="space-y-6">
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

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                currentStep > step.id
                  ? 'bg-green-600 text-white'
                  : currentStep === step.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
              
              {index < STEPS.length - 1 && (
                <div className={`ml-4 w-12 h-0.5 transition-colors ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePrevious}
            disabled={isLoading}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          <div className="space-x-3">
            {currentStep < 3 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isLoading}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}