import { getAllNotices } from '@/lib/api/notices';
import NoticesManagerClient from '@/components/notices-manager-client';

export const revalidate = 0;

export default async function AdminNoticesPage() {
  const result = await getAllNotices();
  const sanitizedNotices = JSON.parse(JSON.stringify(result.data || []));

  return (
    <div className="w-full">
      <NoticesManagerClient initialNotices={sanitizedNotices} />
    </div>
  );
}
