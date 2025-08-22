// src/lib/supabase/server.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // ✅ Now this calls the imported function, not itself
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}