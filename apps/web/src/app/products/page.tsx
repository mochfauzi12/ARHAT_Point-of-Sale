'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ProductBomModal } from '@/components/products/ProductBomModal';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [bomProduct, setBomProduct] = useState<any>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts('');
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async (data: any) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      alert(`Failed to save product: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openBomModal = (product: any) => {
    setBomProduct(product);
    setIsBomModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-slate-500 font-medium">Manage your store inventory and pricing.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-black hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
        {loading ? (
          <div className="text-center py-10 text-slate-500 font-medium animate-pulse">Loading products...</div>
        ) : (
          <ProductTable 
            products={products} 
            onEdit={openEditModal}
            onDelete={handleDelete}
            onManageBom={openBomModal}
          />
        )}
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
      />
      
      <ProductBomModal
        isOpen={isBomModalOpen}
        onClose={() => setIsBomModalOpen(false)}
        product={bomProduct}
      />
    </DashboardLayout>
  );
}
