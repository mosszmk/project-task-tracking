import React, { useState, useMemo, useEffect } from 'react';
import { 
  ActiveView, 
  Project, 
  ProjectAttachment, 
  ProjectSummaryStatus, 
  QuickFilterType, 
  Task, 
  TaskAttachment, 
  TaskStatus, 
  User,
  ProcurementRecord,
  ProcurementStatus,
  ArtworkInfo,
  GraphicSpecs,
  TaskAttachmentCategory
} from './types';
import { mockProjects, mockTasks, mockUsers, currentUser, mockProcurements, marketingTotalBudget } from './mock/mockData';
import { Header } from './components/layout/Header';
import { ViewSwitcher } from './components/layout/ViewSwitcher';
import { TableView } from './components/table/TableView';
import { ProjectStatusSummary } from './components/summary/ProjectStatusSummary';
import { GanttView } from './components/views/GanttView';
import { MyWorkView } from './components/views/MyWorkView';
import { TeamWorkloadView } from './components/views/TeamWorkloadView';
import { KanbanView } from './components/views/KanbanView';
import { ExecutiveDashboardView } from './components/views/ExecutiveDashboardView';
import { BudgetProcurementView } from './components/views/BudgetProcurementView';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { EditProjectModal } from './components/modals/EditProjectModal';
import { ArtworkUploadModal } from './components/modals/ArtworkUploadModal';
import { NewTaskModal } from './components/modals/NewTaskModal';
import { EditTaskModal } from './components/modals/EditTaskModal';
import { FileAttachmentModal } from './components/modals/FileAttachmentModal';
import { TaskAttachmentModal } from './components/modals/TaskAttachmentModal';
import { QuickGuideModal } from './components/modals/QuickGuideModal';
import { QuotationComparisonModal } from './components/modals/QuotationComparisonModal';
import { generateTasksForProject } from './templates/projectTemplates';
import { NewProcurementModal } from './components/modals/NewProcurementModal';
import { GoogleSyncModal } from './components/modals/GoogleSyncModal';
import { 
  fetchFromGoogleSheet, 
  syncToGoogleSheet, 
  loadLocalCache, 
  saveLocalCache, 
  getAppsScriptUrl 
} from './services/googleSheetService';

