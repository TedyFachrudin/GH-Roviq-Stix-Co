import { Product, OrderDetails, CategoryType, CartItem, OrderType, PaymentMethod } from '@/types';
import { PRODUCTS } from './products-data';
import { supabase, isSupabaseConfigured } from './supabase';

const PRODUCTS_KEY = 'gh_roviq_products_v2';
const UNAVAILABLE_PRODUCTS_KEY = 'gh_roviq_unavailable_products_v2';
const ORDERS_KEY = 'gh_roviq_global_orders_v2';
const SYNC_CATALOG_NAME = '__CATALOG_SYNC__';

/**
 * Pushes the current products array to Supabase cloud sync for cross-device visibility
 */
export async function pushProductsToCloud(products: Product[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = JSON.stringify(products);
    const id = `gh-cat-${Date.now()}`;
    const { error } = await supabase.from('orders').insert({
      id,
      customer_name: SYNC_CATALOG_NAME,
      customer_phone: '0',
      order_type: 'System',
      payment_method: 'System',
      subtotal: 0,
      tax: 0,
      total: 0,
      queue_number: '#SYS',
      delivery_address: payload,
    });
    if (error) {
      console.warn('Cloud sync push warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Cloud sync push exception:', err);
    return false;
  }
}

/**
 * Fetches the latest products array from Supabase cloud sync
 */
export async function fetchProductsFromCloud(): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('delivery_address, created_at')
      .eq('customer_name', SYNC_CATALOG_NAME)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const raw = data[0]?.delivery_address;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (err) {
    console.error('Cloud sync fetch exception:', err);
    return null;
  }
}

/**
 * Syncs local products with cloud products.
 * Guarantees cross-device catalog persistence between admin, guests, and members.
 */
export async function syncCatalogWithCloud(): Promise<Product[]> {
  if (typeof window === 'undefined') return getStoredProducts();

  const local = getStoredProducts();
  const cloud = await fetchProductsFromCloud();

  if (cloud !== null) {
    if (local.length === 0 && cloud.length > 0) {
      saveStoredProducts(cloud, false);
      return cloud;
    }
    if (local.length > 0 && cloud.length === 0) {
      await pushProductsToCloud(local);
      return local;
    }
    // Master source from cloud across all devices
    saveStoredProducts(cloud, false);
    return cloud;
  } else if (local.length > 0) {
    await pushProductsToCloud(local);
  }

  return local;
}

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
export function saveStoredProducts(products: Product[], pushToCloud = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('gh_products_updated'));
    if (pushToCloud) {
      pushProductsToCloud(products);
    }
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
    pushProductsToCloud([]);
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
  saveStoredProducts(updated, true);
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
  saveStoredProducts([...current], true);
  return updatedProduct;
}

/**
 * Delete a product from catalog
 */
export function deleteProduct(id: string): boolean {
  const current = getStoredProducts();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredProducts(filtered, true);
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

const QUEUE_COUNTER_KEY = 'gh_roviq_queue_counter_v1';

/**
 * Returns sequential queue number starting from #GH-01, #GH-02, ...
 */
export function getNextQueueNumber(): string {
  if (typeof window === 'undefined') return '#GH-01';
  try {
    const raw = localStorage.getItem(QUEUE_COUNTER_KEY);
    const count = raw ? Number(raw) + 1 : 1;
    localStorage.setItem(QUEUE_COUNTER_KEY, String(count));
    return `#GH-${String(count).padStart(2, '0')}`;
  } catch {
    const orders = getStoredOrders();
    return `#GH-${String(orders.length + 1).padStart(2, '0')}`;
  }
}

/**
 * Pushes a single order to Supabase cloud database
 */
export async function pushOrderToCloud(order: OrderDetails): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = JSON.stringify({
      items: order.items || [],
      paymentProof: order.paymentProof || '',
    });
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      customer_name: order.customerName,
      customer_phone: order.customerPhone || '081234567890',
      order_type: order.orderType,
      table_number: order.tableNumber || null,
      delivery_address: payload,
      payment_method: order.paymentMethod,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      queue_number: order.queueNumber,
      status: order.status,
      created_at: order.createdAt,
    });
    if (error) {
      console.warn('pushOrderToCloud error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('pushOrderToCloud exception:', err);
    return false;
  }
}

/**
 * Updates order with uploaded payment proof and syncs to Supabase
 */
