import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, User } from '../../types';
import { currentUser } from '../../mock/mockData';
import { UserAvatar } from '../common/UserAvatar';
import { StatusPill } from '../table/StatusPill';
import { formatDate } from '../../utils/dateUtils';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  CheckSquare, 
  Layers,
  Palette,
  Search,
  Filter,
  UserCheck,
  FolderKanban,
  Award,
  ChevronRight,
  TrendingUp,
  Paperclip
} from 'lucide-react';

interface MyWorkViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenTaskAttachmentModal?: (task: Task) => void;
}

type WorkScope = 'assigned' | 'lead' | 'all';

export const MyWorkView: React.FC<MyWorkViewProps> = ({
  tasks,
  onUpdateStatus,
  onOpenTaskAttachmentModal,
}) => {
  const [scope, setScope] = useState<WorkScope>('assigned');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter tasks according to scope
  const scopedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (scope === 'assigned') {
        return t.assignee.id === currentUser.id;
      }
      if (scope === 'lead') {
        return t.projectLead.id === currentUser.id;
      }
      return t.assignee.id === currentUser.id || t.projectLead.id === currentUser.id;
    });
  }, [tasks, scope]);

  // 2. Search filtering
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return scopedTasks;
    const q = searchQuery.toLowerCase();
    return scopedTasks.filter(
      (t) =>
        t.taskName.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q) ||
        t.assignee.name.toLowerCase().includes(q) ||
        (t.phase && t.phase.toLowerCase().includes(q))
    );
  }, [scopedTasks, searchQuery]);

  const todayStr = '2026-09-22';

  // Group tasks by urgency
  const todayTasks = filteredTasks.filter((t) => {
    if (t.status === 'Completed' || t.status === 'Done') return false;
    return t.priority === 'Urgent' || t.dueDate <= todayStr;
  });

  const thisWeekTasks = filteredTasks.filter((t) => {
    if (t.status === 'Completed' || t.status === 'Done') return false;
    if (t.priority === 'Urgent' || t.dueDate <= todayStr) return false;
    return t.dueDate <= '2026-09-29';
  });

  const laterTasks = filteredTasks.filter((t) => {
    if (t.status === 'Completed' || t.status === 'Done') return false;
    return t.dueDate > '2026-09-29';
  });

  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed' || t.status === 'Done');

  // Stats
  const activeCount = filteredTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Done').length;
  const urgentCount = filteredTasks.filter((t) => (t.status !== 'Completed' && t.status !== 'Done') && (t.priority === 'Urgent' || t.dueDate <= todayStr)).length;

  const renderTaskItem = (task: Task) => {
    const isCompleted = task.status === 'Completed' || task.status === 'Done';
    const isOverdue = !isCompleted && task.dueDate < todayStr;
    const isToday = !isCompleted && task.dueDate === todayStr;

    return (
      <div
        key={task.id}
        className={`flex items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-150 group shadow-2xs hover:shadow-sm ${
          isCompleted 
            ? 'bg-slate-50/70 border-slate-200 opacity-75' 
            : isOverdue 
            ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20' 
            : 'border-slate-200/90 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Quick Complete Button */}
          <button
            type="button"
            onClick={() => onUpdateStatus(task.id, isCompleted ? 'In Progress' : 'Done')}
            className="text-slate-300 hover:text-emerald-500 transition-colors flex-shrink-0"
            title={isCompleted ? 'Mark as In Progress' : 'Mark as Done'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-sm font-medium ${
                  isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {task.taskName}
              </span>

              {/* Project Badge */}
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[280px]">
                {task.projectName}
              </span>

              {/* Phase Badge */}
              {task.phase && (
                <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                  {task.phase}
                </span>
              )}

              {/* Graphic Specs format */}
              {task.graphicSpecs && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 flex items-center gap-1 border border-purple-100">
                  <Palette className="w-3 h-3 text-purple-500" />
                  <span>{task.graphicSpecs.format}</span>
                </span>
              )}
            </div>

            {/* Task Sub-details */}
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              {/* Due Date Indicator */}
              <span className={`flex items-center gap-1.5 font-mono ${
                isOverdue ? 'text-rose-600 font-medium' : isToday ? 'text-amber-600 font-medium' : 'text-slate-600'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>Due: {formatDate(task.dueDate)}</span>
                {isOverdue && (
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-sans font-medium">
                    OVERDUE
                  </span>
                )}
                {isToday && (
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-sans font-medium">
                    DUE TODAY
                  </span>
                )}
              </span>

              <span>&bull;</span>

              {/* Assignee & Role */}
              <div className="flex items-center gap-1.5">
                <UserAvatar user={task.assignee} size="xs" />
                <span className="text-slate-700 font-normal">
                  {task.assignee.name} <span className="text-slate-400">({task.role})</span>
                </span>
              </div>

              {task.durationDays && (
                <>
                  <span>&bull;</span>
                  <span className="font-mono text-slate-500">
                    Duration: {task.durationDays} days
                  </span>
                </>
              )}

              {/* Attachments Button */}
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => onOpenTaskAttachmentModal?.(task)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] transition-colors cursor-pointer ${
                  (task.attachments || []).length > 0
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80 font-medium shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title="View or attach files (PR, Quotation, Specs)"
              >
                <Paperclip className="w-3 h-3 text-indigo-600" />
                <span>
                  {(task.attachments || []).length > 0 
                    ? `${task.attachments?.length} ${task.attachments?.length === 1 ? 'file' : 'files'}` 
                    : '+ Attach File'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions: Priority & Status Pill */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span
            className={`text-[10.5px] uppercase font-medium px-2.5 py-1 rounded-lg border ${
              task.priority === 'Urgent'
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                : task.priority === 'High'
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {task.priority}
          </span>

          <StatusPill
            status={task.status}
            onChange={(newStatus) => onUpdateStatus(task.id, newStatus)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-8 py-6 space-y-6">
      {/* Full-Width Executive Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <UserAvatar user={currentUser} size="xl" className="shadow-xl shadow-rose-950/40 ring-4 ring-rose-500/20" />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-semibold tracking-tight">
                {currentUser.name} {currentUser.nameTh ? `(${currentUser.nameTh})` : ''}
              </h2>
              <span className="text-xs uppercase font-medium px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 tracking-wide">
                NPD Lead
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1 font-medium">
              {currentUser.title} &bull; {currentUser.department} Department &bull; UCC K2 Thailand
            </p>

            {/* Core Responsibilities Tags */}
            {currentUser.responsibilities && (
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {currentUser.responsibilities.slice(0, 3).map((resp, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10"
                  >
                    {resp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4 Full-Width Key Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-xs border border-white/10 text-center sm:text-left">
            <p className="text-2xl font-semibold text-white">{activeCount}</p>
            <p className="text-[10.5px] text-indigo-200 uppercase font-medium tracking-wider mt-0.5">
              Active Items
            </p>
          </div>

          <div className="bg-rose-500/20 px-4 py-3 rounded-2xl border border-rose-400/30 text-center sm:text-left">
            <p className="text-2xl font-semibold text-rose-300">{urgentCount}</p>
            <p className="text-[10.5px] text-rose-200 uppercase font-medium tracking-wider mt-0.5">
              Urgent / Due
            </p>
          </div>

          <div className="bg-emerald-500/20 px-4 py-3 rounded-2xl border border-emerald-400/30 text-center sm:text-left">
            <p className="text-2xl font-semibold text-emerald-300">{completedTasks.length}</p>
            <p className="text-[10.5px] text-emerald-200 uppercase font-medium tracking-wider mt-0.5">
              Completed
            </p>
          </div>

          <div className="bg-amber-500/20 px-4 py-3 rounded-2xl border border-amber-400/30 text-center sm:text-left">
            <p className="text-2xl font-semibold text-amber-300">{currentUser.onTimeRate}%</p>
            <p className="text-[10.5px] text-amber-200 uppercase font-medium tracking-wider mt-0.5">
              On-Time Rate
            </p>
          </div>
        </div>
      </div>

      {/* Scope Switcher & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Segmented View Switcher: Assigned vs Lead vs All */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
          <button
            onClick={() => setScope('assigned')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              scope === 'assigned'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Assigned to Me ({tasks.filter(t => t.assignee.id === currentUser.id).length})</span>
          </button>

          <button
            onClick={() => setScope('lead')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              scope === 'lead'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
            <span>Projects I Lead ({tasks.filter(t => t.projectLead.id === currentUser.id).length})</span>
          </button>

          <button
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scope === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            All Tasks ({scopedTasks.length})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, project name, phase..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Section 1: Today & Overdue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Today & Overdue Action Items
              </h3>
            </div>
            <span className="text-xs font-medium bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
              {todayTasks.length} tasks
            </span>
          </div>

          <div className="space-y-2">
            {todayTasks.length > 0 ? (
              todayTasks.map(renderTaskItem)
            ) : (
              <div className="p-5 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                🎉 No urgent or overdue pending items
              </div>
            )}
          </div>
        </div>

        {/* Section 2: This Week */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2 text-indigo-700">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                This Week's Deliverables
              </h3>
            </div>
            <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {thisWeekTasks.length} tasks
            </span>
          </div>

          <div className="space-y-2">
            {thisWeekTasks.length > 0 ? (
              thisWeekTasks.map(renderTaskItem)
            ) : (
              <div className="p-5 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                No deliverables due this week
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Waiting / Later */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Layers className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Upcoming & Future Roadmap
              </h3>
            </div>
            <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              {laterTasks.length} tasks
            </span>
          </div>

          <div className="space-y-2">
            {laterTasks.length > 0 ? (
              laterTasks.map(renderTaskItem)
            ) : (
              <div className="p-5 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                No upcoming tasks scheduled
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  Delivered & Completed Items
                </h3>
              </div>
              <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {completedTasks.length} tasks
              </span>
            </div>

            <div className="space-y-2">
              {completedTasks.map(renderTaskItem)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
