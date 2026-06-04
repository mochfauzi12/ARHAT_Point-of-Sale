import React, { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export function ProductFormModal({ isOpen, onClose, onSave, initialData }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    imageUrl: '',
    isActive: true,
  });
  
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || '',
        price: initialData.price || 0,
        cost: initialData.cost || 0,
        stock: initialData.stock || 0,
        imageUrl: initialData.imageUrl || '',
        isActive: initialData.isActive ?? true,
      });
      setImageMode(initialData.imageUrl?.startsWith('data:') ? 'upload' : 'url');
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        price: 0,
        cost: 0,
        stock: 0,
        imageUrl: '',
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="flex gap-4 mb-4">
                <button 
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors ${imageMode === 'url' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <LinkIcon size={16} /> Image URL
                </button>
                <button 
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors ${imageMode === 'upload' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Upload size={16} /> Upload File
                </button>
              </div>

              {imageMode === 'url' ? (
                <input 
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload size={32} className="text-gray-400 mb-3" />
                    <span className="font-medium text-gray-700">Click to upload an image</span>
                    <span className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                  </label>
                </div>
              )}

              {formData.imageUrl && (
                <div className="mt-4 w-32 h-32 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input 
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                  placeholder="e.g. Avocado Toast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input 
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                  placeholder="e.g. AVO-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input 
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                  placeholder="e.g. Food"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (Selling) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input 
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost (Buying)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input 
                    type="number"
                    name="cost"
                    min="0"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input 
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer mt-7">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only" 
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-black' : 'bg-gray-200'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="font-medium text-gray-700">Active Status</span>
                </label>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            form="product-form"
            type="submit"
            className="px-6 py-3 rounded-xl font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
          >
            {initialData ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
