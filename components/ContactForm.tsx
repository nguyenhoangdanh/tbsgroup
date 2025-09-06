'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MotionFadeIn } from './MotionFadeIn';

interface UploadedFile {
  file: File;
  preview: string;
  uploaded: boolean;
  publicUrl?: string;
}

export function ContactForm() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    email: '',
    content: '',
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        continue;
      }
      
      // Check total files limit
      if (files.length + newFiles.length >= 5) {
        setError('Maximum 5 files allowed');
        break;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    // Get presigned URLs
    const uploadRequest = {
      files: files.map(f => ({
        filename: f.file.name,
        contentType: f.file.type,
      }))
    };

    const response = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uploadRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URLs');
    }

    const { uploads } = await response.json();

    // Upload files to R2
    const uploadPromises = files.map(async (file, index) => {
      const upload = uploads[index];
      const uploadResponse = await fetch(upload.url, {
        method: 'PUT',
        body: file.file,
        headers: {
          'Content-Type': file.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${file.file.name}`);
      }

      return upload.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate form
      if (!formData.email || !formData.content) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.content.length < 10) {
        throw new Error('Content must be at least 10 characters');
      }

      // Upload files first
      const imageUrls = await uploadFiles();

      // Submit inquiry
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          content: formData.content,
          imageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit inquiry');
      }

      setIsSuccess(true);
      setFormData({ email: '', content: '' });
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <MotionFadeIn>
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6"
          >
            ✓
          </motion.div>
          <h3 className="text-2xl font-bold text-brand-primary mb-4">
            {t('success.title')}
          </h3>
          <p className="text-gray-600 mb-8">
            {t('success.message')}
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="btn-secondary"
          >
            Send Another Message
          </button>
        </div>
      </MotionFadeIn>
    );
  }

  return (
    <MotionFadeIn>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="input"
            placeholder="your@email.com"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.content')} *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={6}
            className="textarea"
            placeholder={t('description')}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.content.length}/2000 characters
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.images')}
          </label>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? 'border-brand-accent bg-brand-accent/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-sm text-gray-600">
                  {t('form.dragDrop')}
                </div>
                <div className="text-xs text-gray-500">
                  {t('form.maxFiles')}
                </div>
              </div>
            </label>
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={file.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? t('form.sending') : t('form.submit')}
        </motion.button>
      </form>
    </MotionFadeIn>
  );
}