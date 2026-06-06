'use client';
import React, { useState, useEffect } from 'react';
import { useCartStore, Product } from '@/store/useCartStore';
import { fetchProducts } from '@/lib/api';
import { ProductVariant, ProductModifier } from '@/store/useCartStore';

const CATEGORIES = ['All', 'Coffee', 'Non-Coffee', 'Tea', 'Pastry'];

export function ProductGrid() {
  const { addItem } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedModifiers, setSelectedModifiers] = useState<ProductModifier[]>([]);

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
  const filteredProducts = selectedCategory === 'All' 
    ? safeProducts 
    : safeProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100/80 backdrop-blur-sm rounded-full w-fit">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-gray-400">Loading products...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
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
              className="relative bg-gray-50 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-400 hover:-translate-y-1.5 cursor-pointer overflow-hidden group aspect-[4/5] flex flex-col"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:') ? product.imageUrl : `http://localhost:8787${product.imageUrl}`}
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <span className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-700 ease-out">☕</span>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="absolute bottom-2 left-2 right-2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col gap-1 transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/30 group-hover:translate-y-0">
                <p className="font-semibold text-sm leading-tight line-clamp-2 text-white drop-shadow-md">
                  {product.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-white drop-shadow-md text-sm">
                    Rp {parseFloat(product.sellingPrice as string).toLocaleString('id-ID')}
                  </span>
                  {product.stockQuantity !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white/20 text-white rounded-full backdrop-blur-md shadow-sm">
                      {product.stockQuantity}
                    </span>
                  )}
                </div>
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
