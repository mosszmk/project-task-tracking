import React, { useState } from 'react';
import { Department, Project, ProjectSummaryStatus, ProjectType, User } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { X, Plus, FolderKanban, Calendar, Sparkles, Tag, Layers, Tent, Palette, DollarSign, Gift, PackageCheck, FlaskConical } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (newProject: Omit<Project, 'id' | 'attachments'>, generateTemplate?: boolean) => void;
}

const PROJECT_TYPES: ProjectType[] = [
  'NPD (New Formula)',
  'NPD (Special Set)',
  'New Product',
  'Packaging',
  'Creative & Graphic',
  'Event & Exhibition',
  'Campaign',
  'POSM',
  'Branding'
];

const DEPARTMENTS: Department[] = [
  'Marketing',
  'Design',
  'Event & Trade',
  'Brand',
  'R&D'
];

const COLOR_OPTIONS = [
  '#0284c7', // Ocean Sky (New Formula / RTD)
  '#b45309', // Coffee Amber (Special Set & Packaging)
  '#0f172a', // Matte Black
  '#4f46e5', // Indigo (Graphic & Creative)
  '#9333ea', // Royal Purple (Event)
  '#ec4899', // Sakura Pink
  '#059669', // Emerald Green
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ProjectType>('NPD (New Formula)');
  const [department, setDepartment] = useState<Department>('Marketing');
  const [leadId, setLeadId] = useState(mockUsers[6].id); // Wanwisa Chanpraprai (APM NPD)
  const [dueDate, setDueDate] = useState('2026-12-15');
  const [targetDate, setTargetDate] = useState('15 Dec 2026');
  const [budgetAllocated, setBudgetAllocated] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [autoGenerateTasks, setAutoGenerateTasks] = useState(true);

  if (!isOpen) return null;

  // Auto-sync department and lead when type changes
  const handleTypeChange = (newType: ProjectType) => {
    setType(newType);
    if (newType === 'NPD (New Formula)' || newType === 'New Product') {
      setDepartment('Marketing');
      setColor('#0284c7');
      setLeadId(mockUsers[6].id); // Wanwisa Chanpraprai (NPD Lead)
      setAutoGenerateTasks(true);
    } else if (newType === 'NPD (Special Set)') {
      setDepartment('Marketing');
      setColor('#b45309');
      setLeadId(mockUsers[6].id); // Wanwisa Chanpraprai (NPD Lead)
      setAutoGenerateTasks(true);
    } else if (newType === 'Packaging') {
      setDepartment('Design');
      setColor('#b45309');
    } else if (newType === 'Creative & Graphic') {
      setDepartment('Design');
      setColor('#4f46e5');
    } else if (newType === 'Event & Exhibition') {
      setDepartment('Event & Trade');
      setColor('#9333ea');
      setLeadId(mockUsers[0].id); // Atiseal Termwat (Event)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const leadUser = mockUsers.find((u) => u.id === leadId) || mockUsers[6] || mockUsers[0];
    const shouldGenerateTemplate = autoGenerateTasks && (type === 'NPD (New Formula)' || type === 'NPD (Special Set)' || type === 'New Product');

    onCreateProject({
      name: name.trim(),
      code: code.trim() || `UCC-${Math.floor(100 + Math.random() * 900)}`,
      type,
      department,
      category: type,
      color,
      lead: leadUser,
      dueDate: dueDate || '2026-12-15',
      targetDate: targetDate || formatDate(dueDate) || '15 Dec 2026',
      summaryStatus: 'In Progress',
      description: description.trim() || `${type} project initiative for UCC Thailand.`,
      statusNotes: ['Project initiated; briefing, budget sign-off, and timeline scheduling in progress.'],
      budgetAllocated: budgetAllocated ? parseFloat(budgetAllocated) : undefined,
    }, shouldGenerateTemplate);

    onClose();
    setName('');
    setCode('');
    setDescription('');
    setBudgetAllocated('');
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
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-medium">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Create New UCC Project</h3>
              <p className="text-xs text-slate-500">Supports NPD New Product, Special Sets, Graphic Requests & Events</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Category Templates */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Project Scope (รูปแบบโครงการ)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('NPD (New Formula)')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'NPD (New Formula)' || type === 'New Product'
                    ? 'bg-sky-50 border-sky-500 text-sky-950 ring-2 ring-sky-500/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-sky-900">
                    <FlaskConical className="w-4 h-4 text-sky-600" />
                    <span>NPD พัฒนาสูตร</span>
                  </div>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-sky-200/80 text-sky-950 font-semibold">
                    34 Steps ✨
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">R&D สูตรใหม่, อย., Mold, Film</p>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('NPD (Special Set)')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'NPD (Special Set)'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>NPD Special Set</span>
                  </div>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200/80 text-amber-950 font-semibold">
                    34 Steps ✨
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Gift Set, Drip Box, Re-pack</p>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('Packaging')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'Packaging'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Packaging Revamp</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Cans, Pouches, Cups</p>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('Creative & Graphic')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'Creative & Graphic'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Graphic Design</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Brochures, POSM, KV</p>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('Event & Exhibition')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'Event & Exhibition'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Tent className="w-3.5 h-3.5 text-purple-600" />
                  <span>Event & Booth</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Expos, Pop-ups, Fest</p>
              </button>
            </div>
          </div>

          {/* Workflow Template Banner when NPD (New Formula) is selected */}
          {(type === 'NPD (New Formula)' || type === 'New Product') && (
            <div className="p-3 bg-sky-50/90 rounded-xl border border-sky-300 text-xs shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span className="font-semibold text-sky-950">
                    แม่แบบกระบวนการ NPD สินค้าใหม่ (พัฒนาสูตร 34 ขั้นตอน):
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-sky-950 select-none">
                  <input
                    type="checkbox"
                    checked={autoGenerateTasks}
                    onChange={(e) => setAutoGenerateTasks(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold">สร้าง 34 ขั้นตอนตั้งต้นอัตโนมัติ</span>
                </label>
              </div>
              <p className="text-[11px] text-sky-900/80 mt-1 leading-snug">
                ครอบคลุมขั้นตอนตาม Flow: <strong>MKT Concept</strong> (Research, Concept) &bull; <strong>R&D</strong> (Confirm formula) &bull; <strong>Packaging Design</strong> (Brief, Design 1st/2nd/3rd, AP Approvals, Thai version) &bull; <strong>FDA</strong> (ยื่น อย.) &bull; <strong>Lab Test</strong> &bull; <strong>MKT</strong> (Costing, SRP, MAT Code, Barcode) &bull; <strong>Material Delivery</strong> (Mold, Film, Label ⭐, Box 1M) &bull; <strong>Production at UCC & On Shelf</strong>
              </p>
            </div>
          )}

          {/* Workflow Template Banner when NPD (Special Set) is selected */}
          {type === 'NPD (Special Set)' && (
            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-300 text-xs shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="font-semibold text-amber-950">
                    แม่แบบกระบวนการ NPD Special Set (ชุดของขวัญ 34 ขั้นตอน):
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-amber-950 select-none">
                  <input
                    type="checkbox"
                    checked={autoGenerateTasks}
                    onChange={(e) => setAutoGenerateTasks(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold">สร้าง 34 ขั้นตอนตั้งต้นอัตโนมัติ</span>
                </label>
              </div>
              <p className="text-[11px] text-amber-900/80 mt-1 leading-snug">
                ครอบคลุมขั้นตอนตาม Flow: <strong>MKT</strong> (Mock up, Quotation, Price, SINO) &bull; <strong>AW Packaging</strong> (Brief, Design, Carton) &bull; <strong>MKT</strong> (ERP MAT Code, Barcode, Tops Mock up) &bull; <strong>Material Delivery</strong> (Cup, Box, Carton) &bull; <strong>Production & On Shelf</strong> (สามารถแก้ไข/ลบ/เพิ่มงานได้อิสระ)
              </p>
            </div>
          )}

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. UCC Pavilion @ Thailand Coffee Fest 2026"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Project Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. UCC-TCF-2026"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Type & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Project Type *
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as ProjectType)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Responsible Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Lead & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Project Lead
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none"
              >
                {mockUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department} - {u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-700">
                  Target Launch / D-Day Date *
                </label>
                {dueDate && (
                  <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {formatDate(dueDate)}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDueDate(val);
                    setTargetDate(val ? formatDate(val) : '');
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Budget Allocated (Optional) & Color Accent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                งบประมาณที่จัดสรร (Budget - THB)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">฿</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={budgetAllocated}
                  onChange={(e) => setBudgetAllocated(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1.5">
                Project Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              Project Scope & Objective
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 100 sq.m. exhibition space with Cold Brew Nitro bar and masterclass stage..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none placeholder-slate-400 font-medium"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg shadow-sm shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
