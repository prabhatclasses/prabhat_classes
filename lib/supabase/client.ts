import { createClient } from '@supabase/supabase-js';

// Use a lazy getter to avoid calling createClient at module load time
// during Next.js build/SSR when env vars may not yet be resolved.
let _client: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
};

// Keep backward-compatible named export as a getter proxy
export const supabaseClient = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});
