import React, { useState, useEffect } from 'react';
import { Department, Project, ProjectSummaryStatus, ProjectType, User } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { 
  X, 
  Save, 
  FolderKanban, 
  Calendar, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  DollarSign, 
  Layers, 
  Check, 
  AlertCircle,
  Sparkles,
  FileText
} from 'lucide-react';
import { formatDate, toISODate } from '../../utils/dateUtils';
import { ArtworkThumbnail } from '../summary/ArtworkThumbnail';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSaveProject: (updatedProject: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenArtworkModal?: (project: Project) => void;
}

const PROJECT_TYPES: ProjectType[] = [
  'NPD (New Formula)',
  'NPD (Special Set)',
  'New Product',
  'Packaging',
  'Event & Exhibition',
  'Creative & Graphic',
  'Campaign',
  'POSM',
  'Branding',
];

const DEPARTMENTS: Department[] = [
  'B2C',
  'Event & Trade',
  'Design',
  'Marketing',
  'Brand',
  'R&D',
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

const SUMMARY_STATUSES: ProjectSummaryStatus[] = [
  'On Track',
  'In Progress',
  'Planning',
  'At Risk',
  'Completed',
];

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSaveProject,
  onDeleteProject,
  onOpenArtworkModal,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ProjectType>('Packaging');
  const [department, setDepartment] = useState<Department>('Design');
  const [leadId, setLeadId] = useState(mockUsers[0].id);
  const [dueDate, setDueDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [summaryStatus, setSummaryStatus] = useState<ProjectSummaryStatus>('In Progress');
  const [budgetAllocated, setBudgetAllocated] = useState('');
  const [description, setDescription] = useState('');
  const [statusNotes, setStatusNotes] = useState<string[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // Sync state when project changes or modal opens
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setCode(project.code || '');
      setType(project.type || 'Packaging');
      setDepartment(project.department || 'Design');
      setLeadId(project.lead?.id || mockUsers[0].id);
      
      const isoDue = toISODate(project.dueDate) || toISODate(project.targetDate) || '2026-10-18';
      setDueDate(isoDue);
      setTargetDate(project.targetDate || formatDate(isoDue));
      
      setColor(project.color || COLOR_OPTIONS[0]);
      setSummaryStatus(project.summaryStatus || 'In Progress');
      setBudgetAllocated(project.budgetAllocated ? String(project.budgetAllocated) : '');
      setDescription(project.description || '');
      setStatusNotes(project.statusNotes && project.statusNotes.length > 0 ? [...project.statusNotes] : ['']);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    setStatusNotes((prev) => [...prev, newNoteText.trim()]);
    setNewNoteText('');
  };

  const handleRemoveNote = (index: number) => {
    setStatusNotes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleNoteChange = (index: number, val: string) => {
    setStatusNotes((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณากรอกชื่อโปรเจกต์');
      return;
    }

    const leadUser = mockUsers.find((u) => u.id === leadId) || project.lead || mockUsers[0];
    const filteredNotes = statusNotes.map((n) => n.trim()).filter((n) => n.length > 0);

    const updatedProject: Project = {
      ...project,
      name: name.trim(),
      code: code.trim() || project.code,
      type,
      department,
      category: type,
      color,
      lead: leadUser,
      dueDate: dueDate || project.dueDate,
      targetDate: targetDate || formatDate(dueDate) || project.targetDate,
      summaryStatus,
      description: description.trim(),
      statusNotes: filteredNotes.length > 0 ? filteredNotes : ['Project in progress.'],
      budgetAllocated: budgetAllocated ? parseFloat(budgetAllocated) : undefined,
    };

    onSaveProject(updatedProject);
    onClose();
  };

  const handleDelete = () => {
    if (!onDeleteProject) return;
    if (confirm(`คุณต้องการลบโครงการ "${project.name}" (${project.code}) ออกจากระบบใช่หรือไม่?\n\nงาน (Tasks) ทั้งหมดในโครงการนี้จะถูกลบไปด้วย`)) {
      onDeleteProject(project.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span 
              className="w-4 h-4 rounded-full flex-shrink-0 shadow-2xs" 
              style={{ backgroundColor: color }} 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">แก้ไขข้อมูลโปรเจกต์</h3>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                  {project.code}
                </span>
              </div>
              <p className="text-xs text-slate-500">Edit Project Details, Schedule, Lead & Status Notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Project Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                ชื่อโปรเจกต์ (Project Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. UCC Ready to Drink Canned Latte 280ml"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                รหัสโครงการ (Project Code)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. UCC-2026-001"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Type & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                ประเภทโครงการ (Project Type)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                แผนกที่รับผิดชอบ (Department)
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Lead & Summary Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                Project Lead (หัวหน้าโครงการ)
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
              >
                {mockUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nameTh ? `${u.nameTh} (${u.name})` : u.name} — {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                สถานะภาพรวม (Summary Status)
              </label>
              <select
                value={summaryStatus}
                onChange={(e) => setSummaryStatus(e.target.value as ProjectSummaryStatus)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
              >
                {SUMMARY_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Launch Date (Calendar Picker) & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-700">
                  Target Launch / D-Day Date *
                </label>
                {dueDate && (
                  <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
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
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                งบประมาณที่จัดสรร (Allocated Budget - THB)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">฿</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={budgetAllocated}
                  onChange={(e) => setBudgetAllocated(e.target.value)}
                  placeholder="e.g. 1200000"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Color Accent */}
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
              คำอธิบายและขอบเขตโครงการ (Scope & Objectives)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. รายละเอียดโครงการ NPD สำหรับไตรมาสที่ 3-4..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none placeholder-slate-400 font-medium"
            />
          </div>

          {/* Artwork & Key Visual Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">
                  รูป Artwork / Key Visual / Packaging Render
                </span>
              </div>
              {onOpenArtworkModal && (
                <button
                  type="button"
                  onClick={() => onOpenArtworkModal(project)}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{project.artwork ? '✏️ เปลี่ยนรูป AW' : '+ เพิ่มรูป AW'}</span>
                </button>
              )}
            </div>

            {project.artwork ? (
              <div className="flex items-center gap-4 bg-white p-2.5 rounded-lg border border-slate-200">
                <ArtworkThumbnail artwork={project.artwork} projectName={project.name} />
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">
                    รูปแบบ: {project.artwork.type === 'before_after' ? 'เปรียบเทียบ Before & After' : 'ภาพเดี่ยว Single Artwork'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    คลิกที่รูปเพื่อขยาย หรือกดปุ่ม "เปลี่ยนรูป AW" ด้านบนเพื่ออัปโหลดใหม่
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs">
                <span>ยังไม่มีรูป Artwork สำหรับโครงการนี้</span>
                {onOpenArtworkModal && (
                  <button
                    type="button"
                    onClick={() => onOpenArtworkModal(project)}
                    className="text-indigo-600 font-medium hover:underline text-xs"
                  >
                    + เพิ่มรูปภาพเลย
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Status Notes (Bullet points on Summary view) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700">
                โน้ตสถานะความคืบหน้า (Status Notes &bull; หัวข้อย่อยบนหน้า Summary)
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {statusNotes.length} รายการ
              </span>
            </div>

            <div className="space-y-2 mb-2">
              {statusNotes.map((note, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-4 text-center">&bull;</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleNoteChange(idx, e.target.value)}
                    placeholder="เช่น กำลังออกแบบ Can Sleeve 280ml, กำลังเทียบใบเสนอราคาโรงพิมพ์..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNote(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="ลบหัวข้อนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add note input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="+ พิมพ์หัวข้อโน้ตสถานะใหม่ แล้วกด Enter หรือคลิกเพิ่ม..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium placeholder-slate-400 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มโน้ต</span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            {onDeleteProject && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบโครงการนี้</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
