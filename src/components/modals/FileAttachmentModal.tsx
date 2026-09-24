import React, { useState } from 'react';
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
  HardDrive
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
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'ai' | 'figma' | 'image' | 'doc'>('pdf');
  const [fileSize, setFileSize] = useState('2.5 MB');

  if (!isOpen || !project) return null;

  const currentAttachments = (project.attachments || []).filter(
    (att) => att.category === activeTab
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    onAddAttachment(project.id, {
      name: fileName.trim(),
      category: activeTab,
      size: fileType === 'figma' ? 'Figma Cloud Link' : fileUrl.includes('drive.google.com') ? 'Google Drive' : fileSize,
      uploadedBy: currentUser.name,
      uploadedAt: 'Today',
      url: fileUrl.trim() || '#',
      fileType,
    });

    setFileName('');
    setFileUrl('');
    setShowAddForm(false);
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
            <form onSubmit={handleAddSubmit} className="p-4 bg-slate-50 rounded-xl border border-indigo-200 space-y-3 animate-in fade-in duration-100">
              <h4 className="text-xs font-medium text-slate-800 uppercase tracking-wider">
                Attach File to {activeTab.replace('_', ' ')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">File Name *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. Master_Roast_Pouch_Dieline.pdf"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">File Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none font-medium"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="ai">Adobe Illustrator (.ai)</option>
                    <option value="figma">Figma Cloud Link (.figma)</option>
                    <option value="image">High-Res Image (.psd, .png)</option>
                    <option value="doc">Word / Copy Deck (.doc)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Link URL (Optional Cloud Drive / Figma)</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://figma.com/... or https://drive.google.com/..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-xs"
                >
                  Confirm Attach
                </button>
              </div>
            </form>
          )}

          {/* Attachments List */}
          <div className="space-y-2">
            {currentAttachments.length > 0 ? (
              currentAttachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 transition-all bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {file.size} &bull; Uploaded by <strong className="text-slate-600">{file.uploadedBy}</strong> ({file.uploadedAt})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={file.url}
                      onClick={(e) => {
                        if (file.url === '#') {
                          e.preventDefault();
                          alert(`Simulated download for: ${file.name}`);
                        }
                      }}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200/60 transition-colors flex items-center gap-1"
                    >
                      {file.fileType === 'figma' ? (
                        <>
                          <span>Open</span>
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
              ))
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
