import { getActiveSchedules } from '@/lib/api/schedules';
import { AnnouncementBar } from '@/components/announcement-bar';
import HomeClient from '@/components/home-client';

export const revalidate = 60;

export default async function Home() {
  const { data: schedules } = await getActiveSchedules();
  const sanitizedSchedules = JSON.parse(JSON.stringify(schedules));

  return (
    <>
      {/* AnnouncementBar is a server component — rendered at server level */}
      <AnnouncementBar />
      <HomeClient schedules={sanitizedSchedules} />
    </>
  );
}
