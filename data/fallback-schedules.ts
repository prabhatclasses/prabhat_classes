// Static fallback schedules — shown when Supabase is unavailable
// Mirrors the hardcoded batchSchedules that were in programs-section.tsx

export interface FallbackSchedule {
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

export const fallbackSchedules: FallbackSchedule[] = [
  {
    id: 'fallback-morning',
    batch_name: 'Morning Batch (Hindi)',
    batch_tag: 'Hindi Special Batch',
    focus: 'Hindi Subject Special Batch',
    standards: ['8th Standard', '9th Standard', '10th Standard'],
    start_time: '08:00 AM',
    end_time: '11:00 AM',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-afternoon-1',
    batch_name: 'Afternoon Batch',
    batch_tag: 'Middle School',
    focus: 'Middle School Academic Foundation',
    standards: ['5th Standard', '6th Standard', '7th Standard'],
    start_time: '02:00 PM',
    end_time: '04:00 PM',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-afternoon-2',
    batch_name: 'Afternoon Batch',
    batch_tag: 'Middle School',
    focus: 'Middle School Academic Foundation',
    standards: ['5th Standard', '6th Standard', '7th Standard'],
    start_time: '03:00 PM',
    end_time: '05:00 PM',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-evening',
    batch_name: 'Evening Batch',
    batch_tag: 'SSC Board Preparation',
    focus: 'SSC Board Preparation',
    standards: ['8th Standard', '9th Standard', '10th Standard'],
    start_time: '05:00 PM',
    end_time: '09:00 PM',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
