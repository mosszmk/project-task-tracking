import React, { useState } from 'react';
import { Department, Project, ProjectSummaryStatus, ProjectType, User } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { X, Plus, FolderKanban, Calendar, Sparkles, Tag, Layers, Tent, Palette } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (newProject: Omit<Project, 'id' | 'attachments'>) => void;
}

const PROJECT_TYPES: ProjectType[] = [
  'Event & Exhibition',
  'Creative & Graphic',
  'Packaging',
  'New Product',
  'Campaign',
  'POSM',
  'Branding'
];

const DEPARTMENTS: Department[] = [
  'Event & Trade',
  'Design',
  'Marketing',
  'Brand',
  'R&D'
];

const COLOR_OPTIONS = [
  '#9333ea', // Royal Purple (Event)
  '#4f46e5', // Indigo (Graphic & Creative)
  '#b45309', // Coffee Amber (Packaging)
  '#0f172a', // Matte Black (RTD)
  '#ec4899', // Sakura Pink
  '#059669', // Emerald Green
  '#0284c7', // Ocean Blue
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ProjectType>('Event & Exhibition');
  const [department, setDepartment] = useState<Department>('Event & Trade');
  const [leadId, setLeadId] = useState(mockUsers[4].id); // Nate Torres (Event Specialist)
  const [targetDate, setTargetDate] = useState('18 Oct 2026');
  const [dueDate, setDueDate] = useState('2026-10-18');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  // Auto-sync department when type changes
  const handleTypeChange = (newType: ProjectType) => {
    setType(newType);
    if (newType === 'Event & Exhibition') {
      setDepartment('Event & Trade');
      setColor('#9333ea');
    } else if (newType === 'Creative & Graphic') {
      setDepartment('Design');
      setColor('#4f46e5');
    } else if (newType === 'Packaging') {
      setDepartment('Design');
      setColor('#b45309');
    } else if (newType === 'New Product') {
      setDepartment('Marketing');
      setColor('#0f172a');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const leadUser = mockUsers.find((u) => u.id === leadId) || mockUsers[0];

    onCreateProject({
      name: name.trim(),
      code: code.trim() || `UCC-${Math.floor(100 + Math.random() * 900)}`,
      type,
      department,
      category: type,
      color,
      lead: leadUser,
      dueDate,
      targetDate,
      summaryStatus: 'In Progress',
      description: description.trim() || `${type} project initiative for UCC Thailand.`,
      statusNotes: ['Project initiated; briefing, budget sign-off, and timeline scheduling in progress.'],
    });

    onClose();
    setName('');
    setCode('');
    setDescription('');
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
              <p className="text-xs text-slate-500">Supports Events & Exhibitions, Graphic Requests, and Packaging</p>
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
              Quick Project Scope
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('Event & Exhibition')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  type === 'Event & Exhibition'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-500 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Tent className="w-3.5 h-3.5 text-purple-600" />
                  <span>Event & Booth</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Expos, Pop-ups, Fest</p>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('Creative & Graphic')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  type === 'Creative & Graphic'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500 shadow-xs'
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
                onClick={() => handleTypeChange('Packaging')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  type === 'Packaging'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Packaging & NPD</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Cans, Pouches, Cups</p>
              </button>
            </div>
          </div>

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
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Target Launch / D-Day Date
              </label>
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="e.g. 18 Oct 2026"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1.5">
              Project Color Accent
            </label>
            <div className="flex items-center gap-2.5">
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
