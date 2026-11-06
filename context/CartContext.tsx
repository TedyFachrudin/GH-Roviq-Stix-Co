'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Product } from '@/types';
import { PRODUCTS } from '@/lib/products-data';

// Default starter cart matching mockups (Keranjang Belanja.svg & Checkout.svg)
export const DEFAULT_INITIAL_CART: CartItem[] = [];

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, selectedOption?: 'Panas' | 'Dingin') => void;
  updateQuantity: (productId: string, delta: number, selectedOption?: 'Panas' | 'Dingin') => void;
  removeItem: (productId: string, selectedOption?: 'Panas' | 'Dingin') => void;
  clearCart: () => void;
  resetDefaultCart: () => void;
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  deleteConfirmItem: CartItem | null;
  requestDeleteItem: (item: CartItem) => void;
  cancelDeleteItem: () => void;
  confirmDeleteItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CartItem | null>(null);
  const isInitialized = useRef(false);

  // Load cart from localStorage (defaults to empty [] for new visitors)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gh_roviq_cart');
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // If stored cart contains old dummy starter items, purge it to empty
          const isDummyStarter =
            parsed.length === 3 &&
            parsed.some((i) => i.product?.id === 'v60-artisan') &&
            parsed.some((i) => i.product?.id === 'signature-aren-latte');
          if (isDummyStarter) {
            setItems([]);
            localStorage.setItem('gh_roviq_cart', JSON.stringify([]));
          } else {
            setItems(parsed);
          }
        }
      } else {
        // Brand new visitor starts with clean empty cart
        setItems([]);
        localStorage.setItem('gh_roviq_cart', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    } finally {
      isInitialized.current = true;
    }
  }, []);

  // Sync to localStorage ONLY after initial hydration is complete
  useEffect(() => {
    if (!isInitialized.current) return;
    try {
      localStorage.setItem('gh_roviq_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to sync cart to localStorage:', e);
    }
  }, [items]);

  const addItem = (product: Product, selectedOption?: 'Panas' | 'Dingin') => {
    const defaultOption =
      selectedOption || (product.temperatureOptions ? product.temperatureOptions[0] : undefined);

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedOption === defaultOption
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      }

      return [...prev, { product, quantity: 1, selectedOption: defaultOption }];
    });
  };

  const requestDeleteItem = (item: CartItem) => {
    setDeleteConfirmItem(item);
  };

  const cancelDeleteItem = () => {
    setDeleteConfirmItem(null);
  };

  const confirmDeleteItem = () => {
    if (!deleteConfirmItem) return;
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.product.id === deleteConfirmItem.product.id &&
            i.selectedOption === deleteConfirmItem.selectedOption
          )
      )
    );
    setDeleteConfirmItem(null);
  };

  const removeItem = (productId: string, selectedOption?: 'Panas' | 'Dingin') => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.selectedOption === selectedOption))
    );
  };

  const updateQuantity = (
    productId: string,
    delta: number,
    selectedOption?: 'Panas' | 'Dingin'
  ) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === productId && i.selectedOption === selectedOption
      );

      if (!existing) return prev;

      // If quantity is 1 and user clicks - (delta = -1), trigger deletion confirmation modal
      if (existing.quantity === 1 && delta === -1) {
        requestDeleteItem(existing);
        return prev;
      }

      return prev.map((item) => {
        if (item.product.id === productId && item.selectedOption === selectedOption) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const resetDefaultCart = () => {
    setItems([]);
    try {
      localStorage.setItem('gh_roviq_cart', JSON.stringify([]));
    } catch {}
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        resetDefaultCart,
        totalItems,
        subtotal,
        isDrawerOpen,
        setIsDrawerOpen,
        deleteConfirmItem,
        requestDeleteItem,
        cancelDeleteItem,
        confirmDeleteItem,
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
