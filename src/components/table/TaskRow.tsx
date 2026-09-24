import React from 'react';
import { Task, TaskStatus, User } from '../../types';
import { StatusPill } from './StatusPill';
import { AssigneeCell } from './AssigneeCell';
import { GraphicSpecsTag } from './GraphicSpecsTag';
import { formatDate } from '../../utils/dateUtils';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  GripVertical, 
  MoreHorizontal, 
  Trash2,
  ListTodo,
  Paperclip
} from 'lucide-react';

interface TaskRowProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateAssignee: (taskId: string, newAssignee: User) => void;
  onDeleteTask: (taskId: string) => void;
  isSelected: boolean;
  onToggleSelect: (taskId: string) => void;
  onOpenAttachmentModal?: (task: Task) => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Urgent': { bg: 'bg-red-50 border-red-200', text: 'text-red-700 font-medium', dot: 'bg-red-500' },
  'High': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700 font-medium', dot: 'bg-amber-500' },
  'Medium': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700 font-medium', dot: 'bg-blue-500' },
  'Low': { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600 font-medium', dot: 'bg-slate-400' },
};

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onUpdateStatus,
  onUpdateAssignee,
  onDeleteTask,
  isSelected,
  onToggleSelect,
  onOpenAttachmentModal,
}) => {
  const isCompleted = task.status === 'Done' || (task.status as string) === 'Completed';
  const isGraphicRole = task.role === 'Graphic Designer';
  const isReadyForGraphic = task.status === 'Ready for Graphic';
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Medium'];
  const attachmentCount = (task.attachments || []).length;

  return (
    <tr 
      className={`group border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
        isSelected ? 'bg-indigo-50/30' : ''
      }`}
    >
      {/* Checkbox & Drag Handle */}
      <td className="py-2.5 px-3 w-10 text-center">
        <div className="flex items-center justify-center gap-1">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity" />
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </td>

      {/* Task Name & Details */}
      <td className="py-2.5 px-3 min-w-[280px]">
        <div className="flex items-center gap-2">
          {/* Quick complete toggle */}
          <button
            type="button"
            onClick={() => onUpdateStatus(task.id, isCompleted ? 'In Progress' : 'Done')}
            className="text-slate-300 hover:text-emerald-500 transition-colors flex-shrink-0 cursor-pointer"
            title={isCompleted ? 'งานนี้เสร็จแล้ว (คลิกเพื่อเปลี่ยนกลับเป็นกำลังทำ)' : 'คลิกเพื่อทำเครื่องหมายว่า Done (เสร็จสิ้น)'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-400" />
            )}
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold tracking-tight transition-all ${
                  isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
                }`}
              >
                {task.taskName}
              </span>

              {/* Role Badge */}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                  isGraphicRole
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {task.role}
              </span>
            </div>

            {/* Subtask count if any */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400">
                <ListTodo className="w-3 h-3 text-slate-400" />
                <span>
                  {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length} subtasks
                </span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Status Pill (monday.com style) */}
      <td className="py-2.5 px-3 w-40">
        <StatusPill
          status={task.status}
          onChange={(newStatus) => onUpdateStatus(task.id, newStatus)}
        />
      </td>

      {/* Assignee */}
      <td className="py-2.5 px-3 w-44">
        <AssigneeCell
          assignee={task.assignee}
          onChange={(newUser) => onUpdateAssignee(task.id, newUser)}
        />
      </td>

      {/* Priority */}
      <td className="py-2.5 px-3 w-28">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border ${priorityStyle.bg} ${priorityStyle.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
          {task.priority}
        </span>
      </td>

      {/* Date Range */}
      <td className="py-2.5 px-3 min-w-[210px] whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {formatDate(task.startDate)} – {formatDate(task.dueDate)}
          </span>
        </div>
      </td>

      {/* Graphic Specs & Handoff Badge */}
      <td className="py-2.5 px-3 w-48">
        <GraphicSpecsTag
          specs={task.graphicSpecs}
          showHandoffBadge={isReadyForGraphic || (isGraphicRole && task.status === 'Designing')}
        />
      </td>

      {/* Files / Attachments */}
      <td className="py-2.5 px-3 w-28 text-center">
        {attachmentCount > 0 ? (
          <button
            type="button"
            onClick={() => onOpenAttachmentModal?.(task)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-medium text-xs transition-colors shadow-2xs group/att cursor-pointer"
            title={`มีไฟล์แนบ ${attachmentCount} รายการ (คลิกเพื่อเปิดดูหรือดาวน์โหลดเอกสาร PR / สเปก)`}
          >
            <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono">{attachmentCount}</span>
            <span className="text-[10px] text-indigo-600 font-sans">ไฟล์</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAttachmentModal?.(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-40 group-hover:opacity-100 inline-flex items-center justify-center gap-1 cursor-pointer"
            title="คลิกเพื่อแนบเอกสาร (ใบเสนอราคา, PR, สเปกสินค้า)"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-500 hover:text-indigo-600 font-semibold">+ แนบ</span>
          </button>
        )}
      </td>

      {/* Row Actions */}
      <td className="py-2.5 px-3 w-12 text-right">
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          title="ลบงานนี้ออกจากโครงการ"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
};
