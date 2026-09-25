import React from 'react';
import { Task, Project } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { BarChart3, TrendingUp, Users, CheckCircle, Palette, Sparkles } from 'lucide-react';
import { STATUS_CONFIG } from '../table/StatusPill';

interface DashboardPlaceholderProps {
  tasks: Task[];
  projects: Project[];
}

export const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({
  tasks,
  projects,
}) => {
  const completedCount = tasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed').length;
  const overallRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const graphicCount = tasks.filter((t) => t.role === 'Graphic Designer').length;
  const marketerCount = tasks.filter((t) => t.role === 'Marketer').length;

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-400/20">
            Sprint Intelligence
          </span>
          <h2 className="text-2xl font-semibold mt-2">Marketing & Design Executive Dashboard</h2>
          <p className="text-indigo-200 text-xs mt-1">
            Real-time cross-channel throughput, graphic asset bottleneck alerts, and sprint velocity.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-4xl font-semibold text-emerald-400">{overallRate}%</p>
          <p className="text-xs text-indigo-200 uppercase font-medium mt-0.5">Overall Completion</p>
        </div>
      </div>

      {/* Grid: Projects Progress & Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Progress Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Campaign Delivery Progress</span>
          </h3>

          <div className="space-y-4">
            {projects.map((proj) => {
              const pTasks = tasks.filter((t) => t.projectId === proj.id);
              const pCompleted = pTasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed').length;
              const percent = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

              return (
                <div key={proj.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }} />
                      <span className="font-medium text-slate-800">{proj.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{percent}% ({pCompleted}/{pTasks.length})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: proj.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role & Workload Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Workload Split: Marketing vs Graphic</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-xl text-center">
              <Palette className="w-6 h-6 text-purple-600 mx-auto mb-1.5" />
              <p className="text-2xl font-semibold text-purple-800">{graphicCount}</p>
              <p className="text-xs font-medium text-purple-600 uppercase">Graphic Tasks</p>
            </div>

            <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-xl text-center">
              <Sparkles className="w-6 h-6 text-sky-600 mx-auto mb-1.5" />
              <p className="text-2xl font-semibold text-sky-800">{marketerCount}</p>
              <p className="text-xs font-medium text-sky-600 uppercase">Marketing Strategy</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            <strong>Handoff Indicator:</strong> Graphic tasks currently comprise {tasks.length > 0 ? Math.round((graphicCount / tasks.length) * 100) : 0}% of all scheduled tasks. Peak designer load is centered on the 11.11 Mega Sale launch assets.
          </p>
        </div>
      </div>
    </div>
  );
};
