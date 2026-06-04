import { supabaseClient } from '@/lib/supabase/client';
import { fallbackSchedules } from '@/data/fallback-schedules';

export interface Schedule {
  id: string;
  batch_name: string;
  batch_tag: string;
  focus: string;
  standards: string[];
  start_time: string;
  end_time: string;
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

// Fetch all schedules (admin use — includes inactive)
export const getAllSchedules = async (): Promise<{
  data: Schedule[];
  error: string | null;
  isOffline: boolean;
}> => {
  try {
    const supabase = getSupabaseInstance();
    const { data, error } = await supabase
      .from('batch_schedules')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return { data: data as Schedule[], error: null, isOffline: false };
    }

    return { data: fallbackSchedules, error: null, isOffline: true };
  } catch (error: any) {
    console.warn(
      '[Schedules Service] Supabase unavailable, falling back to static data. Error:',
      error?.message || error
    );
    return {
      data: fallbackSchedules,
      error: error?.message || 'Supabase error',
      isOffline: true,
    };
  }
};

// Fetch only active schedules (public website use)
export const getActiveSchedules = async (): Promise<{
  data: Schedule[];
  error: string | null;
  isOffline: boolean;
}> => {
  try {
    const supabase = getSupabaseInstance();
    const { data, error } = await supabase
      .from('batch_schedules')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return { data: data as Schedule[], error: null, isOffline: false };
    }

    const activeFallbacks = fallbackSchedules.filter((s) => s.is_active);
    return { data: activeFallbacks, error: null, isOffline: true };
  } catch (error: any) {
    console.warn(
      '[Schedules Service] Supabase unavailable, using static fallback. Error:',
      error?.message || error
    );
    const activeFallbacks = fallbackSchedules.filter((s) => s.is_active);
    return {
      data: activeFallbacks,
      error: error?.message || 'Supabase error',
      isOffline: true,
    };
  }
};
