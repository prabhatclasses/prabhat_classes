import { getFaculty } from '@/lib/api/faculty';
import { getToppers } from '@/lib/api/toppers';
import { getAllNotices } from '@/lib/api/notices';
import { getAllSchedules } from '@/lib/api/schedules';
import { verifyAdminSession } from '@/lib/supabase/admin';
import {
  Users,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  WifiOff,
  Database,
  Bell,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardOverview() {
  const session = await verifyAdminSession();
  const facultyRes = await getFaculty();
  const toppersRes = await getToppers();
  const noticesRes = await getAllNotices();
  const schedulesRes = await getAllSchedules();

  const totalFaculty = facultyRes.isOffline ? null : facultyRes.data.length;
  const totalToppers = toppersRes.isOffline ? null : toppersRes.data.length;
  const activeNotices = noticesRes.isOffline
    ? null
    : noticesRes.data.filter((n) => n.is_active).length;
  const totalSchedules = schedulesRes.isOffline ? null : schedulesRes.data.length;

  const anyOffline =
    facultyRes.isOffline || toppersRes.isOffline || noticesRes.isOffline || schedulesRes.isOffline;

  return (
    <div className="space-y-10 selection:bg-red-600 selection:text-white">
      {/* Welcome Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-red-600/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Security Access Clear</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              Welcome, {session.user?.email || 'Administrator'}
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              This is the Prabhat Coaching Classes content control center. Manage faculty,
              toppers, notices, and batch schedules from here.
            </p>
          </div>
          <div className="text-xs text-zinc-550 font-medium uppercase tracking-wider self-start md:self-center bg-zinc-950 px-3.5 py-2 border border-zinc-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Session Active
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Faculty Stats */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Faculty</p>
              {facultyRes.isOffline ? (
                <div className="flex items-center gap-2 mt-2">
                  <WifiOff className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-400 font-bold text-sm uppercase tracking-wide">Offline</span>
                </div>
              ) : (
                <h3 className="text-4xl font-black uppercase tracking-tight">{totalFaculty}</h3>
              )}
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 text-red-500">
              <Users className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-800 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              {facultyRes.isOffline ? (
                <><WifiOff className="w-3 h-3 text-amber-500" /><span className="text-amber-500">Unavailable</span></>
              ) : (
                <><Database className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Live Data</span></>
              )}
            </span>
            <Link href="/admin/faculty" className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wide flex items-center gap-1.5 transition-colors">
              Manage <ArrowRight className="w-3 h-3 text-red-500" />
            </Link>
          </div>
        </div>

        {/* Toppers Stats */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Topper Records</p>
              {toppersRes.isOffline ? (
                <div className="flex items-center gap-2 mt-2">
                  <WifiOff className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-400 font-bold text-sm uppercase tracking-wide">Offline</span>
                </div>
              ) : (
                <h3 className="text-4xl font-black uppercase tracking-tight">{totalToppers}</h3>
              )}
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 text-red-500">
              <GraduationCap className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-800 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              {toppersRes.isOffline ? (
                <><WifiOff className="w-3 h-3 text-amber-500" /><span className="text-amber-500">Unavailable</span></>
              ) : (
                <><Database className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Live Data</span></>
              )}
            </span>
            <Link href="/admin/toppers" className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wide flex items-center gap-1.5 transition-colors">
              Manage <ArrowRight className="w-3 h-3 text-red-500" />
            </Link>
          </div>
        </div>

        {/* Notices Stats */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Notices</p>
              {noticesRes.isOffline ? (
                <div className="flex items-center gap-2 mt-2">
                  <WifiOff className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-400 font-bold text-sm uppercase tracking-wide">Offline</span>
                </div>
              ) : (
                <h3 className="text-4xl font-black uppercase tracking-tight">
                  {activeNotices}
                  <span className="text-zinc-600 text-lg font-black"> / 5</span>
                </h3>
              )}
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 text-red-500">
              <Bell className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-800 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              {noticesRes.isOffline ? (
                <><WifiOff className="w-3 h-3 text-amber-500" /><span className="text-amber-500">Unavailable</span></>
              ) : (
                <><Database className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Live Data</span></>
              )}
            </span>
            <Link href="/admin/notices" className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wide flex items-center gap-1.5 transition-colors">
              Manage <ArrowRight className="w-3 h-3 text-red-500" />
            </Link>
          </div>
        </div>

        {/* Schedules Stats */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Batch Schedules</p>
              {schedulesRes.isOffline ? (
                <div className="flex items-center gap-2 mt-2">
                  <WifiOff className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-400 font-bold text-sm uppercase tracking-wide">Offline</span>
                </div>
              ) : (
                <h3 className="text-4xl font-black uppercase tracking-tight">
                  {totalSchedules}
                  <span className="text-zinc-600 text-lg font-black"> / 20</span>
                </h3>
              )}
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 text-red-500">
              <CalendarDays className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-800 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              {schedulesRes.isOffline ? (
                <><WifiOff className="w-3 h-3 text-amber-500" /><span className="text-amber-500">Unavailable</span></>
              ) : (
                <><Database className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Live Data</span></>
              )}
            </span>
            <Link href="/admin/schedules" className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wide flex items-center gap-1.5 transition-colors">
              Manage <ArrowRight className="w-3 h-3 text-red-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Offline Warning Banner */}
      {anyOffline && (
        <div className="bg-amber-950/20 border border-amber-900/40 p-5 flex items-start gap-4">
          <WifiOff className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-amber-400 text-sm font-bold uppercase tracking-wide">
              Database Connection Issue
            </p>
            <p className="text-amber-300/70 text-xs leading-relaxed">
              One or more data sources are currently offline. The public-facing website will continue
              serving cached fallback data. Reconnect to Supabase and refresh this page to see live record counts.
            </p>
          </div>
        </div>
      )}

      {/* Admin Action Guidelines Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 space-y-4">
        <h4 className="font-bold text-sm uppercase tracking-wider text-white">
          Control Panel Guidelines
        </h4>
        <ul className="space-y-2.5 text-xs text-zinc-400 leading-relaxed list-disc pl-4">
          <li>
            <strong>Notices:</strong> Active notices display in the announcement bar marquee at the top of the public site. Maximum 5 active at a time. Word limit: 50 words per notice.
          </li>
          <li>
            <strong>Batch Schedules:</strong> Active schedules appear in the Programs &amp; Timetables section. Use standards like "8th Standard", "9th Standard" to map to divisions. Max 20 total.
          </li>
          <li>
            <strong>Image Upload:</strong> Profile images are saved directly to the Supabase Storage bucket. Only PNG, JPG, JPEG formats up to 10MB.
          </li>
          <li>
            <strong>Data Fallbacks:</strong> If Supabase goes offline, the public site automatically loads static backup data — zero public downtime.
          </li>
        </ul>
      </div>
    </div>
  );
}
