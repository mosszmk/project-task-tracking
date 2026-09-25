import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Layers, 
  Presentation, 
  UserCheck, 
  Palette, 
  Receipt,
  Plus, 
  FolderKanban, 
  Coffee,
  ChevronRight
} from 'lucide-react';
import { currentUser } from '../../mock/mockData';
import { Project } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewProjectModal: () => void;
  graphicQueueCount: number;
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  projects: Project[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  graphicQueueCount,
  activeProjectId,
  onSelectProject,
  projects,
}) => {
  const navItems = [
    { id: 'dashboard-overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gantt-schedule', label: 'Timeline', icon: CalendarRange },
    { id: 'all-tasks', label: 'Task List', icon: Layers },
    { id: 'status-summary', label: 'Status Summary', icon: Presentation },
    { id: 'my-work', label: 'My Work', icon: UserCheck },
    { id: 'graphic-queue', label: 'Graphic Queue', icon: Palette, badge: graphicQueueCount },
    { id: 'budget-procurement', label: 'Budget & PR/PO', icon: Receipt },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 select-none no-print">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center shadow-lg shadow-amber-900/30 text-white font-semibold text-xl">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-base tracking-tight leading-snug">
              B2C Project &amp; Task Tracking
            </h1>
            <span className="text-xs font-normal text-amber-400 tracking-wide uppercase">
              UCC Thailand
            </span>
          </div>
        </div>
      </div>

      {/* Two-Tier CTA: 1. New Project -> 2. Add Task */}
      <div className="p-4 space-y-2">
        <button
          onClick={onOpenNewProjectModal}
          className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium py-2 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-900/30 transition-all duration-150 active:scale-[0.99] cursor-pointer text-sm"
        >
          <FolderKanban className="w-4 h-4 stroke-[2]" />
          <span>+ Create Project</span>
        </button>

        <button
          onClick={onOpenNewTaskModal}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-normal py-2 px-3.5 rounded-xl flex items-center justify-center gap-2 border border-slate-700/80 transition-all duration-150 cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>+ Add Task</span>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 space-y-5 py-1">
        <div>
          <p className="px-3 text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
            Main Views
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (item.id === 'all-tasks' || item.id === 'status-summary' || item.id === 'gantt-schedule' || item.id === 'budget-procurement' || item.id === 'dashboard-overview') {
                      onSelectProject(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-600/20 text-amber-300 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-normal px-2 py-0.5 rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active UCC Projects List with Click to Switch Project */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Active UCC Projects
            </p>
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {projects.length}
            </span>
          </div>
          <div className="space-y-1">
            {projects.map((project) => {
              const isSelected = activeProjectId === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    onSelectProject(isSelected ? null : project.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-normal text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate flex-1">{project.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer">
          <div className="relative">
            <UserAvatar user={currentUser} size="md" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser.title}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </aside>
  );
};
