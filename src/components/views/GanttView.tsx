import React, { useState, useMemo, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Project, Task, TaskStatus } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate, toISODate, calculateWorkingDaysInclusive } from '../../utils/dateUtils';
import { STATUS_CONFIG, ALL_STATUSES } from '../table/StatusPill';
import { exportGanttToExcel } from '../../utils/excelExport';
import { 
  CalendarRange, 
  Plus, 
  Printer, 
  Flag, 
  FolderKanban, 
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
  Loader2,
  Edit3,
  FileSpreadsheet,
  Image as ImageIcon,
  Gift,
  FlaskConical
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
  onEditProject?: (project: Project) => void;
  onEditTask?: (task: Task) => void;
  onApplyTemplate?: (projectId: string, templateKey?: string) => void;
}

const THAI_DAY_LETTERS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const THAI_FULL_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const MONTH_COLOR_PALETTE = [
  { bg: 'bg-amber-800', text: 'text-white' },
  { bg: 'bg-amber-600', text: 'text-white' },
  { bg: 'bg-emerald-700', text: 'text-white' },
  { bg: 'bg-teal-800', text: 'text-white' },
  { bg: 'bg-indigo-700', text: 'text-white' },
  { bg: 'bg-blue-700', text: 'text-white' },
  { bg: 'bg-purple-800', text: 'text-white' },
  { bg: 'bg-rose-700', text: 'text-white' },
  { bg: 'bg-cyan-800', text: 'text-white' },
];

export interface WorkingDayItem {
  dateIso: string;
  dayNum: number;
  dayLetter: string;
  dayOfWeek: number;
  monthKey: string;
  monthTh: string;
  monthEn: string;
  monthFullTh: string;
  year: number;
  isMonday: boolean;
  isFriday: boolean;
  weekIndex: number;
}

export type DayItem = WorkingDayItem;

export interface WeekSlot {
  monthKey: string;
  monthEn: string;
  monthTh: string;
  monthFullTh: string;
  year: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
  days: WorkingDayItem[];
}

