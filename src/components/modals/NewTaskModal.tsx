import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Project, Task, TaskPriority, TaskStatus, User, UserRole, TaskAttachment, TaskAttachmentCategory } from '../../types';
import { mockUsers, mockProjects, currentUser } from '../../mock/mockData';
import { X, Plus, Palette, Calendar, Clock, Flag, Layers, Tent, Search, ChevronDown, Check, Sparkles, Paperclip, UploadCloud, Trash2, FileText, FileSpreadsheet, Receipt, FileBox, FileCheck } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Omit<Task, 'id'>) => void;
  projects?: Project[];
  tasks?: Task[];
  defaultProjectId?: string | null;
  defaultPhase?: string;
}

const COMMON_PHASES = [
  'NPD & Formulation',
  'MKT',
  'AW Packaging',
  'Packaging Specs',
  'Material delivery',
  'Event Concept & Space',
  'Booth Design & 3D',
  'Permit & Production',
  'Event Collaterals',
  'Setup & D-Day',
  'Trade Marketing',
  'Editorial Layout',
  'POSM Production',
  'Logistics',
];

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  projects = mockProjects,
  tasks = [],
  defaultProjectId,
  defaultPhase,
}) => {
  const [taskName, setTaskName] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id || ''));
  const [phase, setPhase] = useState(defaultPhase || 'Event Concept & Space');
  const [assigneeId, setAssigneeId] = useState(mockUsers[0].id);
  const [role, setRole] = useState<UserRole>('Event Coordinator');
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [durationDays, setDurationDays] = useState<number>(7);
  const [isMilestone, setIsMilestone] = useState(false);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [attachmentCategory, setAttachmentCategory] = useState<TaskAttachmentCategory>('pr_quotation');
  const taskFileInputRef = useRef<HTMLInputElement>(null);

  // Searchable Target Project Combobox State
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
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

  // Currently selected project
  const currentSelectedProject = useMemo(() => {
    return projects.find((p) => p.id === projectId) || projects[0] || null;
  }, [projects, projectId]);

  // Filtered projects for search combobox
  const filteredProjects = useMemo(() => {
    if (!projectSearchQuery.trim()) return projects;
    const q = projectSearchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        p.lead.name.toLowerCase().includes(q)
    );
  }, [projects, projectSearchQuery]);

  // Extract unique phases already in the current project from tasks + common presets
  const projectPhases = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.projectId === projectId && t.phase) {
        set.add(t.phase);
      }
    });
    return Array.from(set);
  }, [tasks, projectId]);

  const suggestedPhases = useMemo(() => {
    return Array.from(new Set([...projectPhases, ...COMMON_PHASES]));
  }, [projectPhases]);

  const handleSelectProject = (proj: Project) => {
    setProjectId(proj.id);
    setIsProjectDropdownOpen(false);
    setProjectSearchQuery('');

    // Intelligently adapt role and assignee based on project type
    if (proj.type === 'Event & Exhibition') {
      setRole('Senior Marketing Executive');
      setAssigneeId('user-1'); // Atiseal Termwat
      if (!defaultPhase) setPhase('Booth Design & 3D');
    } else if (proj.type === 'Creative & Graphic' || proj.type === 'Packaging') {
      setRole('Graphic Designer');
      setAssigneeId('user-6'); // Ketsarin Setkhum
      if (!defaultPhase) setPhase('AW Packaging');
    } else if (proj.type === 'New Product') {
      setRole('Assistant Product Manager (NPD)');
      setAssigneeId('user-7'); // Wanwisa Chanpraprai (NPD Lead)
      if (!defaultPhase) setPhase('NPD & Formulation');
    } else {
      setAssigneeId(proj.lead.id);
      setRole(proj.lead.role);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val && durationDays > 0) {
      const d = new Date(val);
      d.setDate(d.getDate() + durationDays);
      setDueDate(d.toISOString().slice(0, 10));
    }
  };

  const handleDurationChange = (days: number) => {
    const validDays = Math.max(1, days);
    setDurationDays(validDays);
    if (startDate && validDays > 0) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + validDays);
      setDueDate(d.toISOString().slice(0, 10));
    }
  };

  // Graphic specs
  const [graphicFormat, setGraphicFormat] = useState<any>('Event Backdrop');
  const [dimensions, setDimensions] = useState('6000 x 3000 mm');

  // Update projectId when defaultProjectId prop changes
  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
      const proj = projects.find((p) => p.id === defaultProjectId);
      if (proj) {
        if (proj.type === 'Event & Exhibition') {
          setPhase('Booth Design & 3D');
          setRole('Event Coordinator');
        } else if (proj.type === 'Creative & Graphic') {
          setPhase('Editorial Layout');
          setRole('Graphic Designer');
        } else if (proj.type === 'Packaging') {
          setPhase('AW Packaging');
          setRole('Graphic Designer');
        } else if (proj.type === 'New Product') {
          setPhase('NPD & Formulation');
          setRole('Assistant Product Manager (NPD)');
          setAssigneeId('user-7'); // Default to Wanwisa Chanpraprai (NPD Lead)
        }
      }
    }
  }, [defaultProjectId, projects]);

  useEffect(() => {
    if (defaultPhase) {
      setPhase(defaultPhase);
    }
  }, [defaultPhase]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeMb} MB`;

    let detectedType: TaskAttachment['fileType'] = 'pdf';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) detectedType = 'image';
    else if (['xlsx', 'xls', 'csv'].includes(ext || '')) detectedType = 'excel';
    else if (['doc', 'docx'].includes(ext || '')) detectedType = 'word';
    else if (['ai', 'psd', 'fig', 'eps'].includes(ext || '')) detectedType = 'ai';

    const newAttachment: TaskAttachment = {
      id: `new-att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: fileName,
      category: attachmentCategory,
      size: sizeStr,
      fileType: detectedType,
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: currentUser.name,
      url: URL.createObjectURL(file),
    };

    setAttachments((prev) => [...prev, newAttachment]);
    if (taskFileInputRef.current) taskFileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const selectedProject = projects.find((p) => p.id === projectId) || projects[0];
    if (!selectedProject) {
      alert('Please create at least one project first before adding a task.');
      return;
    }
    const selectedAssignee = mockUsers.find((u) => u.id === assigneeId) || mockUsers[0];

    onAddTask({
      taskName: taskName.trim(),
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      projectLead: selectedProject.lead,
      assignee: selectedAssignee,
      role,
      status,
      priority,
      startDate,
      dueDate,
      phase,
      durationDays: Number(durationDays) || 1,
      isMilestone,
      attachments: attachments.length > 0 ? attachments : undefined,
      graphicSpecs: role === 'Graphic Designer' || phase.includes('Design') || phase.includes('Collateral')
        ? {
            format: graphicFormat,
            dimensions: dimensions.trim() || undefined,
          }
        : undefined,
    });

    onClose();
    setTaskName('');
    setIsMilestone(false);
    setAttachments([]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add Task to Project</h3>
              <p className="text-xs text-slate-500">Step 2: Add process item, phase, duration, and milestone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target Project Selection (Searchable Combobox) */}
          <div className="relative" ref={projectDropdownRef}>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              Target Project *
            </label>
            
            {/* Trigger Button / Display */}
            <div 
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer flex items-center justify-between gap-2 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: currentSelectedProject?.color || '#4f46e5' }} 
                />
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200/60 flex-shrink-0">
                  {currentSelectedProject?.type || 'Project'}
                </span>
                <span className="truncate text-slate-900 font-medium">
                  {currentSelectedProject?.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                  ({currentSelectedProject?.code})
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </div>

            {/* Dropdown Overlay with Real-time Search */}
            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Search Input */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/80">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      placeholder="พิมพ์ค้นหาชื่อโปรเจกต์ หรือรหัส (เช่น RTD, Coffee Fest, UCC)..."
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {projectSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setProjectSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 text-xs font-medium"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtered Projects List */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((p) => {
                      const isSelected = p.id === projectId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProject(p)}
                          className={`p-2.5 px-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-medium uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {p.type}
                                </span>
                                <span className={`text-xs font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                                  {p.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {p.code} &bull; Lead: <span className="text-slate-600 font-sans font-medium">{p.lead.name}</span>
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      ไม่พบโปรเจกต์ที่ตรงกับ "{projectSearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Task Name */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              List Process / Task Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. 3D Booth Render, Stage Backdrop (6x3m), Organizer Permit, D-Day Event Setup"
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Phase Grouping (Free-text with suggestions) & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-700">
                  Section / Phase *
                </label>
                <span className="text-[10px] text-indigo-600 font-medium">พิมพ์เองได้อิสระ</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="phase-suggestions"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  placeholder="พิมพ์ระบุ Section หรือ Phase เช่น Trade Marketing..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                />
                <datalist id="phase-suggestions">
                  {suggestedPhases.map((ph) => (
                    <option key={ph} value={ph} />
                  ))}
                </datalist>
              </div>

              {/* Quick suggestion chips */}
              <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-slate-400 font-medium mr-0.5">แนะนำ:</span>
                {suggestedPhases.slice(0, 4).map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => setPhase(ph)}
                    className={`text-[9.5px] px-2 py-0.5 rounded-md font-medium border transition-all ${
                      phase === ph
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border-slate-200'
                    }`}
                  >
                    {ph}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Duration (Days)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  days
                </span>
              </div>
            </div>
          </div>

          {/* Status & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
              >
                <option value="Not Started">Not Started (ยังไม่เริ่ม)</option>
                <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
                <option value="Done">Done (เสร็จสิ้น)</option>
                <option value="Briefing">Briefing</option>
                <option value="Designing">Designing</option>
                <option value="Review">Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Assignee (ผู้รับผิดชอบ)
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
              >
                {mockUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nameTh ? `${u.nameTh} (${u.name})` : u.name} — {u.role}
                  </option>
                ))}
              </select>
              {(() => {
                const assigned = mockUsers.find((u) => u.id === assigneeId);
                if (assigned?.responsibilities && assigned.responsibilities.length > 0) {
                  return (
                    <div className="text-[10.5px] text-indigo-700 bg-indigo-50/70 border border-indigo-100 rounded-md px-2 py-1 mt-1.5">
                      <span className="font-semibold">บทบาทหลัก: </span>
                      <span>{assigned.responsibilities.slice(0, 3).join(', ')}</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Timeline Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Due Date / End Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Milestone Highlight Checkbox */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-xs font-semibold text-amber-900">Key Milestone Item</p>
                <p className="text-[11px] text-amber-700">Highlight row in yellow on Gantt chart (e.g. D-Day Event, On Shelf, Delivery)</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isMilestone}
              onChange={(e) => setIsMilestone(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* File Attachments (Optional: PR documents, Quotations, Specs, etc.) */}
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <div>
                  <label className="text-xs font-medium text-slate-800">
                    แนบไฟล์เอกสาร (PR, ใบเสนอราคา, สเปก)
                  </label>
                  <p className="text-[10.5px] text-slate-500">
                    อัปโหลดไฟล์แนบประกอบงาน (PDF, Excel, ภาพบรีฟ, เอกสารราคา)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                {attachments.length} ไฟล์
              </span>
            </div>

            {/* Category selection & Upload trigger button */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex-1 min-w-[140px]">
                <select
                  value={attachmentCategory}
                  onChange={(e) => setAttachmentCategory(e.target.value as TaskAttachmentCategory)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
                >
                  <option value="pr_quotation">เอกสาร PR & ใบเสนอราคา</option>
                  <option value="brief_specs">บรีฟ & สเปกสินค้า</option>
                  <option value="approval_reports">รายงาน & ตรวจรับ</option>
                  <option value="general">เอกสารทั่วไป</option>
                </select>
              </div>

              <input
                ref={taskFileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />

              <button
                type="button"
                onClick={() => taskFileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>เลือกไฟล์แนบ...</span>
              </button>
            </div>

            {/* List of currently attached files */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Paperclip className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span className="truncate font-semibold text-slate-800">
                        {att.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        ({att.size})
                      </span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold flex-shrink-0">
                        {att.category === 'pr_quotation' ? 'PR / Quotation' : att.category === 'brief_specs' ? 'Brief/Specs' : att.category === 'approval_reports' ? 'Approval' : 'General'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="ลบไฟล์แนบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
