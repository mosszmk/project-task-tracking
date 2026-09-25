import React, { useState, useRef, useEffect } from 'react';
import { 
  Table2, 
  CalendarRange, 
  BarChart3, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Share2,
  UserCheck,
  Presentation,
  Receipt,
  Palette,
  FolderKanban,
  Kanban,
  X,
  User,
  Crown,
  Check
} from 'lucide-react';
import { ActiveView, Project, User as UserType } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface ViewSwitcherProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  taskCount: number;
  graphicCount?: number;
  projects?: Project[];
  activeProjectId?: string | null;
  onSelectProject?: (id: string | null) => void;
  users?: UserType[];
  selectedProjectLeadId?: string | null;
  onSelectProjectLead?: (id: string | null) => void;
  selectedAssigneeId?: string | null;
  onSelectAssignee?: (id: string | null) => void;
  onClearFilters?: () => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  activeView,
  onViewChange,
  taskCount,
  graphicCount,
  projects,
  activeProjectId,
  onSelectProject,
  users = [],
  selectedProjectLeadId,
  onSelectProjectLead,
  selectedAssigneeId,
  onSelectAssignee,
  onClearFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const activeFilterCount = (selectedProjectLeadId ? 1 : 0) + (selectedAssigneeId ? 1 : 0);
  const selectedLeadUser = users.find((u) => u.id === selectedProjectLeadId);
  const selectedAssigneeUser = users.find((u) => u.id === selectedAssigneeId);

  const views: { 
    id: ActiveView; 
    label: string; 
    icon: React.ElementType; 
    count?: number;
    tooltip: string;
  }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      tooltip: 'Executive KPI dashboard, project overview, and workload summary' 
    },
    { 
      id: 'gantt', 
      label: 'Timeline', 
      icon: CalendarRange,
      tooltip: '15-week timeline and milestone schedule (Jun - Oct 2026)' 
    },
    { 
      id: 'kanban', 
      label: 'Kanban Board', 
      icon: Kanban, 
      count: taskCount,
      tooltip: 'Visual drag-and-drop workflow board by status' 
    },
    { 
      id: 'table', 
      label: 'Task List', 
      icon: Table2,
      count: taskCount,
      tooltip: 'Full task explorer, status updates & file attachments (PR, Quotations, Specs)' 
    },
    { 
      id: 'summary', 
      label: 'Status Summary', 
      icon: Presentation, 
      tooltip: 'Executive presentation slide ready view with project artwork summaries' 
    },
    { 
      id: 'my-work', 
      label: 'My Work', 
      icon: UserCheck,
      tooltip: 'My prioritized tasks sorted by due date' 
    },
    { 
      id: 'graphic-queue', 
      label: 'Graphic Queue', 
      icon: Palette,
      count: graphicCount,
      tooltip: 'Graphic design queue, dieline specs, packaging and 3D mockups' 
    },
    { 
      id: 'budget', 
      label: 'Budget & PR/PO', 
      icon: Receipt,
      tooltip: 'Marketing budget tracking, PR/PO status and supplier quotations' 
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-6 no-print">
      <div className="flex items-center justify-between overflow-x-auto">
        {/* View Switcher Tabs - Minimalist, Modern, Uncluttered */}
        <div className="flex items-center gap-1 -mb-[1px] min-w-max">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                title={view.tooltip}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{view.label}</span>

                {view.count !== undefined && view.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {view.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Action Controls */}
        <div className="flex items-center gap-2 py-1.5 pl-4 flex-shrink-0">
          {/* Project Filter Selector */}
          {projects && onSelectProject && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeProjectId || ''}
                onChange={(e) => onSelectProject(e.target.value || null)}
                aria-label="Filter by project"
                className="text-xs sm:text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer max-w-[190px] truncate"
              >
                <option value="">All Projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User / Ownership Filter Popover */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-amber-100/90 text-amber-900 border-amber-300 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
              title="Filter by Project Lead or Task Assignee"
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? 'text-amber-700' : 'text-slate-400'}`} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-4 text-xs space-y-3.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-800 text-sm">
                      ตัวกรองบุคคล &amp; สิทธิ์
                    </span>
                  </div>
                  {activeFilterCount > 0 && onClearFilters && (
                    <button
                      onClick={() => {
                        onClearFilters();
                        setIsFilterOpen(false);
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>

                {/* Filter 1: Project Owner / Lead */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>เจ้าของโปรเจกต์ (Project Lead)</span>
                    </label>
                    {selectedProjectLeadId && onSelectProjectLead && (
                      <button
                        onClick={() => onSelectProjectLead(null)}
                        className="text-[10px] text-slate-400 hover:text-slate-600"
                      >
                        รีเซ็ต
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedProjectLeadId || ''}
                    onChange={(e) => onSelectProjectLead && onSelectProjectLead(e.target.value || null)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="">ทั้งหมด (All Leads)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} &bull; {u.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter 2: Task Owner / Assignee */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>เจ้าของงาน (Task Assignee)</span>
                    </label>
                    {selectedAssigneeId && onSelectAssignee && (
                      <button
                        onClick={() => onSelectAssignee(null)}
                        className="text-[10px] text-slate-400 hover:text-slate-600"
                      >
                        รีเซ็ต
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedAssigneeId || ''}
                    onChange={(e) => onSelectAssignee && onSelectAssignee(e.target.value || null)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                  >
                    <option value="">ทั้งหมด (All Assignees)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} &bull; {u.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Done button */}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full mt-2 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  เสร็จสิ้น (Done)
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Share view">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar (Shown when any filter is active) */}
      {(selectedLeadUser || selectedAssigneeUser || activeProjectId) && (
        <div className="py-2 flex flex-wrap items-center gap-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">ตัวกรองที่ใช้งานอยู่:</span>

          {activeProjectId && onSelectProject && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px] font-medium">
              <FolderKanban className="w-3 h-3 text-slate-500" />
              <span>Project: {projects?.find(p => p.id === activeProjectId)?.name || activeProjectId}</span>
              <button
                onClick={() => onSelectProject(null)}
                className="hover:text-rose-600 p-0.5"
                title="Remove project filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedLeadUser && onSelectProjectLead && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px] font-medium">
              <Crown className="w-3 h-3 text-amber-600" />
              <span>เจ้าของโปรเจกต์: {selectedLeadUser.name}</span>
              <button
                onClick={() => onSelectProjectLead(null)}
                className="hover:text-rose-600 p-0.5"
                title="Remove lead filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedAssigneeUser && onSelectAssignee && (
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[11px] font-medium">
              <User className="w-3 h-3 text-indigo-600" />
              <span>เจ้าของงาน: {selectedAssigneeUser.name}</span>
              <button
                onClick={() => onSelectAssignee(null)}
                className="hover:text-rose-600 p-0.5"
                title="Remove assignee filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-medium underline ml-1 cursor-pointer"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  );
};
