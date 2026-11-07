export type CategoryType = 'Semua' | 'Kopi' | 'Makanan' | 'Camilan' | 'Minuman';

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  price: number;
  description: string;
  image: string;
  badge?: string; // e.g. "Terlaris", "Baru", "Rekomendasi"
  temperatureOptions?: ('Panas' | 'Dingin')[];
  rating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOption?: 'Panas' | 'Dingin';
  note?: string;
}

export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery';
export type PaymentMethod = 'QRIS' | 'Tunai' | 'Transfer Bank';

export interface OrderDetails {
  id: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  address?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  status: 'Menunggu' | 'Diproses' | 'Selesai';
  queueNumber: string;
  paymentProof?: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'Regular' | 'Silver' | 'Gold' | 'Artisan Club';
  stamps: number; // 0 to 10
  points: number;
  joinDate: string;
}

