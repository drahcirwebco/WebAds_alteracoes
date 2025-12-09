import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// URLs e chaves para Google Ads (Gallant)
const supabaseUrlGoogle = process.env.SUPABASE_URL_GOOGLE || 'https://pyinmcinjcyelavkuhfl.supabase.co';
const supabaseAnonKeyGoogle = process.env.SUPABASE_ANON_KEY_GOOGLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aW5tY2luamN5ZWxhdmt1aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODA0NDIsImV4cCI6MjA2MzI1NjQ0Mn0.5UbxNTluLWoy56tBLL6tAAZZwLMj17uUDR8_nd9IMWA';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️  AVISO: Variáveis Supabase não configuradas');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  console.error('');
  console.error('   Configure no backend/.env:');
  console.error('   SUPABASE_URL=https://xxxx.supabase.co');
  console.error('   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
}

// Cliente padrão com ANON_KEY (para requisições do frontend - Meta Ads)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Cliente para Google Ads (Gallant)
export const supabaseGoogle = createClient(
  supabaseUrlGoogle,
  supabaseAnonKeyGoogle
);

// Cliente com SERVICE_ROLE_KEY (para requisições do backend com mais permissões)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseServiceKey
    )
  : null;

console.log('✓ Supabase client initialized');
if (supabaseServiceKey) {
  console.log('✓ Supabase admin client (service role) available');
} else {
  console.log('⚠️  Supabase service role key not configured - using public access');
}

