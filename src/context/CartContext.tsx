import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine, Branch } from '@/types';
import { MOCK_BRANCHES } from '@/services/api/mockData';

export interface CartItem {
  medicine: Medicine;
  branch: Branch;
  quantity: number;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  hasRxItems: boolean;
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  addToCart: (medicine: Medicine, quantity?: number, branch?: Branch, unitPrice?: number) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  removeFromCart: (medicineId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'medbazar_cart_v1';
const BRANCH_STORAGE_KEY = 'medbazar_branch_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBranch, setSelectedBranchState] = useState<Branch>(() => {
    try {
      const saved = localStorage.getItem(BRANCH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = MOCK_BRANCHES.find(b => b.id === parsed.id);
        if (match) return match;
      }
    } catch {
      // ignore
    }
    return MOCK_BRANCHES[0];
  });

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const setSelectedBranch = (branch: Branch) => {
    setSelectedBranchState(branch);
    try {
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branch));
    } catch {
      // ignore
    }
  };

  const addToCart = (medicine: Medicine, quantity = 1, branch?: Branch, unitPrice?: number) => {
    const targetBranch = branch || selectedBranch;
    const finalPrice = unitPrice !== undefined ? unitPrice : 32.50;

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.medicine.id === medicine.id);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
        return next;
      }
      return [
        ...prev,
        {
          medicine,
          branch: targetBranch,
          quantity,
          unitPrice: finalPrice,
        },
      ];
    });
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.medicine.id === medicineId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (medicineId: string) => {
    setItems((prev) => prev.filter((i) => i.medicine.id !== medicineId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const discount = subtotal > 150 ? 15 : 0;
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const hasRxItems = items.some((i) => i.medicine.prescriptionRequired);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        discount,
        deliveryFee,
        total,
        hasRxItems,
        selectedBranch,
        setSelectedBranch,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
