import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskAttachment, TaskAttachmentCategory } from '../../types';
import { currentUser } from '../../mock/mockData';
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
  Link2,
  File
} from 'lucide-react';

interface TaskAttachmentModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onAddAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
  initialCategory?: TaskAttachmentCategory;
}

const CATEGORY_TABS: { id: 'all' | TaskAttachmentCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'ทั้งหมด', icon: Layers },
  { id: 'brief_specs', label: 'บรีฟ & สเปกสินค้า', icon: FileBox },
  { id: 'pr_quotation', label: 'เอกสาร PR & ใบเสนอราคา', icon: Receipt },
  { id: 'approval_reports', label: 'รายงาน & ตรวจรับ', icon: FileCheck },
  { id: 'general', label: 'ทั่วไป', icon: Paperclip },
];

export const TaskAttachmentModal: React.FC<TaskAttachmentModalProps> = ({
  task,
  isOpen,
  onClose,
  onAddAttachment,
  onDeleteAttachment,
  initialCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | TaskAttachmentCategory>('all');
  const [showUploadForm, setShowUploadForm] = useState(true);
  
  // Upload Form State
  const [attachMode, setAttachMode] = useState<'file' | 'drive'>('file');
  const [driveUrl, setDriveUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskAttachmentCategory>('brief_specs');
  const [customFileName, setCustomFileName] = useState('');
  const [detectedSize, setDetectedSize] = useState('');
  const [detectedType, setDetectedType] = useState<TaskAttachment['fileType']>('pdf');
  const [fileObjectUrl, setFileObjectUrl] = useState<string>('#');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When modal opens, sync initial category and reset/prepare form
  useEffect(() => {
    if (isOpen) {
      setShowUploadForm(true);
      setAttachMode('file');
      const cat = initialCategory || 'brief_specs';
      setSelectedCategory(cat);
      setActiveTab(cat);
      setCustomFileName('');
      setFileObjectUrl('#');
      setSelectedFileObj(null);
      setDetectedSize('');
      setDriveUrl('');
      setUploadSuccessToast(false);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen || !task) return null;

  const attachments = task.attachments || [];
  const filteredAttachments = activeTab === 'all' 
    ? attachments 
    : attachments.filter((att) => att.category === activeTab);

  // Process a selected file (either via input or drag-and-drop)
  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fType: TaskAttachment['fileType'] = 'other';
    if (ext === 'pdf') fType = 'pdf';
    else if (['xlsx', 'xls', 'csv'].includes(ext)) fType = 'excel';
    else if (['doc', 'docx'].includes(ext)) fType = 'word';
    else if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) fType = 'image';
    else if (['ai', 'psd', 'fig', 'eps'].includes(ext)) fType = 'ai';

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    setCustomFileName(file.name);
    setDetectedSize(formattedSize);
    setDetectedType(fType);
    setSelectedFileObj(file);

    // Read as Data URL so the file persists and can be viewed/downloaded offline/after reload
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '#';
      setFileObjectUrl(dataUrl);
    };
    reader.onerror = () => {
      // Fallback to object URL if FileReader fails
      setFileObjectUrl(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
    setShowUploadForm(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
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
      setUploadSuccessToast(true);
      setTimeout(() => setUploadSuccessToast(false), 3000);
      return;
    }

    if (fileObjectUrl === '#') {
      alert('กรุณาเลือกไฟล์จากคอมพิวเตอร์ก่อนกดแนบไฟล์');
      return;
    }

    onAddAttachment(task.id, {
      name: customFileName.trim(),
      category: selectedCategory,
      size: detectedSize || '1 MB',
      uploadedBy: currentUser.name,
      uploadedAt: 'Today',
      url: fileObjectUrl,
      fileType: detectedType,
    });

    // Reset Form
    setCustomFileName('');
    setFileObjectUrl('#');
    setSelectedFileObj(null);
    setDetectedSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadSuccessToast(true);
    setTimeout(() => setUploadSuccessToast(false), 3000);
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
      case 'brief_specs':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            บรีฟ & สเปกสินค้า
          </span>
        );
      case 'pr_quotation':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            PR & ใบเสนอราคา
          </span>
        );
      case 'approval_reports':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            รายงาน & ตรวจรับ
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
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
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]"
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
                <span className="text-[10.5px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {task.projectName}
                </span>
                {task.phase && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {task.phase}
                  </span>
                )}
                <span className="text-[10.5px] font-medium text-slate-500 font-mono">
                  {attachments.length} files attached
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 truncate">
                {task.taskName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span>ผู้รับผิดชอบ:</span>
                <span className="font-semibold text-slate-700">{task.assignee.name}</span>
                {task.assignee.nameTh && <span className="text-slate-400">({task.assignee.nameTh})</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Success Alert Toast */}
        {uploadSuccessToast && (
          <div className="px-6 py-2 bg-emerald-500 text-white text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>แนบไฟล์เอกสารสำเร็จเรียบร้อยแล้ว!</span>
            </div>
            <span className="text-[10.5px] opacity-80">พร้อมใช้งานทันที</span>
          </div>
        )}

        {/* Category Tabs & Form Toggle */}
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'all') {
                      setSelectedCategory(tab.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              showUploadForm
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showUploadForm ? 'ซ่อนแบบฟอร์ม' : '+ แนบไฟล์เพิ่ม'}</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Upload Form Box */}
          {showUploadForm && (
            <form onSubmit={handleUploadSubmit} className="bg-slate-50 border border-indigo-200 rounded-2xl p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  <span>แนบเอกสารสำหรับงานนี้</span>
                </span>
                <span className="text-[11px] text-slate-500">รองรับ PDF, รูปภาพ, Excel, Word, AI, PSD, ZIP</span>
              </div>

              {/* Mode Toggle: Local File (Default) vs Drive Link */}
              <div className="flex rounded-xl bg-slate-200/80 p-1 max-w-sm">
                <button
                  type="button"
                  onClick={() => setAttachMode('file')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    attachMode === 'file'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>เลือกไฟล์จากเครื่อง (แนะนำ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttachMode('drive')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    attachMode === 'drive'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>ลิงก์ Google Drive</span>
                </button>
              </div>

              {attachMode === 'file' ? (
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
                      processFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-50/80' 
                      : selectedFileObj 
                      ? 'border-emerald-400 bg-emerald-50/40' 
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-100/70'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept="*/*"
                  />
                  
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      selectedFileObj ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {selectedFileObj ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                    </div>

                    {selectedFileObj ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-800">{customFileName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {detectedSize} &bull; <span className="text-indigo-600 underline">คลิกเพื่อเลือกไฟล์อื่น</span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ หรือลากไฟล์มาวางที่นี่
                        </p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">
                          ใบเสนอราคา (Quotation), เอกสาร PR, Technical Drawing, สเปกสินค้า, Artwork
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Google Drive Link Input Box */
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>URL ลิงก์ไฟล์ใน Google Drive *</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... หรือ ลิงก์โฟลเดอร์"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ชื่อเอกสาร (File Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder="e.g. Quotation_Supplier_AluminiumCan.pdf"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Form Fields: File Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachMode === 'file' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ชื่อเอกสาร (File Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder="ชื่อไฟล์เอกสาร"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                )}

                <div className={attachMode === 'file' ? '' : 'sm:col-span-2'}>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    หมวดหมู่เอกสาร (Category) *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TaskAttachmentCategory)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                  >
                    <option value="brief_specs">📐 บรีฟ & สเปกสินค้า (Brief & Specs)</option>
                    <option value="pr_quotation">📑 เอกสาร PR & ใบเสนอราคา (Quotation)</option>
                    <option value="approval_reports">📋 รายงาน & ตรวจรับ (Approvals & Reports)</option>
                    <option value="general">📁 เอกสารทั่วไป (General Files)</option>
                  </select>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={attachMode === 'drive' ? (!customFileName.trim() || !driveUrl.trim()) : !customFileName.trim()}
                  className={`px-4 py-2 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    attachMode === 'drive'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{attachMode === 'drive' ? 'แนบลิงก์ Google Drive' : 'บันทึกและแนบไฟล์นี้'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Attachments List */}
          {filteredAttachments.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                เอกสารที่แนบไว้ ({filteredAttachments.length} ไฟล์)
              </span>

              {filteredAttachments.map((file) => {
                const isDriveFile = file.size === 'Google Drive' || file.url.includes('drive.google.com');

                return (
                  <div
                    key={file.id}
                    className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between gap-3 shadow-2xs transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                        {getFileIcon(file.fileType)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 truncate max-w-[280px]" title={file.name}>
                            {file.name}
                          </span>
                          {getCategoryBadge(file.category)}
                        </div>

                        <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                          {file.size} &bull; แนบโดย <span className="font-semibold text-slate-600 font-sans">{file.uploadedBy}</span> ({file.uploadedAt})
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={file.url}
                        download={isDriveFile ? undefined : file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        title={isDriveFile ? "Open Google Drive File" : "ดาวน์โหลด / เปิดดูไฟล์"}
                      >
                        {isDriveFile ? <ExternalLink className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5 text-indigo-600" />}
                        <span>{isDriveFile ? 'เปิด Drive' : 'เปิดไฟล์'}</span>
                      </a>

                      {onDeleteAttachment && (
                        <button
                          type="button"
                          onClick={() => onDeleteAttachment(task.id, file.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="ลบไฟล์แนบนี้"
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
            !showUploadForm && (
              <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                  <Paperclip className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">ยังไม่มีเอกสารแนบในหมวดหมู่นี้</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                  คุณสามารถแนบเอกสาร PR, ใบเสนอราคา หรือสเปกงานได้ทันที
                </p>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  + แนบเอกสารใหม่
                </button>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>รวมทั้งหมด: <strong>{attachments.length}</strong> ไฟล์แนบ</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
