'use client';
import React, { useState, useEffect } from 'react';
import { useCartStore, Product } from '@/store/useCartStore';
import { fetchProducts } from '@/lib/api';
import { ProductVariant, ProductModifier } from '@/store/useCartStore';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

import { Plus } from 'lucide-react';

const CATEGORIES = ['All', 'Coffee', 'Non-Coffee', 'Tea', 'Pastry'];

// Function to generate deterministic pastel gradient based on product name
const generateGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 70%, 85%), hsl(${h2}, 70%, 80%))`;
};

export function ProductGrid() {
  const { addItem } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedModifiers, setSelectedModifiers] = useState<ProductModifier[]>([]);

  // Global Barcode Scanner Listener
  useBarcodeScanner((barcode) => {
    const foundProduct = products.find(p => p.sku === barcode || p.barcode === barcode || p.id === barcode);
    if (foundProduct) {
      if ((foundProduct.variants && foundProduct.variants.length > 0) || (foundProduct.modifiers && foundProduct.modifiers.length > 0)) {
        // If product has variants, open modal
        setSelectedProduct(foundProduct);
        setSelectedVariant(foundProduct.variants?.[0]);
        setSelectedModifiers([]);
      } else {
        // Direct add to cart
        addItem(foundProduct);
      }
    }
  });

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const data = await fetchProducts('');
      setProducts(data);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  
  // Temporary client-side categorization since backend categories aren't fully implemented yet
  const getProductCategory = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('coffee') || lower.includes('kopi') || lower.includes('americano') || lower.includes('latte') || lower.includes('macchiato') || lower.includes('espresso')) return 'Coffee';
    if (lower.includes('tea') || lower.includes('teh') || lower.includes('matcha')) return 'Tea';
    if (lower.includes('croissant') || lower.includes('cake') || lower.includes('roti') || lower.includes('pastry')) return 'Pastry';
    return 'Non-Coffee';
  };

  const filteredProducts = selectedCategory === 'All' 
    ? safeProducts 
    : safeProducts.filter(p => getProductCategory(p.name) === selectedCategory);

  return (
    <div className="flex flex-col h-full relative">
      {/* Category Pills (Sticky - Touch Optimized) */}
      <div className="sticky top-0 z-10 -mx-6 px-6 pb-6 pt-2 bg-slate-50/80 backdrop-blur-xl overflow-x-auto hide-scrollbar scroll-smooth">
        <div className="flex flex-nowrap gap-3 p-2 bg-white/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-200/50 backdrop-blur-md rounded-[1.25rem] w-max">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-base font-bold px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white shadow-md scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 bg-white border border-slate-100 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold text-lg animate-pulse">Memuat Produk...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 pb-20">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => {
                if ((product.variants && product.variants.length > 0) || (product.modifiers && product.modifiers.length > 0)) {
                  setSelectedProduct(product);
                  setSelectedVariant(product.variants?.[0]);
                  setSelectedModifiers([]);
                } else {
                  addItem(product);
                }
              }}
              className="relative bg-white rounded-3xl shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(11,90,99,0.2)] border border-slate-100/80 transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden group aspect-[4/5] flex flex-col active:scale-95"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:') ? product.imageUrl : `http://localhost:8787${product.imageUrl}`}
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: generateGradient(product.name) }}>
                    <span className="text-6xl font-bold opacity-20 text-white group-hover:scale-125 transition-transform duration-700 ease-out">
                      {product.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Product Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex flex-col gap-2 transition-transform duration-500 group-hover:-translate-y-1">
                <p className="font-extrabold text-base md:text-xl leading-tight line-clamp-2 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {product.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-black text-teal-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-base md:text-lg bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    Rp {parseFloat(product.sellingPrice as string).toLocaleString('id-ID')}
                  </span>
                  {product.stockQuantity !== undefined && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border shadow-sm ${product.stockQuantity > 5 ? 'bg-white/20 text-white border-white/30' : 'bg-rose-500/80 text-white border-rose-400'}`}>
                      Stok: {product.stockQuantity}
                    </span>
                  )}
                </div>
              </div>

              {/* Floating Add Button */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
                <Plus size={24} strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variant & Modifier Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedProduct.name}</h2>
            <p className="text-teal-600 font-bold mb-6">
              Rp {parseFloat(selectedVariant?.price as string || selectedProduct.sellingPrice as string).toLocaleString('id-ID')}
            </p>

            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Pilih Varian (Wajib)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedProduct.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        selectedVariant?.id === v.id 
                          ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' 
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{v.name}</div>
                      <div className="text-sm text-teal-600">Rp {parseFloat(v.price as string).toLocaleString('id-ID')}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct.modifiers && selectedProduct.modifiers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Tambahan (Opsional)</h3>
                <div className="space-y-2">
                  {selectedProduct.modifiers.map(m => {
                    const isSelected = selectedModifiers.some(mod => mod.id === m.id);
                    return (
                      <label key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModifiers([...selectedModifiers, m]);
                              } else {
                                setSelectedModifiers(selectedModifiers.filter(mod => mod.id !== m.id));
                              }
                            }}
                          />
                          <span className="font-medium text-gray-700">{m.name}</span>
                        </div>
                        {parseFloat(m.price as string) > 0 && (
                          <span className="text-sm font-medium text-gray-500">+Rp {parseFloat(m.price as string).toLocaleString('id-ID')}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  addItem(selectedProduct, 1, selectedVariant, selectedModifiers);
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
