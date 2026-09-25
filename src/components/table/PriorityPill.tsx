import React from 'react';

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Urgent': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700 font-medium', dot: 'bg-rose-500' },
  'High': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700 font-medium', dot: 'bg-amber-500' },
  'Medium': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700 font-medium', dot: 'bg-blue-500' },
  'Low': { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600 font-medium', dot: 'bg-slate-400' },
};

export const PriorityPill: React.FC<{ priority: string; className?: string }> = ({ priority, className = '' }) => {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES['Medium'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border ${style.bg} ${style.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{priority}</span>
    </span>
  );
};
