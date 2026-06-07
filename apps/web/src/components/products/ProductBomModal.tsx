import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Package } from 'lucide-react';
import { fetchRawMaterials, fetchProductBoms, updateProductBoms } from '@/lib/api';

interface ProductBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export function ProductBomModal({ isOpen, onClose, product }: ProductBomModalProps) {
  const [boms, setBoms] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      loadData();
    }
  }, [isOpen, product]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [materialsRes, bomsRes] = await Promise.all([
        fetchRawMaterials(),
        fetchProductBoms(product.id)
      ]);
      setRawMaterials(materialsRes);
      
      // Transform BOMs to match state structure
      setBoms(bomsRes.map((b: any) => ({
        rawMaterialId: b.rawMaterialId,
        quantity: b.quantity,
        name: b.rawMaterial.name,
        unit: b.rawMaterial.unit
      })));
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleAddIngredient = () => {
    if (rawMaterials.length === 0) return;
    
    // Default to first material
    const mat = rawMaterials[0];
    setBoms([...boms, { rawMaterialId: mat.id, quantity: '1', name: mat.name, unit: mat.unit }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newBoms = [...boms];
    newBoms.splice(index, 1);
    setBoms(newBoms);
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newBoms = [...boms];
    if (field === 'rawMaterialId') {
      const selected = rawMaterials.find(m => m.id === value);
      if (selected) {
        newBoms[index].rawMaterialId = selected.id;
        newBoms[index].name = selected.name;
        newBoms[index].unit = selected.unit;
      }
    } else {
      newBoms[index][field] = value;
    }
    setBoms(newBoms);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProductBoms(product.id, boms.map(b => ({
        rawMaterialId: b.rawMaterialId,
        quantity: b.quantity
      })));
      onClose();
    } catch (err) {
      alert('Failed to save composition');
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Komposisi / Resep</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Produk: <span className="text-teal-600 font-bold">{product?.name}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 animate-pulse">Memuat data bahan baku...</div>
          ) : rawMaterials.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
              <Package size={48} className="mb-4 opacity-30" />
              <p className="font-semibold text-lg text-slate-700">Data Master Bahan Baku Kosong</p>
              <p className="text-sm">Silakan tambah bahan baku terlebih dahulu di menu "Bahan Baku & Komposisi".</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                <p className="text-sm text-blue-800 font-medium">
                  Atur bahan baku apa saja yang akan terpotong secara otomatis ketika produk ini terjual.
                </p>
              </div>

              {boms.map((bom, index) => (
                <div key={index} className="flex gap-3 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Bahan Baku</label>
                    <select 
                      value={bom.rawMaterialId}
                      onChange={(e) => handleIngredientChange(index, 'rawMaterialId', e.target.value)}
                      className="w-full border-slate-200 bg-white rounded-xl focus:ring-teal-500 focus:border-teal-500 font-medium"
                    >
                      {rawMaterials.map(rm => (
                        <option key={rm.id} value={rm.id}>{rm.name} (Stok: {rm.stockQuantity} {rm.unit})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-32">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Takaran</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        min="0.01"
                        value={bom.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        className="w-full border-slate-200 bg-white rounded-xl focus:ring-teal-500 focus:border-teal-500 font-medium pr-10"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-sm font-semibold">
                        {bom.unit}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRemoveIngredient(index)}
                    className="mt-6 p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}

              <button 
                onClick={handleAddIngredient}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-semibold flex items-center justify-center gap-2 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all"
              >
                <Plus size={20} /> Tambah Komposisi
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-3xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
            disabled={isSaving}
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || rawMaterials.length === 0}
            className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? 'Menyimpan...' : 'Simpan Komposisi'}
          </button>
        </div>

      </div>
    </div>
  );
}
