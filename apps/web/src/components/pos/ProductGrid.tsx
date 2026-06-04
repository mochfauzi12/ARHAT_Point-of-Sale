'use client';
import React, { useState, useEffect } from 'react';
import { useCartStore, Product } from '@/store/useCartStore';
import { fetchProducts } from '@/lib/api';

const CATEGORIES = ['All', 'Coffee', 'Non-Coffee', 'Tea', 'Pastry'];

export function ProductGrid() {
  const { addItem } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const data = await fetchProducts('');
      setProducts(data);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory); // Currently category might be null in DB

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`text-sm font-medium px-4 py-2 rounded-xl border transition-all ${
              selectedCategory === category
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
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
              onClick={() => addItem(product)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3 group"
            >
              <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                <span className="text-4xl">☕</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {product.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-500">
                    Stock: {product.stockQuantity || 0}
                  </span>
                  <span className="font-bold text-black">
                    Rp {parseFloat(product.sellingPrice as string).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
