import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, TaskPriority, User } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { 
  X, 
  Save, 
  Trash2, 
  Calendar, 
  Clock, 
  Flag, 
  Paperclip, 
  CheckSquare, 
  Square, 
  Plus, 
  User as UserIcon,
  Tag,
  Palette,
  AlertCircle,
  Layers,
  FolderKanban
} from 'lucide-react';
import { formatDate, toISODate, calculateWorkingDaysInclusive, addWorkingDays } from '../../utils/dateUtils';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onSaveTask: (updatedTask: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onOpenAttachmentModal?: (task: Task) => void;
}

const COMMON_PHASES = [
  'General',
  'MKT',
  'AW Packaging',
  'Booth Design & 3D',
  'NPD & Formulation',
  'Material delivery',
  'Media & Ads',
  'POSM & Printing',
  'Shelf Audit & Trade',
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'Not Started', label: 'Not Started (ยังไม่เริ่ม)' },
  { value: 'In Progress', label: 'In Progress (กำลังทำ)' },
  { value: 'Done', label: 'Done (เสร็จสิ้น)' },
  { value: 'Briefing', label: 'Briefing' },
  { value: 'Designing', label: 'Designing' },
  { value: 'Review', label: 'Review' },
];

const PRIORITY_OPTIONS: TaskPriority[] = ['Urgent', 'High', 'Medium', 'Low'];

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  task,
  projects,
  onClose,
  onSaveTask,
  onDeleteTask,
  onOpenAttachmentModal,
}) => {
  const [taskName, setTaskName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [phase, setPhase] = useState('General');
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assigneeId, setAssigneeId] = useState(mockUsers[0].id);
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [isMilestone, setIsMilestone] = useState(false);

  // Graphic specs
  const [graphicFormat, setGraphicFormat] = useState<any>('1:1 Square');
  const [dimensions, setDimensions] = useState('');
  const [specsNotes, setSpecsNotes] = useState('');

  // Subtasks
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTaskName(task.taskName || '');
      setProjectId(task.projectId || (projects[0]?.id ?? ''));
      setPhase(task.phase || 'General');
      setStatus(task.status || 'In Progress');
      setPriority(task.priority || 'Medium');
      setAssigneeId(task.assignee?.id || mockUsers[0].id);
      setRole(task.role || task.assignee?.role || '');
      
      const isoStart = toISODate(task.startDate) || new Date().toISOString().slice(0, 10);
      const isoDue = toISODate(task.dueDate) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setStartDate(isoStart);
      setDueDate(isoDue);
      
      const days = task.durationDays || calculateWorkingDaysInclusive(isoStart, isoDue);
      setDurationDays(days);
      setIsMilestone(!!task.isMilestone);

      if (task.graphicSpecs) {
        setGraphicFormat(task.graphicSpecs.format || '1:1 Square');
        setDimensions(task.graphicSpecs.dimensions || '');
        setSpecsNotes(task.graphicSpecs.notes || '');
      } else {
        setGraphicFormat('1:1 Square');
        setDimensions('');
        setSpecsNotes('');
      }

      setSubtasks(task.subtasks ? [...task.subtasks] : []);
    }
  }, [task, isOpen, projects]);

  if (!isOpen || !task) return null;

  // Handle date changes with working days sync
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (newStart && durationDays > 0) {
      setDueDate(addWorkingDays(newStart, durationDays));
    }
  };

  const handleDueDateChange = (newDue: string) => {
    setDueDate(newDue);
    if (startDate && newDue) {
      setDurationDays(calculateWorkingDaysInclusive(startDate, newDue));
    }
  };

  const handleDurationChange = (days: number) => {
    const valid = Math.max(1, days);
    setDurationDays(valid);
    if (startDate) {
      setDueDate(addWorkingDays(startDate, valid));
    }
  };

  // Subtask handlers
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      alert('กรุณากรอกชื่องาน (Task Name)');
      return;
    }

    const assignedUser = mockUsers.find((u) => u.id === assigneeId) || task.assignee || mockUsers[0];
    const targetProj = projects.find((p) => p.id === projectId) || projects[0];

    const updatedTask: Task = {
      ...task,
      taskName: taskName.trim(),
      projectId: targetProj ? targetProj.id : task.projectId,
      projectName: targetProj ? targetProj.name : task.projectName,
      projectLead: targetProj ? targetProj.lead : task.projectLead,
      assignee: assignedUser,
      role: role.trim() || assignedUser.role,
      status,
      priority,
      startDate: startDate || task.startDate,
      dueDate: dueDate || task.dueDate,
      durationDays,
      phase: phase.trim() || 'General',
      isMilestone,
      graphicSpecs: role.toLowerCase().includes('graphic') || phase.toLowerCase().includes('aw') || phase.toLowerCase().includes('design') ? {
        format: graphicFormat,
        dimensions: dimensions.trim() || undefined,
        notes: specsNotes.trim() || undefined,
      } : task.graphicSpecs,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    };

    onSaveTask(updatedTask);
    onClose();
  };

  const handleDelete = () => {
    if (!onDeleteTask) return;
    if (confirm(`คุณต้องการลบงาน "${task.taskName}" ใช่หรือไม่?`)) {
      onDeleteTask(task.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-medium shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">แก้ไขรายละเอียดงาน (Edit Task)</h3>
                {isMilestone && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Flag className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                    Milestone
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Edit Task Name, Phase, Assignee, Schedule & Specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Project Selection */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              โครงการ (Project)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.type}
                </option>
              ))}
            </select>
          </div>

          {/* Task Name */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              ชื่องาน / กิจกรรม (Task Name) *
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Propose new Theme/Concept of design packaging"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Phase & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                หมวดหมู่งาน / ส่วน (Phase / Section)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  placeholder="e.g. MKT, AW Packaging, Booth Design & 3D"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">เลือกด่วน:</span>
                {COMMON_PHASES.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPhase(p)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                บทบาทหน้าที่ (Role Badge)
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Graphic Designer, Assistant Product Manager"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                สถานะการทำงาน (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                ระดับความสำคัญ (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
              >
                {PRIORITY_OPTIONS.map((pr) => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              ผู้รับผิดชอบ (Assignee)
            </label>
            <select
              value={assigneeId}
              onChange={(e) => {
                const newId = e.target.value;
                setAssigneeId(newId);
                const user = mockUsers.find((u) => u.id === newId);
                if (user) setRole(user.role);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
            >
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nameTh ? `${u.nameTh} (${u.name})` : u.name} — {u.role}
                </option>
              ))}
            </select>
          </div>

          {/* Dates & Duration (Calendar Picker) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                วันเริ่มต้น (Start Date) *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {formatDate(startDate)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                วันสิ้นสุด (Due Date) *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {formatDate(dueDate)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                ระยะเวลา (Duration)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  วัน
                </span>
              </div>
              <span className="text-[10px] text-indigo-600 mt-1 block font-medium">
                คำนวณตามวันเริ่ม-จบ
              </span>
            </div>
          </div>

          {/* Key Milestone Checkbox */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-700 fill-amber-700" />
              <div>
                <p className="text-xs font-semibold text-amber-900">Key Milestone จุดส่งมอบสำคัญ</p>
                <p className="text-[11px] text-amber-700">ไฮไลต์แถวสีเหลืองบนตาราง Gantt Chart เพื่อการนำเสนอผู้บริหาร</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isMilestone}
              onChange={(e) => setIsMilestone(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700">
                รายการงานย่อย (Subtasks Checklist)
              </label>
              <span className="text-[10px] text-slate-400">
                {subtasks.filter((s) => s.completed).length} / {subtasks.length} เสร็จแล้ว
              </span>
            </div>

            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className="flex items-center gap-2 text-xs text-left cursor-pointer flex-1"
                  >
                    {st.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {st.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ พิมพ์ชื่องานย่อย แล้วกด Enter หรือคลิกเพิ่ม..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </div>

          {/* File Attachments Quick View */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  ไฟล์แนบเอกสาร ({task.attachments?.length || 0} ไฟล์)
                </p>
                <p className="text-[10.5px] text-slate-500">
                  {task.attachments && task.attachments.length > 0
                    ? task.attachments.map((a) => a.name).join(', ')
                    : 'ยังไม่มีไฟล์แนบ (PR, ใบเสนอราคา, สเปก)'}
                </p>
              </div>
            </div>
            {onOpenAttachmentModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAttachmentModal(task);
                }}
                className="px-2.5 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-white border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                + จัดการไฟล์แนบ
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            {onDeleteTask && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบงานนี้</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
