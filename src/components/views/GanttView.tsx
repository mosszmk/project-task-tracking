import React, { useState, useMemo, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Project, Task, TaskStatus } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate } from '../../utils/dateUtils';
import { 
  CalendarRange, 
  Plus, 
  Printer, 
  Flag, 
  FolderKanban, 
  Calendar,
  Sparkles,
  Maximize2,
  ZoomIn,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight,
  Paperclip,
  Search,
  ChevronDown,
  Check,
  X,
  Download,
  Camera,
  Loader2
} from 'lucide-react';

interface GanttViewProps {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenNewTaskModal: (projectId: string, defaultPhase?: string) => void;
  onOpenNewProjectModal: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenTaskAttachmentModal?: (task: Task) => void;
}

// 15 Working Weeks matching the UCC Excel Schedule (Jun - Oct 2026)
interface WeekSlot {
  month: 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct';
  monthTh: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  days: string[]; // ['จ', 'อ', 'พ', 'พฤ', 'ศ']
}

const WEEKS_SCHEDULE: WeekSlot[] = [
  { month: 'Jun', monthTh: 'มิ.ย.', weekLabel: '29-30', startDate: '2026-06-29', endDate: '2026-06-30', days: ['จ', 'อ'] },
  { month: 'Jul', monthTh: 'ก.ค.', weekLabel: '1-3', startDate: '2026-07-01', endDate: '2026-07-03', days: ['พ', 'พฤ', 'ศ'] },
  { month: 'Jul', monthTh: 'ก.ค.', weekLabel: '6-10', startDate: '2026-07-06', endDate: '2026-07-10', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Jul', monthTh: 'ก.ค.', weekLabel: '13-17', startDate: '2026-07-13', endDate: '2026-07-17', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Jul', monthTh: 'ก.ค.', weekLabel: '20-24', startDate: '2026-07-20', endDate: '2026-07-24', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Jul', monthTh: 'ก.ค.', weekLabel: '27-31', startDate: '2026-07-27', endDate: '2026-07-31', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Aug', monthTh: 'ส.ค.', weekLabel: '3-7', startDate: '2026-08-03', endDate: '2026-08-07', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Aug', monthTh: 'ส.ค.', weekLabel: '10-14', startDate: '2026-08-10', endDate: '2026-08-14', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Aug', monthTh: 'ส.ค.', weekLabel: '17-21', startDate: '2026-08-17', endDate: '2026-08-21', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Aug', monthTh: 'ส.ค.', weekLabel: '24-28', startDate: '2026-08-24', endDate: '2026-08-28', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Aug', monthTh: 'ส.ค.', weekLabel: '31', startDate: '2026-08-31', endDate: '2026-08-31', days: ['จ'] },
  { month: 'Sep', monthTh: 'ก.ย.', weekLabel: '1-4', startDate: '2026-09-01', endDate: '2026-09-04', days: ['อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Sep', monthTh: 'ก.ย.', weekLabel: '7-11', startDate: '2026-09-07', endDate: '2026-09-11', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Sep', monthTh: 'ก.ย.', weekLabel: '14-18', startDate: '2026-09-14', endDate: '2026-09-18', days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'] },
  { month: 'Oct', monthTh: 'ต.ค.', weekLabel: '1', startDate: '2026-10-01', endDate: '2026-10-01', days: ['พฤ'] },
];

const MONTH_COLORS: Record<string, { bg: string; text: string; label: string; fullTh: string }> = {
  Jun: { bg: 'bg-sky-600', text: 'text-white', label: 'Jun 2026', fullTh: 'มิถุนายน (Jun 2026)' },
  Jul: { bg: 'bg-amber-800', text: 'text-white', label: 'Jul 2026', fullTh: 'กรกฎาคม (Jul 2026)' },
  Aug: { bg: 'bg-amber-600', text: 'text-white', label: 'Aug 2026', fullTh: 'สิงหาคม (Aug 2026)' },
  Sep: { bg: 'bg-emerald-700', text: 'text-white', label: 'Sep 2026', fullTh: 'กันยายน (Sep 2026)' },
  Oct: { bg: 'bg-teal-800', text: 'text-white', label: 'Oct 2026', fullTh: 'ตุลาคม (Oct 2026)' },
};

type TimelineDensity = 'compact' | 'comfortable' | 'spacious';

