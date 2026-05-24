import { createClient } from '@supabase/supabase-js';

// Singleton pattern para evitar múltiplas instâncias
let supabaseInstance: any = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseInstance;
}

// Para compatibilidade com código existente
export const supabase = getSupabaseClient();