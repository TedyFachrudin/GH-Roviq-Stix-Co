-- ==============================================================================
-- GH ROVIQ COFFEE & KITCHEN - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  badge VARCHAR(50),
  temperature_options TEXT[] DEFAULT '{}',
  rating NUMERIC(3, 1) DEFAULT 4.8,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Member Profiles Table (Linked with Clerk user_id)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id VARCHAR(50) UNIQUE, -- e.g. 'GH-001'
  clerk_id VARCHAR(100) UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(50),
  tier VARCHAR(50) DEFAULT 'Regular', -- 'Regular', 'Silver', 'Gold', 'Artisan Club'
  stamps INTEGER DEFAULT 0 CHECK (stamps >= 0 AND stamps <= 10),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(50) PRIMARY KEY, -- e.g. 'GHR-1024'
  clerk_id VARCHAR(100),
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  order_type VARCHAR(50) NOT NULL, -- 'Dine-in', 'Takeaway', 'Delivery'
  table_number VARCHAR(20),
  delivery_address TEXT,
  payment_method VARCHAR(50) NOT NULL, -- 'QRIS', 'Tunai', 'Transfer Bank'
  subtotal NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  queue_number VARCHAR(20) NOT NULL, -- e.g. '#A-18'
  status VARCHAR(50) DEFAULT 'Diproses', -- 'Menunggu', 'Diproses', 'Selesai'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES public.products(id),
  product_name VARCHAR(150) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL,
  selected_option VARCHAR(50), -- 'Panas' / 'Dingin'
  subtotal NUMERIC(12, 2) NOT NULL
);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO public.categories (name, slug) VALUES
  ('Kopi', 'kopi'),
  ('Makanan', 'makanan'),
  ('Camilan', 'camilan'),
  ('Minuman', 'minuman')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (id, name, category, price, description, image, badge, temperature_options, rating) VALUES
  ('gh-01', 'Signature Aren Latte', 'Kopi', 25000, 'Espresso house blend gayo dipadu susu segar dan sirup gula aren organik.', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop', 'Terlaris', ARRAY['Panas', 'Dingin'], 4.9),
  ('gh-02', 'Artisan V60 Pour Over', 'Kopi', 28000, 'Biji kopi single origin pilihan dataran tinggi Gayo diseduh manual dengan metode V60.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop', 'Pilihan Barista', ARRAY['Panas', 'Dingin'], 4.9),
  ('gh-03', 'Flat White Melbourne', 'Kopi', 26000, 'Double shot ristretto berkarakter kuat dengan microfoam susu yang lembut dan velvety.', 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=800&auto=format&fit=crop', NULL, ARRAY['Panas'], 4.8),
  ('gh-04', 'Cold Brew Citrus', 'Kopi', 27000, 'Ekstraksi dingin selama 18 jam dengan sentuhan kesegaran irisan jeruk sunkist.', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop', 'Musim Ini', ARRAY['Dingin'], 4.7),
  ('gh-05', 'Espresso Single Origin', 'Kopi', 22000, 'Ekstraksi murni biji kopi arabika pilihan dengan crema tebal dan aroma cokelat gelap.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', NULL, ARRAY['Panas'], 4.9),
  ('gh-06', 'Sourdough Toast & Scramble', 'Makanan', 38000, 'Roti sourdough panggang renyah disajikan dengan telur orak-arik lembut minyak truffle.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop', 'Sarapan Favorit', ARRAY[]::TEXT[], 4.9),
  ('gh-07', 'Japanese Katsu Curry', 'Makanan', 42000, 'Fillet ayam renyah keemasan berpadu kuah kari kental rempah Jepang dan nasi pulen.', 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=800&auto=format&fit=crop', NULL, ARRAY[]::TEXT[], 4.8),
  ('gh-08', 'Smoked Beef Aglio Olio', 'Makanan', 36000, 'Spaghetti al dente ditumis dengan minyak zaitun murni, bawang putih, cabai kering & daging asap.', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop', NULL, ARRAY[]::TEXT[], 4.7),
  ('gh-09', 'Almond Croissant Butter', 'Camilan', 24000, 'Pastry mentega berlapis ala Prancis dengan isian krim frangipane dan taburan almond panggang.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop', 'Paling Disukai', ARRAY[]::TEXT[], 4.9),
  ('gh-10', 'Cinnamon Canele Bordeaux', 'Camilan', 18000, 'Kue tradisional Prancis berkerak karamel renyah dengan isian custard vanila lembut.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop', NULL, ARRAY[]::TEXT[], 4.8),
  ('gh-11', 'Truffle Fries & Parmesan', 'Camilan', 25000, 'Kentang goreng renyah bumbu sea salt, aroma minyak truffle putih & parutan keju parmesan asli.', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop', NULL, ARRAY[]::TEXT[], 4.7),
  ('gh-12', 'Matcha Ceremonial Latte', 'Minuman', 29000, 'Bubuk teh hijau matcha grade seremonial dari Uji, Kyoto dikocok tangan bersama susu lembut.', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop', NULL, ARRAY['Panas', 'Dingin'], 4.9),
  ('gh-13', 'Hojicha Roasted Tea', 'Minuman', 27000, 'Teh hijau panggang dengan aroma kayu dan karamel naturally sweet rendah kafein.', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop', NULL, ARRAY['Panas', 'Dingin'], 4.8),
  ('gh-14', 'Chamomile Blossom Infusion', 'Minuman', 23000, 'Seduhan bunga kamomil utuh dengan aroma madu alami untuk relaksasi tubuh dan pikiran.', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800&auto=format&fit=crop', NULL, ARRAY['Panas'], 4.7)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products & categories
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

-- Allow public insert & read orders and order items
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Order Items" ON public.order_items FOR SELECT USING (true);

-- Allow public read, insert, and update members
CREATE POLICY "Public Read Members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public Insert Members" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Members" ON public.members FOR UPDATE USING (true);