export function updateOrderPaymentProof(orderId: string, proof: string): void {
  const current = getStoredOrders();
  const index = current.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    current[index].paymentProof = proof;
    saveStoredOrders([...current]);

    if (isSupabaseConfigured()) {
      const payload = JSON.stringify({
        items: current[index].items || [],
        paymentProof: proof,
      });
      (async () => {
        try {
          await supabase.from('orders').update({ delivery_address: payload }).eq('id', orderId);
        } catch (err) {
          console.warn('Supabase paymentProof update failed:', err);
        }
      })();
    }
  }
}

/**
 * Sanitizes any raw order object into a strictly valid and safe OrderDetails
 */
export function sanitizeOrder(order: any): OrderDetails {
  const safeItems: CartItem[] = Array.isArray(order?.items)
    ? order.items.map((it: any) => {
        if (it?.product && typeof it.product === 'object') {
          return {
            product: {
              id: String(it.product.id || 'prod'),
              name: String(it.product.name || 'Menu Sajian'),
              price: Number(it.product.price) || 0,
              category: (it.product.category as CategoryType) || 'Kopi',
              description: String(it.product.description || ''),
              image:
                it.product.image ||
                'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
            },
            quantity: Math.max(1, Number(it.quantity) || 1),
            selectedOption: it.selectedOption || undefined,
            note: it.note || undefined,
          };
        }
        return {
          product: {
            id: String(it?.id || it?.product_id || 'prod'),
            name: String(it?.name || it?.product_name || 'Menu Sajian'),
            price: Number(it?.price) || Number(it?.unit_price) || 0,
            category: (it?.category as CategoryType) || 'Kopi',
            description: String(it?.description || ''),
            image:
              it?.image ||
              'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
          },
          quantity: Math.max(1, Number(it?.quantity) || 1),
          selectedOption: it?.selected_option || it?.selectedOption || undefined,
          note: it?.note || undefined,
        };
      })
    : [];

  const paymentMethod = (order?.paymentMethod || order?.payment_method || 'QRIS') as PaymentMethod;
  const subtotal = Number(order?.subtotal) || 0;
  const total = Number(order?.total) || subtotal;

  return {
    id: String(order?.id || `GHR-${Math.floor(1000 + Math.random() * 9000)}`),
    customerName: String(order?.customerName || order?.customer_name || 'Pelanggan GH ROVIQ'),
    customerPhone: String(order?.customerPhone || order?.customer_phone || '-'),
    orderType: (order?.orderType || order?.order_type || 'Dine-in') as OrderType,
    tableNumber: order?.tableNumber || order?.table_number || undefined,
    paymentMethod,
    items:
      safeItems.length > 0
        ? safeItems
        : [
            {
              product: {
                id: 'item-default',
                name: `Pesanan (${paymentMethod})`,
                price: total > 0 ? total : 25000,
                category: 'Kopi',
                description: 'Pesanan sajian GH ROVIQ Coffee & Kitchen',
                image:
                  'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
              },
              quantity: 1,
            },
          ],
    subtotal,
    tax: Number(order?.tax) || 0,
    total,
    createdAt: order?.createdAt || order?.created_at || new Date().toISOString(),
    status: (order?.status as 'Menunggu' | 'Diproses' | 'Selesai') || 'Diproses',
    queueNumber: String(order?.queueNumber || order?.queue_number || '#GH-01'),
    paymentProof: order?.paymentProof || undefined,
  };
}

/**
 * Checks whether an order row is a system catalog synchronization record
 */
function isSystemCatalogOrder(o: any): boolean {
  if (!o) return true;
  const id = String(o.id || '');
  const name = String(o.customerName || o.customer_name || '').toUpperCase();
  const type = String(o.orderType || o.order_type || '');
  return (
    type === 'System' ||
    id.startsWith('gh-cat-') ||
    id === 'gh-system-catalog-state' ||
    name.includes('CATALOG')
  );
}

/**
 * Retrieves all incoming and past orders from global storage
 */
export function getStoredOrders(): OrderDetails[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out any system catalog rows and sanitize items
    return parsed
      .filter((o) => !isSystemCatalogOrder(o))
      .map((o) => sanitizeOrder(o));
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
    const sanitized = orders.filter((o) => !isSystemCatalogOrder(o)).map(sanitizeOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event('gh_orders_updated'));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
}

/**
 * Adds a new incoming customer order and pushes to cloud
 */
export function addGlobalOrder(order: OrderDetails): void {
  const current = getStoredOrders();
  const safe = sanitizeOrder(order);
  const updated = [safe, ...current.filter((o) => o.id !== safe.id)];
  saveStoredOrders(updated);
  pushOrderToCloud(safe).catch(() => {});
}

/**
 * Updates status of an order ('Menunggu' -> 'Diproses' -> 'Selesai') both locally and in Supabase
 */
