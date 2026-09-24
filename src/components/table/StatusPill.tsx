import React, { useState, useRef, useEffect } from 'react';
import { TaskStatus } from '../../types';
import { ChevronDown, Check } from 'lucide-react';

interface StatusPillProps {
  status: TaskStatus;
  onChange: (newStatus: TaskStatus) => void;
  disabled?: boolean;
}

export const STATUS_CONFIG: Record<TaskStatus, { bg: string; text: string; hover: string; label: string; dot: string }> = {
  'Backlog': {
    bg: 'bg-slate-500',
    text: 'text-white',
    hover: 'hover:bg-slate-600',
    label: 'Backlog',
    dot: 'bg-slate-300',
  },
  'Briefing': {
    bg: 'bg-sky-500',
    text: 'text-white',
    hover: 'hover:bg-sky-600',
    label: 'Briefing',
    dot: 'bg-sky-200',
  },
  'Ready for Graphic': {
    bg: 'bg-purple-600',
    text: 'text-white',
    hover: 'hover:bg-purple-700',
    label: 'Ready for Graphic',
    dot: 'bg-purple-200',
  },
  'Designing': {
    bg: 'bg-amber-500',
    text: 'text-white',
    hover: 'hover:bg-amber-600',
    label: 'Designing',
    dot: 'bg-amber-200',
  },
  'Review': {
    bg: 'bg-rose-500',
    text: 'text-white',
    hover: 'hover:bg-rose-600',
    label: 'Review',
    dot: 'bg-rose-200',
  },
  'Completed': {
    bg: 'bg-emerald-500',
    text: 'text-white',
    hover: 'hover:bg-emerald-600',
    label: 'Completed',
    dot: 'bg-emerald-200',
  },
  'Done': {
    bg: 'bg-emerald-700',
    text: 'text-white',
    hover: 'hover:bg-emerald-800',
    label: 'Done',
    dot: 'bg-emerald-300',
  },
  'In Progress': {
    bg: 'bg-amber-500',
    text: 'text-white',
    hover: 'hover:bg-amber-600',
    label: 'In Progress',
    dot: 'bg-amber-300',
  },
  'Not Started': {
    bg: 'bg-sky-500',
    text: 'text-white',
    hover: 'hover:bg-sky-600',
    label: 'Not Started',
    dot: 'bg-sky-300',
  },
};

const ALL_STATUSES: TaskStatus[] = [
  'Done',
  'In Progress',
  'Not Started',
  'Backlog',
  'Briefing',
  'Ready for Graphic',
  'Designing',
  'Review',
];

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG['Backlog'];

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
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-36 h-8 px-2.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center justify-between shadow-sm cursor-pointer select-none group ${currentConfig.bg} ${currentConfig.text} ${currentConfig.hover}`}
        title="Click to update status"
      >
        <span className="truncate flex-1 text-center font-medium tracking-wide">
          {currentConfig.label}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Select Status
          </div>
          {ALL_STATUSES.map((st) => {
            const config = STATUS_CONFIG[st];
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
                  isSelected ? 'font-medium text-slate-900 bg-slate-50' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${config.bg}`} />
                  <span>{config.label}</span>
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
