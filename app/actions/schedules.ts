'use server';

import { verifyAdminSession } from '@/lib/supabase/admin';
import { createSupabaseServer } from '@/lib/supabase/server';
import { scheduleSchema } from '@/lib/supabase/schemas';
import { revalidatePath } from 'next/cache';

async function authenticateAdmin() {
  const session = await verifyAdminSession();
  if (!session.authenticated) {
    throw new Error(`Unauthorized: ${session.error || 'Admin privilege required.'}`);
  }
  return session;
}

function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export async function createScheduleAction(formData: any) {
  try {
    await authenticateAdmin();

    const parsed = scheduleSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const supabase = createSupabaseServer();

    // Max 20 total schedules
    const { count, error: countError } = await supabase
      .from('batch_schedules')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { success: false, message: countError.message };
    }
    if (count !== null && count >= 20) {
      return {
        success: false,
        message: 'Maximum 20 schedules allowed. Delete an existing schedule first.',
      };
    }

    const { data, error } = await supabase
      .from('batch_schedules')
      .insert([
        {
          batch_name: parsed.data.batch_name,
          batch_tag: parsed.data.batch_tag,
          focus: parsed.data.focus,
          standards: parsed.data.standards,
          start_time: parsed.data.start_time,
          end_time: parsed.data.end_time,
          is_active: parsed.data.is_active,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[createScheduleAction] DB Error:', error);
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/schedules');
    return { success: true, id: data?.id };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Server error' };
  }
}

export async function updateScheduleAction(id: string, formData: any) {
  try {
    await authenticateAdmin();

    if (!isValidUUID(id)) {
      return { success: false, message: 'Fallback records cannot be modified.' };
    }

    const parsed = scheduleSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const supabase = createSupabaseServer();
    const { data, error } = await supabase
      .from('batch_schedules')
      .update({
        batch_name: parsed.data.batch_name,
        batch_tag: parsed.data.batch_tag,
        focus: parsed.data.focus,
        standards: parsed.data.standards,
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time,
        is_active: parsed.data.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateScheduleAction] DB Error:', error);
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/schedules');
    return { success: true, id: data?.id };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Server error' };
  }
}

export async function deleteScheduleAction(id: string) {
  try {
    await authenticateAdmin();

    if (!isValidUUID(id)) {
      return { success: true, message: 'Fallback record handled.' };
    }

    const supabase = createSupabaseServer();
    const { error } = await supabase.from('batch_schedules').delete().eq('id', id);

    if (error) {
      console.error('[deleteScheduleAction] DB Error:', error);
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/schedules');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Server error' };
  }
}
