import React from 'react';
import { Task, TaskStatus, User } from '../../types';
import { STATUS_CONFIG } from '../table/StatusPill';
import { UserAvatar } from '../common/UserAvatar';
import { Calendar, Palette, CheckCircle2 } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const KANBAN_COLUMNS: TaskStatus[] = [
  'Backlog',
  'Briefing',
  'Ready for Graphic',
  'Designing',
  'Review',
  'Done',
];

export const KanbanPlaceholder: React.FC<KanbanViewProps> = ({
  tasks,
  onUpdateStatus,
}) => {
  return (
    <div className="p-6 overflow-x-auto min-h-[calc(100vh-140px)]">
      <div className="flex items-start gap-4 min-w-max pb-4">
        {KANBAN_COLUMNS.map((columnStatus) => {
          const colTasks = tasks.filter((t) => t.status === columnStatus || (columnStatus === 'Done' && (t.status as string) === 'Completed'));
          const config = STATUS_CONFIG[columnStatus];

          return (
            <div
              key={columnStatus}
              className="w-72 bg-slate-100/70 rounded-xl border border-slate-200 p-3 flex flex-col max-h-[calc(100vh-160px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${config.bg}`} />
                  <h4 className="text-xs font-medium text-slate-800 tracking-tight">
                    {config.label}
                  </h4>
                </div>
                <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 truncate max-w-[140px]">
                          {task.projectName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium uppercase bg-slate-100 text-slate-600">
                          {task.priority}
                        </span>
                      </div>

                      <h5 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                        {task.taskName}
                      </h5>

                      {/* Graphic Specs tag */}
                      {task.graphicSpecs && (
                        <div className="mb-2.5 flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          <Palette className="w-3 h-3 text-purple-500" />
                          <span className="font-semibold">{task.graphicSpecs.format}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={task.assignee} size="xs" />
                          <span className="text-[11px] text-slate-600 font-medium truncate max-w-[90px]">
                            {task.assignee.name}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-medium">
                          {task.dueDate.slice(5)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200/80 rounded-lg">
                    No tasks in {config.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
