import { create } from 'zustand';
import { playBeep } from '@/lib/audio';

export interface ProductVariant {
  id: string;
  name: string;
  price: number | string;
}

export interface ProductModifier {
  id: string;
  name: string;
  price: number | string;
}

export interface Product {
  id: string;
  name: string;
  sellingPrice: number | string;
  stockQuantity?: number | string;
  image?: string;
  imageUrl?: string;
  category?: string;
  sku?: string;
  barcode?: string;
  variants?: ProductVariant[];
  modifiers?: ProductModifier[];
}

export interface CartItem extends Omit<Product, 'variants' | 'modifiers'> {
  cartItemId: string;
  quantity: number;
  discount: number;
  selectedVariant?: ProductVariant;
  selectedModifiers?: ProductModifier[];
  finalUnitPrice: number;
}

export interface HeldTransaction {
  id: string;
  note: string;
  items: CartItem[];
  timestamp: number;
}

interface CartState {
  items: CartItem[];
  heldTransactions: HeldTransaction[];
  globalDiscount: number;
  isTaxEnabled: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number, selectedVariant?: ProductVariant, selectedModifiers?: ProductModifier[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateDiscount: (cartItemId: string, discount: number) => void;
  clearCart: () => void;
  
  // Hold & Resume
  holdTransaction: (note: string) => void;
  resumeTransaction: (id: string) => void;
  removeHeldTransaction: (id: string) => void;

  // Selectors
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  
  // Global settings
  setGlobalDiscount: (discount: number) => void;
  setTaxEnabled: (enabled: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  heldTransactions: [],
  globalDiscount: 0,
  isTaxEnabled: true,
  
  addItem: (product, quantity = 1, selectedVariant, selectedModifiers = []) => {
    playBeep('success');
    set((state) => {
      const modifierIds = selectedModifiers.map(m => m.id).sort().join(',');
      const cartItemId = `${product.id}-${selectedVariant?.id || 'base'}-${modifierIds}`;
      
      const existingItem = state.items.find((item) => item.cartItemId === cartItemId);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      
      let finalUnitPrice = parseFloat(product.sellingPrice as string);
      if (selectedVariant) finalUnitPrice = parseFloat(selectedVariant.price as string);
      selectedModifiers.forEach(m => {
        finalUnitPrice += parseFloat(m.price as string);
      });

      const { variants, modifiers, ...baseProduct } = product;
      
      return { 
        items: [...state.items, { 
          ...baseProduct, 
          cartItemId,
          quantity, 
          discount: 0,
          selectedVariant,
          selectedModifiers,
          finalUnitPrice
        }] 
      };
    });
  },
  
  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
  },
  
  updateQuantity: (cartItemId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      ),
    }));
  },

  updateDiscount: (cartItemId, discount) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, discount } : item
      ),
    }));
  },
  
  clearCart: () => set({ items: [] }),

  holdTransaction: (note) => {
    const { items } = get();
    if (items.length === 0) return;
    
    set((state) => ({
      heldTransactions: [
        ...state.heldTransactions,
        { id: `hold_${Date.now()}`, note, items: [...state.items], timestamp: Date.now() }
      ],
      items: [] // clear current cart
    }));
  },

  resumeTransaction: (id) => {
    set((state) => {
      const held = state.heldTransactions.find(h => h.id === id);
      if (!held) return state;
      return {
        items: held.items,
        heldTransactions: state.heldTransactions.filter(h => h.id !== id)
      };
    });
  },

  removeHeldTransaction: (id) => {
    set((state) => ({
      heldTransactions: state.heldTransactions.filter(h => h.id !== id)
    }));
  },
  
  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      return total + (item.finalUnitPrice * item.quantity);
    }, 0);
  },

  getTotalDiscount: () => {
    const itemsDiscount = get().items.reduce((total, item) => total + (item.discount * item.quantity), 0);
    return itemsDiscount + get().globalDiscount;
  },
  
  setGlobalDiscount: (discount) => set({ globalDiscount: discount }),
  setTaxEnabled: (enabled) => set({ isTaxEnabled: enabled })
}));
