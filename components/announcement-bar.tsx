import { getActiveNotices } from '@/lib/api/notices';

// This is a server component — no 'use client' needed
// It fetches notices from Supabase and falls back to static data automatically
export async function AnnouncementBar() {
  const { data: notices } = await getActiveNotices();

  // Join active notice texts into a single marquee string
  const text =
    notices.length > 0
      ? notices.map((n) => n.notice_text).join(' • ')
      : '⚡ ADMISSIONS OPEN FOR BATCH 2026 - 2027 • REGISTER NOW & GET 10 DAYS FREE DEMO CLASS SEAT RISK-FREE • BATCHES FILLING FAST • CALL 8286080756 ⚡';

  return (
    <a
      href="tel:8286080756"
      className="fixed top-0 left-0 right-0 z-[60] bg-red-600 overflow-hidden h-[37px] flex items-center hover:bg-red-700 transition-colors cursor-pointer select-none"
      title="Call Prabhat Classes Now"
    >
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner {
          display: flex;
          animation: marquee-scroll 30s linear infinite;
          width: max-content;
        }
        .marquee-inner:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-inner text-white text-xs font-bold tracking-widest uppercase whitespace-nowrap">
        <span className="pr-16">{text}</span>
        <span className="pr-16">{text}</span>
        <span className="pr-16">{text}</span>
        <span className="pr-16">{text}</span>
      </div>
    </a>
  );
}
