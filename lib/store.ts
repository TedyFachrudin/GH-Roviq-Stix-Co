import { Product, OrderDetails, CategoryType } from '@/types';
import { PRODUCTS } from './products-data';

const PRODUCTS_KEY = 'gh_roviq_products_v2';
const UNAVAILABLE_PRODUCTS_KEY = 'gh_roviq_unavailable_products_v2';
const ORDERS_KEY = 'gh_roviq_global_orders_v2';

/* =========================================================
   PRODUCTS MANAGEMENT
   ========================================================= */

/**
 * Returns products from localStorage. Default is empty array [] as requested.
 */
export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return PRODUCTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

/**
 * Saves products to localStorage and notifies other components.
 */
export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('gh_products_updated'));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

/**
 * Resets/Clears all products to 0 items.
 */
export function clearStoredProducts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('gh_products_updated'));
  } catch (e) {
    console.error('Failed to clear products:', e);
  }
}

/**
 * Add a new product to catalog
 */
export function addProduct(product: Product): Product {
  const current = getStoredProducts();
  const updated = [product, ...current];
  saveStoredProducts(updated);
  return product;
}

/**
 * Update an existing product
 */
export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const current = getStoredProducts();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProduct = { ...current[index], ...updates };
  current[index] = updatedProduct;
  saveStoredProducts([...current]);
  return updatedProduct;
}

/**
 * Delete a product from catalog
 */
export function deleteProduct(id: string): boolean {
  const current = getStoredProducts();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredProducts(filtered);
  return true;
}

/**
 * Check if a product is marked as in-stock
 */
export function isProductAvailable(id: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(UNAVAILABLE_PRODUCTS_KEY);
    if (!raw) return true;
    const unavailableList: string[] = JSON.parse(raw);
    return !unavailableList.includes(id);
  } catch {
    return true;
  }
}

/**
 * Toggle product stock availability ('Tersedia' / 'Habis')
 */
export function setProductAvailability(id: string, available: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(UNAVAILABLE_PRODUCTS_KEY);
    const unavailableList: string[] = raw ? JSON.parse(raw) : [];
    let updated: string[];

    if (available) {
      updated = unavailableList.filter((item) => item !== id);
    } else {
      updated = Array.from(new Set([...unavailableList, id]));
    }

    localStorage.setItem(UNAVAILABLE_PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gh_products_updated'));
  } catch (e) {
    console.error('Failed to toggle stock availability:', e);
  }
}

/* =========================================================
   ORDERS MANAGEMENT (Real-Time)
   ========================================================= */

/**
 * Retrieves all incoming and past orders from global storage
 */
export function getStoredOrders(): OrderDetails[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves orders and triggers a real-time event
 */
export function saveStoredOrders(orders: OrderDetails[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('gh_orders_updated'));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
}

/**
 * Adds a new incoming customer order
 */
export function addGlobalOrder(order: OrderDetails): void {
  const current = getStoredOrders();
  const updated = [order, ...current];
  saveStoredOrders(updated);
}

/**
 * Updates status of an order ('Menunggu' -> 'Diproses' -> 'Selesai')
 */
export function updateOrderStatus(
  orderId: string,
  newStatus: 'Menunggu' | 'Diproses' | 'Selesai'
): boolean {
  const current = getStoredOrders();
  const index = current.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  current[index] = {
    ...current[index],
    status: newStatus,
  };
  saveStoredOrders([...current]);
  return true;
}

/**
 * Clears all orders (resets orders to 0)
 */
export function clearStoredOrders(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ORDERS_KEY);
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('gh_orders_updated'));
  } catch (e) {
    console.error('Failed to clear orders:', e);
  }
}

/* =========================================================
   REVENUE & OMSET CALCULATION
   ========================================================= */

export interface OmsetStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  qrisRevenue: number;
  cashRevenue: number;
  qrisPercentage: number;
  cashPercentage: number;
  recentTransactions: {
    id: string;
    customerName: string;
    total: number;
    paymentMethod: string;
    createdAt: string;
    status: string;
  }[];
  categoryBreakdown: { category: CategoryType; revenue: number; percentage: number }[];
}

export function calculateOmsetStats(timeframe: 'today' | 'week' | 'month' = 'today'): OmsetStats {
  const orders = getStoredOrders();
  const now = new Date();

  // Filter orders by timeframe
  const filtered = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    if (timeframe === 'today') {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    } else if (timeframe === 'week') {
      const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    } else {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
  });

  // Calculate metrics
  let totalRevenue = 0;
  let qrisRevenue = 0;
  let cashRevenue = 0;
  const categoryMap: Record<string, number> = {
    Kopi: 0,
    Makanan: 0,
    Camilan: 0,
    Minuman: 0,
  };

  filtered.forEach((o) => {
    totalRevenue += o.total;
    if (o.paymentMethod === 'QRIS') {
      qrisRevenue += o.total;
    } else {
      cashRevenue += o.total;
    }

    o.items?.forEach((item) => {
      const cat = item.product?.category || 'Kopi';
      const itemSubtotal = (item.product?.price || 0) * (item.quantity || 1);
      categoryMap[cat] = (categoryMap[cat] || 0) + itemSubtotal;
    });
  });

  const totalOrders = filtered.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const qrisPercentage = totalRevenue > 0 ? Math.round((qrisRevenue / totalRevenue) * 100) : 0;
  const cashPercentage = totalRevenue > 0 ? 100 - qrisPercentage : 0;

  const totalCatSum = Object.values(categoryMap).reduce((a, b) => a + b, 0);
  const categoryBreakdown = Object.entries(categoryMap).map(([category, revenue]) => ({
    category: category as CategoryType,
    revenue,
    percentage: totalCatSum > 0 ? Math.round((revenue / totalCatSum) * 100) : 0,
  }));

  const recentTransactions = filtered.slice(0, 10).map((o) => ({
    id: o.id,
    customerName: o.customerName,
    total: o.total,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt,
    status: o.status,
  }));

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    qrisRevenue,
    cashRevenue,
    qrisPercentage,
    cashPercentage,
    recentTransactions,
    categoryBreakdown,
  };
}

