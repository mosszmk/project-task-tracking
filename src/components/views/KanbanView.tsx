import React, { useState } from 'react';
import { 
  Task, 
  TaskStatus, 
  Project, 
  User, 
  TaskPriority 
} from '../../types';
import { STATUS_CONFIG } from '../table/StatusPill';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Plus, 
  Calendar, 
  Palette, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  MoveRight, 
  FolderKanban, 
  Sparkles,
  Search,
  Filter,
  CheckSquare,
  Edit3
} from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskModal?: (projectId?: string, defaultPhase?: string) => void;
  onOpenTaskAttachmentModal?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

interface ColumnDef {
  status: TaskStatus;
  labelTh: string;
  labelEn: string;
  bgHeader: string;
  badgeColor: string;
  dropBorder: string;
  matchingStatuses: TaskStatus[];
}

const KANBAN_COLUMNS: ColumnDef[] = [
  {
    status: 'Backlog',
    labelTh: 'รอดำเนินการ / ไอเดีย',
    labelEn: 'Backlog',
    bgHeader: 'bg-slate-500',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    dropBorder: 'border-slate-400 bg-slate-100/80',
    matchingStatuses: ['Backlog', 'Not Started'],
  },
  {
    status: 'Briefing',
    labelTh: 'บรีฟงาน / เตรียมข้อมูล',
    labelEn: 'Briefing',
    bgHeader: 'bg-sky-500',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    dropBorder: 'border-sky-400 bg-sky-50/80',
    matchingStatuses: ['Briefing'],
  },
  {
    status: 'Ready for Graphic',
    labelTh: 'ส่งต่อกราฟิก / รอเริ่มงาน',
    labelEn: 'Ready for Graphic',
    bgHeader: 'bg-purple-600',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    dropBorder: 'border-purple-400 bg-purple-50/80',
    matchingStatuses: ['Ready for Graphic'],
  },
  {
    status: 'Designing',
    labelTh: 'กำลังออกแบบ / กำลังทำ',
    labelEn: 'Designing',
    bgHeader: 'bg-amber-500',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    dropBorder: 'border-amber-400 bg-amber-50/80',
    matchingStatuses: ['Designing', 'In Progress'],
  },
  {
    status: 'Review',
    labelTh: 'รอตรวจ / รีวิวงาน',
    labelEn: 'Review',
    bgHeader: 'bg-rose-500',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    dropBorder: 'border-rose-400 bg-rose-50/80',
    matchingStatuses: ['Review'],
  },
  {
    status: 'Done',
    labelTh: 'เสร็จสมบูรณ์',
    labelEn: 'Done',
    bgHeader: 'bg-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dropBorder: 'border-emerald-400 bg-emerald-50/80',
    matchingStatuses: ['Done', 'Completed'],
  },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  projects,
  onUpdateStatus,
  onOpenNewTaskModal,
  onOpenTaskAttachmentModal,
  onDeleteTask,
  onEditTask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropOverCol, setDropOverCol] = useState<TaskStatus | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [quickSearch, setQuickSearch] = useState<string>('');
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // Filter tasks locally by priority or quick search within board
  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
      return false;
    }
    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase();
      const matchName = task.taskName.toLowerCase().includes(q);
      const matchProject = task.projectName.toLowerCase().includes(q);
      const matchAssignee = task.assignee.name.toLowerCase().includes(q);
      if (!matchName && !matchProject && !matchAssignee) return false;
    }
    return true;
  });

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDropOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropOverCol !== status) {
      setDropOverCol(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskStatus) => {
    // Only clear if leaving the column boundary
    if (dropOverCol === status) {
      setDropOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDropOverCol(null);
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const isDueSoonOrOverdue = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      isOverdue: diffDays < 0,
      isDueSoon: diffDays >= 0 && diffDays <= 2,
      diffDays,
    };
  };

  return (
    <div className="w-full px-6 py-5 space-y-4">
      {/* Top Kanban Toolbar & Quick Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-semibold">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-indigo-700">
                Visual Workflow Board
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">UCC Thailand Project Tracking</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Kanban Board &bull; กระดานติดตามสถานะงาน
            </h3>
          </div>
        </div>

        {/* Right: Board Controls & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Priority Quick Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 px-2 text-[11px] font-medium">Priority:</span>
            {['ALL', 'Urgent', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  priorityFilter === p
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'ALL' ? 'ทั้งหมด' : p}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="ค้นหาในบอร์ด..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-36 sm:w-44"
            />
          </div>

          {/* Add Task Button */}
          {onOpenNewTaskModal && (
            <button
              onClick={() => onOpenNewTaskModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มงาน (Add Task)</span>
            </button>
          )}
        </div>
      </div>

      {/* Guide Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            <strong>Drag &amp; Drop:</strong> ลากการ์ดงานไปวางในคอลัมน์ที่ต้องการเพื่อเปลี่ยนสถานะทันที หรือคลิกปุ่ม <strong>[ย้าย]</strong> บนการ์ด
          </span>
        </div>
        <span className="text-slate-400 font-medium">
          รวมงานทั้งหมดในบอร์ด: <strong className="text-slate-700">{filteredTasks.length}</strong> รายการ
        </span>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex items-start gap-3.5 min-w-max">
          {KANBAN_COLUMNS.map((column) => {
            const colTasks = filteredTasks.filter((t) =>
              column.matchingStatuses.includes(t.status)
            );
            const isDropTarget = dropOverCol === column.status;

            return (
              <div
                key={column.status}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={(e) => handleDragLeave(e, column.status)}
                onDrop={(e) => handleDrop(e, column.status)}
                className={`w-[290px] sm:w-[310px] rounded-2xl border transition-all duration-200 flex flex-col max-h-[calc(100vh-210px)] flex-shrink-0 ${
                  isDropTarget
                    ? `${column.dropBorder} ring-2 ring-indigo-500/40 shadow-md`
                    : 'bg-slate-100/70 border-slate-200/90'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 bg-white/60 rounded-t-2xl flex items-center justify-between backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${column.bgHeader} ring-2 ring-white shadow-2xs`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {column.labelEn}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-normal leading-tight">
                        {column.labelTh}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${column.badgeColor}`}
                    >
                      {colTasks.length}
                    </span>
                    {onOpenNewTaskModal && (
                      <button
                        onClick={() => onOpenNewTaskModal(undefined, column.status)}
                        className="p-1 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                        title={`Add task to ${column.labelEn}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Column Task List (Droppable area) */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 min-h-[140px]">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => {
                      const { isOverdue, isDueSoon } = isDueSoonOrOverdue(task.dueDate);
                      const isDraggingThis = draggedTaskId === task.id;
                      const hasAttachments = task.attachments && task.attachments.length > 0;
                      const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                      const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            if (onEditTask) {
                              onEditTask(task);
                            } else if (onOpenTaskAttachmentModal) {
                              onOpenTaskAttachmentModal(task);
                            }
                          }}
                          className={`bg-white p-3.5 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-md hover:border-indigo-400 group relative ${
                            isDraggingThis ? 'opacity-40 scale-95 border-dashed border-indigo-400' : 'border-slate-200/90'
                          }`}
                        >
                          {/* Top Card Row: Project Tag & Priority */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className="text-[10px] font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                              title={task.projectName}
                            >
                              {task.projectName}
                            </span>
                            <span
                              className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-bold uppercase border ${getPriorityStyle(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h5 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2 line-clamp-2">
                            {task.taskName}
                          </h5>

                          {/* Phase & Graphic Specs Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                            {task.phase && (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                {task.phase}
                              </span>
                            )}
                            {task.graphicSpecs && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                <Palette className="w-3 h-3 text-purple-500" />
                                {task.graphicSpecs.format}
                              </span>
                            )}
                          </div>

                          {/* Subtasks progress indicator */}
                          {hasSubtasks && (
                            <div className="mb-2 text-[10.5px] text-slate-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>{completedSubtasks}/{task.subtasks?.length} subtasks</span>
                            </div>
                          )}

                          {/* Card Footer: Assignee, Due Date, Attachments, Move Button */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            {/* Assignee Avatar + Name */}
                            <div className="flex items-center gap-1.5 min-w-0" title={task.assignee.name}>
                              <UserAvatar user={task.assignee} size="xs" />
                              <span className="text-[11px] text-slate-700 font-medium truncate max-w-[85px]">
                                {task.assignee.name.split(' ')[0]}
                              </span>
                            </div>

                            {/* Right side of card footer */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Attachments Icon */}
                              {hasAttachments && (
                                <span
                                  className="flex items-center gap-0.5 text-[10px] font-medium text-slate-400 hover:text-indigo-600"
                                  title={`${task.attachments?.length} เอกสารแนบ`}
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span>{task.attachments?.length}</span>
                                </span>
                              )}

                              {/* Due Date */}
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                  isOverdue
                                    ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200'
                                    : isDueSoon
                                    ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                                    : 'text-slate-400'
                                }`}
                                title={`กำหนดส่ง: ${task.dueDate}`}
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{task.dueDate.slice(5)}</span>
                              </span>

                              {/* Edit Task Button */}
                              {onEditTask && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTask(task);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title="แก้ไขรายละเอียดงาน (Edit Task)"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}

                              {/* Quick Move Dropdown Menu */}
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() =>
                                    setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id)
                                  }
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                  title="ย้ายสถานะด่วน"
                                >
                                  <MoveRight className="w-3 h-3" />
                                </button>

                                {activeMenuTaskId === task.id && (
                                  <div className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1.5 text-xs animate-in fade-in zoom-in-95">
                                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                      ย้ายสถานะไปยัง:
                                    </div>
                                    {KANBAN_COLUMNS.map((col) => (
                                      <button
                                        key={col.status}
                                        onClick={() => {
                                          onUpdateStatus(task.id, col.status);
                                          setActiveMenuTaskId(null);
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                          task.status === col.status
                                            ? 'font-bold text-indigo-600 bg-indigo-50/50'
                                            : 'text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className={`w-2 h-2 rounded-full ${col.bgHeader}`} />
                                          <span>{col.labelEn}</span>
                                        </div>
                                        {task.status === col.status && (
                                          <span className="text-[10px] text-indigo-600">ปัจจุบัน</span>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Empty column drop area */
                    <div
                      className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                        isDropTarget
                          ? 'border-indigo-400 bg-indigo-50/50 text-indigo-700'
                          : 'border-slate-200/80 text-slate-400'
                      }`}
                    >
                      <p className="text-xs font-medium">ไม่มีงานในสถานะนี้</p>
                      <p className="text-[10.5px] text-slate-400 mt-1">ลากการ์ดมาวางที่นี่</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Board Empty State (If 0 tasks in board) */}
      {filteredTasks.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-2xs mt-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            ยังไม่มีงานในกระดาน Kanban
          </h4>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            {quickSearch || priorityFilter !== 'ALL'
              ? 'ไม่พบงานที่ตรงกับตัวกรองที่เลือก ลองล้างคำค้นหาหรือตัวกรอง Priority'
              : 'เริ่มต้นจัดการงานด้วยการสร้างโปรเจกต์และเพิ่มงานใหม่เพื่อติดตามบนบอร์ด'}
          </p>
          {onOpenNewTaskModal && (
            <button
              onClick={() => onOpenNewTaskModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มงานแรกของคุณ</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
