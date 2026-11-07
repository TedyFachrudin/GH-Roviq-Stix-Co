'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Coffee,
  Clock,
  Receipt,
  Award,
  Upload,
  CheckCircle2,
  Check,
  QrCode,
} from 'lucide-react';
import { OrderDetails } from '@/types';
import { useAppUser } from '@/lib/auth';
import { updateOrderPaymentProof } from '@/lib/store';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { isSignedIn } = useAppUser();
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  if (!order) return null;

  const isQris = order.paymentMethod === 'QRIS';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 900;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } else {
            resolve(ev.target?.result as string);
          }
        };
        img.onerror = () => resolve(ev.target?.result as string);
        img.src = ev.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file maksimal 15MB. Silakan pilih foto bukti lain.');
      return;
    }

    try {
      setIsUploading(true);
      const base64 = await compressImage(file);
      if (base64) {
        setPaymentProof(base64);
        // Immediately sync to global store & cloud so admin sees it right away
        await updateOrderPaymentProof(order.id, base64);
      }
    } catch (err) {
      console.error('Gagal memproses bukti bayar:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKirimBukti = async () => {
    if (isUploading) return;
    if (paymentProof) {
      await updateOrderPaymentProof(order.id, paymentProof);
    }
    // 8. Tampilkan popout kecil pemberitahuan: "pesanan berhasil dikirim dan dibuat, mohon tunggu"
    setShowNotificationToast(true);
  };

  const handleFinalDone = () => {
    setShowNotificationToast(false);
    onClose();
  };

  // Generate chat links for WhatsApp & Telegram
  const itemsSummary =
    order.items && order.items.length > 0
      ? order.items
          .map(
            (it) =>
              `${it.quantity}x ${it.product.name}${
                it.selectedOption ? ` (${it.selectedOption})` : ''
              }`
          )
          .join(', ')
      : 'Sajian Menu';

  const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890').replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(
    `Halo Barista GH ROVIQ! 👋\n` +
      `Saya ingin konfirmasi pesanan saya:\n\n` +
      `*Nomor Antrean:* ${order.queueNumber}\n` +
      `*ID Pesanan:* ${order.id}\n` +
      `*Nama:* ${order.customerName}\n` +
      `*Pesanan:* ${itemsSummary}\n` +
      `*Total:* ${formatRupiah(order.total)}\n` +
      `*Metode:* ${order.paymentMethod}\n\n` +
      `Mohon diproses ya kak. Terima kasih!`
  );
  const whatsappUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  const tgUsername = (process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || 'ghroviq').replace('@', '');
  const telegramUrl = `https://t.me/${tgUsername}`;

  // 8. Popout kecil pemberitahuan dengan animasi ceklis
  if (showNotificationToast) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="bg-[#FAF5EE] border border-[#D8D0C8] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Animasi Ceklis */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Check size={36} className="stroke-[3]" />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-serif text-xl font-bold text-[#3A302A]">
              Pesanan Berhasil Dikirim dan Dibuat
            </h4>
            <p className="text-xs text-[#605850] font-sans leading-relaxed">
              Mohon tunggu, barista GH ROVIQ sedang menyiapkan pesanan kurasi terbaik untuk Anda.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F6F0E8] border border-[#E8E2D9] flex items-center justify-between text-xs">
            <span className="text-[#9A9088] uppercase tracking-wider font-semibold text-[10px]">
              Nomor Antrean
            </span>
            <span className="font-serif font-bold text-lg text-[#C2652A]">
              {order.queueNumber}
            </span>
          </div>

          {/* Konfirmasi Pesanan via WhatsApp & Telegram */}
          <div className="space-y-2 pt-1 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088] block">
              Konfirmasi Langsung ke Barista
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                title="Buka Chat WhatsApp Barista"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                title="Buka Chat Telegram Barista"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.828.942z" />
                </svg>
                <span>Telegram</span>
              </a>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleFinalDone}
              className="w-full py-3 px-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-md active:scale-95"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A302A]/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-[#FAF5EE] border border-[#D8D0C8] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-dropdown space-y-5 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* 2. Header: Judul "Menunggu Pembayaran" untuk QRIS */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#F7ECE4] text-[#C2652A] flex items-center justify-center mx-auto shadow-inner">
            {isQris ? (
              <Clock size={30} className="stroke-[2.2] animate-pulse" />
            ) : (
              <CheckCircle2 size={32} className="stroke-[2.2]" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#3A302A]">
              {isQris ? 'Menunggu Pembayaran' : 'Pesanan Berhasil Diterima!'}
            </h3>
            <p className="text-xs sm:text-sm text-[#605850] mt-1 font-sans">
              {isQris
                ? 'Silakan scan kode QRIS resmi GH ROVIQ di bawah ini untuk menyelesaikan transaksi.'
                : 'Barista kami sedang menyiapkan pesanan kurasi terbaik untuk Anda.'}
            </p>
          </div>
        </div>

        {/* 1. Menampilkan Gambar QRIS Resmi jika metode pembayaran QRIS */}
        {isQris && (
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-4 text-center space-y-3 shadow-2xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#D8D0C8] text-[#C2652A] text-[10px] font-bold uppercase tracking-wider">
              <QrCode size={13} />
              <span>QRIS Resmi GH ROVIQ</span>
            </div>

            <div className="relative w-full max-w-[240px] aspect-[3/4] mx-auto rounded-xl overflow-hidden border border-[#E8E2D9] shadow-inner bg-white">
              <Image
                src="/qris-gh-roviq.jpg"
                alt="QRIS GH ROVIQ STIX & CO"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <div className="text-center space-y-0.5">
              <p className="text-xs font-bold text-[#3A302A]">GH ROVIQ STIX & CO. - FOOD</p>
              <p className="text-[10px] text-[#9A9088] font-mono">NMID: ID1026630124554 • A01</p>
              <p className="text-[10px] text-[#605850] pt-1">
                BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana, LinkAja
              </p>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5 space-y-4">
          {/* Top row: 3. No Antrian dimulai dari #GH-01 & 4. HAPUS ID Pesanan */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F6F0E8]">
            <div>
              <span className="text-[11px] text-[#9A9088] uppercase tracking-wider font-semibold">
                Nomor Antrean
              </span>
              <div className="font-serif text-3xl font-bold text-[#C2652A]">
                {order.queueNumber}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#9A9088] uppercase tracking-wider font-semibold block">
                Status Pesanan
              </span>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isQris
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isQris ? 'Menunggu Bayar' : 'Diproses'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[#9A9088] flex items-center gap-1">
                <Coffee size={13} /> Jenis Layanan
              </span>
              <p className="font-semibold text-[#3A302A]">
                {order.orderType} {order.tableNumber ? `(Meja ${order.tableNumber})` : ''}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9A9088] flex items-center gap-1">
                <Clock size={13} /> Estimasi Seduh
              </span>
              <p className="font-semibold text-[#3A302A]">10 - 15 Menit</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9A9088] flex items-center gap-1">
                <Receipt size={13} /> Pembayaran
              </span>
              <p className="font-semibold text-[#3A302A]">{order.paymentMethod}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9A9088]">Total Pembayaran</span>
              <p className="font-bold text-[#C2652A] text-base">
                {formatRupiah(order.total)}
              </p>
            </div>
          </div>

          {/* 5. Hapus +1 Stamp Loyalty apabila di aktornya tamu (hanya jika member login) */}
          {isSignedIn && (
            <div className="bg-[#FAF5EE] rounded-lg p-3 border border-[#E8E2D9] flex items-center gap-3 text-xs text-[#3A302A]">
              <Award size={20} className="text-[#C2652A] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#C2652A]">+1 Stamp Loyalty</span> berhasil ditambahkan ke kartu member digital Anda!
              </div>
            </div>
          )}
        </div>

        {/* 6. Form Upload Bukti Pembayaran QRIS (Opsional) */}
        {isQris && (
          <div className="space-y-2 text-left bg-white border border-[#E8E2D9] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#3A302A]">
                Bukti Pembayaran (Opsional)
              </span>
              {paymentProof && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <Check size={13} /> Terlampir
                </span>
              )}
            </div>

            {paymentProof ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#D8D0C8] bg-[#FAF5EE] group">
                <img
                  src={paymentProof}
                  alt="Bukti pembayaran"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-white text-xs font-semibold text-[#3A302A] cursor-pointer shadow-sm hover:bg-[#FAF5EE]">
                    Ganti
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPaymentProof('')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : isUploading ? (
              <div className="border-2 border-dashed border-[#C2652A] rounded-xl p-4 flex items-center justify-center gap-2.5 bg-[#FAF5EE] text-xs text-[#C2652A]">
                <div className="w-4 h-4 border-2 border-[#C2652A] border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold">Mengompresi & mengunggah bukti pembayaran...</span>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#D8D0C8] hover:border-[#C2652A] rounded-xl p-3.5 flex items-center justify-center gap-2.5 cursor-pointer bg-[#FAF5EE] hover:bg-white transition-all text-xs text-[#605850] group">
                <Upload size={16} className="text-[#C2652A]" />
                <span className="group-hover:text-[#C2652A] font-medium">
                  Upload foto bukti screenshot QRIS
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* 7. Action Button: diganti menjadi kirim bukti pembayaran */}
        {isQris ? (
          <div className="space-y-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleKirimBukti}
              className="w-full py-3.5 px-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] disabled:bg-[#D8D0C8] disabled:cursor-not-allowed text-white text-xs uppercase tracking-wider font-bold text-center shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengunggah Bukti...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Kirim Bukti Pembayaran</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={handleKirimBukti}
              className="w-full text-center text-xs text-[#9A9088] hover:text-[#3A302A] transition-colors py-1 disabled:opacity-50"
            >
              Selesaikan & Konfirmasi Pesanan
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            {isSignedIn && (
              <Link
                href="/profil"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-[#D8D0C8] bg-transparent text-[#3A302A] text-xs uppercase tracking-wider font-semibold text-center hover:bg-[#F6F0E8] transition-colors"
              >
                Cek Kartu Stamp
              </Link>
            )}
            <button
              type="button"
              onClick={handleKirimBukti}
              className="flex-1 py-3 px-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold text-center shadow-sm transition-colors"
            >
              Pesan Menu Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