export function updateOrderStatus(
  orderId: string,
  newStatus: 'Menunggu' | 'Diproses' | 'Selesai'
): boolean {
  const current = getStoredOrders();
  const index = current.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    current[index] = {
      ...current[index],
      status: newStatus,
    };
    saveStoredOrders([...current]);
  }

  if (isSupabaseConfigured()) {
    (async () => {
      try {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      } catch (err) {
        console.warn('Supabase status update failed:', err);
      }
    })();
  }
  return true;
}

/**
 * Syncs orders from Supabase cloud database into local storage.
 * Ensures the admin dashboard on any device immediately sees orders placed by guests & members.
 */
export async function syncOrdersFromCloud(): Promise<OrderDetails[]> {
  if (typeof window === 'undefined') return [];
  const localOrders = getStoredOrders();

  if (!isSupabaseConfigured()) return localOrders;

  try {
    const { data: cloudOrders, error } = await supabase
      .from('orders')
      .select('*')
      .neq('order_type', 'System')
      .order('created_at', { ascending: false });

    if (error || !cloudOrders) {
      console.warn('Error fetching orders from Supabase:', error?.message);
      return localOrders;
    }

    // Filter out any system catalog rows
    const validCloudOrders = cloudOrders.filter((row) => !isSystemCatalogOrder(row));

    // Identify orders that need fallback order_items lookup
    const needItemsIds = validCloudOrders
      .filter(
        (row) =>
          !row.delivery_address ||
          (!row.delivery_address.startsWith('{') && !row.delivery_address.startsWith('['))
      )
      .map((row) => row.id);

    let itemsByOrderId: Record<string, any[]> = {};
    if (needItemsIds.length > 0) {
      try {
        const { data: dbItems } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', needItemsIds);
        if (dbItems) {
          dbItems.forEach((it) => {
            if (!itemsByOrderId[it.order_id]) itemsByOrderId[it.order_id] = [];
            itemsByOrderId[it.order_id].push(it);
          });
        }
      } catch (err) {
        console.warn('Error fetching order items:', err);
      }
    }

    const mappedCloudOrders: OrderDetails[] = validCloudOrders.map((row) => {
      let items: any[] = [];
      let paymentProof: string | undefined = undefined;

      if (row.delivery_address) {
        try {
          const parsed = JSON.parse(row.delivery_address);
          if (Array.isArray(parsed)) {
            items = parsed;
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.items)) items = parsed.items;
            if (typeof parsed.paymentProof === 'string') paymentProof = parsed.paymentProof;
          }
        } catch {
          if (typeof row.delivery_address === 'string' && row.delivery_address.startsWith('data:image')) {
            paymentProof = row.delivery_address;
          }
        }
      }

      // If items empty, check itemsByOrderId
      if (items.length === 0 && itemsByOrderId[row.id]?.length > 0) {
        items = itemsByOrderId[row.id].map((it) => ({
          product: {
            id: it.product_id || 'prod',
            name: it.product_name || 'Pesanan',
            price: Number(it.unit_price) || 0,
            category: 'Kopi',
            image:
              'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
          },
          quantity: Number(it.quantity) || 1,
          selectedOption: it.selected_option || undefined,
        }));
      }

      // Check if local cache has payment proof
      const localMatch = localOrders.find((lo) => lo.id === row.id);
      if (!paymentProof && localMatch?.paymentProof) {
        paymentProof = localMatch.paymentProof;
      }

      return sanitizeOrder({
        id: row.id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        orderType: row.order_type,
        tableNumber: row.table_number || undefined,
        paymentMethod: row.payment_method,
        items,
        subtotal: Number(row.subtotal) || 0,
        tax: Number(row.tax) || 0,
        total: Number(row.total) || 0,
        createdAt: row.created_at,
        status: row.status,
        queueNumber: row.queue_number,
        paymentProof,
      });
    });

    // Merge cloud orders with any local orders not yet reflected in cloud
    const cloudIds = new Set(mappedCloudOrders.map((o) => o.id));
    const merged = [...mappedCloudOrders];
    for (const lo of localOrders) {
      if (!cloudIds.has(lo.id) && !isSystemCatalogOrder(lo)) {
        merged.push(sanitizeOrder(lo));
      }
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('gh_orders_updated'));
    return merged;
  } catch (err) {
    console.error('Failed to sync orders with cloud:', err);
    return localOrders;
  }
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
      const cat = item?.product?.category || (item as any)?.category || 'Kopi';
      const itemPrice = item?.product?.price ?? (item as any)?.price ?? 0;
      const itemSubtotal = itemPrice * (item?.quantity || 1);
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

