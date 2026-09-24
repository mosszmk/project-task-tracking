import React, { useState, useRef, useEffect } from 'react';
import { GraphicSpecs } from '../../types';
import { Palette, ExternalLink, Image, FileText, Info } from 'lucide-react';

interface GraphicSpecsTagProps {
  specs?: GraphicSpecs;
  showHandoffBadge?: boolean;
}

export const GraphicSpecsTag: React.FC<GraphicSpecsTagProps> = ({
  specs,
  showHandoffBadge = false,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  if (!specs && !showHandoffBadge) {
    return <span className="text-slate-300 text-xs">—</span>;
  }

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

      {/* Format Pill */}
      {specs ? (
        <button
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
        >
          <Image className="w-3 h-3 text-slate-400" />
          <span>{specs.format}</span>
        </button>
      ) : null}

      {/* Popover Card */}
      {showPopover && specs && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-slate-900">Graphic Asset Specs</span>
            </div>
            <span className="text-[10px] font-medium bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
              {specs.format}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {specs.dimensions && (
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-400 block">Resolution</span>
                <p className="font-mono text-xs text-slate-800 font-medium">{specs.dimensions}</p>
              </div>
            )}

            {specs.notes && (
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-400 block">Design Notes</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                  {specs.notes}
                </p>
              </div>
            )}

            <div className="pt-1 flex flex-col gap-1">
              {specs.briefUrl && (
                <a
                  href={specs.briefUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-indigo-600 hover:text-indigo-700 hover:underline text-xs font-semibold py-1 px-1.5 rounded hover:bg-indigo-50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Creative Brief
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {specs.moodboardUrl && (
                <a
                  href={specs.moodboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-purple-600 hover:text-purple-700 hover:underline text-xs font-semibold py-1 px-1.5 rounded hover:bg-purple-50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> Moodboard & Assets
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
