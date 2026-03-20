import { createClient } from '@supabase/supabase-js';

const sanitizeHeaderValue = (val) => {
  if (typeof val !== 'string') return '';
  // Remove any characters that are not ISO-8859-1 (0-255)
  // This prevents the "String contains non ISO-8859-1 code point" fetch error
  return val.split('').filter(char => char.charCodeAt(0) <= 255).join('').trim();
};

const supabaseUrl = sanitizeHeaderValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeHeaderValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
