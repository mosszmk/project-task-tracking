import React, { useState, useRef } from 'react';
import { Task, TaskAttachment, TaskAttachmentCategory } from '../../types';
import { currentUser } from '../../mock/mockData';
import { UserAvatar } from '../common/UserAvatar';
import { 
  X, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  FileSpreadsheet,
  Download, 
  Plus, 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  FileCheck,
  Receipt,
  FileBox,
  HardDrive,
  Link2
} from 'lucide-react';

interface TaskAttachmentModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onAddAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
}

const CATEGORY_TABS: { id: 'all' | TaskAttachmentCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'ทั้งหมด', icon: Layers },
  { id: 'pr_quotation', label: 'เอกสาร PR & ใบเสนอราคา', icon: Receipt },
  { id: 'brief_specs', label: 'บรีฟ & สเปกสินค้า', icon: FileBox },
  { id: 'approval_reports', label: 'รายงาน & ตรวจรับ', icon: FileCheck },
  { id: 'general', label: 'ทั่วไป', icon: Paperclip },
];

export const TaskAttachmentModal: React.FC<TaskAttachmentModalProps> = ({
  task,
  isOpen,
  onClose,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | TaskAttachmentCategory>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Upload Form State
  const [attachMode, setAttachMode] = useState<'drive' | 'file'>('drive');
  const [driveUrl, setDriveUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskAttachmentCategory>('pr_quotation');
  const [customFileName, setCustomFileName] = useState('');
  const [detectedSize, setDetectedSize] = useState('1.5 MB');
  const [detectedType, setDetectedType] = useState<TaskAttachment['fileType']>('pdf');
  const [fileObjectUrl, setFileObjectUrl] = useState<string>('#');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !task) return null;

  const attachments = task.attachments || [];
  const filteredAttachments = activeTab === 'all' 
    ? attachments 
    : attachments.filter((att) => att.category === activeTab);

  // Handle actual file selection from computer
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Derive file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fType: TaskAttachment['fileType'] = 'other';
    if (ext === 'pdf') fType = 'pdf';
    else if (['xlsx', 'xls', 'csv'].includes(ext)) fType = 'excel';
    else if (['doc', 'docx'].includes(ext)) fType = 'word';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) fType = 'image';
    else if (['ai', 'psd', 'fig'].includes(ext)) fType = 'ai';

    // Format size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`;

    setCustomFileName(file.name);
    setDetectedSize(formattedSize);
    setDetectedType(fType);
    setFileObjectUrl(URL.createObjectURL(file));
    setShowUploadForm(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFileName.trim()) return;

    if (attachMode === 'drive') {
      if (!driveUrl.trim()) return;
      onAddAttachment(task.id, {
        name: customFileName.trim(),
        category: selectedCategory,
        size: 'Google Drive',
        uploadedBy: currentUser.name,
        uploadedAt: 'Today',
        url: driveUrl.trim(),
        fileType: detectedType,
      });
      setCustomFileName('');
      setDriveUrl('');
      setShowUploadForm(false);
      return;
    }

    onAddAttachment(task.id, {
      name: customFileName.trim(),
      category: selectedCategory,
      size: detectedSize,
      uploadedBy: currentUser.name,
      uploadedAt: 'Today',
      url: fileObjectUrl,
      fileType: detectedType,
    });

    // Reset Form
    setCustomFileName('');
    setFileObjectUrl('#');
    setShowUploadForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: TaskAttachment['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'word':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-sky-600" />;
      case 'ai':
        return <FileCode className="w-5 h-5 text-amber-600" />;
      default:
        return <Paperclip className="w-5 h-5 text-slate-500" />;
    }
  };

  const getCategoryBadge = (category: TaskAttachmentCategory) => {
    switch (category) {
      case 'pr_quotation':
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            PR & ใบเสนอราคา
          </span>
        );
      case 'brief_specs':
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
            บรีฟ & สเปกสินค้า
          </span>
        );
      case 'approval_reports':
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            รายงาน & ตรวจรับ
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            ทั่วไป
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-600/30">
              <Paperclip className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10.5px] font-medium uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {task.projectName}
                </span>
                {task.phase && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {task.phase}
                  </span>
                )}
                <span className="text-[10.5px] font-medium text-slate-400 font-mono">
                  {attachments.length} files attached
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 truncate">
                {task.taskName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span>Assignee:</span>
                <span className="font-medium text-slate-700">{task.assignee.name}</span>
                {task.assignee.nameTh && <span className="text-slate-400">({task.assignee.nameTh})</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Drive Central Storage Banner */}
        <div className="px-6 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <HardDrive className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-[11.5px]">
              <strong>Google Drive โฟลเดอร์รวม:</strong> อัปโหลดเอกสารลงใน Google Drive กลาง แล้วนำลิงก์มาแปะแนบกับงานนี้ได้ทันที
            </span>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1fWXvxxKx8rckEhDgDNLwuYC7310PKyGE?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 transition-colors flex-shrink-0 shadow-2xs"
          >
            <span>เปิด Google Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tab.id === 'all' 
                ? attachments.length 
                : attachments.filter((a) => a.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-2xs ${
              showUploadForm
                ? 'bg-slate-200 text-slate-800'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showUploadForm ? 'Cancel' : '+ Upload File'}</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Upload Form Box */}
          {showUploadForm && (
            <form onSubmit={handleUploadSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  <span>แนบเอกสารสำหรับงานนี้</span>
                </span>
                <span className="text-[11px] text-slate-500">รองรับลิงก์ Drive, PDF, Excel, Word, ภาพ, AI</span>
              </div>

              {/* Mode Toggle: Drive Link vs Local File */}
              <div className="flex rounded-xl bg-slate-200/80 p-1 max-w-sm">
                <button
                  type="button"
                  onClick={() => setAttachMode('drive')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    attachMode === 'drive'
                      ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>แปะลิงก์ Google Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttachMode('file')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    attachMode === 'file'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>เลือกไฟล์จากเครื่อง</span>
                </button>
              </div>

              {attachMode === 'drive' ? (
                /* Google Drive Link Input Box */
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-emerald-900 mb-1 flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>URL ลิงก์ไฟล์ใน Google Drive *</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... หรือ ลิงก์โฟลเดอร์"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                    />
                    <p className="text-[10px] text-emerald-700 mt-1">
                      💡 อัปโหลดไฟล์ใส่ Google Drive แล้วคลิก Share &gt; "คัดลอกลิงก์ (Anyone with link)" มาวางที่นี่
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        ชนิดไฟล์
                      </label>
                      <select
                        value={detectedType}
                        onChange={(e) => setDetectedType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                      >
                        <option value="pdf">📄 PDF Document</option>
                        <option value="excel">📊 Excel / Sheet</option>
                        <option value="word">📝 Word Document</option>
                        <option value="image">🖼️ รูปภาพ (Image)</option>
                        <option value="ai">🎨 Artwork / AI / CAD</option>
                        <option value="other">📁 เอกสารอื่นๆ</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        ชื่อเอกสาร (File Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={customFileName}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        placeholder="e.g. Quotation_Supplier_AluminiumCan.pdf"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Drag & Drop / File Input Clickable Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.[0]) {
                      const file = e.dataTransfer.files[0];
                      const ext = file.name.split('.').pop()?.toLowerCase() || '';
                      let fType: TaskAttachment['fileType'] = 'other';
                      if (ext === 'pdf') fType = 'pdf';
                      else if (['xlsx', 'xls', 'csv'].includes(ext)) fType = 'excel';
                      else if (['doc', 'docx'].includes(ext)) fType = 'word';
                      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) fType = 'image';
                      else if (['ai', 'psd', 'fig'].includes(ext)) fType = 'ai';

                      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
                      const formattedSize = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`;

                      setCustomFileName(file.name);
                      setDetectedSize(formattedSize);
                      setDetectedType(fType);
                      setFileObjectUrl(URL.createObjectURL(file));
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-50/60' 
                      : customFileName 
                      ? 'border-emerald-400 bg-emerald-50/30' 
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-100/60'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <UploadCloud className={`w-7 h-7 ${customFileName ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {customFileName ? (
                      <div>
                        <p className="text-xs font-medium text-emerald-800">{customFileName}</p>
                        <p className="text-[10.5px] text-slate-500">{detectedSize} &bull; คลิกเพื่อเปลี่ยนไฟล์</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-medium text-slate-700">คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ หรือลากไฟล์มาวางที่นี่</p>
                        <p className="text-[10.5px] text-slate-400">ใบเสนอราคา (Quotation), เอกสาร PR, Technical Drawing, สเปกสินค้า</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Fields: Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachMode === 'file' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      ชื่อเอกสาร (File Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder="e.g. Quotation_Supplier_AluminiumCan.pdf"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}

                <div className={attachMode === 'file' ? '' : 'sm:col-span-2'}>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    หมวดหมู่เอกสาร (Category) *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TaskAttachmentCategory)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                  >
                    <option value="pr_quotation">📑 เอกสาร PR & ใบเสนอราคา (Quotation)</option>
                    <option value="brief_specs">📐 บรีฟ & สเปกสินค้า (Brief & Specs)</option>
                    <option value="approval_reports">📋 รายงาน & ตรวจรับ (Approvals & Reports)</option>
                    <option value="general">📁 เอกสารทั่วไป (General Files)</option>
                  </select>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={attachMode === 'drive' ? (!customFileName.trim() || !driveUrl.trim()) : !customFileName.trim()}
                  className={`px-4 py-1.5 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
                    attachMode === 'drive'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                  }`}
                >
                  {attachMode === 'drive' ? <HardDrive className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{attachMode === 'drive' ? 'แนบลิงก์ Google Drive' : 'Attach File to Task'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Attachments List */}
          {filteredAttachments.length > 0 ? (
            <div className="space-y-2.5">
              {filteredAttachments.map((file) => {
                const isDriveFile = file.size === 'Google Drive' || file.url.includes('drive.google.com');

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white border border-slate-200 transition-colors">
                        {getFileIcon(file.fileType)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-slate-900 truncate">
                            {file.name}
                          </span>
                          {getCategoryBadge(file.category)}
                          {isDriveFile && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <HardDrive className="w-2.5 h-2.5 text-emerald-600" />
                              Google Drive
                            </span>
                          )}
                        </div>

                        <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                          {file.size} &bull; Uploaded by <span className="font-medium text-slate-600 font-sans">{file.uploadedBy}</span> ({file.uploadedAt})
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <a
                        href={file.url}
                        download={isDriveFile ? undefined : file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
                        title={isDriveFile ? "Open Google Drive File" : "Download / Open file"}
                      >
                        {isDriveFile ? <ExternalLink className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isDriveFile ? 'เปิดไฟล์' : 'Open'}</span>
                      </a>

                      {onDeleteAttachment && (
                        <button
                          type="button"
                          onClick={() => onDeleteAttachment(task.id, file.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                          title="Delete attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                <Paperclip className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-700">ยังไม่มีเอกสารแนบในหมวดหมู่นี้</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                คลิกปุ่ม "+ Upload File" ด้านบนเพื่อแนบเอกสาร PR, ใบเสนอราคา หรือสเปกงาน
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Total: <strong>{attachments.length}</strong> attachments for this task</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
