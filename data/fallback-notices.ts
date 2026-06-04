// Static fallback notices — shown when Supabase is unavailable
export interface FallbackNotice {
  id: string;
  notice_text: string;
  is_active: boolean;
  created_at: string;
}

export const fallbackNotices: FallbackNotice[] = [
  {
    id: 'fallback-1',
    notice_text:
      '⚡ ADMISSIONS OPEN FOR BATCH 2026 - 2027 • REGISTER NOW & GET 10 DAYS FREE DEMO CLASS SEAT RISK-FREE • BATCHES FILLING FAST • CALL 8286080756 ⚡',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
