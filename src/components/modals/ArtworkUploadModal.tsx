import React, { useState, useEffect, useRef } from 'react';
import { Project, ArtworkInfo } from '../../types';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Check, 
  Link as LinkIcon, 
  HelpCircle,
  FileImage,
  RefreshCw
} from 'lucide-react';

interface ArtworkUploadModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSaveArtwork: (projectId: string, artwork: ArtworkInfo | undefined) => void;
}

export const ArtworkUploadModal: React.FC<ArtworkUploadModalProps> = ({
  isOpen,
  project,
  onClose,
  onSaveArtwork,
}) => {
  const [artworkType, setArtworkType] = useState<'single' | 'before_after'>('single');
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [secondaryUrl, setSecondaryUrl] = useState('');
  const [labelPrimary, setLabelPrimary] = useState('');
  const [labelSecondary, setLabelSecondary] = useState('');

  const [primaryTab, setPrimaryTab] = useState<'upload' | 'url'>('upload');
  const [secondaryTab, setSecondaryTab] = useState<'upload' | 'url'>('upload');

  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from project when modal opens
  useEffect(() => {
    if (project) {
      if (project.artwork) {
        setArtworkType(project.artwork.type === 'before_after' ? 'before_after' : 'single');
        setPrimaryUrl(project.artwork.primaryUrl || '');
        setSecondaryUrl(project.artwork.secondaryUrl || '');
        setLabelPrimary(project.artwork.labelPrimary || 'Approved New AW (2026)');
        setLabelSecondary(project.artwork.labelSecondary || 'Current Packaging');
      } else {
        setArtworkType('single');
        setPrimaryUrl('');
        setSecondaryUrl('');
        setLabelPrimary('Approved New AW (2026)');
        setLabelSecondary('Current Packaging');
      }
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  // Convert Google Drive sharing links to direct image preview links
  const normalizeImageUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    // Format: https://drive.google.com/file/d/FILE_ID/view...
    const driveMatch1 = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch1 && driveMatch1[1]) {
      return `https://drive.google.com/thumbnail?id=${driveMatch1[1]}&sz=w1000`;
    }
    // Format: https://drive.google.com/open?id=FILE_ID
    const driveMatch2 = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (driveMatch2 && driveMatch2[1]) {
      return `https://drive.google.com/thumbnail?id=${driveMatch2[1]}&sz=w1000`;
    }
    return trimmed;
  };

  const handleFileUpload = (file: File, isSecondary: boolean = false) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์ภาพ (PNG, JPG, JPEG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isSecondary) {
        setSecondaryUrl(result);
      } else {
        setPrimaryUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isSecondary: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], isSecondary);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSave = () => {
    const finalPrimary = normalizeImageUrl(primaryUrl);
    const finalSecondary = normalizeImageUrl(secondaryUrl);

    if (!finalPrimary) {
      alert('กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป (Primary Artwork)');
      return;
    }

    const newArtwork: ArtworkInfo = {
      type: artworkType,
      primaryUrl: finalPrimary,
      labelPrimary: labelPrimary.trim() || undefined,
      ...(artworkType === 'before_after' && finalSecondary ? {
        secondaryUrl: finalSecondary,
        labelSecondary: labelSecondary.trim() || undefined,
      } : {}),
    };

    onSaveArtwork(project.id, newArtwork);
    onClose();
  };

  const handleRemoveArtwork = () => {
    if (confirm(`คุณต้องการลบรูป Artwork ของโครงการ "${project.name}" ใช่หรือไม่?`)) {
      onSaveArtwork(project.id, undefined);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-medium shadow-2xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">จัดการรูป Artwork / Key Visual</h3>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                  {project.code}
                </span>
              </div>
              <p className="text-xs text-slate-500">{project.name}</p>
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Format / Type Selection */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
              รูปแบบการแสดงผลรูป Artwork บนหน้า Summary
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setArtworkType('single')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  artworkType === 'single'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>ภาพเดี่ยว (Single Artwork)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  สำหรับ Packaging 3D Render เดี่ยว, Key Visual แคมเปญ, หรือ Backdrop
                </p>
              </button>

              <button
                type="button"
                onClick={() => setArtworkType('before_after')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  artworkType === 'before_after'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>เปรียบเทียบรูปเดิม vs รูปใหม่ (Before & After)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  เทียบแพ็กเกจจิ้งเดิมในตลาด vs แพ็กเกจจิ้งใหม่ปี 2026 ข้างกันแบบ Side-by-Side
                </p>
              </button>
            </div>
          </div>

          {/* If Before & After: Slot 2 (Old/Current Packaging) */}
          {artworkType === 'before_after' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>1. รูปแพ็กเกจจิ้งเดิม / Current Market Packaging (Before)</span>
                </span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-medium">
                  <button
                    type="button"
                    onClick={() => setSecondaryTab('upload')}
                    className={`px-2 py-0.5 rounded ${secondaryTab === 'upload' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500'}`}
                  >
                    อัปโหลดไฟล์
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecondaryTab('url')}
                    className={`px-2 py-0.5 rounded ${secondaryTab === 'url' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500'}`}
                  >
                    ใส่ลิงก์ URL
                  </button>
                </div>
              </div>

              {secondaryTab === 'upload' ? (
                <div
                  onDrop={(e) => handleDrop(e, true)}
                  onDragOver={handleDragOver}
                  onClick={() => secondaryFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl p-4 text-center cursor-pointer transition-all"
                >
                  <input
                    ref={secondaryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)}
                    className="hidden"
                  />
                  {secondaryUrl ? (
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={normalizeImageUrl(secondaryUrl)}
                        alt="Old Preview"
                        className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white p-1"
                      />
                      <div className="text-left">
                        <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> เลือกไฟล์เรียบร้อยแล้ว
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">คลิกเพื่อเปลี่ยนรูป หรือลากไฟล์ใหม่มาวางทับ</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSecondaryUrl('');
                          }}
                          className="mt-1.5 text-[10px] text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> ลบรูปนี้
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="text-xs font-medium text-slate-700">
                        ลากรูปมาวางที่นี่ หรือ <span className="text-indigo-600 underline">คลิกเลือกรูปภาพ</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">รองรับ PNG, JPG, WebP</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={secondaryUrl}
                    onChange={(e) => setSecondaryUrl(e.target.value)}
                    placeholder="วางลิงก์ภาพ https://... หรือ Google Drive link"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  />
                  {secondaryUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={normalizeImageUrl(secondaryUrl)}
                        alt="URL Preview"
                        className="w-12 h-12 object-contain rounded border border-slate-200 bg-white"
                      />
                      <span className="text-[11px] text-slate-500 truncate">{secondaryUrl}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Label */}
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                  ป้ายกำกับรูปเดิม (Label)
                </label>
                <input
                  type="text"
                  value={labelSecondary}
                  onChange={(e) => setLabelSecondary(e.target.value)}
                  placeholder="e.g. Current in Market (2024)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                />
              </div>
            </div>
          )}

          {/* Primary Artwork Slot (New Packaging / Single AW) */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>
                  {artworkType === 'before_after'
                    ? '2. รูปแพ็กเกจจิ้งใหม่ / Approved New Artwork 2026 (After) *'
                    : 'รูป Artwork / Key Visual / Packaging 3D Render *'}
                </span>
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-medium">
                <button
                  type="button"
                  onClick={() => setPrimaryTab('upload')}
                  className={`px-2 py-0.5 rounded ${primaryTab === 'upload' ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-slate-500'}`}
                >
                  อัปโหลดไฟล์
                </button>
                <button
                  type="button"
                  onClick={() => setPrimaryTab('url')}
                  className={`px-2 py-0.5 rounded ${primaryTab === 'url' ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-slate-500'}`}
                >
                  ใส่ลิงก์ URL
                </button>
              </div>
            </div>

            {primaryTab === 'upload' ? (
              <div
                onDrop={(e) => handleDrop(e, false)}
                onDragOver={handleDragOver}
                onClick={() => primaryFileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-white/70"
              >
                <input
                  ref={primaryFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)}
                  className="hidden"
                />
                {primaryUrl ? (
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={normalizeImageUrl(primaryUrl)}
                      alt="Primary Preview"
                      className="w-24 h-24 object-contain rounded-lg border border-indigo-200 bg-white p-1 shadow-xs"
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" /> พร้อมใช้งาน (Ready)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">คลิกเพื่อเปลี่ยนรูป หรือลากไฟล์ใหม่มาวางทับ</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimaryUrl('');
                        }}
                        className="mt-2 text-[10.5px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> ลบรูปนี้
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      ลากรูปภาพมาวางที่นี่ หรือ <span className="text-indigo-600 underline">คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์</span>
                    </p>
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      รองรับไฟล์ภาพ: PNG, JPG, JPEG, WebP, SVG (ไม่จำกัดขนาด)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={primaryUrl}
                  onChange={(e) => setPrimaryUrl(e.target.value)}
                  placeholder="วางลิงก์ภาพ https://... หรือ Google Drive link"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {primaryUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={normalizeImageUrl(primaryUrl)}
                      alt="URL Preview"
                      className="w-12 h-12 object-contain rounded border border-slate-200 bg-white"
                    />
                    <span className="text-[11px] text-slate-500 truncate">{primaryUrl}</span>
                  </div>
                )}
              </div>
            )}

            {/* Primary Label */}
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-600 mb-1">
                ป้ายกำกับรูปภาพ (Label)
              </label>
              <input
                type="text"
                value={labelPrimary}
                onChange={(e) => setLabelPrimary(e.target.value)}
                placeholder="e.g. Approved New AW (2026) หรือ Can 280ml Design"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Quick Helper / Info Tip */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-[11px]">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-900">แนะนำการใช้งานรูปภาพบนหน้า Summary:</p>
              <p className="text-amber-800">
                &bull; ภาพที่อัปโหลดจะแสดงเป็น Thumbnail บนตาราง Summary ทันที และสามารถคลิกเพื่อขยายดูรายละเอียดขนาดใหญ่ได้
              </p>
              <p className="text-amber-800">
                &bull; ข้อมูลรูปภาพจะถูกบันทึกลงระบบและ Auto-sync ไปยัง Google Sheet โดยอัตโนมัติ
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            {project.artwork && (
              <button
                type="button"
                onClick={handleRemoveArtwork}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบรูป AW ของโครงการนี้</span>
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
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกรูป Artwork</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
