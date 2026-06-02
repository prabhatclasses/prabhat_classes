'use client';

import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

/**
 * SupabaseWakeup
 *
 * Silently pings Supabase on every page load by fetching a single row
 * from the toppers table. This keeps the Supabase instance from going
 * to sleep and ensures instant response when the real data is needed.
 *
 * Nothing is rendered; nothing changes on the UI.
 */
export default function SupabaseWakeup() {
  useEffect(() => {
    const wakeup = async () => {
      try {
        await supabaseClient
          .from('toppers')
          .select('student_name')
          .limit(1);
        // Intentionally ignoring the result — this is a fire-and-forget ping.
      } catch {
        // Silently swallow any error; this is a best-effort wakeup call.
      }
    };

    wakeup();
  }, []); // runs once after the component mounts (i.e. on every page load/reload)

  return null; // renders nothing
}
