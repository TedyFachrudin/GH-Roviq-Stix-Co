'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Coffee,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAppUser } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { OrderDetails, OrderType, PaymentMethod } from '@/types';
import { OrderSuccessModal } from '@/components/checkout/OrderSuccessModal';
import { addGlobalOrder, getNextQueueNumber } from '@/lib/store';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, resetDefaultCart } = useCart();
  const { isSignedIn, user } = useAppUser();

  const orderType: OrderType = 'Dine-in';
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDetails | null>(null);

  React.useEffect(() => {
    if (user) {
      setCustomerName((user as any)?.username || user.fullName || user.firstName || '');
    }
  }, [user]);

  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    // Generate order ID & sequential Queue Number (#GH-01, #GH-02, ...)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `GHR-${randomNum}`;
    const queueNumber = getNextQueueNumber();

    const orderData: OrderDetails = {
      id: orderId,
      customerName: customerName || 'Tamu GH ROVIQ',
      customerPhone: customerPhone || '081234567890',
      orderType,
      paymentMethod,
      items: [...items],
      subtotal,
      tax,
      total: grandTotal,
      createdAt: new Date().toISOString(),
      status: paymentMethod === 'QRIS' ? 'Menunggu' : 'Diproses',
      queueNumber,
    };

    // Store order into global admin live feed
    try {
      addGlobalOrder(orderData);
    } catch (e) {
      console.error('Failed to add global order:', e);
    }

    // If user is signed in, save order to member history and increment stamps & points
    if (user?.id) {
      try {
        const stampsEarned = items.reduce((acc, curr) => acc + curr.quantity, 0);
        const pointsEarned = Math.round(grandTotal / 1000);
        const curStamps = Number(localStorage.getItem(`gh_stamps_${user.id}`) || '0');
        const curPoints = Number(localStorage.getItem(`gh_points_${user.id}`) || '0');
        localStorage.setItem(`gh_stamps_${user.id}`, String(curStamps + stampsEarned));
        localStorage.setItem(`gh_points_${user.id}`, String(curPoints + pointsEarned));

        const storedOrders = localStorage.getItem(`gh_orders_${user.id}`);
        const orders = storedOrders ? JSON.parse(storedOrders) : [];
        orders.unshift({
          id: orderId,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          items: items.map(i => `${i.quantity}x ${i.product.name}`).join(', '),
          total: grandTotal,
          stampsAdded: stampsEarned,
        });
        localStorage.setItem(`gh_orders_${user.id}`, JSON.stringify(orders));
      } catch {}
    }

    // Sync order & order items to Supabase in the cloud
    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const itemsPayload = JSON.stringify({
            items,
            paymentProof: '',
          });

          await supabase.from('orders').insert({
            id: orderId,
            clerk_id: user?.id || null,
            customer_name: customerName || 'Tamu GH ROVIQ',
            customer_phone: customerPhone || '081234567890',
            order_type: orderType,
            table_number: null,
            delivery_address: itemsPayload,
            payment_method: paymentMethod,
            subtotal,
            tax,
            total: grandTotal,
            queue_number: queueNumber,
            status: paymentMethod === 'QRIS' ? 'Menunggu' : 'Diproses',
          });

          const itemsToInsert = items.map((i) => ({
            order_id: orderId,
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            unit_price: i.product.price,
            selected_option: i.selectedOption || null,
            subtotal: i.product.price * i.quantity,
          }));
          await supabase.from('order_items').insert(itemsToInsert);
        } catch {
          // Gracefully continue even if network/offline
        }
      })();
    }

    setTimeout(() => {
      setCreatedOrder(orderData);
      clearCart();
      setIsSubmitting(false);
    }, 800);
  };

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#F6F0E8] text-[#9A9088] flex items-center justify-center mx-auto">
          <ShoppingBag size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-[#3A302A]">
            Keranjang Masih Kosong
          </h2>
          <p className="text-sm text-[#605850]">
            Silakan pilih seduhan kopi atau sajian artisan kami terlebih dahulu sebelum melakukan pembayaran.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C2652A] text-white text-xs uppercase tracking-wider font-semibold shadow-sm hover:bg-[#A95420] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link & Header */}
        <div className="space-y-2">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#605850] hover:text-[#C2652A] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Menu</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A]">
            Konfirmasi Pesanan
          </h1>
          <p className="text-sm text-[#605850] font-light">
            Lengkapi data pemesanan dan pilih metode pembayaran favorit Anda.
          </p>
        </div>

        {/* 2-Column Responsive Form */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Details, Options, Customer Info */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Order Type Selector matching Checkout.svg */}
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#9A9088] block">
                  1. Tipe Layanan
                </label>
              </div>

              <div className="w-full p-3.5 rounded-xl border border-[#C2652A] bg-[#F7ECE4] text-[#C2652A] font-semibold flex items-center justify-center gap-2 transition-all">
                <Coffee size={20} />
                <span className="text-xs">Dine-in</span>
              </div>
            </div>

            {/* Step 2: Customer Identity */}
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 space-y-4 shadow-subtle">
              <label className="text-xs font-bold uppercase tracking-wider text-[#9A9088] block">
                2. Data Pemesan
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#605850] block mb-1.5">
                    Nama Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Roviq"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#605850] block mb-1.5">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 0812-3456-7890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#605850] block mb-1.5">
                  Catatan untuk Barista (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Less sweet, jangan terlalu dingin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
                />
              </div>
            </div>

            {/* Step 3: Payment Method Selector matching Checkout.svg */}
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 space-y-4 shadow-subtle">
              <label className="text-xs font-bold uppercase tracking-wider text-[#9A9088] block">
                3. Metode Pembayaran
              </label>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'border-[#C2652A] bg-[#F7ECE4]'
                      : 'border-[#E8E2D9] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#C2652A]">
                      <QrCode size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3A302A]">QRIS Instan</p>
                      <p className="text-xs text-[#605850]">BCA, GoPay, OVO, ShopeePay, Dana, LinkAja</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'QRIS'}
                    onChange={() => setPaymentMethod('QRIS')}
                    className="accent-[#C2652A]"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod('Tunai')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'Tunai'
                      ? 'border-[#C2652A] bg-[#F7ECE4]'
                      : 'border-[#E8E2D9] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#3A302A]">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3A302A]">Bayar Tunai di Kasir</p>
                      <p className="text-xs text-[#605850]">Bayar langsung saat pesanan diserahkan</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Tunai'}
                    onChange={() => setPaymentMethod('Tunai')}
                    className="accent-[#C2652A]"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod('Transfer Bank')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'Transfer Bank'
                      ? 'border-[#C2652A] bg-[#F7ECE4]'
                      : 'border-[#E8E2D9] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#3A302A]">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3A302A]">Transfer Bank Manual</p>
                      <p className="text-xs text-[#605850]">BCA 182-094-1188 a.n GH ROVIQ</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Transfer Bank'}
                    onChange={() => setPaymentMethod('Transfer Bank')}
                    className="accent-[#C2652A]"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Right Summary: Items preview & Submit */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 space-y-5 shadow-card">
              <h3 className="font-serif text-lg font-bold text-[#3A302A] border-b border-[#F6F0E8] pb-3">
                Ringkasan Pesanan ({items.length} item)
              </h3>

              {/* Items scrollable */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedOption}`}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-[#F6F0E8]">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          unoptimized={Boolean(item.product.image?.startsWith("data:"))}
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-[#3A302A] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[#9A9088]">
                          {item.quantity}x {item.selectedOption ? `(${item.selectedOption})` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#3A302A] flex-shrink-0">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 pt-4 border-t border-[#F6F0E8] text-xs">
                <div className="flex justify-between text-[#605850]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#3A302A]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#605850]">
                  <span>Pajak Restoran (10%)</span>
                  <span className="font-medium text-[#3A302A]">{formatRupiah(tax)}</span>
                </div>
                <div className="pt-3 border-t border-[#D8D0C8] flex justify-between items-baseline">
                  <span className="font-serif text-sm font-bold text-[#3A302A]">Total Akhir</span>
                  <span className="text-xl font-bold text-[#C2652A] font-sans">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Submit CTA button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 bg-[#C2652A] hover:bg-[#A95420] text-white rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Menyiapkan Pesanan...</span>
                ) : (
                  <span>Konfirmasi & Bayar {formatRupiah(grandTotal)}</span>
                )}
              </button>

              <p className="text-[11px] text-center text-[#9A9088]">
                Pesanan Anda akan langsung masuk ke layar barista di kasir.
              </p>
            </div>
          </div>

        </form>

      </div>

      {/* Popout Success Modal */}
      <OrderSuccessModal
        order={createdOrder}
        onClose={() => {
          setCreatedOrder(null);
          router.push('/menu');
        }}
      />
    </div>
  );
}

