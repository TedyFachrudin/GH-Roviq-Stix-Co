import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from './products-data';
import { Product } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-placeholder.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'demo-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Checks whether valid Supabase credentials have been configured in .env.local
 */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('demo-placeholder') &&
    !key.includes('demo-anon-key')
  );
};

/**
 * Fetch products from Supabase table 'products', with seamless fallback to PRODUCTS if offline/not configured
 */
export async function getProductsFromSupabase(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return PRODUCTS;
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      description: item.description || '',
      image: item.image,
      badge: item.badge || undefined,
      temperatureOptions: item.temperature_options || [],
      rating: Number(item.rating) || 4.8,
    }));
  } catch {
    return PRODUCTS;
  }
}
