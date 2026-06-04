'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  XCircle,
  AlertCircle,
  Bell,
  BellOff,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  createNoticeAction,
  updateNoticeAction,
  deleteNoticeAction,
  toggleNoticeActiveAction,
} from '@/app/actions/notices';
import { Notice } from '@/lib/api/notices';

interface NoticesManagerClientProps {
  initialNotices: Notice[];
}

function countWords(str: string) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export default function NoticesManagerClient({ initialNotices }: NoticesManagerClientProps) {
  const [noticeList, setNoticeList] = useState<Notice[]>(initialNotices);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form state
  const [noticeText, setNoticeText] = useState('');
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showFormModal, setShowFormModal] = useState(false);

  const router = useRouter();

  const resetForm = () => {
    setNoticeText('');
    setIsActive(true);
    setErrors({});
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleEditClick = (notice: Notice) => {
    resetForm();
    setCurrentId(notice.id);
    setNoticeText(notice.notice_text);
    setIsActive(notice.is_active);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const payload = { notice_text: noticeText, is_active: isActive };

    try {
      let res;
      if (isEditing && currentId) {
        res = await updateNoticeAction(currentId, payload);
      } else {
        res = await createNoticeAction(payload);
      }

      if (res.success) {
        toast.success(isEditing ? 'Notice updated successfully!' : 'Notice created successfully!');
        setShowFormModal(false);
        resetForm();
        router.refresh();
        window.location.reload();
      } else if (res.errors) {
        setErrors(res.errors as Record<string, string[]>);
        toast.error('Validation failed. Please fix the errors below.');
      } else {
        toast.error(res.message || 'An error occurred.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this notice?')) return;

    const toastId = toast.loading('Deleting notice...');
    try {
      const res = await deleteNoticeAction(id);
      if (res.success) {
        toast.success('Notice deleted successfully.', { id: toastId });
        setNoticeList(noticeList.filter((n) => n.id !== id));
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to delete notice.', { id: toastId });
      }
    } catch {
      toast.error('Network error deleting notice.', { id: toastId });
    }
  };

  const handleToggleClick = async (notice: Notice) => {
    setToggling(notice.id);
    const toastId = toast.loading(notice.is_active ? 'Deactivating notice...' : 'Activating notice...');

    try {
      const res = await toggleNoticeActiveAction(notice.id, notice.is_active);
      if (res.success) {
        toast.success(
          notice.is_active ? 'Notice deactivated.' : 'Notice activated and now live!',
          { id: toastId }
        );
        setNoticeList(
          noticeList.map((n) => (n.id === notice.id ? { ...n, is_active: !n.is_active } : n))
        );
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to toggle notice.', { id: toastId });
      }
    } catch {
      toast.error('Network error toggling notice.', { id: toastId });
    } finally {
      setToggling(null);
    }
  };

  const activeCount = noticeList.filter((n) => n.is_active).length;
  const wordCount = countWords(noticeText);

  return (
    <div className="space-y-8 selection:bg-red-600 selection:text-white">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider">Notice Management</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1.5">
            Manage public announcement bar notices · Max 5 active at a time
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs transition-colors rounded-none cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" /> Create Notice
        </button>
      </div>

      {/* Active count indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase tracking-widest">
          <Bell className="w-3.5 h-3.5 text-red-500" />
          <span className="text-zinc-400">Active Notices:</span>
          <span className={activeCount >= 5 ? 'text-red-400' : 'text-emerald-400'}>
            {activeCount} / 5
          </span>
        </div>
        {activeCount >= 5 && (
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Limit reached — deactivate a notice before creating another active one
          </p>
        )}
      </div>

      {/* Notice List */}
      {noticeList.length === 0 ? (
        <div className="bg-zinc-900/30 border border-zinc-800 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Bell className="w-8 h-8 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-300">
              No Notices Created
            </h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
              Create your first notice to display it in the announcement bar on the public website.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {noticeList.map((notice) => (
            <div
              key={notice.id}
              className={`bg-zinc-900 border flex flex-col sm:flex-row sm:items-start gap-4 p-5 transition-all ${
                notice.is_active ? 'border-zinc-700' : 'border-zinc-800 opacity-60'
              }`}
            >
              {/* Status indicator strip */}
              <div
                className={`hidden sm:flex w-1 self-stretch flex-shrink-0 ${
                  notice.is_active ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                      notice.is_active
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {notice.is_active ? '● ACTIVE' : '○ INACTIVE'}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                    {new Date(notice.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                    {countWords(notice.notice_text)} words
                  </span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed break-words line-clamp-2">
                  {notice.notice_text}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle */}
                <button
                  onClick={() => handleToggleClick(notice)}
                  disabled={toggling === notice.id}
                  title={notice.is_active ? 'Deactivate notice' : 'Activate notice'}
                  className={`p-2 border transition-colors flex items-center justify-center cursor-pointer rounded-none disabled:opacity-40 ${
                    notice.is_active
                      ? 'border-emerald-800 text-emerald-500 hover:bg-emerald-950/20 hover:border-emerald-600'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  {toggling === notice.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : notice.is_active ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleEditClick(notice)}
                  className="p-2 border border-zinc-700 hover:border-white text-white transition-colors flex items-center justify-center cursor-pointer rounded-none"
                  title="Edit notice"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteClick(notice.id)}
                  className="p-2 border border-red-950 text-red-500 hover:bg-red-950/20 hover:border-red-800 transition-colors flex items-center justify-center cursor-pointer rounded-none"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => !saving && setShowFormModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Form Card */}
          <div className="relative bg-zinc-900 border border-zinc-800 max-w-lg w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider">
                {isEditing ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              <button
                disabled={saving}
                onClick={() => setShowFormModal(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Notice Text */}
              <div className="space-y-1.5">
                <label
                  htmlFor="notice-text"
                  className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                >
                  Notice Text (max 50 words)
                </label>
                <textarea
                  id="notice-text"
                  required
                  rows={4}
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="e.g. ⚡ ADMISSIONS OPEN FOR BATCH 2026 - 2027 • REGISTER NOW..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-red-600 focus:outline-none transition-colors rounded-none resize-none"
                />
                <div className="flex justify-between items-center text-[9px] text-zinc-500">
                  <span className={wordCount > 50 ? 'text-red-500 font-bold' : ''}>
                    Words: {wordCount} / 50
                  </span>
                  {errors.notice_text && (
                    <span className="text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.notice_text[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Active Status</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Active notices appear in the announcement bar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/20 border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/30'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4" /> Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" /> Inactive
                    </>
                  )}
                </button>
              </div>

              {/* Submit / Cancel */}
              <div className="flex gap-4 border-t border-zinc-800 pt-6 mt-6">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 border border-zinc-700 hover:border-white text-white font-bold uppercase tracking-wider text-xs transition-colors rounded-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs transition-colors rounded-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Notice' : 'Create Notice'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
