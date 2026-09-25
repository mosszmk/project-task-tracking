import React, { useState, useRef, useEffect } from 'react';
import { GraphicSpecs, Task, TaskAttachmentCategory } from '../../types';
import { 
  Palette, 
  ExternalLink, 
  Image as ImageIcon, 
  FileText, 
  Paperclip, 
  Plus, 
  Download, 
  Check, 
  ChevronDown 
} from 'lucide-react';

interface GraphicSpecsTagProps {
  task?: Task;
  specs?: GraphicSpecs;
  showHandoffBadge?: boolean;
  onOpenAttachmentModal?: (task: Task, initialCategory?: TaskAttachmentCategory) => void;
  onUpdateSpecs?: (taskId: string, newSpecs: GraphicSpecs) => void;
}

const AVAILABLE_FORMATS = [
  'Packaging / Box',
  'Label / Sticker',
  'Pouch',
  'Event Backdrop',
  'Standee',
  '1:1 Square',
  '16:9 Banner',
  '9:16 Story/Reels',
  'Flyer/Leaflet',
  'Custom',
];

export const GraphicSpecsTag: React.FC<GraphicSpecsTagProps> = ({
  task,
  specs,
  showHandoffBadge = false,
  onOpenAttachmentModal,
  onUpdateSpecs,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [isChangingFormat, setIsChangingFormat] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
        setIsChangingFormat(false);
      }
    };
    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  // Find spec-related attachments for this task
  const specAttachments = (task?.attachments || []).filter(
    (a) => a.category === 'brief_specs'
  );
  const totalAttachments = (task?.attachments || []).length;

  if (!specs && !showHandoffBadge) {
    return (
      <button
        type="button"
        onClick={() => {
          if (task && onOpenAttachmentModal) {
            onOpenAttachmentModal(task, 'brief_specs');
          }
        }}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-dashed border-slate-300 hover:border-indigo-300 transition-colors cursor-pointer"
        title="คลิกเพื่อแนบสเปกสินค้า หรือบรีฟงานออกแบบ"
      >
        <Plus className="w-3 h-3" />
        <span>แนบสเปก</span>
      </button>
    );
  }

  const handleSelectFormat = (newFormat: string) => {
    if (task && onUpdateSpecs) {
      onUpdateSpecs(task.id, {
        ...(specs || { format: newFormat }),
        format: newFormat,
      });
    }
    setIsChangingFormat(false);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={popoverRef}>
      {/* Design Handoff Badge */}
      {showHandoffBadge && (
        <span 
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-purple-100 text-purple-700 border border-purple-200/80 shadow-2xs"
          title="Design Handoff in Progress"
        >
          <Palette className="w-3 h-3 text-purple-600" />
          <span>Handoff</span>
        </span>
      )}

      {/* Format & Attachment Pill */}
      {specs ? (
        <button
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all shadow-2xs cursor-pointer group ${
            specAttachments.length > 0
              ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'
              : 'bg-slate-100/90 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border-slate-200 hover:border-indigo-300'
          }`}
          title="คลิกเพื่อดูรายละเอียดสเปก หรือแนบไฟล์สเปก/บรีฟงาน"
        >
          <ImageIcon className="w-3 h-3 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">{specs.format}</span>
          
          {specAttachments.length > 0 ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white font-mono">
              <Paperclip className="w-2.5 h-2.5" />
              {specAttachments.length}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-sans">
              + แนบ
            </span>
          )}
        </button>
      ) : null}

      {/* Popover Card */}
      {showPopover && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-40 animate-in fade-in zoom-in-95 duration-100 space-y-3">
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-slate-900">Graphic Asset Specs</span>
            </div>
            
            {/* Format Badge with edit dropdown trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsChangingFormat(!isChangingFormat)}
                className="text-[10.5px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="คลิกเพื่อเปลี่ยนรูปแบบสเปกงาน (Change Format)"
              >
                <span>{specs?.format || 'เลือกรูปแบบ'}</span>
                <ChevronDown className="w-3 h-3 text-purple-500" />
              </button>

              {isChangingFormat && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in duration-100 max-h-48 overflow-y-auto text-left">
                  {AVAILABLE_FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => handleSelectFormat(fmt)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-purple-50 transition-colors ${
                        specs?.format === fmt ? 'font-semibold text-purple-700 bg-purple-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{fmt}</span>
                      {specs?.format === fmt && <Check className="w-3 h-3 text-purple-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Specs Details */}
          <div className="space-y-2 text-xs">
            {specs?.dimensions && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Resolution / Dimensions</span>
                <p className="font-mono text-xs text-slate-800 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  {specs.dimensions}
                </p>
              </div>
            )}

            {specs?.notes && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Design Notes</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                  {specs.notes}
                </p>
              </div>
            )}
          </div>

          {/* Attached Spec Files List */}
          {specAttachments.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                ไฟล์สเปก / บรีฟที่แนบไว้ ({specAttachments.length} ไฟล์)
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {specAttachments.map((att) => (
                  <div 
                    key={att.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span className="truncate font-medium text-[11.5px]" title={att.name}>
                        {att.name}
                      </span>
                    </div>
                    <a
                      href={att.url}
                      download={att.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded transition-colors flex-shrink-0"
                      title="ดาวน์โหลด / เปิดไฟล์"
                    >
                      <Download className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action: Attach File Button */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setShowPopover(false);
                if (task && onOpenAttachmentModal) {
                  onOpenAttachmentModal(task, 'brief_specs');
                }
              }}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>+ แนบไฟล์สเปก / บรีฟ / Artwork</span>
            </button>

            {/* Quick Links */}
            {(specs?.briefUrl || specs?.moodboardUrl) && (
              <div className="flex flex-col gap-1 pt-1">
                {specs.briefUrl && (
                  <a
                    href={specs.briefUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-indigo-600 hover:text-indigo-700 hover:underline text-xs font-medium py-1 px-1.5 rounded hover:bg-indigo-50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Creative Brief Link
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {specs.moodboardUrl && (
                  <a
                    href={specs.moodboardUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-purple-600 hover:text-purple-700 hover:underline text-xs font-medium py-1 px-1.5 rounded hover:bg-purple-50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Moodboard & Assets
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
