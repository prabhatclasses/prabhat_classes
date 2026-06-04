import { supabaseClient } from '@/lib/supabase/client';
import { fallbackNotices } from '@/data/fallback-notices';

export interface Notice {
  id: string;
  notice_text: string;
  is_active: boolean;
  created_at: string;
}

const getSupabaseInstance = () => {
  if (typeof window === 'undefined') {
    const { createSupabaseServer } = require('@/lib/supabase/server');
    return createSupabaseServer();
  }
  return supabaseClient;
};

// Fetch all notices (admin use — includes inactive)
export const getAllNotices = async (): Promise<{
  data: Notice[];
  error: string | null;
  isOffline: boolean;
}> => {
  try {
    const supabase = getSupabaseInstance();
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      return { data: data as Notice[], error: null, isOffline: false };
    }

    return { data: fallbackNotices, error: null, isOffline: true };
  } catch (error: any) {
    console.warn(
      '[Notices Service] Supabase unavailable, falling back to static data. Error:',
      error?.message || error
    );
    return {
      data: fallbackNotices,
      error: error?.message || 'Supabase error',
      isOffline: true,
    };
  }
};

// Fetch only active notices (public website use)
export const getActiveNotices = async (): Promise<{
  data: Notice[];
  error: string | null;
  isOffline: boolean;
}> => {
  try {
    const supabase = getSupabaseInstance();
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      return { data: data as Notice[], error: null, isOffline: false };
    }

    // Return active fallback notices only
    const activeFallbacks = fallbackNotices.filter((n) => n.is_active);
    return { data: activeFallbacks, error: null, isOffline: true };
  } catch (error: any) {
    console.warn(
      '[Notices Service] Supabase unavailable, using static fallback. Error:',
      error?.message || error
    );
    const activeFallbacks = fallbackNotices.filter((n) => n.is_active);
    return {
      data: activeFallbacks,
      error: error?.message || 'Supabase error',
      isOffline: true,
    };
  }
};
