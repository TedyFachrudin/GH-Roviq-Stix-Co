import { Product, OrderDetails, CategoryType } from '@/types';
import { PRODUCTS } from './products-data';

const PRODUCTS_KEY = 'gh_roviq_products';
const UNAVAILABLE_PRODUCTS_KEY = 'gh_roviq_unavailable_products';
const ORDERS_KEY = 'gh_roviq_global_orders';

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
 * Seed initial sample orders for testing the real-time order UI
 */
export function seedSampleOrders(): void {
  const sampleOrders: OrderDetails[] = [
    {
      id: 'GHR-1082',
      customerName: 'Bagas Pratama',
      customerPhone: '081298765432',
      orderType: 'Dine-in',
      tableNumber: '04',
      paymentMethod: 'QRIS',
      items: [
        {
          product: {
            id: 'demo-1',
            name: 'Signature Aren Latte',
            category: 'Kopi',
            price: 25000,
            description: 'Espresso blend gayo dengan gula aren murni',
            image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
          },
          quantity: 2,
          selectedOption: 'Dingin',
          note: 'Less ice, normal sugar',
        },
        {
          product: {
            id: 'demo-2',
            name: 'Almond Croissant Butter',
            category: 'Camilan',
            price: 24000,
            description: 'Pastry mentega berlapis ala Prancis',
            image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
          },
          quantity: 1,
          note: 'Tolong dihangatkan sebentar',
        },
      ],
      subtotal: 74000,
      tax: 7400,
      total: 81400,
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      status: 'Menunggu',
      queueNumber: '#A-12',
    },
    {
      id: 'GHR-1079',
      customerName: 'Siti Rahma',
      customerPhone: '085712348899',
      orderType: 'Dine-in',
      tableNumber: '02',
      paymentMethod: 'Tunai',
      items: [
        {
          product: {
            id: 'demo-3',
            name: 'Artisan V60 Pour Over',
            category: 'Kopi',
            price: 28000,
            description: 'Biji kopi single origin Gayo seduh V60',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
          },
          quantity: 1,
          selectedOption: 'Panas',
          note: 'Notes floral citrus',
        },
      ],
      subtotal: 28000,
      tax: 2800,
      total: 30800,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'Diproses',
      queueNumber: '#B-05',
    },
    {
      id: 'GHR-1065',
      customerName: 'Reza Fahmi',
      customerPhone: '081399887766',
      orderType: 'Takeaway',
      paymentMethod: 'QRIS',
      items: [
        {
          product: {
            id: 'demo-4',
            name: 'Cold Brew Citrus',
            category: 'Kopi',
            price: 27000,
            description: 'Ekstraksi dingin 18 jam dengan sunkist',
            image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop',
          },
          quantity: 2,
          selectedOption: 'Dingin',
        },
      ],
      subtotal: 54000,
      tax: 5400,
      total: 59400,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'Selesai',
      queueNumber: '#C-08',
    },
  ];

  saveStoredOrders(sampleOrders);
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
  const qrisPercentage = totalRevenue > 0 ? Math.round((qrisRevenue / totalRevenue) * 100) : 70;
  const cashPercentage = totalRevenue > 0 ? 100 - qrisPercentage : 30;

  const totalCatSum = Object.values(categoryMap).reduce((a, b) => a + b, 0);
  const categoryBreakdown = Object.entries(categoryMap).map(([category, revenue]) => ({
    category: category as CategoryType,
    revenue,
    percentage: totalCatSum > 0 ? Math.round((revenue / totalCatSum) * 100) : 25,
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

