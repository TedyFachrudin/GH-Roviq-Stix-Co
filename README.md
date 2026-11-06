# GH ROVIQ — Artisan Coffee & Kitchen (Minimalist Web App)

Aplikasi web modern, responsif (Desktop & Mobile), dan minimalis berestetika hangat (warm minimalist artisan coffee house) yang dibangun berdasarkan 10 desain mockup SVG di folder `GH ROVIQ`.

---

## ☕ Fitur & Halaman (Berdasarkan Mockup SVG)

| No | Mockup SVG | Halaman / Komponen | Deskripsi Fitur |
|---|---|---|---|
| 1 | `Landing Page.svg` | `app/page.tsx` | Hero banner kurasi kopi, filosofi 3 pilar, produk terlaris, dan teaser loyalty card. |
| 2 | `Menu.svg` | `app/menu/page.tsx` | Filter kategori (*Kopi*, *Makanan*, *Camilan*, *Minuman*), pencarian live, pilihan suhu (*Panas/Dingin*), dan tombol tambah keranjang. |
| 3 | `Keranjang Belanja.svg` | `components/cart/CartDrawer.tsx` | Drawer keranjang belanja samping (*slide-over*) dengan kontrol kuantitas, rincian subtotal, dan pajak. |
| 4 | `Koonfirmasi Hapus Produk.svg` | `components/cart/DeleteConfirmModal.tsx` | Modal dialog konfirmasi hapus item dari keranjang saat tombol sampah diklik atau kuantitas mencapai nol. |
| 5 | `Checkout.svg` | `app/checkout/page.tsx` | Pilihan layanan (*Dine-in*, *Takeaway*, *Delivery*), input nomor meja/alamat, data pemesan, dan metode pembayaran (*QRIS*, *Tunai*, *Transfer*). |
| 6 | `Popout pesanan Berhasil.svg` | `components/checkout/OrderSuccessModal.tsx` | Popout konfirmasi pemesanan berhasil lengkap dengan ID pesanan, nomor antrean (`#A-XX`), dan reward stamp. |
| 7 | `Profil Tamu.svg` | `app/profil/page.tsx` (Guest View) | Tampilan profil pengunjung belum login dengan penjelasan keuntungan bergabung ke Artisan Club. |
| 8 | `Profil Member & Loyalty Card.svg` | `components/member/LoyaltyCard.tsx` | Kartu digital loyalitas 10-stamp dengan QR scanner kasir, progres reward, dan riwayat transaksi. |
| 9 | `Login Masuk.svg` | `app/sign-in/[[...sign-in]]/page.tsx` | Halaman autentikasi masuk dengan Clerk disesuaikan dengan tema minimalis GH ROVIQ. |
| 10 | `Login Daftar Akkun.svg` | `app/sign-up/[[...sign-up]]/page.tsx` | Halaman pendaftaran member baru dengan Clerk. |

---

## 🛠️ Teknologi & Arsitektur

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS dengan palet warna resmi:
  - Cream Background: `#FAF5EE`
  - Card & Surface: `#F6F0E8`
  - Espresso High-Contrast: `#3A302A`
  - Terracotta Brand Accent: `#C2652A`
  - Subtle Borders: `#D8D0C8`
- **Autentikasi**: Clerk (`@clerk/nextjs`)
- **Database**: Supabase (`@supabase/supabase-js`)
- **Icons**: Lucide React

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
2. Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Konfigurasi Environment (`.env.local`)

File konfigurasi telah dibuat di `.env.local`:
```env
# Clerk Authentication (Dapatkan dari dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (Dapatkan dari app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🗄️ Database Supabase Schema

Skrip SQL lengkap untuk membuat tabel `categories`, `products`, `members`, `orders`, dan `order_items` beserta data seed awal tersedia di file [`supabase/schema.sql`](supabase/schema.sql).

