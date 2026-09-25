import React, { useState } from 'react';
import { Project, Task, TaskStatus, User, GraphicSpecs, TaskAttachmentCategory } from '../../types';
import { TaskRow } from './TaskRow';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  CheckCircle, 
  User as UserIcon,
  Calendar,
  Sparkles,
  Edit3
} from 'lucide-react';
import { currentUser } from '../../mock/mockData';
import { UserAvatar } from '../common/UserAvatar';

interface ProjectGroupProps {
  project: Project;
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateAssignee: (taskId: string, newAssignee: User) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAddTask: (projectId: string, taskName: string) => void;
  selectedTaskIds: string[];
  onToggleSelectTask: (taskId: string) => void;
  onOpenAttachmentModal?: (task: Task, initialCategory?: TaskAttachmentCategory) => void;
  onEditProject?: (project: Project) => void;
  onUpdateTaskDates?: (taskId: string, startDate: string, dueDate: string) => void;
  onEditTask?: (task: Task) => void;
  onUpdateTaskSpecs?: (taskId: string, newSpecs: GraphicSpecs) => void;
}

export const ProjectGroup: React.FC<ProjectGroupProps> = ({
  project,
  tasks,
  onUpdateStatus,
  onUpdateAssignee,
  onDeleteTask,
  onQuickAddTask,
  selectedTaskIds,
  onToggleSelectTask,
  onOpenAttachmentModal,
  onEditProject,
  onUpdateTaskDates,
  onEditTask,
  onUpdateTaskSpecs,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newTaskName, setNewTaskName] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const completedCount = tasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    onQuickAddTask(project.id, newTaskName.trim());
    setNewTaskName('');
    setIsAddingTask(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 mb-6 transition-all">
      {/* Group Accordion Header */}
      <div 
        className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 rounded-t-xl flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-1 hover:bg-slate-200/80 rounded transition-colors text-slate-500"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Project Color Pill */}
          <span 
            className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-xs" 
            style={{ backgroundColor: project.color }} 
          />

          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-medium text-slate-900 tracking-tight">
              {project.name}
            </h3>
            <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-slate-600">
              {project.category}
            </span>
            {onEditProject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
                className="p-1 hover:bg-slate-200/90 rounded text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
                title="แก้ไขข้อมูลโครงการ (Edit Project)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">แก้ไข</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Meta Info & Progress Bar */}
        <div className="flex items-center gap-6 text-xs text-slate-500">
          {/* Project Lead */}
          <div className="hidden sm:flex items-center gap-1.5">
            <UserAvatar user={project.lead} size="xs" />
            <span className="text-xs font-normal text-slate-600">
              Lead: <span className="font-medium text-slate-800">{project.lead.name}</span>
            </span>
          </div>

          {/* Progress Bar (monday.com style) */}
          <div className="flex items-center gap-2.5 min-w-[150px]">
            <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700">
              {progressPercent}%
            </span>
          </div>

          {/* Task count */}
          <div className="bg-slate-200/80 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {completedCount}/{tasks.length} Tasks Done
          </div>
        </div>
      </div>

      {/* Group Table Content */}
      {isExpanded && (
        <div className="overflow-x-auto min-h-[160px] pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10.5px] font-medium uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[280px]">Task Name</th>
                <th className="py-2.5 px-3 w-40">Status</th>
                <th className="py-2.5 px-3 w-44">Assignee</th>
                <th className="py-2.5 px-3 w-28">Priority</th>
                <th className="py-2.5 px-3 min-w-[210px]">Timeline</th>
                <th className="py-2.5 px-3 w-48">Graphic Specs</th>
                <th className="py-2.5 px-3 w-28 text-center">Files / PR</th>
                <th className="py-2.5 px-3 w-12 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onUpdateStatus={onUpdateStatus}
                    onUpdateAssignee={onUpdateAssignee}
                    onDeleteTask={onDeleteTask}
                    isSelected={selectedTaskIds.includes(task.id)}
                    onToggleSelect={onToggleSelectTask}
                    onOpenAttachmentModal={onOpenAttachmentModal}
                    onUpdateDates={onUpdateTaskDates}
                    onEditTask={onEditTask}
                    onUpdateTaskSpecs={onUpdateTaskSpecs}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400 italic bg-slate-50/30">
                    No tasks in this project yet or no tasks match current filter
                  </td>
                </tr>
              )}

              {/* Bottom Quick Add Row */}
              <tr className="border-t border-slate-100 bg-slate-50/30">
                <td colSpan={9} className="py-2.5 px-4">
                  {isAddingTask ? (
                    <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="+ Type new task name and press Enter to save..."
                        className="flex-1 max-w-md px-3 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs font-medium"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
                      >
                        Add Task
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTask(false);
                          setNewTaskName('');
                        }}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-500" />
                      <span>+ Add new task to {project.code}</span>
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
