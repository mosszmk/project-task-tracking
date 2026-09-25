import React, { useState, useRef, useEffect } from 'react';
import { ProjectSummaryStatus } from '../../types';
import { ChevronDown, Check } from 'lucide-react';

interface SummaryStatusPillProps {
  status: ProjectSummaryStatus;
  onChange?: (newStatus: ProjectSummaryStatus) => void;
  disabled?: boolean;
}

export const SUMMARY_STATUS_CONFIG: Record<
  ProjectSummaryStatus, 
  { bg: string; text: string; hover: string; border: string; label: string; dot: string }
> = {
  'On Track': {
    bg: 'bg-emerald-500',
    text: 'text-white',
    hover: 'hover:bg-emerald-600',
    border: 'border-emerald-600',
    label: 'On Track',
    dot: 'bg-emerald-300',
  },
  'In Progress': {
    bg: 'bg-amber-500',
    text: 'text-white',
    hover: 'hover:bg-amber-600',
    border: 'border-amber-600',
    label: 'In Progress',
    dot: 'bg-amber-300',
  },
  'Planning': {
    bg: 'bg-sky-500',
    text: 'text-white',
    hover: 'hover:bg-sky-600',
    border: 'border-sky-600',
    label: 'Planning',
    dot: 'bg-sky-300',
  },
  'At Risk': {
    bg: 'bg-rose-600',
    text: 'text-white',
    hover: 'hover:bg-rose-700',
    border: 'border-rose-700',
    label: 'At Risk',
    dot: 'bg-rose-300',
  },
  'Completed': {
    bg: 'bg-emerald-600',
    text: 'text-white',
    hover: 'hover:bg-emerald-700',
    border: 'border-emerald-700',
    label: 'Completed',
    dot: 'bg-emerald-300',
  },
};

const ALL_SUMMARY_STATUSES: ProjectSummaryStatus[] = [
  'On Track',
  'In Progress',
  'Planning',
  'At Risk',
  'Completed',
];

export const SummaryStatusPill: React.FC<SummaryStatusPillProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = SUMMARY_STATUS_CONFIG[status] || SUMMARY_STATUS_CONFIG['In Progress'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled || !onChange}
        onClick={() => onChange && setIsOpen(!isOpen)}
        className={`w-32 h-7 px-2.5 rounded-md text-[11px] font-medium transition-all duration-150 flex items-center justify-between shadow-xs select-none ${
          onChange ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'
        } ${config.bg} ${config.text} ${onChange ? config.hover : ''}`}
        title={onChange ? 'Click to change status' : undefined}
      >
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          <span className="font-medium tracking-wide uppercase">{config.label}</span>
        </div>
        {onChange && (
          <ChevronDown className="w-3 h-3 opacity-70 ml-1 flex-shrink-0" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && onChange && (
        <div className="absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Change Status
          </div>
          {ALL_SUMMARY_STATUSES.map((st) => {
            const itemConfig = SUMMARY_STATUS_CONFIG[st];
            const isSelected = st === status;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  onChange(st);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors hover:bg-slate-50 ${
                  isSelected ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${itemConfig.bg}`} />
                  <span>{itemConfig.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
