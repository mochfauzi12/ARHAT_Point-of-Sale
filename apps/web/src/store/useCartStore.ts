import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  sellingPrice: number | string;
  stockQuantity?: number | string;
  image?: string;
  imageUrl?: string;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number; // Support discount per item
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
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  
  // Hold & Resume
  holdTransaction: (note: string) => void;
  resumeTransaction: (id: string) => void;
  removeHeldTransaction: (id: string) => void;

  // Selectors
  getSubtotal: () => number;
  getTotalDiscount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  heldTransactions: [],
  
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity, discount: 0 }] };
    });
  },
  
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },
  
  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  updateDiscount: (productId, discount) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, discount } : item
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
      const price = typeof item.sellingPrice === 'string' ? parseFloat(item.sellingPrice) : item.sellingPrice;
      return total + (price * item.quantity);
    }, 0);
  },

  getTotalDiscount: () => {
    return get().items.reduce((total, item) => total + (item.discount * item.quantity), 0);
  }
}));