export function App() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [procurements, setProcurements] = useState<ProcurementRecord[]>(mockProcurements);

  // Google Sheet & Cloud Sync State
  const [isGoogleSyncModalOpen, setIsGoogleSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('ucc_last_sync_time'));
  const [syncSuccess, setSyncSuccess] = useState(false);
  const isFirstRender = React.useRef(true);

  // Layout & Navigation State: Dashboard is Default Landing View
  const [currentTab, setCurrentTab] = useState<string>('dashboard-overview');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [activeFilter, setActiveFilter] = useState<QuickFilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Ownership Filters (Project Lead & Task Assignee)
  const [selectedProjectLeadId, setSelectedProjectLeadId] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

  // Gantt specific selected project
  const [selectedGanttProjectId, setSelectedGanttProjectId] = useState<string>('');

  // Modals State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [selectedProjectForArtwork, setSelectedProjectForArtwork] = useState<Project | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetProjectIdForTask, setTargetProjectIdForTask] = useState<string | null>(null);
  const [targetPhaseForTask, setTargetPhaseForTask] = useState<string | undefined>(undefined);

  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [selectedProjectForAttachment, setSelectedProjectForAttachment] = useState<Project | null>(null);

  const [isTaskAttachmentModalOpen, setIsTaskAttachmentModalOpen] = useState(false);
  const [selectedTaskForAttachment, setSelectedTaskForAttachment] = useState<Task | null>(null);
  const [taskAttachmentCategory, setTaskAttachmentCategory] = useState<TaskAttachmentCategory>('brief_specs');

  // Budget & Procurement Modals State
  const [selectedProcurementForComparison, setSelectedProcurementForComparison] = useState<ProcurementRecord | null>(null);
  const [isNewProcurementModalOpen, setIsNewProcurementModalOpen] = useState(false);
  const [targetProjectIdForPR, setTargetProjectIdForPR] = useState<string | undefined>(undefined);

  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState(false);
  const [isWelcomeBannerDismissed, setIsWelcomeBannerDismissed] = useState(true);

  // 1. Initial Load: Load from local cache, then sync from Google Sheet if configured
  useEffect(() => {
    const cached = loadLocalCache();
    if (cached) {
      if (cached.projects && cached.projects.length > 0) setProjects(cached.projects);
      if (cached.tasks && cached.tasks.length > 0) setTasks(cached.tasks);
      if (cached.procurements && cached.procurements.length > 0) setProcurements(cached.procurements);
    }

    if (getAppsScriptUrl()) {
      setIsSyncing(true);
      fetchFromGoogleSheet()
        .then((res) => {
          if (res?.status === 'success' && res.data) {
            if (res.data.projects) setProjects(res.data.projects);
            if (res.data.tasks) setTasks(res.data.tasks);
            if (res.data.procurements) setProcurements(res.data.procurements);
            setSyncSuccess(true);
            setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        })
        .catch((err) => console.error('Initial sheet fetch error:', err))
        .finally(() => setIsSyncing(false));
    }
  }, []);

  // 2. Auto-sync on data mutation (debounced 1000ms)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    saveLocalCache(projects, tasks, procurements);

    if (getAppsScriptUrl()) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        syncToGoogleSheet(projects, tasks, procurements)
          .then((success) => {
            setSyncSuccess(success);
            if (success) {
              setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
          })
          .catch((err) => console.error('Auto sync error:', err))
          .finally(() => setIsSyncing(false));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [projects, tasks, procurements]);

  // 3. Manual sync handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const success = await syncToGoogleSheet(projects, tasks, procurements);
      setSyncSuccess(success);
      if (success) {
        setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Manual sync error:', err);
      setSyncSuccess(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Read URL query params on mount for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as ActiveView | null;
    if (viewParam && ['dashboard', 'gantt', 'kanban', 'table', 'summary', 'my-work', 'graphic-queue', 'budget', 'workload'].includes(viewParam)) {
      setActiveView(viewParam);
      if (viewParam === 'dashboard') setCurrentTab('dashboard-overview');
      else if (viewParam === 'gantt') setCurrentTab('gantt-schedule');
      else if (viewParam === 'kanban') setCurrentTab('kanban-board');
      else if (viewParam === 'table') setCurrentTab('all-tasks');
      else if (viewParam === 'summary') setCurrentTab('status-summary');
      else if (viewParam === 'my-work') setCurrentTab('my-work');
      else if (viewParam === 'graphic-queue') {
        setCurrentTab('graphic-queue');
        setActiveFilter('graphic-design');
      }
      else if (viewParam === 'budget') setCurrentTab('budget-procurement');
    }
  }, []);

  // Quick action: Change tab from sidebar (Aligned to User Order)
  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (tabId === 'dashboard-overview') {
      setActiveView('dashboard');
      setActiveProjectId(null);
    } else if (tabId === 'gantt-schedule') {
      setActiveView('gantt');
      setActiveProjectId(null);
    } else if (tabId === 'kanban-board') {
      setActiveView('kanban');
      setActiveProjectId(null);
    } else if (tabId === 'all-tasks') {
      setActiveFilter('all');
      setActiveView('table');
      setActiveProjectId(null);
    } else if (tabId === 'status-summary') {
      setActiveView('summary');
      setActiveProjectId(null);
    } else if (tabId === 'my-work') {
      setActiveView('my-work');
      setActiveProjectId(null);
    } else if (tabId === 'graphic-queue') {
      setActiveFilter('graphic-design');
      setActiveView('graphic-queue');
      setActiveProjectId(null);
    } else if (tabId === 'budget-procurement') {
      setActiveView('budget');
      setActiveProjectId(null);
    }
  };

  // Sync active view change back to tab and filter
  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    if (view === 'dashboard') {
      setCurrentTab('dashboard-overview');
      setActiveFilter('all');
    } else if (view === 'gantt') {
      setCurrentTab('gantt-schedule');
      setActiveFilter('all');
    } else if (view === 'kanban') {
      setCurrentTab('kanban-board');
      setActiveFilter('all');
    } else if (view === 'table') {
      setCurrentTab('all-tasks');
      setActiveFilter('all');
    } else if (view === 'summary') {
      setCurrentTab('status-summary');
      setActiveFilter('all');
    } else if (view === 'my-work') {
      setCurrentTab('my-work');
      setActiveFilter('my-tasks');
    } else if (view === 'graphic-queue') {
      setCurrentTab('graphic-queue');
      setActiveFilter('graphic-design');
    } else if (view === 'budget') {
      setCurrentTab('budget-procurement');
      setActiveFilter('all');
    }
  };

  // Modal Triggers: Step 1 = Create Project, Step 2 = Add Task
  const handleOpenNewProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const handleOpenNewTaskModal = (projectId?: string, defaultPhase?: string) => {
    setTargetProjectIdForTask(projectId || activeProjectId || selectedGanttProjectId || projects[0]?.id || null);
    setTargetPhaseForTask(defaultPhase);
    setIsTaskModalOpen(true);
  };

  // 1. Create Project (With optional auto-generation of 34 template tasks)
  const handleCreateProject = (
    newProjectData: Omit<Project, 'id' | 'attachments'>,
    generateTemplate: boolean = false
  ) => {
    const newProjId = `proj-${Date.now()}`;
    const newProject: Project = {
      ...newProjectData,
      id: newProjId,
      attachments: [],
    };
    setProjects((prev) => [newProject, ...prev]);
    setSelectedGanttProjectId(newProjId);
    setActiveProjectId(newProjId);

    // If requested or if type is NPD, generate the corresponding 34 workflow tasks
    if (
      generateTemplate || 
      newProject.type === 'NPD (New Formula)' || 
      newProject.type === 'New Product' || 
      newProject.type === 'NPD (Special Set)'
    ) {
      const templateKey = (newProject.type === 'NPD (Special Set)') ? 'npd_special_set' : 'npd_new_product';
      const templateTasks = generateTasksForProject(newProject, templateKey, mockUsers);
      setTasks((prev) => [...prev, ...templateTasks]);
    }
  };

  // 1.05 Apply Workflow Template to an existing project (e.g. from GanttView toolbar or empty state)
  const handleApplyTemplate = (projectId: string, templateKey?: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const resolvedKey = templateKey || (proj.type === 'NPD (Special Set)' ? 'npd_special_set' : 'npd_new_product');
    const templateTasks = generateTasksForProject(proj, resolvedKey, mockUsers);
    setTasks((prev) => [...prev, ...templateTasks]);
  };

  // 1.1 Edit Project
  const handleOpenEditProjectModal = (project: Project) => {
    setSelectedProjectForEdit(project);
    setIsEditProjectModalOpen(true);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    // If project name or lead changed, keep associated tasks in sync
    setTasks((prev) =>
      prev.map((t) =>
        t.projectId === updatedProject.id
          ? {
              ...t,
              projectName: updatedProject.name,
              projectLead: updatedProject.lead,
            }
          : t
      )
    );
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    setProcurements((prev) => prev.filter((pr) => pr.projectId !== projectId));
    if (activeProjectId === projectId) setActiveProjectId(null);
    if (selectedGanttProjectId === projectId) setSelectedGanttProjectId('');
  };

  // 1.2 Artwork Upload & Manager
  const handleOpenArtworkModal = (project: Project) => {
    setSelectedProjectForArtwork(project);
    setIsArtworkModalOpen(true);
  };

  const handleSaveArtwork = (projectId: string, artwork: ArtworkInfo | undefined) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, artwork } : p))
    );
    setSelectedProjectForEdit((prev) =>
      prev && prev.id === projectId ? { ...prev, artwork } : prev
    );
  };

  // 1.3 Task Dates Mutator (Interactive Calendar Picker)
  const handleUpdateTaskDates = (taskId: string, startDate: string, dueDate: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const start = new Date(startDate);
          const due = new Date(dueDate);
          const diffDays = Math.max(1, Math.round((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          return {
            ...t,
            startDate,
            dueDate,
            durationDays: diffDays,
          };
        }
        return t;
      })
    );
  };

  // 2. Add Task to Project
  const handleCreateTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [...prev, newTask]);
    // Sync Gantt project view to target project so user immediately sees the new task and section
    setSelectedGanttProjectId(newTaskData.projectId);
    if (activeProjectId && activeProjectId !== newTaskData.projectId) {
      setActiveProjectId(newTaskData.projectId);
    }
  };

  // Task Mutators
  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleUpdateAssignee = (taskId: string, newAssignee: User) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assignee: newAssignee } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setSelectedTaskForEdit(task);
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleQuickAddTask = (projectId: string, taskName: string) => {
    const proj = projects.find((p) => p.id === projectId) || projects[0];
    if (!proj) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      taskName,
      projectId: proj.id,
      projectName: proj.name,
      projectLead: proj.lead,
      assignee: currentUser,
      role: 'Marketer',
      phase: 'General',
      status: 'In Progress',
      priority: 'Medium',
      durationDays: 7,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Project Mutators
  const handleUpdateSummaryStatus = (projectId: string, newStatus: ProjectSummaryStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, summaryStatus: newStatus } : p))
    );
  };

  const handleUpdateProjectStatusNotes = (projectId: string, newNotes: string[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, statusNotes: newNotes } : p))
    );
  };

  const handleOpenAttachmentModal = (project: Project) => {
    setSelectedProjectForAttachment(project);
    setIsAttachmentModalOpen(true);
  };

  const handleAddAttachment = (projectId: string, newAttachment: Omit<ProjectAttachment, 'id'>) => {
    const attachmentWithId: ProjectAttachment = {
      ...newAttachment,
      id: `att-${Date.now()}`,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, attachments: [...(p.attachments || []), attachmentWithId] }
          : p
      )
    );

    setSelectedProjectForAttachment((prev) =>
      prev && prev.id === projectId
        ? { ...prev, attachments: [...(prev.attachments || []), attachmentWithId] }
        : prev
    );
  };

  const handleOpenTaskAttachmentModal = (task: Task, initialCategory?: TaskAttachmentCategory) => {
    setSelectedTaskForAttachment(task);
    setTaskAttachmentCategory(initialCategory || 'brief_specs');
    setIsTaskAttachmentModalOpen(true);
  };

  const handleUpdateTaskSpecs = (taskId: string, newSpecs: GraphicSpecs) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, graphicSpecs: newSpecs } : t))
    );
  };

  const handleAddTaskAttachment = (taskId: string, newAttachment: Omit<TaskAttachment, 'id'>) => {
    const attachmentWithId: TaskAttachment = {
      ...newAttachment,
      id: `task-att-${Date.now()}`,
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, attachments: [...(t.attachments || []), attachmentWithId] }
          : t
      )
    );

    setSelectedTaskForAttachment((prev) =>
      prev && prev.id === taskId
        ? { ...prev, attachments: [...(prev.attachments || []), attachmentWithId] }
        : prev
    );
  };

  const handleDeleteTaskAttachment = (taskId: string, attachmentId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, attachments: (t.attachments || []).filter((a) => a.id !== attachmentId) }
          : t
      )
    );

    setSelectedTaskForAttachment((prev) =>
      prev && prev.id === taskId
        ? { ...prev, attachments: (prev.attachments || []).filter((a) => a.id !== attachmentId) }
        : prev
    );
  };

  // Procurement Mutators
  const handleCreateProcurement = (newRecordData: Omit<ProcurementRecord, 'id' | 'createdAt'>) => {
    const newRecord: ProcurementRecord = {
      ...newRecordData,
      id: `pr-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setProcurements((prev) => [newRecord, ...prev]);
  };

  const handleUpdateProcurementStatus = (id: string, newStatus: ProcurementStatus, poNumber?: string) => {
    setProcurements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            procurementStatus: newStatus,
            poNumber: poNumber !== undefined ? poNumber : item.poNumber,
          };
        }
        return item;
      })
    );
    setSelectedProcurementForComparison((prev) => {
      if (prev && prev.id === id) {
        return {
          ...prev,
          procurementStatus: newStatus,
          poNumber: poNumber !== undefined ? poNumber : prev.poNumber,
        };
      }
      return prev;
    });
  };

  const handleDeleteProcurement = (id: string) => {
    setProcurements((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpenNewPRModal = (projectId?: string) => {
    setTargetProjectIdForPR(projectId || activeProjectId || undefined);
    setIsNewProcurementModalOpen(true);
  };

  const handleOpenQuotationComparison = (procurement: ProcurementRecord) => {
    setSelectedProcurementForComparison(procurement);
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Project Filter
      if (activeProjectId && task.projectId !== activeProjectId) {
        return false;
      }

      // 1.1 Project Lead / Owner Filter
      if (selectedProjectLeadId) {
        const proj = projects.find((p) => p.id === task.projectId);
        const leadId = task.projectLead?.id || proj?.lead?.id;
        if (leadId !== selectedProjectLeadId) {
          return false;
        }
      }

      // 1.2 Task Assignee / Owner Filter
      if (selectedAssigneeId && task.assignee?.id !== selectedAssigneeId) {
        return false;
      }

      // 2. View and Quick Filters
      if (activeView === 'graphic-queue' || currentTab === 'graphic-queue' || activeFilter === 'graphic-design') {
        const isGraphic =
          task.role === 'Graphic Designer' ||
          task.status === 'Ready for Graphic' ||
          task.status === 'Designing';
        if (!isGraphic) return false;
        // In Graphic Queue, remove all tasks that are already Done / Completed
        if (task.status === 'Done' || (task.status as string) === 'Completed') {
          return false;
        }
      } else if (activeFilter === 'my-tasks' || activeView === 'my-work') {
        if (task.assignee.id !== currentUser.id && task.projectLead.id !== currentUser.id) {
          return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = task.taskName.toLowerCase().includes(q);
        const matchesProject = task.projectName.toLowerCase().includes(q);
        const matchesAssignee = task.assignee.name.toLowerCase().includes(q);
        const matchesPhase = task.phase?.toLowerCase().includes(q);
        if (!matchesName && !matchesProject && !matchesAssignee && !matchesPhase) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, activeProjectId, selectedProjectLeadId, selectedAssigneeId, activeFilter, currentTab, activeView, searchQuery, projects]);

  // Filtered Projects for views that display projects
  const filteredProjects = useMemo(() => {
    let list = projects;
    if (activeProjectId) {
      list = list.filter((p) => p.id === activeProjectId);
    }
    if (selectedProjectLeadId) {
      list = list.filter((p) => p.lead?.id === selectedProjectLeadId);
    }
    if (selectedAssigneeId) {
      const projectIdsWithAssignee = new Set(
        tasks.filter((t) => t.assignee?.id === selectedAssigneeId).map((t) => t.projectId)
      );
      list = list.filter((p) => projectIdsWithAssignee.has(p.id));
    }
    return list;
  }, [projects, activeProjectId, selectedProjectLeadId, selectedAssigneeId, tasks]);

  // Graphic Queue Count for ViewSwitcher Badge (Active tasks only)
  const graphicQueueCount = useMemo(() => {
    return tasks.filter(
      (t) =>
        (t.role === 'Graphic Designer' || t.status === 'Ready for Graphic' || t.status === 'Designing') &&
        t.status !== 'Done' &&
        (t.status as string) !== 'Completed'
    ).length;
  }, [tasks]);

  // Dynamic Header Title
  const headerTitle = useMemo(() => {
    if (activeProjectId) {
      const p = projects.find((proj) => proj.id === activeProjectId);
      return p ? p.name : 'Campaign Tasks';
    }
    if (activeView === 'dashboard' || currentTab === 'dashboard-overview') return 'Executive Campaign & Task Dashboard';
    if (activeView === 'gantt' || currentTab === 'gantt-schedule') return 'Project Gantt Schedule & Timeline';
    if (activeView === 'kanban' || currentTab === 'kanban-board') return 'Visual Workflow & Kanban Board';
    if (activeView === 'table' || currentTab === 'all-tasks') return 'All UCC Projects & Operational Tasks';
    if (activeView === 'summary' || currentTab === 'status-summary') return 'Project Status Summary (UCC Slide)';
    if (activeView === 'my-work' || currentTab === 'my-work') return 'My Focus & Work Queue';
    if (activeView === 'graphic-queue' || currentTab === 'graphic-queue') return 'Graphic Queue & Packaging Pipeline';
    if (activeView === 'budget' || currentTab === 'budget-procurement') return 'Marketing Budget, Supplier & PR/PO Tracking';
    return 'All UCC Projects & Operational Tasks';
  }, [activeProjectId, activeView, currentTab, projects]);

  const activeProjectObj = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* 1. Top Header with Search, Filters, and Action CTAs */}
      <div className="no-print">
        <Header
          title={headerTitle}
          subtitle={activeProjectObj ? activeProjectObj.description : 'UCC Thailand integrated operations, packaging development, and brand asset delivery.'}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          taskStats={{
            total: filteredTasks.length,
            myTasks: tasks.filter((t) => t.assignee.id === currentUser.id).length,
            graphicTasks: graphicQueueCount,
          }}
          onOpenNewProjectModal={handleOpenNewProjectModal}
          onOpenNewTaskModal={() => handleOpenNewTaskModal()}
          onOpenQuickGuide={() => setIsQuickGuideOpen(true)}
          onOpenGoogleSync={() => setIsGoogleSyncModalOpen(true)}
          isSyncing={isSyncing}
          isSheetConnected={Boolean(getAppsScriptUrl())}
        />
      </div>

      {/* 2. ClickUp-Style View Switcher Tabs (hidden in print) */}
      <ViewSwitcher
        activeView={activeView}
        onViewChange={handleViewChange}
        taskCount={filteredTasks.length}
        graphicCount={graphicQueueCount}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          if (id) setSelectedGanttProjectId(id);
        }}
        users={mockUsers}
        selectedProjectLeadId={selectedProjectLeadId}
        onSelectProjectLead={setSelectedProjectLeadId}
        selectedAssigneeId={selectedAssigneeId}
        onSelectAssignee={setSelectedAssigneeId}
        onClearFilters={() => {
          setSelectedProjectLeadId(null);
          setSelectedAssigneeId(null);
          setActiveProjectId(null);
        }}
      />

        {/* 3.1 Dismissible Welcome Hint Banner for Zero-Manual Readability */}
        {!isWelcomeBannerDismissed && (
          <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-slate-50 border-b border-amber-200/70 px-6 py-2 flex items-center justify-between no-print animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              <span>
                <strong>👋 Quick Start:</strong> Select view tabs above (e.g., <strong>Project Timeline</strong> for 15-week schedules, or <strong>Task List</strong> to attach PR/quotation files), or click{' '}
                <button
                  onClick={() => setIsQuickGuideOpen(true)}
                  className="text-indigo-700 hover:text-indigo-900 font-semibold underline cursor-pointer"
                >
                  📖 View 30-Second Quick Guide
                </button>
              </span>
            </div>
            <button
              onClick={() => setIsWelcomeBannerDismissed(true)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs font-medium cursor-pointer transition-colors ml-4"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* 4. Active View Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/60 print:overflow-visible print:bg-white">
          {/* 1. Executive Dashboard View (Default Landing View) */}
          {activeView === 'dashboard' && (
            <ExecutiveDashboardView
              projects={filteredProjects}
              tasks={filteredTasks}
              procurements={procurements}
              onNavigateToProject={(pId) => {
                setSelectedGanttProjectId(pId);
                setActiveProjectId(pId);
                setActiveView('gantt');
                setCurrentTab('gantt-schedule');
              }}
              onNavigateToTasks={(pId) => {
                if (pId) setActiveProjectId(pId);
                else setActiveProjectId(null);
                setActiveFilter('all');
                setActiveView('table');
                setCurrentTab('all-tasks');
              }}
              onNavigateToGraphicQueue={() => {
                setActiveFilter('graphic-design');
                setActiveView('graphic-queue');
                setCurrentTab('graphic-queue');
              }}
              onNavigateToBudget={(pId) => {
                if (pId) setActiveProjectId(pId);
                else setActiveProjectId(null);
                setActiveView('budget');
                setCurrentTab('budget-procurement');
              }}
              onUpdateTaskStatus={handleUpdateStatus}
            />
          )}

          {/* 2. Project View (Gantt Schedule 15 Weeks) */}
          {activeView === 'gantt' && (
            <GanttView
              projects={filteredProjects}
              tasks={filteredTasks}
              selectedProjectId={selectedGanttProjectId}
              onSelectProject={setSelectedGanttProjectId}
              onOpenNewTaskModal={(pId, defaultPhase) => handleOpenNewTaskModal(pId, defaultPhase)}
              onOpenNewProjectModal={handleOpenNewProjectModal}
              onUpdateTaskStatus={handleUpdateStatus}
              onOpenTaskAttachmentModal={handleOpenTaskAttachmentModal}
              onEditProject={handleOpenEditProjectModal}
              onEditTask={handleOpenEditTaskModal}
              onApplyTemplate={handleApplyTemplate}
            />
          )}

          {/* 3. Task List & Graphic Queue View (Monday.com Style Table) */}
          {(activeView === 'table' || activeView === 'graphic-queue') && (
            <TableView
              projects={filteredProjects}
              tasks={filteredTasks}
              onUpdateStatus={handleUpdateStatus}
              onUpdateAssignee={handleUpdateAssignee}
              onDeleteTask={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
              onOpenTaskAttachmentModal={handleOpenTaskAttachmentModal}
              isGraphicQueue={activeView === 'graphic-queue'}
              onEditProject={handleOpenEditProjectModal}
              onUpdateTaskDates={handleUpdateTaskDates}
              onEditTask={handleOpenEditTaskModal}
              onUpdateTaskSpecs={handleUpdateTaskSpecs}
            />
          )}

          {/* 4. Status Summary View (Slide Ready) */}
          {activeView === 'summary' && (
            <ProjectStatusSummary
              projects={filteredProjects}
              procurements={procurements}
              onUpdateSummaryStatus={handleUpdateSummaryStatus}
              onUpdateStatusNotes={handleUpdateProjectStatusNotes}
              onOpenAttachmentModal={handleOpenAttachmentModal}
              onOpenQuotationComparison={handleOpenQuotationComparison}
              onNavigateToBudget={(projectId) => {
                if (projectId) setActiveProjectId(projectId);
                handleTabChange('budget-procurement');
              }}
              onEditProject={handleOpenEditProjectModal}
              onEditArtwork={handleOpenArtworkModal}
            />
          )}

          {/* 5. My Work View */}
          {activeView === 'my-work' && (
            <MyWorkView
              tasks={tasks}
              onUpdateStatus={handleUpdateStatus}
              onOpenTaskAttachmentModal={handleOpenTaskAttachmentModal}
            />
          )}

          {/* 6. Budget & PR/PO Procurement Tracking View */}
          {activeView === 'budget' && (
            <BudgetProcurementView
              procurements={activeProjectId ? procurements.filter((p) => p.projectId === activeProjectId) : procurements}
              projects={filteredProjects}
              totalBudget={marketingTotalBudget}
              onOpenNewPRModal={handleOpenNewPRModal}
              onOpenQuotationComparison={handleOpenQuotationComparison}
              onUpdateProcurementStatus={handleUpdateProcurementStatus}
              onDeleteProcurement={handleDeleteProcurement}
            />
          )}

          {/* 7. Team Workload & Evaluation View */}
          {activeView === 'workload' && (
            <TeamWorkloadView
              tasks={tasks}
            />
          )}

          {/* 8. Kanban View */}
          {activeView === 'kanban' && (
            <KanbanView
              tasks={filteredTasks}
              projects={projects}
              onUpdateStatus={handleUpdateStatus}
              onOpenNewTaskModal={(pId, defaultPhase) => handleOpenNewTaskModal(pId, defaultPhase)}
              onOpenTaskAttachmentModal={handleOpenTaskAttachmentModal}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleOpenEditTaskModal}
            />
          )}
        </main>

      {/* Modal 1: Create New Project */}
      <NewProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Modal 1.1: Edit Existing Project */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        project={selectedProjectForEdit}
        onClose={() => {
          setIsEditProjectModalOpen(false);
          setSelectedProjectForEdit(null);
        }}
        onSaveProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onOpenArtworkModal={handleOpenArtworkModal}
      />

      {/* Modal 1.2: Artwork & Key Visual Upload / Manager */}
      <ArtworkUploadModal
        isOpen={isArtworkModalOpen}
        project={selectedProjectForArtwork}
        onClose={() => {
          setIsArtworkModalOpen(false);
          setSelectedProjectForArtwork(null);
        }}
        onSaveArtwork={handleSaveArtwork}
      />

      {/* Modal 2: Add Task to Project */}
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTargetProjectIdForTask(null);
          setTargetPhaseForTask(undefined);
        }}
        onAddTask={handleCreateTask}
        projects={projects}
        tasks={tasks}
        defaultProjectId={targetProjectIdForTask}
        defaultPhase={targetPhaseForTask}
      />

      {/* Modal 2.1: Edit Existing Task */}
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        task={selectedTaskForEdit}
        projects={projects}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setSelectedTaskForEdit(null);
        }}
        onSaveTask={handleUpdateTask}
        onDeleteTask={(taskId) => {
          handleDeleteTask(taskId);
          setIsEditTaskModalOpen(false);
          setSelectedTaskForEdit(null);
        }}
        onOpenAttachmentModal={(task) => {
          setIsEditTaskModalOpen(false);
          handleOpenTaskAttachmentModal(task);
        }}
      />

      {/* Modal 3: Categorized File Attachments */}
      <FileAttachmentModal
        project={selectedProjectForAttachment}
        isOpen={isAttachmentModalOpen}
        onClose={() => {
          setIsAttachmentModalOpen(false);
          setSelectedProjectForAttachment(null);
        }}
        onAddAttachment={handleAddAttachment}
      />

      {/* Modal 4: Task-level File Attachments (PR, Quotations, Specs, etc.) */}
      <TaskAttachmentModal
        task={selectedTaskForAttachment}
        isOpen={isTaskAttachmentModalOpen}
        initialCategory={taskAttachmentCategory}
        onClose={() => {
          setIsTaskAttachmentModalOpen(false);
          setSelectedTaskForAttachment(null);
        }}
        onAddAttachment={handleAddTaskAttachment}
        onDeleteAttachment={handleDeleteTaskAttachment}
      />

      {/* Modal 5: Quick Guide Modal (3-Step Intuitive Onboarding) */}
      <QuickGuideModal
        isOpen={isQuickGuideOpen}
        onClose={() => setIsQuickGuideOpen(false)}
        onOpenNewProjectModal={handleOpenNewProjectModal}
        onOpenNewTaskModal={() => handleOpenNewTaskModal()}
      />

      {/* Modal 6: Quotation Comparison Modal (2-3 Suppliers Side-by-Side) */}
      <QuotationComparisonModal
        procurement={selectedProcurementForComparison}
        isOpen={!!selectedProcurementForComparison}
        onClose={() => setSelectedProcurementForComparison(null)}
        onSelectWinner={(quotationId: string, reason: string) => {
          if (!selectedProcurementForComparison) return;
          const currentId = selectedProcurementForComparison.id;
          setProcurements((prev) =>
            prev.map((item) => {
              if (item.id === currentId) {
                const updatedQuotes = item.quotations.map((q) => ({
                  ...q,
                  isSelected: q.id === quotationId,
                  selectionReason: q.id === quotationId ? reason : undefined,
                }));
                const winner = updatedQuotes.find((q) => q.id === quotationId);
                return {
                  ...item,
                  quotations: updatedQuotes,
                  supplierName: winner ? winner.supplierName : item.supplierName,
                  supplierContact: winner ? (winner.contactPerson || winner.phone || item.supplierContact) : item.supplierContact,
                  amountTHB: winner ? winner.quotedAmountTHB : item.amountTHB,
                  leadTimeDays: winner ? winner.leadTimeDays : item.leadTimeDays,
                };
              }
              return item;
            })
          );
          setSelectedProcurementForComparison((prev) => {
            if (!prev) return null;
            const updatedQuotes = prev.quotations.map((q) => ({
              ...q,
              isSelected: q.id === quotationId,
              selectionReason: q.id === quotationId ? reason : undefined,
            }));
            const winner = updatedQuotes.find((q) => q.id === quotationId);
            return {
              ...prev,
              quotations: updatedQuotes,
              supplierName: winner ? winner.supplierName : prev.supplierName,
              supplierContact: winner ? (winner.contactPerson || winner.phone || prev.supplierContact) : prev.supplierContact,
              amountTHB: winner ? winner.quotedAmountTHB : prev.amountTHB,
              leadTimeDays: winner ? winner.leadTimeDays : prev.leadTimeDays,
            };
          });
        }}
        onUpdateStatus={(newStatus: ProcurementStatus) => {
          if (!selectedProcurementForComparison) return;
          handleUpdateProcurementStatus(selectedProcurementForComparison.id, newStatus);
        }}
      />

      {/* Modal 7: Create New PR with Supplier Quotations */}
      <NewProcurementModal
        isOpen={isNewProcurementModalOpen}
        onClose={() => {
          setIsNewProcurementModalOpen(false);
          setTargetProjectIdForPR(undefined);
        }}
        onCreateProcurement={handleCreateProcurement}
        projects={projects}
        defaultProjectId={targetProjectIdForPR}
      />

      {/* Modal 8: Google Sheet Sync & Database Hub */}
      <GoogleSyncModal
        isOpen={isGoogleSyncModalOpen}
        onClose={() => setIsGoogleSyncModalOpen(false)}
        onTriggerSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        syncSuccess={syncSuccess}
      />
    </div>
  );
}

export default App;
