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
  CalendarDays,
  X as XIcon,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
} from '@/app/actions/schedules';
import { Schedule } from '@/lib/api/schedules';

interface SchedulesManagerClientProps {
  initialSchedules: Schedule[];
}

export default function SchedulesManagerClient({ initialSchedules }: SchedulesManagerClientProps) {
  const [scheduleList, setScheduleList] = useState<Schedule[]>(initialSchedules);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form state
  const [batchName, setBatchName] = useState('');
  const [batchTag, setBatchTag] = useState('');
  const [focus, setFocus] = useState('');
  const [standards, setStandards] = useState<string[]>(['']);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showFormModal, setShowFormModal] = useState(false);

  const router = useRouter();

  const resetForm = () => {
    setBatchName('');
    setBatchTag('');
    setFocus('');
    setStandards(['']);
    setStartTime('');
    setEndTime('');
    setIsActive(true);
    setErrors({});
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleEditClick = (schedule: Schedule) => {
    resetForm();
    setCurrentId(schedule.id);
    setBatchName(schedule.batch_name);
    setBatchTag(schedule.batch_tag);
    setFocus(schedule.focus);
    setStandards(schedule.standards.length > 0 ? schedule.standards : ['']);
    setStartTime(schedule.start_time);
    setEndTime(schedule.end_time);
    setIsActive(schedule.is_active);
    setIsEditing(true);
    setShowFormModal(true);
  };

  // Standards array helpers
  const addStandard = () => {
    if (standards.length < 10) setStandards([...standards, '']);
  };
  const removeStandard = (index: number) => {
    const updated = standards.filter((_, i) => i !== index);
    setStandards(updated.length > 0 ? updated : ['']);
  };
  const updateStandard = (index: number, value: string) => {
    const updated = [...standards];
    updated[index] = value;
    setStandards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const cleanedStandards = standards.map((s) => s.trim()).filter(Boolean);

    const payload = {
      batch_name: batchName,
      batch_tag: batchTag,
      focus,
      standards: cleanedStandards,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
    };

    try {
      let res;
      if (isEditing && currentId) {
        res = await updateScheduleAction(currentId, payload);
      } else {
        res = await createScheduleAction(payload);
      }

      if (res.success) {
        toast.success(isEditing ? 'Schedule updated successfully!' : 'Schedule created successfully!');
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

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the schedule "${name}"?`)) return;

    const toastId = toast.loading('Deleting schedule...');
    try {
      const res = await deleteScheduleAction(id);
      if (res.success) {
        toast.success('Schedule deleted successfully.', { id: toastId });
        setScheduleList(scheduleList.filter((s) => s.id !== id));
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to delete schedule.', { id: toastId });
      }
    } catch {
      toast.error('Network error deleting schedule.', { id: toastId });
    }
  };

  const focusWordCount = focus.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 selection:bg-red-600 selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider">Batch Schedules</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1.5">
            Manage batch timetables shown on the public programs section · Max 20 schedules
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs transition-colors rounded-none cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" /> Add Schedule
        </button>
      </div>

      {/* Count info */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        <CalendarDays className="w-3.5 h-3.5 text-red-500" />
        <span className="text-zinc-400">Total Schedules:</span>
        <span className={scheduleList.length >= 20 ? 'text-red-400' : 'text-emerald-400'}>
          {scheduleList.length} / 20
        </span>
      </div>

      {/* Schedule List */}
      {scheduleList.length === 0 ? (
        <div className="bg-zinc-900/30 border border-zinc-800 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-300">
              No Schedules Added
            </h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
              Add batch schedules to display them in the Programs section on the public website.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduleList.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-zinc-900 border flex flex-col lg:flex-row lg:items-start gap-0 transition-all overflow-hidden ${
                schedule.is_active ? 'border-zinc-700' : 'border-zinc-800 opacity-60'
              }`}
            >
              {/* Left content */}
              <div className="flex-1 p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">
                    {schedule.batch_name}
                  </h3>
                  <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-600/30 text-[9px] font-black uppercase tracking-widest">
                    {schedule.batch_tag}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                      schedule.is_active
                        ? 'bg-emerald-600/10 text-emerald-400 border-emerald-600/30'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}
                  >
                    {schedule.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Focus: <span className="text-zinc-300 font-extrabold">{schedule.focus}</span>
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {schedule.standards.map((std, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-[9px] font-black text-zinc-300 uppercase tracking-widest"
                    >
                      {std}
                    </span>
                  ))}
                </div>

                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  Added: {new Date(schedule.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Right: time + actions */}
              <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center lg:items-center border-t lg:border-t-0 lg:border-l border-zinc-800">
                {/* Time block */}
                <div className="bg-red-600 text-white px-6 py-4 text-center flex-1 lg:flex-none lg:w-full lg:min-w-[180px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-200 mb-1">Timing</p>
                  <p className="text-sm font-black tracking-widest uppercase whitespace-nowrap">
                    {schedule.start_time}
                  </p>
                  <p className="text-[9px] text-red-200 font-bold tracking-widest">TO</p>
                  <p className="text-sm font-black tracking-widest uppercase whitespace-nowrap">
                    {schedule.end_time}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex lg:flex-row gap-2 p-3">
                  <button
                    onClick={() => handleEditClick(schedule)}
                    className="p-2 border border-zinc-700 hover:border-white text-white transition-colors flex items-center justify-center cursor-pointer rounded-none"
                    title="Edit schedule"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(schedule.id, schedule.batch_name)}
                    className="p-2 border border-red-950 text-red-500 hover:bg-red-950/20 hover:border-red-800 transition-colors flex items-center justify-center cursor-pointer rounded-none"
                    title="Delete schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !saving && setShowFormModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative bg-zinc-900 border border-zinc-800 max-w-xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider">
                {isEditing ? 'Edit Schedule' : 'Add New Schedule'}
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
              {/* Batch Name & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="batch-name" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Batch Name (max 50 chars)
                  </label>
                  <input
                    id="batch-name"
                    type="text"
                    required
                    maxLength={50}
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g. Evening Batch"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-red-600 focus:outline-none transition-colors rounded-none"
                  />
                  {errors.batch_name && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.batch_name[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="batch-tag" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Batch Tag (max 30 chars)
                  </label>
                  <input
                    id="batch-tag"
                    type="text"
                    required
                    maxLength={30}
                    value={batchTag}
                    onChange={(e) => setBatchTag(e.target.value)}
                    placeholder="e.g. SSC Board Preparation"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-red-600 focus:outline-none transition-colors rounded-none"
                  />
                  {errors.batch_tag && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.batch_tag[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Focus */}
              <div className="space-y-1.5">
                <label htmlFor="batch-focus" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Focus (max 20 words)
                </label>
                <input
                  id="batch-focus"
                  type="text"
                  required
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g. Hindi Subject Special Batch"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-red-600 focus:outline-none transition-colors rounded-none"
                />
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span className={focusWordCount > 20 ? 'text-red-500 font-bold' : ''}>
                    Words: {focusWordCount} / 20
                  </span>
                  {errors.focus && (
                    <span className="text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.focus[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Start / End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="start-time" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Start Time
                  </label>
                  <input
                    id="start-time"
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-red-600 focus:outline-none transition-colors rounded-none"
                  />
                  {errors.start_time && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.start_time[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="end-time" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    End Time
                  </label>
                  <input
                    id="end-time"
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-red-600 focus:outline-none transition-colors rounded-none"
                  />
                  {errors.end_time && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.end_time[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Standards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Standards / Classes (1–10)
                  </label>
                  {standards.length < 10 && (
                    <button
                      type="button"
                      onClick={addStandard}
                      className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {standards.map((std, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={std}
                        onChange={(e) => updateStandard(idx, e.target.value)}
                        placeholder={`e.g. ${idx + 8}th Standard`}
                        className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-red-600 focus:outline-none transition-colors rounded-none"
                      />
                      {standards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStandard(idx)}
                          className="p-2 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-900 transition-colors cursor-pointer rounded-none"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.standards && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.standards[0]}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Active Status</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Active schedules appear on the public website</p>
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
                    <><ToggleRight className="w-4 h-4" /> Active</>
                  ) : (
                    <><ToggleLeft className="w-4 h-4" /> Inactive</>
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
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                  ) : (
                    <span>{isEditing ? 'Update Schedule' : 'Create Schedule'}</span>
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
