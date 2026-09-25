import React, { useState, useRef } from 'react';
import { Project, ProjectAttachment } from '../../types';
import { 
  X, 
  Paperclip, 
  FileText, 
  Image, 
  ExternalLink, 
  Plus, 
  FileCode, 
  Download, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Palette, 
  Printer,
  HardDrive,
  UploadCloud,
  Link2
} from 'lucide-react';
import { currentUser } from '../../mock/mockData';

interface FileAttachmentModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onAddAttachment: (projectId: string, attachment: Omit<ProjectAttachment, 'id'>) => void;
}

export const FileAttachmentModal: React.FC<FileAttachmentModalProps> = ({
  project,
  isOpen,
  onClose,
  onAddAttachment,
}) => {
  const [activeTab, setActiveTab] = useState<'brief_specs' | 'design_drafts' | 'final_production'>('brief_specs');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Upload & File Selection State
  const [attachMode, setAttachMode] = useState<'file' | 'drive'>('file');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'ai' | 'figma' | 'image' | 'doc'>('pdf');
  const [fileSize, setFileSize] = useState('2.5 MB');
  const [fileObjectUrl, setFileObjectUrl] = useState<string>('#');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project) return null;

  const currentAttachments = (project.attachments || []).filter(
    (att) => att.category === activeTab
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fType: 'pdf' | 'ai' | 'figma' | 'image' | 'doc' = 'pdf';
    if (ext === 'pdf') fType = 'pdf';
    else if (['ai', 'eps', 'psd', 'cdr'].includes(ext)) fType = 'ai';
    else if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) fType = 'image';
    else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) fType = 'doc';
    else if (['fig'].includes(ext)) fType = 'figma';

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`;

    setFileName(file.name);
    setFileSize(formattedSize);
    setFileType(fType);
    setFileObjectUrl(URL.createObjectURL(file));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const finalUrl = attachMode === 'file' ? fileObjectUrl : (fileUrl.trim() || '#');
    const finalSize = attachMode === 'drive' ? 'Google Drive' : fileSize;

    onAddAttachment(project.id, {
      name: fileName.trim(),
      category: activeTab,
      size: finalSize,
      uploadedBy: currentUser.name,
      uploadedAt: 'Today',
      url: finalUrl,
      fileType,
    });

    setFileName('');
    setFileUrl('');
    setFileObjectUrl('#');
    setShowAddForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'ai':
        return <FileCode className="w-4 h-4 text-amber-600" />;
      case 'figma':
        return <Palette className="w-4 h-4 text-purple-600" />;
      case 'image':
        return <Image className="w-4 h-4 text-blue-600" />;
      default:
        return <Paperclip className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  {project.code}
                </span>
                <span className="text-xs font-medium text-slate-500">Project Files Hub</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                {project.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Drive Central Storage Banner */}
        <div className="px-6 pt-3 pb-1 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <HardDrive className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-[11.5px]">
              <strong>Google Drive โฟลเดอร์รวม:</strong> อัปโหลดไฟล์งานลงใน Google Drive กลาง แล้วนำลิงก์มาวางในช่อง URL ด้านล่าง
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

        {/* 3 Categories Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => { setActiveTab('brief_specs'); setShowAddForm(false); }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'brief_specs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>(1) Brief & Specs</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {(project.attachments || []).filter((a) => a.category === 'brief_specs').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('design_drafts'); setShowAddForm(false); }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'design_drafts'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>(2) Design Drafts</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {(project.attachments || []).filter((a) => a.category === 'design_drafts').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('final_production'); setShowAddForm(false); }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'final_production'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>(3) Final Production Files</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {(project.attachments || []).filter((a) => a.category === 'final_production').length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'brief_specs' && 'Brand guidelines, nutritional facts, dieline drawings, and legal copies.'}
              {activeTab === 'design_drafts' && 'WIP Figma mockups, PDF review proofs, and 3D packaging renders.'}
              {activeTab === 'final_production' && 'Print-ready pre-press AI/PDF separations and high-res master assets.'}
            </p>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-indigo-200/80"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Upload / Add Link'}</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="p-4 bg-slate-50 rounded-2xl border border-indigo-200/80 space-y-3.5 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  <span>แนบไฟล์เอกสารเข้า {activeTab.replace('_', ' ')}</span>
                </h4>
                <span className="text-[11px] text-slate-500">รองรับ PDF, AI, PSD, ภาพ, Doc</span>
              </div>

              {/* Mode Toggle: File Upload vs Cloud Link */}
              <div className="flex rounded-xl bg-slate-200/80 p-1 max-w-sm">
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
                  <span>เลือกไฟล์จากเครื่อง (Upload)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttachMode('drive')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    attachMode === 'drive'
                      ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>แปะลิงก์ Google Drive</span>
                </button>
              </div>

              {attachMode === 'file' ? (
                /* Clickable Drag & Drop Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.[0]) {
                      const file = e.dataTransfer.files[0];
                      const ext = file.name.split('.').pop()?.toLowerCase() || '';
                      let fType: 'pdf' | 'ai' | 'figma' | 'image' | 'doc' = 'pdf';
                      if (ext === 'pdf') fType = 'pdf';
                      else if (['ai', 'eps', 'psd', 'cdr'].includes(ext)) fType = 'ai';
                      else if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) fType = 'image';
                      else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) fType = 'doc';
                      else if (['fig'].includes(ext)) fType = 'figma';

                      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
                      const formattedSize = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`;

                      setFileName(file.name);
                      setFileSize(formattedSize);
                      setFileType(fType);
                      setFileObjectUrl(URL.createObjectURL(file));
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-50/70' 
                      : fileName 
                      ? 'border-emerald-400 bg-emerald-50/40' 
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-100/70'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className={`w-8 h-8 ${fileName ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {fileName ? (
                      <div>
                        <p className="text-xs font-semibold text-emerald-800">{fileName}</p>
                        <p className="text-[10.5px] text-slate-500">{fileSize} &bull; คลิกเพื่อเปลี่ยนไฟล์</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-medium text-slate-700">
                          <strong>คลิกที่นี่เพื่อเลือกไฟล์จากคอมพิวเตอร์</strong> หรือลากไฟล์มาวาง
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          รองรับ PDF Dieline, Master Artwork (AI), ภาพเรนเดอร์ 3D, สเปกสินค้า
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Google Drive / Cloud Link Input */
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <label className="block text-[11px] font-medium text-emerald-900 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                    <span>URL ลิงก์ไฟล์ใน Google Drive *</span>
                  </label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... หรือ ลิงก์โฟลเดอร์"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                  <p className="text-[10.5px] text-emerald-700">
                    💡 อัปโหลดไฟล์ใส่ Google Drive แล้วกด Share &gt; "คัดลอกลิงก์" มาวางที่นี่
                  </p>
                </div>
              )}

              {/* File Name & Type (auto-filled or editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">ชื่อเอกสาร (File Name) *</label>
                  <input
                    type="text"
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. Master_Roast_Pouch_Dieline.pdf"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">ประเภทเอกสาร (File Type)</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden font-medium text-slate-800"
                  >
                    <option value="pdf">📄 PDF Document (.pdf)</option>
                    <option value="ai">🎨 Adobe Illustrator / CAD (.ai, .psd)</option>
                    <option value="figma">🌐 Figma Cloud Link (.figma)</option>
                    <option value="image">🖼️ ภาพความละเอียดสูง (.png, .jpg)</option>
                    <option value="doc">📝 Word / Copy Deck (.doc, .docx)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!fileName.trim()}
                  className={`px-4 py-1.5 text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                    attachMode === 'drive'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {attachMode === 'drive' ? <HardDrive className="w-3.5 h-3.5" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>{attachMode === 'drive' ? 'แนบลิงก์ Google Drive' : 'อัปโหลดไฟล์เข้าโปรเจกต์'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Attachments List */}
          <div className="space-y-2">
            {currentAttachments.length > 0 ? (
              currentAttachments.map((file) => {
                const isDrive = file.size === 'Google Drive' || file.url.includes('drive.google.com');

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 transition-all bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {file.name}
                          </p>
                          {isDrive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <HardDrive className="w-2.5 h-2.5 text-emerald-600" />
                              Google Drive
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {file.size} &bull; Uploaded by <strong className="text-slate-600">{file.uploadedBy}</strong> ({file.uploadedAt})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={file.url}
                        download={isDrive ? undefined : file.name}
                        onClick={(e) => {
                          if (file.url === '#') {
                            e.preventDefault();
                            alert(`File: ${file.name}`);
                          }
                        }}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200/60 transition-colors flex items-center gap-1"
                      >
                        {isDrive ? (
                          <>
                            <span>เปิดไฟล์</span>
                            <ExternalLink className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>Download</span>
                            <Download className="w-3 h-3" />
                          </>
                        )}
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <Paperclip className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No attachments in this category yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Upload / Add Link" to attach files.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
