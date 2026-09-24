import React from 'react';
import { Task, Project } from '../../types';
import { CalendarRange, Sparkles, CheckCircle2 } from 'lucide-react';

interface GanttPlaceholderProps {
  tasks: Task[];
  projects: Project[];
}

export const GanttPlaceholder: React.FC<GanttPlaceholderProps> = ({
  tasks,
  projects,
}) => {
  const dates = [
    { label: 'Sep 01 - 07', day: 'Week 1' },
    { label: 'Sep 08 - 14', day: 'Week 2' },
    { label: 'Sep 15 - 21', day: 'Week 3' },
    { label: 'Sep 22 - 28', day: 'Week 4' },
    { label: 'Sep 29 - Oct 05', day: 'Week 5' },
    { label: 'Oct 06 - 12', day: 'Week 6' },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Campaign Gantt Timeline View</h3>
              <p className="text-xs text-slate-500">Cross-channel marketing schedule & graphic production roadmap</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            ClickUp Compatible Schedule
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Dates */}
            <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Task & Campaign</div>
              <div className="col-span-8 grid grid-cols-6 gap-1 text-center">
                {dates.map((d, i) => (
                  <div key={i} className="bg-slate-50 py-1 rounded">
                    <p className="text-slate-700 font-semibold">{d.day}</p>
                    <p className="text-[10px] text-slate-400">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 mt-2">
              {tasks.slice(0, 7).map((task, idx) => {
                // mock offsets for realistic visualization
                const startCols = [1, 2, 3, 2, 4, 3, 1];
                const spanCols = [3, 2, 2, 3, 2, 3, 4];
                const colStart = startCols[idx % startCols.length];
                const colSpan = spanCols[idx % spanCols.length];

                return (
                  <div key={task.id} className="grid grid-cols-12 gap-2 py-3 items-center hover:bg-slate-50/60 rounded">
                    <div className="col-span-4 pr-3">
                      <p className="text-xs font-semibold text-slate-800 truncate">{task.taskName}</p>
                      <span className="text-[10px] text-slate-400">{task.projectName}</span>
                    </div>
                    <div className="col-span-8 grid grid-cols-6 gap-1 h-7 items-center relative">
                      <div
                        className="h-6 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-semibold flex items-center px-2 shadow-xs truncate"
                        style={{
                          gridColumnStart: colStart,
                          gridColumnEnd: `span ${colSpan}`,
                        }}
                      >
                        {task.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
