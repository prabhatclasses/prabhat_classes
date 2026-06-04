'use server';

import { verifyAdminSession } from '@/lib/supabase/admin';
import { createSupabaseServer } from '@/lib/supabase/server';
import { noticeSchema } from '@/lib/supabase/schemas';
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

export async function createNoticeAction(formData: { notice_text: string; is_active: boolean }) {
  try {
    await authenticateAdmin();

    const parsed = noticeSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const supabase = createSupabaseServer();

    // Max 5 active notices
    if (parsed.data.is_active) {
      const { count, error: countError } = await supabase
        .from('notices')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (countError) {
        return { success: false, message: countError.message };
      }
      if (count !== null && count >= 5) {
        return {
          success: false,
          message: 'Maximum 5 active notices allowed. Deactivate an existing notice first.',
        };
      }
    }

    const { data, error } = await supabase
      .from('notices')
      .insert([{ notice_text: parsed.data.notice_text, is_active: parsed.data.is_active }])
      .select()
      .single();

    if (error) {
      console.error('[createNoticeAction] DB Error:', error);
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/notices');
    return { success: true, id: data?.id };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Server error' };
  }
}

export async function updateNoticeAction(
  id: string,
  formData: { notice_text: string; is_active: boolean }
) {
  try {
    await authenticateAdmin();

    if (!isValidUUID(id)) {
      return { success: false, message: 'Fallback records cannot be modified.' };
    }

    const parsed = noticeSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const supabase = createSupabaseServer();

    // If activating, check count limit (excluding self)
    if (parsed.data.is_active) {
      const { count, error: countError } = await supabase
        .from('notices')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .neq('id', id);

      if (countError) {
        return { success: false, message: countError.message };
      }
      if (count !== null && count >= 5) {
        return {
          success: false,
          message: 'Maximum 5 active notices allowed. Deactivate another notice first.',
        };
      }
    }

    const { data, error } = await supabase
      .from('notices')
      .update({ notice_text: parsed.data.notice_text, is_active: parsed.data.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateNoticeAction] DB Error:', error);
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/notices');
    return { success: true, id: data?.id };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Server error' };
  }
}

export async function deleteNoticeAction(id: string) {
  try {
    await authenticateAdmin();

    if (!isValidUUID(id)) {
      return { success: true, message: 'Fallback record handled.' };
    }

    const supabase = createSupabaseServer();
    const { error } = await supabase.from('notices').delete().eq('id', id);

    if (error) {
      console.error('[deleteNoticeAction] DB Error:', error);
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/notices');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Server error' };
  }
}

export async function toggleNoticeActiveAction(id: string, currentActive: boolean) {
  try {
    await authenticateAdmin();

    if (!isValidUUID(id)) {
      return { success: false, message: 'Fallback records cannot be toggled.' };
    }

    const supabase = createSupabaseServer();

    // If activating, check count limit (excluding self)
    if (!currentActive) {
      const { count, error: countError } = await supabase
        .from('notices')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .neq('id', id);

      if (countError) {
        return { success: false, message: countError.message };
      }
      if (count !== null && count >= 5) {
        return {
          success: false,
          message: 'Maximum 5 active notices allowed. Deactivate another notice first.',
        };
      }
    }

    const { error } = await supabase
      .from('notices')
      .update({ is_active: !currentActive })
      .eq('id', id);

    if (error) {
      console.error('[toggleNoticeActiveAction] DB Error:', error);
      return { success: false, message: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/notices');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Server error' };
  }
}