export const GanttView: React.FC<GanttViewProps> = ({
  projects,
  tasks,
  selectedProjectId,
  onSelectProject,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  onUpdateTaskStatus,
  onOpenTaskAttachmentModal,
}) => {
  // Density / Column Width state for optimal readability
  const [density, setDensity] = useState<TimelineDensity>('comfortable');
  const [onlyMilestones, setOnlyMilestones] = useState(false);

  // Column width per density setting (comfortable = 120px gives ample space for 5 distinct day tiles)
  const columnWidthMap: Record<TimelineDensity, number> = {
    compact: 95,
    comfortable: 120,
    spacious: 155,
  };
  const colWidth = columnWidthMap[density];

  // Searchable Project Combobox state & click-outside
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const projectComboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectComboboxRef.current && !projectComboboxRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  // Export to Image State & Refs
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const ganttTableContainerRef = useRef<HTMLDivElement>(null);
  const ganttTableScrollRef = useRef<HTMLDivElement>(null);

  // High-Resolution Full-Width Image Export Handler
  const handleExportImage = async () => {
    if (!ganttTableContainerRef.current) return;
    setIsExporting(true);

    try {
      const container = ganttTableContainerRef.current;
      const scrollEl = ganttTableScrollRef.current;
      // Calculate full scrollable width of the timeline table
      const fullWidth = scrollEl ? Math.max(scrollEl.scrollWidth, 1500) : 1500;

      const canvas = await html2canvas(container, {
        scale: 2, // 2x Retina resolution for sharp text, badges, and lines
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: fullWidth + 60,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('[data-gantt-export="true"]') as HTMLElement;
          if (clonedContainer) {
            clonedContainer.style.width = `${fullWidth}px`;
            clonedContainer.style.maxWidth = 'none';
            const clonedScroll = clonedContainer.querySelector('[data-gantt-scroll="true"]') as HTMLElement;
            if (clonedScroll) {
              clonedScroll.style.overflow = 'visible';
              clonedScroll.style.width = `${fullWidth}px`;
            }
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeProjectName = currentProject ? currentProject.name.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_') : 'Schedule';
      link.download = `Gantt_Timeline_${safeProjectName}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = imgData;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to export Gantt table as image:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  // Find currently selected project
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Searchable projects list based on typed query
  const searchableProjects = useMemo(() => {
    if (!projectSearchQuery.trim()) return projects;
    const q = projectSearchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.lead?.name.toLowerCase().includes(q)
    );
  }, [projects, projectSearchQuery]);

  // Tasks for current project
  const projectTasks = useMemo(() => {
    if (!currentProject) return [];
    let list = tasks.filter((t) => t.projectId === currentProject.id);
    if (onlyMilestones) {
      list = list.filter((t) => t.isMilestone);
    }
    return list;
  }, [tasks, currentProject, onlyMilestones]);

  // Group tasks by phase (MKT, AW Packaging, Material delivery, etc.)
  const phaseGroups = useMemo(() => {
    const groups: { phase: string; tasks: Task[] }[] = [];
    projectTasks.forEach((task) => {
      const p = task.phase || 'General';
      let existing = groups.find((g) => g.phase === p);
      if (!existing) {
        existing = { phase: p, tasks: [] };
        groups.push(existing);
      }
      existing.tasks.push(task);
    });
    return groups;
  }, [projectTasks]);

  // Calculate Gantt bar column position based on dates
  const calculateBarPosition = (startDate: string, dueDate: string) => {
    let startIdx = 0;
    let endIdx = 0;
    let foundStart = false;

    WEEKS_SCHEDULE.forEach((slot, idx) => {
      if (!foundStart && startDate <= slot.endDate) {
        startIdx = idx;
        foundStart = true;
      }
      if (dueDate >= slot.startDate) {
        endIdx = idx;
      }
    });

    if (!foundStart) startIdx = WEEKS_SCHEDULE.length - 1;
    if (endIdx < startIdx) endIdx = startIdx;

    return {
      startCol: startIdx + 1,
      spanCols: Math.max(1, endIdx - startIdx + 1),
    };
  };

  // Status badge styling
  const renderStatusPill = (task: Task) => {
    const isDone = task.status === 'Done' || task.status === 'Completed';
    const isInProgress = task.status === 'In Progress' || task.status === 'Designing';

    return (
      <select
        value={isDone ? 'Done' : isInProgress ? 'In Progress' : 'Not Started'}
        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
        className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium uppercase tracking-wider border cursor-pointer focus:outline-none transition-colors shadow-2xs ${
          isDone
            ? 'bg-emerald-700 text-white border-emerald-800'
            : isInProgress
            ? 'bg-amber-400 text-slate-900 border-amber-500'
            : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}
      >
        <option value="Done">Done</option>
        <option value="In Progress">In Progress</option>
        <option value="Not Started">Not Started</option>
      </select>
    );
  };

  return (
    <div className="w-full px-8 py-5 space-y-4">
      {/* Top Project Selector & Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-medium">
            <CalendarRange className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700">
                Project-Specific Gantt Timeline
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">UCC Thailand Production Schedule</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {/* Searchable & Wide Project Combobox */}
              <div className="relative inline-block" ref={projectComboboxRef}>
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="w-72 sm:w-96 md:w-[420px] lg:w-[460px] px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs flex items-center justify-between gap-2 text-left transition-all"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <FolderKanban className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    {currentProject ? (
                      <div className="truncate flex items-center gap-2">
                        <span className="font-semibold text-slate-900 truncate">{currentProject.name}</span>
                        <span className="text-xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-mono flex-shrink-0">
                          {currentProject.code}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal">
                        {projects.length === 0 ? 'No Projects Created' : 'Select Project...'}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Combobox Dropdown Popover with Search Input */}
                {isProjectDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 md:w-[420px] lg:w-[460px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2.5 text-xs animate-in fade-in zoom-in-95">
                    {/* Search Input Bar */}
                    <div className="relative mb-2 px-0.5">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={projectSearchQuery}
                        onChange={(e) => setProjectSearchQuery(e.target.value)}
                        placeholder="พิมพ์ค้นหาชื่อโปรเจกต์ หรือรหัสโครงการ..."
                        className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-all"
                      />
                      {projectSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setProjectSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Projects List */}
                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                      {searchableProjects.length > 0 ? (
                        searchableProjects.map((p) => {
                          const isSelected = currentProject?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                onSelectProject(p.id);
                                setIsProjectDropdownOpen(false);
                                setProjectSearchQuery('');
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-50/90 border border-amber-200 text-amber-950 font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate min-w-0">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.color || 'bg-amber-500'}`} />
                                <div className="truncate">
                                  <div className="text-xs sm:text-sm font-medium truncate">{p.name}</div>
                                  <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono bg-slate-100 px-1 rounded">{p.code}</span>
                                    <span>&bull;</span>
                                    <span>{p.category}</span>
                                    {p.lead && (
                                      <>
                                        <span>&bull;</span>
                                        <span>{p.lead.name}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                          <p>
                            {projects.length === 0
                              ? 'ยังไม่มีโครงการในระบบ'
                              : `ไม่พบโปรเจกต์ที่ตรงกับ "${projectSearchQuery}"`}
                          </p>
                          {projects.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsProjectDropdownOpen(false);
                                onOpenNewProjectModal();
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ สร้างโครงการใหม่</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {currentProject && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  Target Launch: <strong className="text-slate-900">{formatDate(currentProject.targetDate)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View Controls & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Milestone Filter Toggle */}
          <button
            onClick={() => setOnlyMilestones(!onlyMilestones)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              onlyMilestones
                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${onlyMilestones ? 'fill-amber-700 text-amber-700' : 'text-slate-400'}`} />
            <span>เฉพาะ Milestones สำคัญ</span>
          </button>

          {/* Density Width Switcher (Compact / Standard / Spacious) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <span className="text-[10.5px] font-medium text-slate-400 px-2 uppercase tracking-wide">
              ขนาดไทม์ไลน์:
            </span>
            <button
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                density === 'compact' ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              กะทัดรัด (95px)
            </button>
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                density === 'comfortable' ? 'bg-white text-indigo-700 font-medium shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              มาตรฐาน (120px)
            </button>
            <button
              onClick={() => setDensity('spacious')}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                density === 'spacious' ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              กว้างพิเศษ (155px)
            </button>
          </div>

          {/* Create Project Button */}
          <button
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
          >
            <FolderKanban className="w-4 h-4 text-amber-600" />
            <span>+ Create Project</span>
          </button>

          {/* Add Task to Current Project */}
          {currentProject && (
            <button
              onClick={() => onOpenNewTaskModal(currentProject.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Task</span>
            </button>
          )}

          {/* Export to Image (PNG) Button */}
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border shadow-2xs transition-all cursor-pointer ${
              exportSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : isExporting
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 opacity-80 cursor-wait'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="Export ตาราง Timeline เป็นรูปภาพ PNG คมชัดสูง"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>กำลังบันทึกภาพ...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>บันทึกภาพสำเร็จ!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export รูปภาพ (PNG)</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Print Gantt"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Friendly Guide & Legend Bar for Zero-Manual Readability */}
      <div className="bg-gradient-to-r from-amber-50/90 via-indigo-50/50 to-slate-50 border border-amber-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="font-semibold text-slate-800">
            💡 คำแนะนำ: แถวสีเหลือง = <strong>Milestone จุดส่งมอบสำคัญ</strong> &bull; สัญลักษณ์ <strong>📎</strong> = มีเอกสารแนบ (คลิกเพื่อดู PR/ใบเสนอราคา/สเปก) &bull; คลิกปุ่ม <strong>[+ Add Task]</strong> เพื่อเพิ่มงานในโครงการนี้
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
            <span>เขียว = เสร็จ (Done)</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
            <span>เหลือง = กำลังทำ (In Progress)</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 inline-block" />
            <span>เทา = ยังไม่เริ่ม</span>
          </span>
        </div>
      </div>

      {/* Main Gantt Table & Calendar Grid (UCC Thailand Excel Format) */}
      <div 
        ref={ganttTableContainerRef}
        data-gantt-export="true"
        className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden"
      >
        <div 
          ref={ganttTableScrollRef}
          data-gantt-scroll="true"
          className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300"
        >
          <table className="w-full text-left border-collapse min-w-[1450px]">
            {/* Table Headers */}
            <thead>
              {/* Top Month Header Row */}
              <tr className="border-b border-slate-300">
                {/* Left Columns Header Spans */}
                <th colSpan={7} className="border-r-2 border-slate-300 py-2.5 px-4 bg-slate-200/90 text-slate-800 text-left font-semibold uppercase text-xs tracking-wider">
                  Process Breakdown & Schedule ({currentProject ? currentProject.name : 'No Project Selected'})
                </th>

                {/* Month Spans with Clear Contrast */}
                <th colSpan={1} className={`${MONTH_COLORS.Jun.bg} ${MONTH_COLORS.Jun.text} border-r border-white/20 py-2 px-1 text-center text-xs font-semibold shadow-inner`}>
                  {MONTH_COLORS.Jun.label}
                </th>
                <th colSpan={5} className={`${MONTH_COLORS.Jul.bg} ${MONTH_COLORS.Jul.text} border-r border-white/20 py-2 px-1 text-center text-xs font-semibold shadow-inner`}>
                  {MONTH_COLORS.Jul.label}
                </th>
                <th colSpan={5} className={`${MONTH_COLORS.Aug.bg} ${MONTH_COLORS.Aug.text} border-r border-white/20 py-2 px-1 text-center text-xs font-semibold shadow-inner`}>
                  {MONTH_COLORS.Aug.label}
                </th>
                <th colSpan={3} className={`${MONTH_COLORS.Sep.bg} ${MONTH_COLORS.Sep.text} border-r border-white/20 py-2 px-1 text-center text-xs font-semibold shadow-inner`}>
                  {MONTH_COLORS.Sep.label}
                </th>
                <th colSpan={1} className={`${MONTH_COLORS.Oct.bg} ${MONTH_COLORS.Oct.text} py-2 px-1 text-center text-xs font-semibold shadow-inner`}>
                  {MONTH_COLORS.Oct.label}
                </th>
              </tr>

              {/* Week Date Ranges Header Row */}
              <tr className="bg-slate-100 text-center text-xs font-medium border-b border-slate-300 text-slate-700">
                <th className="py-2.5 px-2 w-10 text-center border-r border-slate-300 text-[11px]">No</th>
                <th className="py-2.5 px-2.5 w-28 border-r border-slate-300 text-[11px]">Section</th>
                <th className="py-2.5 px-3 min-w-[250px] text-left border-r border-slate-300 text-[11px]">List Process</th>
                <th className="py-2.5 px-2 w-28 text-center border-r border-slate-300 text-[11px]">Status</th>
                <th className="py-2.5 px-2 w-20 text-center border-r border-slate-300 text-[11px]">Duration</th>
                <th className="py-2.5 px-3 min-w-[105px] text-center border-r border-slate-300 text-[11px] whitespace-nowrap">Start Date</th>
                <th className="py-2.5 px-3 min-w-[105px] text-center border-r-2 border-slate-400 text-[11px] whitespace-nowrap">Due Date</th>

                {/* Week Columns */}
                {WEEKS_SCHEDULE.map((slot, i) => (
                  <th 
                    key={i} 
                    style={{ width: `${colWidth}px`, minWidth: `${colWidth}px` }}
                    className="py-2 px-1 text-center border-r border-slate-200 bg-slate-100 text-slate-900"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold text-slate-900 tracking-tight leading-tight">
                        {slot.weekLabel}
                      </span>
                      <span className="text-[9.5px] font-medium text-slate-500 uppercase">
                        {slot.monthTh}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>

              {/* Working Days Row: จ อ พ พฤ ศ (Clean Individual Day Tiles) */}
              <tr className="bg-slate-50 border-b-2 border-slate-400">
                <th colSpan={7} className="border-r-2 border-slate-400 py-1.5 px-4 text-right bg-slate-100/90 text-xs font-medium text-slate-700">
                  <div className="flex items-center justify-end gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>วันทำงาน (Working Days):</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                      (จันทร์ - ศุกร์)
                    </span>
                  </div>
                </th>

                {/* Beautiful Individual Day Tiles per Week Slot */}
                {WEEKS_SCHEDULE.map((slot, i) => (
                  <th 
                    key={i} 
                    style={{ width: `${colWidth}px`, minWidth: `${colWidth}px` }}
                    className="py-1 px-1 text-center border-r border-slate-200 bg-slate-50/80"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {slot.days.map((day, dIdx) => (
                        <span
                          key={dIdx}
                          className="inline-flex items-center justify-center w-5 h-5 rounded text-[10.5px] font-medium bg-white text-slate-800 shadow-2xs border border-slate-300 hover:border-indigo-400 transition-colors"
                          title={`วัน${day === 'จ' ? 'จันทร์' : day === 'อ' ? 'อังคาร' : day === 'พ' ? 'พุธ' : day === 'พฤ' ? 'พฤหัสบดี' : 'ศุกร์'}`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-xs">
              {phaseGroups.length > 0 ? (
                phaseGroups.map((group, groupIdx) => (
                  <React.Fragment key={group.phase}>
                    {/* Phase Header Row */}
                    <tr className="bg-slate-200/80 text-slate-900 font-semibold text-[11px] uppercase tracking-wider">
                      <td colSpan={7} className="py-2 px-4 border-r-2 border-slate-400">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{group.phase}</span>
                            <span className="text-[10px] font-medium text-slate-500 lowercase">
                              ({group.tasks.length} items)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenNewTaskModal(currentProject?.id || '', group.phase)}
                            className="text-[10.5px] text-indigo-600 hover:text-indigo-800 font-medium lowercase hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>add process to {group.phase}</span>
                          </button>
                        </div>
                      </td>
                      <td 
                        colSpan={WEEKS_SCHEDULE.length} 
                        className="bg-slate-100/50 border-b border-slate-200"
                      />
                    </tr>

                    {/* Task Rows inside Phase */}
                    {group.tasks.map((task, taskIdx) => {
                      const overallNo = groupIdx * 10 + taskIdx + 1;
                      const { startCol, spanCols } = calculateBarPosition(task.startDate, task.dueDate);
                      const isMilestone = task.isMilestone;

                      return (
                        <tr 
                          key={task.id}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            isMilestone ? 'bg-amber-100/90 border-y-2 border-amber-300 font-medium' : ''
                          }`}
                        >
                          {/* 1. No */}
                          <td className="py-2 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200">
                            {overallNo}
                          </td>

                          {/* 2. Phase / Section */}
                          <td className="py-2 px-2.5 text-slate-600 font-semibold text-[11px] border-r border-slate-200 truncate max-w-[110px]">
                            {task.phase || '—'}
                          </td>

                          {/* 3. List Process (Task Name, Attachments & Assignee) */}
                          <td className="py-2 px-3 border-r border-slate-200 min-w-[260px]">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                {isMilestone && (
                                  <Flag className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 fill-amber-700" />
                                )}
                                <span className={`text-xs truncate ${isMilestone ? 'text-amber-950 font-semibold' : 'text-slate-900 font-medium'}`}>
                                  {task.taskName}
                                </span>
                                {(task.attachments || []).length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenTaskAttachmentModal?.(task)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-medium transition-colors cursor-pointer flex-shrink-0"
                                    title={`${task.attachments?.length} file(s) attached: ${task.attachments?.map(a => a.name).join(', ')}`}
                                  >
                                    <Paperclip className="w-3 h-3 text-indigo-600" />
                                    <span>{task.attachments?.length}</span>
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {(!task.attachments || task.attachments.length === 0) && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenTaskAttachmentModal?.(task)}
                                    className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                    title="Attach PR / Quotation file"
                                  >
                                    <Paperclip className="w-3 h-3" />
                                  </button>
                                )}
                                <UserAvatar user={task.assignee} size="xs" />
                              </div>
                            </div>
                          </td>

                          {/* 4. Status */}
                          <td className="py-2 px-2 text-center border-r border-slate-200">
                            {renderStatusPill(task)}
                          </td>

                          {/* 5. Duration (days) */}
                          <td className="py-2 px-2 text-center text-slate-700 font-mono font-semibold border-r border-slate-200">
                            {task.durationDays ? `${task.durationDays} d` : '—'}
                          </td>

                          {/* 6. Start Date */}
                          <td className="py-2 px-2.5 text-center text-slate-700 font-mono text-[11px] border-r border-slate-200 whitespace-nowrap">
                            {formatDate(task.startDate)}
                          </td>

                          {/* 7. Due Date */}
                          <td className="py-2 px-2.5 text-center text-slate-900 font-mono text-[11px] font-medium border-r-2 border-slate-400 whitespace-nowrap">
                            {formatDate(task.dueDate)}
                          </td>

                          {/* 8. Gantt Timeline Bar Column Cell (Spanning all 15 week columns) */}
                          <td 
                            colSpan={WEEKS_SCHEDULE.length} 
                            className="py-1 px-0 relative h-9 bg-slate-50/10"
                          >
                            {/* Background vertical column lines for tracing */}
                            <div 
                              className="absolute inset-0 grid pointer-events-none"
                              style={{ gridTemplateColumns: `repeat(${WEEKS_SCHEDULE.length}, ${colWidth}px)` }}
                            >
                              {WEEKS_SCHEDULE.map((_, idx) => (
                                <div 
                                  key={idx} 
                                  className={`border-r border-slate-100 h-full ${
                                    idx % 2 === 1 ? 'bg-slate-50/30' : ''
                                  }`} 
                                />
                              ))}
                            </div>

                            {/* Actual Timeline Bar */}
                            <div 
                              className="relative grid h-7 items-center" 
                              style={{ gridTemplateColumns: `repeat(${WEEKS_SCHEDULE.length}, ${colWidth}px)` }}
                            >
                              <div
                                style={{
                                  gridColumnStart: startCol,
                                  gridColumnEnd: `span ${spanCols}`,
                                }}
                                className={`h-6 rounded-md flex items-center px-2 text-[11px] font-medium shadow-xs truncate transition-all duration-150 cursor-pointer z-10 ${
                                  isMilestone
                                    ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-500 border border-amber-500 text-amber-950 shadow-sm ring-1 ring-amber-300'
                                    : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 border border-indigo-500 text-white hover:brightness-105'
                                }`}
                                title={`${task.taskName} | Duration: ${task.durationDays || spanCols * 5} days (${formatDate(task.startDate)} – ${formatDate(task.dueDate)}) | Owner: ${task.assignee.name}`}
                              >
                                {isMilestone && (
                                  <Flag className="w-3 h-3 mr-1 flex-shrink-0 fill-amber-900 text-amber-900" />
                                )}
                                <span className="truncate flex-1">{task.taskName}</span>
                                <span className="ml-1 text-[9.5px] opacity-90 flex-shrink-0 font-mono">
                                  ({task.durationDays ? `${task.durationDays}d` : `${spanCols}w`})
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7 + WEEKS_SCHEDULE.length} className="py-12 text-center text-xs text-slate-400 italic">
                    {projects.length === 0
                      ? 'No projects created yet. Click "+ Create Project" above to create your first project schedule.'
                      : 'No tasks found for this project. Click "+ Add Task to Project" above to create new schedule items.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend & Summary Info Footer */}
        <div className="p-3.5 bg-slate-100/90 border-t border-slate-300 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-3">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 border border-indigo-500" />
              <span className="font-semibold text-slate-800">Standard Process Bar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-500 ring-1 ring-amber-300" />
              <span className="font-semibold text-amber-950 flex items-center gap-1">
                <Flag className="w-3 h-3 fill-amber-700 text-amber-700" />
                <span>Yellow Milestone (จุดส่งมอบสำคัญ)</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium bg-white text-slate-800 border border-slate-300">
                จ
              </span>
              <span>= ตัวอย่างป้ายวันทำงาน จันทร์ - ศุกร์ (จ อ พ พฤ ศ)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            UCC K2 Thailand B2C Production & Packaging Pipeline (Jun – Oct 2026)
          </p>
        </div>
      </div>
    </div>
  );
};
