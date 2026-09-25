import React, { useState, useMemo } from 'react';
import { Project, Task, TaskStatus, User, GraphicSpecs, TaskAttachmentCategory } from '../../types';
import { ProjectGroup } from './ProjectGroup';
import { 
  Layers, 
  CheckCircle2, 
  Palette, 
  Clock, 
  AlertCircle,
  Trash2,
  X
} from 'lucide-react';

interface TableViewProps {
  projects: Project[];
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateAssignee: (taskId: string, newAssignee: User) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAddTask: (projectId: string, taskName: string) => void;
  onBulkUpdateStatus?: (taskIds: string[], status: TaskStatus) => void;
  onBulkDelete?: (taskIds: string[]) => void;
  onOpenTaskAttachmentModal?: (task: Task, initialCategory?: TaskAttachmentCategory) => void;
  isGraphicQueue?: boolean;
  onEditProject?: (project: Project) => void;
  onUpdateTaskDates?: (taskId: string, startDate: string, dueDate: string) => void;
  onEditTask?: (task: Task) => void;
  onUpdateTaskSpecs?: (taskId: string, newSpecs: GraphicSpecs) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  projects,
  tasks,
  onUpdateStatus,
  onUpdateAssignee,
  onDeleteTask,
  onQuickAddTask,
  onBulkUpdateStatus,
  onBulkDelete,
  onOpenTaskAttachmentModal,
  isGraphicQueue = false,
  onEditProject,
  onUpdateTaskDates,
  onEditTask,
  onUpdateTaskSpecs,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleClearSelection = () => {
    setSelectedTaskIds([]);
  };

  // Only show projects that have at least 1 task matching the current filter
  const activeProjects = useMemo(() => {
    return projects.filter((project) => tasks.some((t) => t.projectId === project.id));
  }, [projects, tasks]);

  // Metrics computation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Designing').length;
  const readyForGraphicTasks = tasks.filter((t) => t.status === 'Ready for Graphic').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'Review').length;

  return (
    <div className="p-6 space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isGraphicQueue ? (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Active Queue</p>
                <p className="text-2xl font-semibold text-purple-700 mt-1">{totalTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Palette className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Designing</p>
                <p className="text-2xl font-semibold text-amber-700 mt-1">{inProgressTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Ready for Graphic</p>
                <p className="text-2xl font-semibold text-indigo-700 mt-1">{readyForGraphicTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">In Review</p>
                <p className="text-2xl font-semibold text-rose-700 mt-1">{inReviewTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{totalTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-semibold text-amber-700 mt-1">{inProgressTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">In Review</p>
                <p className="text-2xl font-semibold text-rose-700 mt-1">{inReviewTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Done</p>
                <p className="text-2xl font-semibold text-emerald-700 mt-1">{completedTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bulk Action Bar (when tasks are selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md">
              {selectedTaskIds.length} Selected
            </span>
            <span className="text-xs text-slate-300">Quick bulk actions:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedTaskIds.forEach((id) => onUpdateStatus(id, 'Done'));
                handleClearSelection();
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>

            <button
              onClick={() => {
                selectedTaskIds.forEach((id) => onDeleteTask(id));
                handleClearSelection();
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <button
              onClick={handleClearSelection}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Project Group Accordions */}
      <div className="space-y-6">
        {activeProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              {isGraphicQueue ? 'No Pending Graphic Tasks' : 'No Tasks Found'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {isGraphicQueue
                ? 'All graphic design tasks have been completed and cleared from the queue! Awesome work.'
                : 'No tasks match your selected project, filter, or search keywords.'}
            </p>
          </div>
        ) : (
          activeProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            return (
              <ProjectGroup
                key={project.id}
                project={project}
                tasks={projectTasks}
                onUpdateStatus={onUpdateStatus}
                onUpdateAssignee={onUpdateAssignee}
                onDeleteTask={onDeleteTask}
                onQuickAddTask={onQuickAddTask}
                selectedTaskIds={selectedTaskIds}
                onToggleSelectTask={handleToggleSelectTask}
                onOpenAttachmentModal={onOpenTaskAttachmentModal}
                onEditProject={onEditProject}
                onUpdateTaskDates={onUpdateTaskDates}
                onEditTask={onEditTask}
                onUpdateTaskSpecs={onUpdateTaskSpecs}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
