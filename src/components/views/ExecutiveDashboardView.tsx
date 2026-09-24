import React, { useState, useMemo } from 'react';
import { Task, Project, User, TaskStatus, ProcurementRecord } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate } from '../../utils/dateUtils';
import { StatusPill } from '../table/StatusPill';
import { PriorityPill } from '../table/PriorityPill';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Palette, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  FolderKanban, 
  Layers, 
  ChevronRight, 
  ExternalLink,
  ArrowRight,
  Receipt,
  X,
  Flame,
  FileText,
  Paperclip,
  Check,
  Briefcase,
  Mail,
  Phone
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  projects: Project[];
  tasks: Task[];
  procurements?: ProcurementRecord[];
  onNavigateToProject: (projectId: string) => void;
  onNavigateToTasks: (projectId?: string) => void;
  onNavigateToGraphicQueue: () => void;
  onNavigateToBudget: (projectId?: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  projects,
  tasks,
  procurements = [],
  onNavigateToProject,
  onNavigateToTasks,
  onNavigateToGraphicQueue,
  onNavigateToBudget,
  onUpdateTaskStatus,
}) => {
  // 1. Interactive Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered Tasks calculation (sorted by Project first, then date/task)
  const filteredTasks = useMemo(() => {
    const list = tasks.filter((task) => {
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
        return false;
      }
      if (selectedAssigneeId !== 'all' && task.assignee.id !== selectedAssigneeId) {
        return false;
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Graphic') {
          const isGraphic =
            task.role === 'Graphic Designer' ||
            task.status === 'Ready for Graphic' ||
            task.status === 'Designing';
          if (!isGraphic) return false;
        } else if (task.status !== selectedStatus) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = task.taskName.toLowerCase().includes(q);
        const matchesProject = task.projectName.toLowerCase().includes(q);
        const matchesAssignee = task.assignee.name.toLowerCase().includes(q) || (task.assignee.nameTh && task.assignee.nameTh.toLowerCase().includes(q));
        const matchesPhase = task.phase?.toLowerCase().includes(q);
        if (!matchesName && !matchesProject && !matchesAssignee && !matchesPhase) {
          return false;
        }
      }
      return true;
    });

    const projectOrderMap = new Map(projects.map((p, i) => [p.id, i]));
    return list.slice().sort((a, b) => {
      const pA = projectOrderMap.has(a.projectId) ? projectOrderMap.get(a.projectId)! : 999;
      const pB = projectOrderMap.has(b.projectId) ? projectOrderMap.get(b.projectId)! : 999;
      if (pA !== pB) return pA - pB;
      if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
      return (a.taskName || '').localeCompare(b.taskName || '', 'th');
    });
  }, [tasks, projects, selectedProjectId, selectedAssigneeId, selectedStatus, searchQuery]);

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Filtered Projects calculation based on selected filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (selectedProjectId !== 'all' && project.id !== selectedProjectId) {
        return false;
      }
      if (selectedAssigneeId !== 'all') {
        const isLead = project.lead.id === selectedAssigneeId;
        const hasAssignedTask = tasks.some(
          (t) => t.projectId === project.id && t.assignee.id === selectedAssigneeId
        );
        if (!isLead && !hasAssignedTask) {
          return false;
        }
      }
      if (selectedStatus !== 'all') {
        const hasMatchingTask = tasks.some((t) => {
          if (t.projectId !== project.id) return false;
          if (selectedStatus === 'Graphic') {
            return t.role === 'Graphic Designer' || t.status === 'Ready for Graphic' || t.status === 'Designing';
          }
          return t.status === selectedStatus;
        });
        if (!hasMatchingTask) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProjectName = project.name.toLowerCase().includes(q);
        const matchesProjectCode = project.code.toLowerCase().includes(q);
        const matchesLead = project.lead.name.toLowerCase().includes(q) || (project.lead.nameTh && project.lead.nameTh.toLowerCase().includes(q));
        const hasMatchingTask = tasks.some((t) => t.projectId === project.id && (
          t.taskName.toLowerCase().includes(q) ||
          t.assignee.name.toLowerCase().includes(q) ||
          (t.assignee.nameTh && t.assignee.nameTh.toLowerCase().includes(q))
        ));
        if (!matchesProjectName && !matchesProjectCode && !matchesLead && !hasMatchingTask) {
          return false;
        }
      }
      return true;
    });
  }, [projects, tasks, selectedProjectId, selectedAssigneeId, selectedStatus, searchQuery]);

  // Unfinished projects on-hand (reactive to filter)
  const displayUnfinishedProjects = useMemo(() => {
    return filteredProjects.filter((p) => p.summaryStatus !== 'Completed');
  }, [filteredProjects]);

  const displayCompletedProjectsCount = useMemo(() => {
    return filteredProjects.filter((p) => p.summaryStatus === 'Completed').length;
  }, [filteredProjects]);

  // 2. High-Level KPI Metrics
  const totalTasksCount = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed').length;
  const inProgressTasksCount = filteredTasks.filter((t) => t.status === 'In Progress').length;
  const graphicTasksCount = filteredTasks.filter((t) => t.role === 'Graphic Designer' || t.status === 'Ready for Graphic' || taskIsGraphic(t)).length;
  const overallCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // 3. Operational Blindspots: Deadline & Overdue Radar (Dynamic according to active filters)
  const now = new Date();
  const overdueOrUrgentTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (t.status === 'Done' || (t.status as string) === 'Completed') return false;
      if (t.priority === 'Urgent') return true;
      if (t.dueDate) {
        const due = new Date(t.dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7; // Due in 7 days or past due
      }
      return false;
    });
  }, [filteredTasks]);

  // 4. Operational Blindspot: Graphic Bottleneck Alert (Dynamic according to active filters)
  const graphicQueueTasks = useMemo(() => {
    return filteredTasks.filter((t) => 
      (t.status === 'Ready for Graphic' || t.status === 'Designing' || t.role === 'Graphic Designer') &&
      t.status !== 'Done' && (t.status as string) !== 'Completed'
    );
  }, [filteredTasks]);

  // 5. Workload Matrix per Member - Dynamic according to active filters
  const memberWorkloads = useMemo(() => {
    let targetUsers = mockUsers;

    // Filter which members to display based on active filters
    if (selectedAssigneeId !== 'all') {
      targetUsers = mockUsers.filter((u) => u.id === selectedAssigneeId);
    } else if (selectedProjectId !== 'all') {
      const projectMemberIds = new Set<string>();
      const proj = projects.find((p) => p.id === selectedProjectId);
      if (proj) projectMemberIds.add(proj.lead.id);
      tasks.filter((t) => t.projectId === selectedProjectId).forEach((t) => projectMemberIds.add(t.assignee.id));
      targetUsers = mockUsers.filter((u) => projectMemberIds.has(u.id));
    } else if (selectedStatus !== 'all' || searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      targetUsers = mockUsers.filter((u) => {
        const hasMatchingTask = filteredTasks.some((t) => t.assignee.id === u.id);
        const matchesProfile = q ? (
          u.name.toLowerCase().includes(q) || 
          (u.nameTh && u.nameTh.toLowerCase().includes(q)) || 
          u.title.toLowerCase().includes(q)
        ) : false;
        return hasMatchingTask || matchesProfile;
      });
    }

    return targetUsers.map((user) => {
      const userFilteredTasks = filteredTasks.filter((t) => t.assignee.id === user.id);
      const activeTasks = userFilteredTasks.filter((t) => t.status !== 'Done' && (t.status as string) !== 'Completed');
      const completedTasks = userFilteredTasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed');
      
      // Calculate distinct projects for this user under the active filter
      const userProjectIds = new Set<string>();
      userFilteredTasks.forEach((t) => userProjectIds.add(t.projectId));
      filteredProjects.forEach((p) => {
        if (p.lead.id === user.id) userProjectIds.add(p.id);
      });
      const projectCount = userProjectIds.size;

      // Capacity based on user's active tasks in current context
      const capacityPercent = Math.min(Math.round((activeTasks.length / user.maxCapacity) * 100), 100);
      let loadStatus: 'Available' | 'Optimal' | 'Overloaded' = 'Optimal';
      if (capacityPercent < 60) loadStatus = 'Available';
      else if (capacityPercent >= 85) loadStatus = 'Overloaded';

      return {
        user,
        activeTasks,
        completedTasks,
        totalTasks: userFilteredTasks.length,
        projectCount,
        capacityPercent,
        loadStatus,
      };
    });
  }, [mockUsers, filteredTasks, filteredProjects, projects, tasks, selectedAssigneeId, selectedProjectId, selectedStatus, searchQuery]);

  // Seniority Ranking (จากตำแหน่งสูงไปน้อย)
  const ROLE_HIERARCHY_RANK: Record<string, number> = {
    'General Manager': 1,
    'B2C Assistant GM': 2,
    'B2C Senior Marketing Manager': 3,
    'Assistant Product Manager (NPD)': 4,
    'Assistant Product Manager - NPD': 4,
    'Assistant Product Manager': 4,
    'Senior Marketing Executive': 5,
    'Senior B2C Marketing Executive': 6,
    'Graphic Designer': 7,
  };

  const sortedMemberWorkloads = useMemo(() => {
    return [...memberWorkloads].sort((a, b) => {
      const rankA = ROLE_HIERARCHY_RANK[a.user.title] || ROLE_HIERARCHY_RANK[a.user.role] || 99;
      const rankB = ROLE_HIERARCHY_RANK[b.user.title] || ROLE_HIERARCHY_RANK[b.user.role] || 99;
      return rankA - rankB;
    });
  }, [memberWorkloads]);

  // Workload High-Level Summary Counts
  const highLoadCount = useMemo(() => memberWorkloads.filter((m) => m.loadStatus === 'Overloaded').length, [memberWorkloads]);
  const optimalLoadCount = useMemo(() => memberWorkloads.filter((m) => m.loadStatus === 'Optimal').length, [memberWorkloads]);
  const availableLoadCount = useMemo(() => memberWorkloads.filter((m) => m.loadStatus === 'Available').length, [memberWorkloads]);
  const totalActiveTasks = useMemo(() => memberWorkloads.reduce((sum, m) => sum + m.activeTasks.length, 0), [memberWorkloads]);

  // Budget summary (dynamic to selected project)
  const filteredProcurements = useMemo(() => {
    if (selectedProjectId !== 'all') {
      return procurements.filter((p) => p.projectId === selectedProjectId);
    }
    return procurements;
  }, [procurements, selectedProjectId]);

  const totalBudget = 5000000;
  const committedPO = filteredProcurements
    .filter((p) => p.procurementStatus === 'PO Issued' || p.procurementStatus === 'Delivered')
    .reduce((sum, p) => sum + p.amountTHB, 0);
  const remainingBudget = totalBudget - committedPO;

  function taskIsGraphic(t: Task) {
    return t.status === 'Ready for Graphic' || t.status === 'Designing';
  }

  const isFilterActive = selectedProjectId !== 'all' || selectedAssigneeId !== 'all' || selectedStatus !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="w-full px-6 md:px-8 py-5 space-y-5">
      {/* 1. Interactive Multi-Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filter:</span>
          </div>

          {/* Filter by Project */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-normal py-2 px-3.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
            >
              <option value="all">📁 All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Assignee */}
          <div className="relative">
            <select
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-normal py-2 px-3.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
            >
              <option value="all">👤 All Team Members ({mockUsers.length})</option>
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.nameTh || u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-normal py-2 px-3.5 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
            >
              <option value="all">🏷️ All Statuses</option>
              <option value="In Progress">🟡 In Progress</option>
              <option value="Done">🟢 Completed (Done)</option>
              <option value="Graphic">🎨 Graphic &amp; Design Queue</option>
              <option value="Not Started">⚪ Not Started</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task name, project, assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal placeholder-slate-400"
            />
          </div>
        </div>

        {/* Clear Filter Action */}
        {isFilterActive && (
          <button
            onClick={() => {
              setSelectedProjectId('all');
              setSelectedAssigneeId('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Clear All Filters</span>
          </button>
        )}
      </div>

      {/* 3. Six Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Projects Total with Unfinished vs Completed */}
        <div 
          onClick={() => setSelectedProjectId('all')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {isFilterActive ? 'Total Projects (Filtered)' : 'Total Projects'}
            </span>
            <FolderKanban className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-semibold text-slate-900">{filteredProjects.length}</p>
          <p className="text-xs text-slate-500 mt-1 truncate font-light">
            <span className="text-amber-700 font-medium">{displayUnfinishedProjects.length} Active On-Hand</span>
            {displayCompletedProjectsCount > 0 && <span className="text-slate-400"> &bull; {displayCompletedProjectsCount} Done</span>}
          </p>
        </div>

        {/* KPI 2: Tasks Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Tasks</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-semibold text-slate-900">{totalTasksCount}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {overallCompletionRate}% Completed
          </p>
        </div>

        {/* KPI 3: In Progress Tasks */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? 'all' : 'In Progress')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-700">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-semibold text-amber-700">{inProgressTasksCount}</p>
          <p className="text-xs font-light text-slate-500 mt-1">Active sprint deliveries</p>
        </div>

        {/* KPI 4: Done Tasks */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'Done' ? 'all' : 'Done')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-700">Completed (Done)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-semibold text-emerald-700">{completedTasksCount}</p>
          <p className="text-xs font-light text-slate-500 mt-1">Fully delivered</p>
        </div>

        {/* KPI 5: Graphic Queue */}
        <div 
          onClick={onNavigateToGraphicQueue}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-purple-700">Graphic Queue</span>
            <Palette className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-semibold text-purple-700">{graphicTasksCount}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">Packaging, 3D &amp; AW</p>
        </div>

        {/* KPI 6: Budget & PR/PO */}
        <div 
          onClick={() => onNavigateToBudget()}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-800">Committed PO Budget</span>
            <Receipt className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-1">฿{(committedPO / 1000000).toFixed(2)}M</p>
          <p className="text-xs font-light text-slate-500 truncate">Remaining ฿{(remainingBudget / 1000000).toFixed(2)}M</p>
        </div>
      </div>

      {/* 4. Workload Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-medium">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Team Workload &amp; Capacity
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {totalActiveTasks} active tasks
                </span>
              </div>
              <p className="text-xs font-light text-slate-500 mt-0.5">
                Overview of on-hand workload, member capacity limits, and team delivery status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-normal">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Available: <strong className="text-slate-800 font-medium">{availableLoadCount}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Optimal: <strong className="text-slate-800 font-medium">{optimalLoadCount}</strong></span>
            </span>
            {highLoadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>High Load: <strong className="text-rose-700 font-medium">{highLoadCount}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Active Filter Context Banner (only when filter active) */}
        {isFilterActive && (
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-indigo-900 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Filter:</span>
              </span>
              {selectedProjectId !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-md bg-white text-indigo-700 font-normal border border-indigo-200">
                  Project: {projects.find((p) => p.id === selectedProjectId)?.name || selectedProjectId}
                </span>
              )}
              {selectedAssigneeId !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-md bg-white text-indigo-700 font-normal border border-indigo-200">
                  Assignee: {mockUsers.find((u) => u.id === selectedAssigneeId)?.name || selectedAssigneeId}
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-md bg-white text-indigo-700 font-normal border border-indigo-200">
                  Status: {selectedStatus}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="px-2.5 py-0.5 rounded-md bg-white text-indigo-700 font-normal border border-indigo-200">
                  Search: "{searchQuery}"
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedProjectId('all');
                setSelectedAssigneeId('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Workload Table: 7 Clean Columns */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[240px]">Member Profile</th>
                <th className="py-3 px-3 w-32 text-center">Workload Status</th>
                <th className="py-3 px-3 w-28 text-center">Projects</th>
                <th className="py-3 px-3 w-36 text-center">Tasks</th>
                <th className="py-3 px-4 min-w-[200px]">Capacity Utilization</th>
                <th className="py-3 px-4 min-w-[220px]">Contact Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMemberWorkloads.length > 0 ? (
                sortedMemberWorkloads.map(({ user, activeTasks, completedTasks, totalTasks, projectCount, capacityPercent, loadStatus }, idx) => {
                  const isSelected = selectedAssigneeId === user.id;

                  return (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedAssigneeId(isSelected ? 'all' : user.id)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-50/70'
                          : 'hover:bg-slate-50/70'
                      }`}
                      title="Click to filter dashboard by this member"
                    >
                      <td className="py-3 px-3 text-center font-normal text-slate-400 bg-slate-50/30 text-sm">
                        {idx + 1}
                      </td>

                      {/* Column 1: Member Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {user.name}
                              </span>
                              {user.nameTh && (
                                <span className="text-xs text-slate-400 font-light">
                                  ({user.nameTh})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-light mt-0.5">
                              {user.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Workload Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          loadStatus === 'Overloaded'
                            ? 'bg-rose-50 text-rose-700'
                            : loadStatus === 'Optimal'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            loadStatus === 'Overloaded' ? 'bg-rose-500 animate-pulse' :
                            loadStatus === 'Optimal' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span>{loadStatus === 'Overloaded' ? 'High Load' : loadStatus}</span>
                        </span>
                      </td>

                      {/* Column 3: Projects */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-medium text-slate-800">
                          {projectCount}
                        </span>
                        <span className="text-xs text-slate-400 font-light ml-1">
                          {projectCount === 1 ? 'proj' : 'projs'}
                        </span>
                      </td>

                      {/* Column 4: Tasks */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-medium text-slate-900">{totalTasks}</span>
                        <div className="text-[11px] text-slate-400 font-light mt-0.5">
                          <span className="text-amber-700 font-medium">{activeTasks.length} active</span>
                          <span className="mx-1 text-slate-300">·</span>
                          <span className="text-emerald-700 font-medium">{completedTasks.length} done</span>
                        </div>
                      </td>

                      {/* Column 5: Capacity Utilization Bar */}
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800">{capacityPercent}%</span>
                            <span className="text-slate-400 font-light text-[11px]">({activeTasks.length}/{user.maxCapacity} max)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                capacityPercent >= 85 ? 'bg-rose-500' :
                                capacityPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Contact Info */}
                      <td className="py-3 px-4 text-xs text-slate-600 font-light">
                        <div className="flex flex-col space-y-0.5">
                          <a
                            href={`mailto:${user.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-600 hover:text-indigo-600 truncate flex items-center gap-1.5"
                          >
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </a>
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{user.phone}</span>
                            {user.phoneGs && user.phoneGs !== '-' && (
                              <span className="font-sans text-slate-400 text-[10px]">
                                ext. {user.phoneGs}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 bg-slate-50/50">
                    <Filter className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                    <p className="text-xs font-medium text-slate-700">No team members match the current filter criteria</p>
                    <button
                      onClick={() => {
                        setSelectedProjectId('all');
                        setSelectedAssigneeId('all');
                        setSelectedStatus('all');
                        setSearchQuery('');
                      }}
                      className="mt-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Operational Blindspot Radars: 🚨 Deadline Radar + 🎨 Graphic Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Blindspot 1: 🚨 Deadline & Overdue Radar */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-medium">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>🚨 Deadline Radar: Upcoming &amp; Critical (Next 7 Days)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
                    {overdueOrUrgentTasks.length} Tasks
                  </span>
                </h3>
                <p className="text-xs sm:text-sm font-light text-slate-500">
                  Early warning radar for upcoming deliveries and high-priority items
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {overdueOrUrgentTasks.length > 0 ? (
              overdueOrUrgentTasks.slice(0, 5).map((task) => {
                const due = new Date(task.dueDate);
                const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;

                return (
                  <div
                    key={task.id}
                    className="p-3.5 bg-rose-50/40 hover:bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-normal text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {task.projectName}
                        </span>
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {task.taskName}
                        </span>
                        <PriorityPill priority={task.priority} />
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap font-light">
                        <span>Assignee: {task.assignee.name}</span>
                        <span>&bull;</span>
                        <span className={`font-medium ${isOverdue ? 'text-rose-700' : 'text-amber-700'}`}>
                          {isOverdue ? `Overdue by ${Math.abs(diffDays)}d` : `${diffDays}d remaining`} ({formatDate(task.dueDate)})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpdateTaskStatus(task.id, 'Done')}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs transition-colors cursor-pointer flex-shrink-0"
                      title="Mark as Done"
                    >
                      ✓ Mark Done
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-100 font-light">
                🎉 Excellent! No overdue or critical tasks at this time
              </div>
            )}
          </div>
        </div>

        {/* Blindspot 2: 🎨 Graphic & Packaging Pipeline Monitor */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-medium">
                <Palette className="w-5 h-5 text-purple-600" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>🎨 Graphic &amp; Packaging Pipeline Monitor</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
                    {graphicQueueTasks.length} Queued
                  </span>
                </h3>
                <p className="text-xs sm:text-sm font-light text-slate-500">
                  Monitor packaging artworks and dieline queue to prevent print delays
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToGraphicQueue}
              className="text-xs sm:text-sm font-medium text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>Graphic Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {graphicQueueTasks.length > 0 ? (
              graphicQueueTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-purple-50/30 hover:bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 truncate">{task.taskName}</span>
                      <span className="text-xs font-normal px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap font-light">
                      <span className="font-normal text-slate-700">{task.projectName}</span>
                      <span>&bull;</span>
                      <span>Due Date: {formatDate(task.dueDate)}</span>
                      {task.graphicSpecs && (
                        <>
                          <span>&bull;</span>
                          <span className="text-purple-700 font-normal">Spec: {task.graphicSpecs.format}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-normal text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {task.assignee.name.split(' ')[0]}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-100 font-light">
                ✨ Graphic pipeline is clear with no pending backlog
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Active Projects On-Hand Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-medium shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span>Active Projects On-Hand Summary</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium border border-amber-200">
                  {displayUnfinishedProjects.length} Active Projects
                </span>
              </h3>
              <p className="text-sm font-light text-slate-500">
                Summary of active ongoing projects with overall delivery progress {isFilterActive && '(Filtered)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-normal px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Total Projects{isFilterActive ? ' (Filtered)' : ''}: {filteredProjects.length} Projects
            </span>
          </div>
        </div>

        {/* Bullet List of Active Projects On-Hand */}
        <div className="space-y-3">
          {displayUnfinishedProjects.length > 0 ? (
            displayUnfinishedProjects.map((proj) => {
              const pTasks = tasks.filter((t) => t.projectId === proj.id);
              const pDone = pTasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed').length;
              const progress = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
              const pProcurements = procurements.filter((p) => p.projectId === proj.id);
              const hasPO = pProcurements.some((p) => p.procurementStatus === 'PO Issued' || p.procurementStatus === 'Delivered');

              return (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left: Color Bullet + Project Name + Code + Lead */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: proj.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 
                          onClick={() => onNavigateToProject(proj.id)}
                          className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-base cursor-pointer"
                        >
                          {proj.name}
                        </h4>
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-light">
                          {proj.code}
                        </span>
                        <span className="text-xs font-normal uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {proj.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-slate-500 flex-wrap font-light">
                        <div className="flex items-center gap-1.5">
                          <UserAvatar user={proj.lead} size="xs" />
                          <span className="font-medium text-slate-700">{proj.lead.name}</span>
                          {proj.lead.nameTh && <span className="text-slate-400">({proj.lead.nameTh})</span>}
                        </div>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target: {formatDate(proj.targetDate || proj.dueDate)}</span>
                        </span>
                        {hasPO && (
                          <>
                            <span>&bull;</span>
                            <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ PO Issued
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress bar + Status Badge + Action */}
                  <div className="flex items-center gap-4 flex-shrink-0 justify-between md:justify-end">
                    <div className="w-40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 text-sm">{progress}%</span>
                        <span className="text-slate-500 text-xs font-light">{pDone}/{pTasks.length} Tasks</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%`, backgroundColor: proj.color }}
                        />
                      </div>
                    </div>

                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      proj.summaryStatus === 'At Risk'
                        ? 'bg-rose-100 text-rose-800'
                        : proj.summaryStatus === 'On Track'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {proj.summaryStatus}
                    </span>

                    <button
                      onClick={() => onNavigateToProject(proj.id)}
                      className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Timeline</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-100 font-light">
              <FolderKanban className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-normal text-slate-600">
                {projects.length === 0
                  ? "No projects created yet. Click '+ Create Project' in the top header to begin."
                  : 'No active on-hand projects match the current filter criteria'}
              </p>
              {projects.length > 0 && isFilterActive && (
                <button
                  onClick={() => {
                    setSelectedProjectId('all');
                    setSelectedAssigneeId('all');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="mt-2.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 7. All Filtered Tasks Explorer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-medium">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                All Tasks Explorer ({filteredTasks.length} Tasks)
              </h3>
              <p className="text-sm font-light text-slate-500">
                {isFilterActive ? 'Showing tasks matching active filters' : 'Comprehensive list of all team tasks across projects'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTasks(selectedProjectId !== 'all' ? selectedProjectId : undefined)}
            className="text-xs sm:text-sm font-medium text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1.5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition-colors"
          >
            <span>Open in Task List with Attachments</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[360px] w-96 lg:min-w-[420px]">Project</th>
                <th className="py-3.5 px-4 min-w-[220px]">Task Name</th>
                <th className="py-3.5 px-4 w-44">Assignee</th>
                <th className="py-3.5 px-4 w-36 text-center">Status</th>
                <th className="py-3.5 px-3 w-32 text-center">Priority</th>
                <th className="py-3.5 px-4 w-36 text-center">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => {
                  const proj = projectMap.get(task.projectId);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 px-4 text-center font-normal text-slate-400 bg-slate-50/40 text-sm">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 min-w-[360px] lg:min-w-[420px]">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: proj?.color || '#6366F1' }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span
                              className="text-sm font-medium text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                              onClick={() => onNavigateToProject(task.projectId)}
                              title={`View project: ${task.projectName}`}
                            >
                              {task.projectName}
                            </span>
                            {proj?.code && (
                              <span className="text-xs font-mono font-light text-slate-400 mt-0.5">
                                {proj.code}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900">
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-base font-medium group-hover:text-indigo-600 transition-colors">{task.taskName}</span>
                          {task.phase && (
                            <span className="text-xs font-light text-slate-400 mt-0.5">
                              Phase: {task.phase}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={task.assignee} size="xs" />
                          <span className="text-xs sm:text-sm font-normal text-slate-700 truncate">{task.assignee.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusPill 
                          status={task.status} 
                          onChange={(newSt) => onUpdateTaskStatus(task.id, newSt)} 
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <PriorityPill priority={task.priority} />
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs sm:text-sm font-light text-slate-600">
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-light text-sm">
                    {tasks.length === 0
                      ? "No tasks in the system yet. Click '+ Add Task' in the top header to create your first task."
                      : 'No tasks match the search or filter criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
