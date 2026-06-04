import { getAllSchedules } from '@/lib/api/schedules';
import SchedulesManagerClient from '@/components/schedules-manager-client';

export const revalidate = 0;

export default async function AdminSchedulesPage() {
  const result = await getAllSchedules();
  const sanitizedSchedules = JSON.parse(JSON.stringify(result.data || []));

  return (
    <div className="w-full">
      <SchedulesManagerClient initialSchedules={sanitizedSchedules} />
    </div>
  );
}