export interface MonthGroup {
  monthKey: string;
  monthEn: string;
  monthTh: string;
  monthFullTh: string;
  year: number;
  label: string;
  workingDays: WorkingDayItem[];
  color: { bg: string; text: string };
}

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
  onEditProject,
  onEditTask,
  onApplyTemplate,
}) => {
  // Density / Column Width state for optimal readability
  const [density, setDensity] = useState<TimelineDensity>('comfortable');
  const [onlyMilestones, setOnlyMilestones] = useState(false);
  const [isTemplateConfirmOpen, setIsTemplateConfirmOpen] = useState(false);
  const [selectedTemplateToApply, setSelectedTemplateToApply] = useState<'npd_new_product' | 'npd_special_set'>('npd_new_product');
  const [templateAppliedToast, setTemplateAppliedToast] = useState<string | null>(null);

  // Column width per working day (comfortable = 34px gives crystal-clear square tile for each working day)
  const columnWidthMap: Record<TimelineDensity, number> = {
    compact: 26,
    comfortable: 34,
    spacious: 44,
  };
  const dayColWidth = columnWidthMap[density];
  const colWidth = dayColWidth;

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

  // Export Menu State & Refs
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const ganttTableContainerRef = useRef<HTMLDivElement>(null);
  const ganttTableScrollRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  // Find currently selected project
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Searchable projects list based on typed query (sorted by Target Date)
  const searchableProjects = useMemo(() => {
    let list = projects;
    if (projectSearchQuery.trim()) {
      const q = projectSearchQuery.toLowerCase();
      list = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.lead?.name.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const dateA = toISODate(a.targetDate || a.dueDate) || '9999-99-99';
      const dateB = toISODate(b.targetDate || b.dueDate) || '9999-99-99';
      return dateA.localeCompare(dateB);
    });
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
    const sortedTasks = [...projectTasks].sort((a, b) => {
      const dateA = toISODate(a.startDate) || '';
      const dateB = toISODate(b.startDate) || '';
      return dateA.localeCompare(dateB);
    });

    sortedTasks.forEach((task) => {
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

  // Sequential task numbering across all phases (1, 2, 3, ... N) without phase index jumps
  const taskNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let count = 1;
    phaseGroups.forEach((group) => {
      group.tasks.forEach((task) => {
        map.set(task.id, count++);
      });
    });
    return map;
  }, [phaseGroups]);

  // Dynamically generate Timeline months & individual working days based on project start and target dates
  const { monthGroups, allWorkingDays, timelineSlots } = useMemo(() => {
    let earliestDate = currentProject?.startDate ? toISODate(currentProject.startDate) : '';
    let latestDate = currentProject?.targetDate ? toISODate(currentProject.targetDate) : '';

    projectTasks.forEach((t) => {
      const s = toISODate(t.startDate);
      const d = toISODate(t.dueDate);
      if (s) {
        if (!earliestDate || s < earliestDate) earliestDate = s;
      }
      if (d) {
        if (!latestDate || d > latestDate) latestDate = d;
      }
    });

    if (!earliestDate) {
      earliestDate = new Date().toISOString().slice(0, 10);
    }
    if (!latestDate || latestDate < earliestDate) {
      const d = new Date(earliestDate);
      d.setMonth(d.getMonth() + 3);
      latestDate = d.toISOString().slice(0, 10);
    }

    const startYear = parseInt(earliestDate.slice(0, 4), 10) || new Date().getFullYear();
    const startMonth = (parseInt(earliestDate.slice(5, 7), 10) || 1) - 1; // 0-indexed

    const endYear = parseInt(latestDate.slice(0, 4), 10) || startYear;
    const endMonth = (parseInt(latestDate.slice(5, 7), 10) || 12) - 1;

    let totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    // Show at least 3 months for good visibility
    if (totalMonths < 3) {
      totalMonths = 3;
    }
    // Cap at 18 months max
    if (totalMonths > 18) {
      totalMonths = 18;
    }

    const groups: MonthGroup[] = [];
    const allDays: WorkingDayItem[] = [];
    const allSlots: WeekSlot[] = [];
    let weekCounter = 1;

    for (let i = 0; i < totalMonths; i++) {
      const curDate = new Date(startYear, startMonth + i, 1);
      const y = curDate.getFullYear();
      const m = curDate.getMonth();
      const daysInMonth = new Date(y, m + 1, 0).getDate();

      const mDays: WorkingDayItem[] = [];
      let currentWeekDays: WorkingDayItem[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = new Date(y, m, d);
        const dayOfWeek = dayDate.getDay(); // 0 Sun, 1 Mon, ... 5 Fri, 6 Sat
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const isMon = dayOfWeek === 1;
          const isFri = dayOfWeek === 5;
          if (isMon && mDays.length > 0) {
            weekCounter++;
          }
          const item: WorkingDayItem = {
            dateIso: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            dayNum: d,
            dayLetter: THAI_DAY_LETTERS[dayOfWeek],
            dayOfWeek,
            monthKey: `${y}-${String(m + 1).padStart(2, '0')}`,
            monthTh: THAI_MONTHS[m],
            monthEn: EN_MONTHS[m],
            monthFullTh: THAI_FULL_MONTHS[m],
            year: y,
            isMonday: isMon,
            isFriday: isFri,
            weekIndex: weekCounter,
          };
          mDays.push(item);
          allDays.push(item);
          currentWeekDays.push(item);

          if (isFri || d === daysInMonth) {
            const first = currentWeekDays[0];
            const last = currentWeekDays[currentWeekDays.length - 1];
            allSlots.push({
              monthKey: `${y}-${String(m + 1).padStart(2, '0')}`,
              monthEn: EN_MONTHS[m],
              monthTh: THAI_MONTHS[m],
              monthFullTh: THAI_FULL_MONTHS[m],
              year: y,
              weekLabel: first.dayNum === last.dayNum ? `${first.dayNum}` : `${first.dayNum}-${last.dayNum}`,
              startDate: first.dateIso,
              endDate: last.dateIso,
              days: currentWeekDays,
            });
            currentWeekDays = [];
          }
        }
      }

      if (mDays.length > 0) {
        groups.push({
          monthKey: `${y}-${String(m + 1).padStart(2, '0')}`,
          monthEn: EN_MONTHS[m],
          monthTh: THAI_MONTHS[m],
          monthFullTh: THAI_FULL_MONTHS[m],
          year: y,
          label: `${EN_MONTHS[m]} ${y}`,
          workingDays: mDays,
          color: MONTH_COLOR_PALETTE[i % MONTH_COLOR_PALETTE.length],
        });
      }
    }

    return { monthGroups: groups, allWorkingDays: allDays, timelineSlots: allSlots };
  }, [currentProject, projectTasks]);

  // High-Resolution Full-Height Image Export Handler (Guarantees ALL rows & crystal-clear readability)
  const handleExportImage = async () => {
    if (!ganttTableContainerRef.current) return;
    setIsExporting(true);

    try {
      const container = ganttTableContainerRef.current;
      const scrollEl = container.querySelector('[data-gantt-scroll="true"]') as HTMLElement;
      const tableEl = container.querySelector('table') as HTMLTableElement;

      // True column dimensions matching web view: Left cols (784px) + day columns
      const exportDayColWidth = dayColWidth || 34;
      const leftColsWidth = 784;
      const timelineWidth = Math.max(allWorkingDays.length * exportDayColWidth, 800);
      const totalWidth = leftColsWidth + timelineWidth + 2;

      // Measure unconstrained content height to capture all rows
      const totalTasks = projectTasks.length || 34;
      const totalPhases = phaseGroups.length || 8;
      const estimatedContentHeight = 85 + (totalPhases * 42) + (totalTasks * 46) + 60;
      const measuredScrollHeight = tableEl ? tableEl.scrollHeight : (scrollEl ? scrollEl.scrollHeight : estimatedContentHeight);
      const totalExportHeight = Math.max(measuredScrollHeight + 40, estimatedContentHeight);

      const canvas = await html2canvas(container, {
        scale: 2, // 2x Retina resolution for crystal-clear text and graphics
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: totalWidth,
        windowWidth: totalWidth + 50,
        height: totalExportHeight,
        windowHeight: totalExportHeight + 100,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('[data-gantt-export="true"]') as HTMLElement;
          if (!clonedContainer) return;

          // Expand cloned document body & html
          clonedDoc.body.style.width = `${totalWidth + 50}px`;
          clonedDoc.body.style.height = `${totalExportHeight + 100}px`;
          clonedDoc.body.style.overflow = 'visible';
          clonedDoc.body.style.fontFamily = "'Kanit', sans-serif";
          clonedDoc.documentElement.style.width = `${totalWidth + 50}px`;
          clonedDoc.documentElement.style.height = `${totalExportHeight + 100}px`;
          clonedDoc.documentElement.style.overflow = 'visible';
          clonedContainer.style.fontFamily = "'Kanit', sans-serif";

          // 1. Remove all sticky positioning so html2canvas renders naturally without displacement
          const stickyEls = clonedContainer.querySelectorAll<HTMLElement>('.sticky, [class*="sticky"]');
          stickyEls.forEach((el) => {
            el.style.position = 'static';
            el.style.left = 'auto';
            el.style.top = 'auto';
            el.style.boxShadow = 'none';
          });

          // 2. Expand scroll container to visible and full dimensions so all rows render
          const clonedScroll = clonedContainer.querySelector('[data-gantt-scroll="true"]') as HTMLElement;
          if (clonedScroll) {
            clonedScroll.style.overflow = 'visible';
            clonedScroll.style.maxHeight = 'none';
            clonedScroll.style.height = 'auto';
            clonedScroll.style.width = `${totalWidth}px`;
            clonedScroll.style.maxWidth = 'none';
          }
          clonedContainer.style.width = `${totalWidth}px`;
          clonedContainer.style.maxWidth = 'none';
          clonedContainer.style.height = 'auto';
          clonedContainer.style.maxHeight = 'none';
          clonedContainer.style.overflow = 'visible';

          const clonedTable = clonedContainer.querySelector('table');
          if (clonedTable) {
            clonedTable.style.width = `${totalWidth}px`;
            clonedTable.style.minWidth = `${totalWidth}px`;
            clonedTable.style.maxWidth = `${totalWidth}px`;
            clonedTable.style.height = 'auto';
          }

          // 3. Convert <select> dropdowns into clean, vibrant, high-contrast badges matching web view
          clonedContainer.querySelectorAll<HTMLSelectElement>('select').forEach((sel) => {
            const val = sel.value;
            const badge = clonedDoc.createElement('div');
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.padding = '3px 8px';
            badge.style.borderRadius = '6px';
            badge.style.fontSize = '11px';
            badge.style.fontWeight = '700';
            badge.style.fontFamily = "'Kanit', sans-serif";
            badge.style.whiteSpace = 'nowrap';
            badge.style.width = '100%';
            badge.style.maxWidth = '100px';
            badge.style.height = '24px';

            if (val === 'Done' || val === 'Completed') {
              badge.textContent = '✔ Done';
              badge.style.background = '#059669';
              badge.style.color = '#ffffff';
            } else if (val === 'In Progress' || val === 'Designing') {
              badge.textContent = '⏳ In Progress';
              badge.style.background = '#d97706';
              badge.style.color = '#ffffff';
            } else if (val === 'Review') {
              badge.textContent = '🔍 Review';
              badge.style.background = '#e11d48';
              badge.style.color = '#ffffff';
            } else {
              badge.textContent = '⚪ Not Started';
              badge.style.background = '#94a3b8';
              badge.style.color = '#ffffff';
            }
            sel.parentNode?.replaceChild(badge, sel);
          });

          // 4. Hide interactive add buttons and edit icons in the exported image for a clean executive look
          clonedContainer.querySelectorAll<HTMLElement>('button').forEach((btn) => {
            const txt = (btn.textContent || '').toLowerCase();
            if (txt.includes('add process') || btn.title?.includes('แก้ไข') || btn.querySelector('svg.lucide-edit-3')) {
              btn.style.display = 'none';
            }
          });
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

  // Export to Real Styled Microsoft Excel (.xlsx) with Gantt Timeline, colors & formatting
  const handleExportExcel = async () => {
    if (!currentProject) {
      alert('กรุณาเลือกโครงการที่ต้องการส่งออก');
      return;
    }
    try {
      setIsExportingExcel(true);
      await exportGanttToExcel({
        currentProject,
        phaseGroups,
        monthGroups,
        allWorkingDays,
        timelineSlots,
        calculateBarPosition,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to export Gantt to Excel (.xlsx):', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel (.xlsx) กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export to Excel / CSV with UTF-8 BOM for Thai support
  const handleExportCSV = () => {
    if (!currentProject) {
      alert('กรุณาเลือกโครงการที่ต้องการส่งออก');
      return;
    }

    const headers = [
      'ลำดับ (No.)',
      'กลุ่มงาน (Phase / Section)',
      'ชื่องาน / รายละเอียด (List Process)',
      'สถานะ (Status)',
      'ระยะเวลา (วัน)',
      'วันที่เริ่ม (Start Date)',
      'กำหนดส่ง (Due Date)',
      'ผู้รับผิดชอบ (Assignee)',
      'ตำแหน่ง (Role)',
      'จุดส่งมอบสำคัญ (Milestone)',
      'โครงการ (Project Name)',
      'รหัสโครงการ (Project Code)',
      'วันเปิดตัวสินค้า (Target Launch)'
    ];

    const rows: string[][] = [];
    let counter = 1;

    phaseGroups.forEach((group) => {
      group.tasks.forEach((task) => {
        const isDone = task.status === 'Done' || task.status === 'Completed';
        const isInProgress = task.status === 'In Progress' || task.status === 'Designing';
        const statusLabel = isDone ? 'Done (เสร็จสิ้น)' : isInProgress ? 'In Progress (กำลังทำ)' : 'Not Started (ยังไม่เริ่ม)';

        rows.push([
          String(counter++),
          `"${(group.phase || 'General').replace(/"/g, '""')}"`,
          `"${(task.taskName || '').replace(/"/g, '""')}"`,
          `"${statusLabel}"`,
          task.durationDays ? String(task.durationDays) : '-',
          task.startDate ? formatDate(task.startDate) : '-',
          task.dueDate ? formatDate(task.dueDate) : '-',
          `"${(task.assignee?.name || '-').replace(/"/g, '""')}"`,
          `"${(task.role || task.assignee?.role || '-').replace(/"/g, '""')}"`,
          task.isMilestone ? 'YES (Milestone)' : 'No',
          `"${(currentProject.name || '').replace(/"/g, '""')}"`,
          currentProject.code || '-',
          currentProject.targetDate ? formatDate(currentProject.targetDate) : '-'
        ]);
      });
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeProjectName = currentProject.name.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_');
    link.download = `UCC_Schedule_${safeProjectName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Dedicated Print to PDF in Landscape Mode
  const handlePrintPDF = () => {
    window.print();
  };

  // Calculate Gantt bar column position based on exact working days
  const calculateBarPosition = (startDateStr: string, dueDateStr: string) => {
    const startIso = toISODate(startDateStr) || toISODate(dueDateStr);
    const dueIso = toISODate(dueDateStr) || startIso;

    if (!startIso || allWorkingDays.length === 0) {
      return { startCol: 1, spanCols: 1 };
    }

    // 1. Find start index: first working day with dateIso >= startIso
    let startIdx = allWorkingDays.findIndex((day) => day.dateIso >= startIso);
    if (startIdx === -1) {
      startIdx = allWorkingDays.length - 1;
    }

    // 2. Find end index: last working day with dateIso <= dueIso
    let endIdx = -1;
    for (let i = allWorkingDays.length - 1; i >= 0; i--) {
      if (allWorkingDays[i].dateIso <= dueIso) {
        endIdx = i;
        break;
      }
    }
    if (endIdx === -1) {
      endIdx = 0;
    }

    // Ensure endIdx is never before startIdx
    if (endIdx < startIdx) {
      endIdx = startIdx;
    }

    return {
      startCol: startIdx + 1,
      spanCols: Math.max(1, endIdx - startIdx + 1),
    };
  };

  // Status dropdown selector styled as an elegant modern pill with 100% reliable dropdown
  const renderStatusPill = (task: Task) => {
    const effectiveStatus: TaskStatus = (task.status as string) === 'Completed' ? 'Done' : task.status;
    const config = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG['Not Started'];
    
    return (
      <div className="relative inline-flex items-center justify-center w-full max-w-[110px]">
        <select
          value={effectiveStatus}
          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
          className={`w-full h-6.5 pl-2 pr-5 text-[11px] font-semibold rounded-md shadow-2xs cursor-pointer border-0 text-center appearance-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500/40 select-none ${config.bg} ${config.text} ${config.hover}`}
          title="คลิกเพื่อเลือกเปลี่ยนสถานะงาน (Status)"
        >
          <option value="Not Started" className="bg-white text-slate-800 font-medium py-1">
            ⚪ Not Started
          </option>
          <option value="In Progress" className="bg-white text-amber-700 font-semibold py-1">
            ⏳ In Progress
          </option>
          <option value="Done" className="bg-white text-emerald-700 font-semibold py-1">
            ✔ Done
          </option>
          <option value="Review" className="bg-white text-rose-700 font-semibold py-1">
            🔍 Review
          </option>
          <option value="Designing" className="bg-white text-amber-700 font-medium py-1">
            🎨 Designing
          </option>
          <option value="Ready for Graphic" className="bg-white text-purple-700 font-medium py-1">
            📐 Ready for Graphic
          </option>
          <option value="Briefing" className="bg-white text-sky-700 font-medium py-1">
            📝 Briefing
          </option>
          <option value="Backlog" className="bg-white text-slate-600 font-medium py-1">
            📋 Backlog
          </option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-white/90 absolute right-1 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="w-full px-8 py-5 space-y-4">
      {/* Toast Notification for Template Load */}
      {templateAppliedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{templateAppliedToast}</span>
        </div>
      )}

      {/* Top Project Selector & Control Toolbar */}
      <div className="relative z-40 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
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
              <div className={`relative inline-block ${isProjectDropdownOpen ? 'z-50' : 'z-10'}`} ref={projectComboboxRef}>
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
                  <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 md:w-[420px] lg:w-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] p-2.5 text-xs animate-in fade-in zoom-in-95">
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    Target Launch: <strong className="text-slate-900">{formatDate(currentProject.targetDate)}</strong>
                  </span>
                  {onEditProject && (
                    <button
                      type="button"
                      onClick={() => onEditProject(currentProject)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-300 rounded-lg shadow-2xs transition-all cursor-pointer"
                      title="แก้ไขข้อมูลโครงการ (ชื่อ, วันที่, Lead, งบประมาณ)"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>แก้ไขโปรเจกต์</span>
                    </button>
                  )}
                </div>
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
              กะทัดรัด (26px)
            </button>
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                density === 'comfortable' ? 'bg-white text-indigo-700 font-medium shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              มาตรฐาน (34px)
            </button>
            <button
              onClick={() => setDensity('spacious')}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                density === 'spacious' ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              กว้างสบายตา (44px)
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

          {/* Quick Apply NPD Workflow Template Button */}
          {currentProject && onApplyTemplate && (
            <button
              type="button"
              onClick={() => {
                if (currentProject.type === 'NPD (Special Set)') {
                  setSelectedTemplateToApply('npd_special_set');
                } else {
                  setSelectedTemplateToApply('npd_new_product');
                }
                setIsTemplateConfirmOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 rounded-xl shadow-2xs transition-all cursor-pointer"
              title="โหลดขั้นตอนกระบวนการทำงานมาตรฐาน NPD (สินค้าใหม่พัฒนาสูตร หรือ Special Set 34 ขั้นตอน) เข้าสู่โครงการนี้"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>⚡ โหลดแม่แบบ NPD (34 ขั้นตอน)</span>
            </button>
          )}

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

          {/* Dedicated Export Buttons: 1-Click Excel (.xlsx) & 1-Click Image (PNG) */}
          <div className="flex items-center gap-2">
            {/* 1. Export Real Excel (.xlsx) */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel || !currentProject}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
                exportSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="ส่งออกตารางเป็นไฟล์ Microsoft Excel (.xlsx) สวยงามเหมือนหน้าเว็บ พร้อมแถบไทม์ไลน์และสีกราฟ Gantt Bar (เปิดใช้งานได้ทันที)"
            >
              {isExportingExcel ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>กำลังสร้าง Excel (.xlsx)...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>ส่งออกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                  <span>Export Excel (.xlsx)</span>
                </>
              )}
            </button>

            {/* 2. Export Ultra HD Image (PNG) */}
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExporting || !currentProject}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="บันทึกภาพตาราง Gantt Chart คมชัดสูง (PNG) เหมือนบนหน้าจอทุกประการ สำหรับส่งต่องานหรือใส่สไลด์"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>กำลังบันทึกภาพ...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Export รูปภาพ (PNG)</span>
                </>
              )}
            </button>

            {/* 3. Print / PDF */}
            <button
              type="button"
              onClick={handlePrintPDF}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="พิมพ์ตาราง หรือ บันทึกเป็น PDF แนวนอน (Landscape)"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Gantt Table & Calendar Grid (UCC Thailand Excel Format) */}
      <div 
        ref={ganttTableContainerRef}
        data-gantt-export="true"
        className="relative z-10 bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden"
      >
        <div 
          ref={ganttTableScrollRef}
          data-gantt-scroll="true"
          className="max-h-[calc(100vh-210px)] overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300"
        >
          <table className="w-full text-left border-separate border-spacing-0 min-w-[1450px]">
            {/* Table Headers */}
            <thead>
              {/* Top Month Header Row */}
              <tr className="h-[38px]">
                {/* Left Columns Header Spans (6 columns = 784px) */}
                <th colSpan={6} className="sticky top-0 left-0 z-50 w-[784px] min-w-[784px] max-w-[784px] border-r-2 border-b border-slate-300 py-2 px-4 bg-slate-200 text-slate-800 text-left font-semibold uppercase text-xs tracking-wider shadow-[4px_0_10px_-2px_rgba(0,0,0,0.12)]">
                  Process Breakdown & Schedule ({currentProject ? currentProject.name : 'No Project Selected'})
                </th>

                {/* Dynamic Month Spans */}
                {monthGroups.map((mg) => (
                  <th 
                    key={mg.monthKey} 
                    colSpan={mg.workingDays.length} 
                    data-month-header="true"
                    className={`sticky top-0 z-30 ${mg.color.bg} ${mg.color.text} border-r border-b border-white/20 py-2 px-1 text-center text-xs font-semibold shadow-inner`}
                  >
                    {mg.label}
                  </th>
                ))}
              </tr>

              {/* Columns Header & Working Days Row */}
              <tr className="h-[42px] bg-slate-100 text-center text-xs font-medium text-slate-700">
                <th className="sticky top-[38px] left-0 z-50 w-[44px] min-w-[44px] max-w-[44px] py-2 px-1 text-center border-r border-b-2 border-slate-400 text-[11px] bg-slate-100 font-semibold text-slate-700">No</th>
                <th className="sticky top-[38px] left-[44px] z-50 w-[360px] min-w-[360px] max-w-[360px] py-2 px-3 text-left border-r border-b-2 border-slate-400 text-[11px] bg-slate-100 font-semibold text-slate-700">List Process</th>
                <th className="sticky top-[38px] left-[404px] z-50 w-[125px] min-w-[125px] max-w-[125px] py-2 px-2 text-center border-r border-b-2 border-slate-400 text-[11px] bg-slate-100 font-semibold text-slate-700">Status</th>
                <th className="sticky top-[38px] left-[529px] z-50 w-[65px] min-w-[65px] max-w-[65px] py-2 px-2 text-center border-r border-b-2 border-slate-400 text-[11px] bg-slate-100 font-semibold text-slate-700">Duration</th>
                <th className="sticky top-[38px] left-[594px] z-50 w-[95px] min-w-[95px] max-w-[95px] py-2 px-2 text-center border-r border-b-2 border-slate-400 text-[11px] bg-slate-100 font-semibold text-slate-700 whitespace-nowrap">Start Date</th>
                <th className="sticky top-[38px] left-[689px] z-50 w-[95px] min-w-[95px] max-w-[95px] py-2 px-2 text-center border-r-2 border-b-2 border-slate-400 text-[11px] bg-slate-100 font-semibold text-slate-700 whitespace-nowrap shadow-[4px_0_10px_-2px_rgba(0,0,0,0.12)]">Due Date</th>

                {/* Individual Working Day Columns */}
                {allWorkingDays.map((day) => (
                  <th 
                    key={day.dateIso} 
                    data-day-col="true"
                    style={{ width: `${dayColWidth}px`, minWidth: `${dayColWidth}px`, maxWidth: `${dayColWidth}px` }}
                    className={`sticky top-[38px] z-30 py-1 px-0.5 text-center border-b-2 border-slate-400 bg-slate-50 ${
                      day.isFriday ? 'border-r-2 border-r-slate-400' : 'border-r border-r-slate-200'
                    }`}
                  >
                    <div
                      data-day-tile="true"
                      className={`inline-flex flex-col items-center justify-center w-full h-[36px] rounded bg-white text-slate-800 shadow-2xs border transition-all select-none ${
                        day.isMonday ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200'
                      } hover:border-amber-500 hover:bg-amber-50/80`}
                      title={`วัน${day.dayLetter} ที่ ${day.dayNum} ${day.monthTh} ${day.year}`}
                    >
                      <span className="text-[11px] font-bold text-slate-900 leading-none">
                        {day.dayNum}
                      </span>
                      <span className="text-[8.5px] font-medium text-slate-500 leading-none mt-0.5">
                        {day.dayLetter}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-xs">
              {phaseGroups.length > 0 ? (
                phaseGroups.map((group, groupIdx) => (
                  <React.Fragment key={group.phase}>
                    {/* Phase Header Row */}
                    <tr className="bg-slate-200 text-slate-900 font-semibold text-[11px] uppercase tracking-wider">
                      <td colSpan={6} className="sticky left-0 z-20 w-[784px] min-w-[784px] max-w-[784px] py-2 px-4 border-r-2 border-b border-slate-400 bg-slate-200 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.12)]">
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
                            className="text-[10.5px] text-indigo-600 hover:text-indigo-800 font-medium lowercase hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>add process to {group.phase}</span>
                          </button>
                        </div>
                      </td>
                      <td 
                        colSpan={allWorkingDays.length} 
                        className="bg-slate-100/50 border-b border-slate-300 z-0"
                      />
                    </tr>

                    {/* Task Rows inside Phase */}
                    {group.tasks.map((task, taskIdx) => {
                      const overallNo = taskNumberMap.get(task.id) ?? (taskIdx + 1);
                      const { startCol, spanCols } = calculateBarPosition(task.startDate, task.dueDate);
                      const isMilestone = task.isMilestone;
                      const effectiveDuration = (task.startDate && task.dueDate)
                        ? calculateWorkingDaysInclusive(task.startDate, task.dueDate)
                        : (task.durationDays || spanCols || 1);
                      const stickyBg = isMilestone ? 'bg-amber-100 group-hover:bg-amber-100' : 'bg-white group-hover:bg-slate-50';

                      return (
                        <tr 
                          key={task.id}
                          className={`group transition-colors ${
                            isMilestone ? 'bg-amber-100 font-medium' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* 1. No */}
                          <td className={`sticky left-0 z-20 w-[44px] min-w-[44px] max-w-[44px] py-2.5 px-1 text-center text-slate-500 font-mono text-[11px] border-r border-b border-slate-200 ${stickyBg}`}>
                            {overallNo}
                          </td>

                          {/* 2. List Process (Task Name, Attachments & Assignee) - Full Readable Multi-Line */}
                          <td className={`sticky left-[44px] z-20 w-[360px] min-w-[360px] max-w-[360px] py-2.5 px-3 border-r border-b border-slate-200 ${stickyBg}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                {isMilestone && (
                                  <Flag className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 fill-amber-700 mt-0.5" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => onEditTask?.(task)}
                                  className="text-left font-medium hover:text-indigo-600 transition-colors flex items-start gap-1.5 group/name flex-1 cursor-pointer"
                                  title="คลิกเพื่อแก้ไขรายละเอียด Task"
                                >
                                  <span data-task-name="true" className={`text-xs whitespace-normal break-words leading-snug ${isMilestone ? 'text-amber-950 font-semibold' : 'text-slate-900 font-medium'}`}>
                                    {task.taskName}
                                  </span>
                                  <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover/name:opacity-100 hover:text-indigo-600 flex-shrink-0 mt-0.5" />
                                </button>
                                {(task.attachments || []).length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenTaskAttachmentModal?.(task)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-medium transition-colors cursor-pointer flex-shrink-0 mt-0.5"
                                    title={`${task.attachments?.length} file(s) attached: ${task.attachments?.map(a => a.name).join(', ')}`}
                                  >
                                    <Paperclip className="w-3 h-3 text-indigo-600" />
                                    <span>{task.attachments?.length}</span>
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
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

                          {/* 3. Status */}
                          <td className={`sticky left-[404px] z-20 w-[125px] min-w-[125px] max-w-[125px] py-2 px-2 text-center border-r border-b border-slate-200 ${stickyBg}`}>
                            {renderStatusPill(task)}
                          </td>

                          {/* 4. Duration (days) */}
                          <td className={`sticky left-[529px] z-20 w-[65px] min-w-[65px] max-w-[65px] py-2 px-2 text-center text-slate-700 font-mono font-semibold border-r border-b border-slate-200 ${stickyBg}`}>
                            {effectiveDuration ? `${effectiveDuration} d` : '—'}
                          </td>

                          {/* 5. Start Date */}
                          <td className={`sticky left-[594px] z-20 w-[95px] min-w-[95px] max-w-[95px] py-2 px-2 text-center text-slate-700 font-mono text-[11px] border-r border-b border-slate-200 whitespace-nowrap ${stickyBg}`}>
                            {formatDate(task.startDate)}
                          </td>

                          {/* 6. Due Date */}
                          <td className={`sticky left-[689px] z-20 w-[95px] min-w-[95px] max-w-[95px] py-2 px-2 text-center text-slate-900 font-mono text-[11px] font-medium border-r-2 border-b border-slate-400 whitespace-nowrap shadow-[4px_0_10px_-2px_rgba(0,0,0,0.15)] ${stickyBg}`}>
                            {formatDate(task.dueDate)}
                          </td>

                          {/* 7. Gantt Timeline Bar Column Cell (Spanning all working days) */}
                          <td 
                            colSpan={allWorkingDays.length} 
                            className="py-1 px-0 relative h-10 bg-slate-50/10 border-b border-slate-200 z-0"
                          >
                            {/* Background vertical column lines for tracing */}
                            <div 
                              data-timeline-grid="true"
                              className="absolute inset-0 grid pointer-events-none"
                              style={{ gridTemplateColumns: `repeat(${allWorkingDays.length}, ${dayColWidth}px)` }}
                            >
                              {allWorkingDays.map((day) => (
                                <div 
                                  key={day.dateIso} 
                                  className={`h-full ${
                                    day.isFriday ? 'border-r-2 border-r-slate-300' : 'border-r border-r-slate-100'
                                  } ${day.dayOfWeek % 2 === 0 ? 'bg-slate-50/20' : ''}`} 
                                />
                              ))}
                            </div>

                            {/* Actual Timeline Bar */}
                            <div 
                              data-timeline-grid="true"
                              className="relative grid h-7 items-center" 
                              style={{ gridTemplateColumns: `repeat(${allWorkingDays.length}, ${dayColWidth}px)` }}
                            >
                              <div
                                data-gantt-bar="true"
                                onClick={() => onEditTask?.(task)}
                                style={{
                                  gridColumnStart: startCol,
                                  gridColumnEnd: `span ${spanCols}`,
                                }}
                                className={`h-6 rounded-md flex items-center px-1.5 text-[11px] font-medium shadow-xs transition-all duration-150 cursor-pointer z-0 hover:z-10 hover:scale-[1.01] ${
                                  isMilestone
                                    ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-500 border border-amber-500 text-amber-950 shadow-sm ring-1 ring-amber-300 hover:brightness-105'
                                    : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 border border-indigo-500 text-white hover:brightness-105'
                                }`}
                                title={`${task.taskName} (คลิกเพื่อแก้ไข) | Duration: ${effectiveDuration} days (${formatDate(task.startDate)} – ${formatDate(task.dueDate)}) | Owner: ${task.assignee?.name || '-'}`}
                              >
                                {spanCols === 1 ? (
                                  <span className="text-[10px] font-bold mx-auto">
                                    {isMilestone ? '★' : `${effectiveDuration}d`}
                                  </span>
                                ) : spanCols === 2 ? (
                                  <span className="text-[10px] font-bold mx-auto truncate px-0.5">
                                    {isMilestone ? '★' : `${effectiveDuration}d`}
                                  </span>
                                ) : (
                                  <>
                                    {isMilestone && (
                                      <Flag className="w-3 h-3 mr-1 flex-shrink-0 fill-amber-900 text-amber-900" />
                                    )}
                                    <span className="truncate flex-1">{task.taskName}</span>
                                    <span className="ml-1 text-[9.5px] opacity-90 flex-shrink-0 font-mono">
                                      ({effectiveDuration}d)
                                    </span>
                                  </>
                                )}
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
                  <td colSpan={6 + allWorkingDays.length} className="py-16 px-6 text-center bg-slate-50/40">
                    <div className="max-w-md mx-auto space-y-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                        <Sparkles className="w-6 h-6 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {projects.length === 0
                            ? 'ยังไม่มีโครงการในระบบ'
                            : `ยังไม่มีรายการงานในโครงการ "${currentProject?.name}"`}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          คุณสามารถเริ่มต้นอย่างรวดเร็วด้วย <strong>ขั้นตอนมาตรฐาน NPD (34 ขั้นตอน)</strong> หรือคลิกเพิ่มงานใหม่ทีละรายการ
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        {onApplyTemplate && currentProject && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onApplyTemplate(currentProject.id, 'npd_new_product');
                                setTemplateAppliedToast('โหลด 34 ขั้นตอน NPD สินค้าใหม่ (พัฒนาสูตร) เรียบร้อยแล้ว!');
                                setTimeout(() => setTemplateAppliedToast(null), 4000);
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md"
                            >
                              <FlaskConical className="w-4 h-4 text-sky-200" />
                              <span>⚡ โหลดแม่แบบ NPD สินค้าใหม่ (พัฒนาสูตร 34 ขั้นตอน)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onApplyTemplate(currentProject.id, 'npd_special_set');
                                setTemplateAppliedToast('โหลด 34 ขั้นตอน NPD Special Set (ชุดของขวัญ) เรียบร้อยแล้ว!');
                                setTimeout(() => setTemplateAppliedToast(null), 4000);
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md"
                            >
                              <Gift className="w-4 h-4 text-amber-200" />
                              <span>⚡ โหลดแม่แบบ NPD Special Set (34 ขั้นตอน)</span>
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenNewTaskModal(currentProject?.id || '')}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ เพิ่มงานใหม่เอง</span>
                        </button>
                      </div>
                    </div>
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
              <span>= ป้ายวันทำงาน จันทร์ - ศุกร์ เรียงตามวันที่</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            UCC K2 Thailand B2C Production & Packaging Pipeline (Jun – Dec 2026)
          </p>
        </div>
      </div>

      {/* Template Confirmation Modal */}
      {isTemplateConfirmOpen && currentProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsTemplateConfirmOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  เลือกแม่แบบกระบวนการทำงานมาตรฐาน NPD (Official 34 Steps)
                </h3>
                <p className="text-xs text-slate-500">
                  เพิ่ม 34 ขั้นตอนตามเอกสาร UCC Thailand พร้อมคำนวณวันเริ่ม-ส่งมอบให้อัตโนมัติ
                </p>
              </div>
            </div>

            {/* Target project indicator */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-slate-600 font-medium">โครงการเป้าหมาย:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[260px]">{currentProject.name}</span>
              </div>
              <span className="font-mono text-[11px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700 flex-shrink-0">
                {currentProject.code}
              </span>
            </div>

            {/* Template Option Cards */}
            <div className="space-y-2.5">
              {/* Option 1: NPD New Product (Formula Development) */}
              <button
                type="button"
                onClick={() => setSelectedTemplateToApply('npd_new_product')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTemplateToApply === 'npd_new_product'
                    ? 'bg-sky-50/80 border-sky-500 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-sky-900">
                    <FlaskConical className="w-4 h-4 text-sky-600" />
                    <span>1. NPD สินค้าใหม่ (มีการพัฒนาสูตร)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-200 text-sky-950 font-bold">
                    34 ขั้นตอน
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  ครอบคลุม: MKT Concept &bull; R&D Confirm formula &bull; Packaging Design 1st/2nd/3rd & AP Approvals &bull; ยื่น อย. (FDA) &bull; Lab Test &bull; Costing, SRP, MAT Code &bull; Mold & Film &bull; ฉลาก ⭐ &bull; ผลิต ณ UCC &bull; ส่ง SINO &bull; On Shelf ⭐
                </p>
              </button>

              {/* Option 2: NPD Special Set */}
              <button
                type="button"
                onClick={() => setSelectedTemplateToApply('npd_special_set')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTemplateToApply === 'npd_special_set'
                    ? 'bg-amber-50/80 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>2. NPD Special Set (ชุดของขวัญ / Repackaging)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-bold">
                    34 ขั้นตอน
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  ครอบคลุม: Mock up box &bull; Quotation &bull; Structure Price &bull; SINO Presentation &bull; AW Design & Carton &bull; Cup Delivery ⭐ &bull; Box 1M ⭐ &bull; Carton 1M ⭐ &bull; ผลิต Re-pack ณ UCC &bull; On Shelf ⭐
                </p>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                * สามารถแก้ไข ปรับวันที่ หรือลบงานได้อิสระตลอดเวลา
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateConfirmOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onApplyTemplate?.(currentProject.id, selectedTemplateToApply);
                    setIsTemplateConfirmOpen(false);
                    const toastText = selectedTemplateToApply === 'npd_new_product'
                      ? 'โหลด 34 ขั้นตอน NPD สินค้าใหม่ (พัฒนาสูตร) เรียบร้อยแล้ว!'
                      : 'โหลด 34 ขั้นตอน NPD Special Set (ชุดของขวัญ) เรียบร้อยแล้ว!';
                    setTemplateAppliedToast(toastText);
                    setTimeout(() => setTemplateAppliedToast(null), 4000);
                  }}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all cursor-pointer ${
                    selectedTemplateToApply === 'npd_new_product'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                  }`}
                >
                  ยืนยันโหลด 34 ขั้นตอน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
