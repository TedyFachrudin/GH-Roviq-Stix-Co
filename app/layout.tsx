import type { Metadata } from 'next';
import { AppAuthProvider } from '@/lib/auth';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { DeleteConfirmModal } from '@/components/cart/DeleteConfirmModal';
import './globals.css';

export const metadata: Metadata = {
  title: 'GH ROVIQ — Artisan Coffee & Kitchen',
  description:
    'Kedai kopi kurasi dan dapur artisan minimalis. Tempat bersahaja untuk menikmati seduhan kopi berkualitas dan hidangan hangat pilihan.',
  icons: {
    icon: '/logo-gh-roviq.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-[#FAF5EE] text-[#3A302A] min-h-screen flex flex-col font-sans selection:bg-[#F7ECE4] selection:text-[#C2652A]">
        <AppAuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <DeleteConfirmModal />
          </CartProvider>
        </AppAuthProvider>
      </body>
    </html>
  );
}
