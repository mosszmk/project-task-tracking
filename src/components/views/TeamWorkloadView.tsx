import React from 'react';
import { User, Task } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Sparkles, 
  Award, 
  Layers,
  Palette,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

interface TeamWorkloadViewProps {
  tasks: Task[];
}

export const TeamWorkloadView: React.FC<TeamWorkloadViewProps> = ({ tasks }) => {
  // Compute workload for each team member
  const memberWorkloads = mockUsers.map((user) => {
    const userTasks = tasks.filter((t) => t.assignee.id === user.id);
    const activeTasks = userTasks.filter((t) => t.status !== 'Done' && (t.status as string) !== 'Completed');
    const completedTasks = userTasks.filter((t) => t.status === 'Done' || (t.status as string) === 'Completed');
    
    // Group active tasks by project for clean bullet display
    const projectMap = new Map<string, { id: string; name: string; count: number }>();
    activeTasks.forEach((t) => {
      const existing = projectMap.get(t.projectId);
      if (existing) {
        existing.count += 1;
      } else {
        projectMap.set(t.projectId, {
          id: t.projectId,
          name: t.projectName,
          count: 1,
        });
      }
    });
    const activeProjects = Array.from(projectMap.values());

    // capacity percentage based on user's maxCapacity
    const capacityPercent = Math.min(
      Math.round((activeTasks.length / user.maxCapacity) * 100),
      100
    );

    let loadStatus: 'Available' | 'Optimal' | 'Overloaded' = 'Optimal';
    if (capacityPercent < 60) loadStatus = 'Available';
    else if (capacityPercent >= 85) loadStatus = 'Overloaded';

    return {
      user,
      activeTasks,
      completedTasks,
      activeProjects,
      totalCount: userTasks.length,
      capacityPercent,
      loadStatus,
    };
  });

  const totalActive = tasks.filter((t) => t.status !== 'Done' && (t.status as string) !== 'Completed').length;
  const avgCapacity = Math.round(
    memberWorkloads.reduce((acc, m) => acc + m.capacityPercent, 0) / memberWorkloads.length
  );

  return (
    <div className="w-full px-8 py-5 space-y-6">
      {/* Top Header & Analytics Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-indigo-600 mb-1">
            <Users className="w-4 h-4" />
            <span>Team Resource & Performance Evaluation</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Workload Distribution & Sprint Capacity
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate individual throughput, on-time delivery rates, and mitigate design bottlenecks.
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <p className="text-[10px] font-medium uppercase text-slate-400">Average Capacity</p>
            <p className="text-xl font-semibold text-slate-900">{avgCapacity}%</p>
          </div>

          <div className="bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100">
            <p className="text-[10px] font-medium uppercase text-indigo-500">Active Work items</p>
            <p className="text-xl font-semibold text-indigo-700">{totalActive}</p>
          </div>

          <div className="bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-medium uppercase text-emerald-600">On-Time Benchmark</p>
            <p className="text-xl font-semibold text-emerald-700">94.8%</p>
          </div>
        </div>
      </div>

      {/* Team Evaluation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-5 w-[330px]">Team Member (ข้อมูลสมาชิก)</th>
                <th className="py-3.5 px-3 w-28 text-center">Department</th>
                <th className="py-3.5 px-3 w-28 text-center">On-Hand Tasks</th>
                <th className="py-3.5 px-4 w-52">Capacity Utilization</th>
                <th className="py-3.5 px-4 w-32 text-center">On-Time Delivery</th>
                <th className="py-3.5 px-5 min-w-[340px]">Current Active Focus & Responsibilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {memberWorkloads.map(({ user, activeTasks, completedTasks, activeProjects, capacityPercent, loadStatus }) => {
                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Member Profile - 5 Tier Clean Information Hierarchy */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-start gap-3.5">
                        {/* Avatar with Active Dot */}
                        <div className="relative flex-shrink-0 mt-0.5">
                          <UserAvatar user={user} size="lg" className="ring-2 ring-slate-100 shadow-xs" />
                          <span 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" 
                            title="Active Member" 
                          />
                        </div>

                        {/* 5-Line Information Hierarchy */}
                        <div className="flex flex-col space-y-1 min-w-0">
                          {/* 1. English Name */}
                          <p className="text-sm font-medium text-slate-900 leading-snug tracking-tight">
                            {user.name}
                          </p>

                          {/* 2. Thai Name */}
                          {user.nameTh && (
                            <p className="text-xs text-slate-500 font-normal leading-tight">
                              {user.nameTh}
                            </p>
                          )}

                          {/* 3. Position / Role */}
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50/90 text-indigo-700 border border-indigo-100/90 leading-tight">
                              <Briefcase className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                              <span className="truncate">{user.title || user.role}</span>
                            </span>
                          </div>

                          {/* 4. Email */}
                          <div className="pt-0.5">
                            <a
                              href={`mailto:${user.email}`}
                              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-indigo-600 font-mono transition-colors leading-tight group"
                              title={`คลิกเพื่อส่งอีเมลถึง ${user.name}`}
                            >
                              <Mail className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </a>
                          </div>

                          {/* 5. Phone & Ext */}
                          <div className="pt-0.5">
                            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 leading-tight">
                              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span>
                                {user.phone && user.phone !== '-' ? user.phone : '02-018-9999'}
                              </span>
                              {user.phoneGs && user.phoneGs !== '-' && (
                                <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/80">
                                  ต่อ {user.phoneGs}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-3 text-center align-top pt-5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {user.department}
                      </span>
                    </td>

                    {/* On-Hand Tasks */}
                    <td className="py-4 px-3 text-center align-top pt-5">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-semibold text-slate-900 leading-none">
                          {activeTasks.length}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal mt-1">
                          {completedTasks.length} done
                        </span>
                      </div>
                    </td>

                    {/* Capacity Bar */}
                    <td className="py-4 px-4 align-top pt-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-medium ${
                            loadStatus === 'Overloaded' ? 'text-rose-600' : loadStatus === 'Optimal' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {loadStatus} ({capacityPercent}%)
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            Max: {user.maxCapacity} tasks
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              capacityPercent >= 85
                                ? 'bg-rose-500'
                                : capacityPercent >= 60
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* On-Time Delivery Rate */}
                    <td className="py-4 px-4 text-center align-top pt-5">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-medium text-slate-900">
                            {user.onTimeRate}%
                          </span>
                        </div>
                        <span className="text-[9px] uppercase font-medium text-emerald-600 mt-0.5">
                          {user.onTimeRate >= 95 ? 'Top Performer' : 'Standard'}
                        </span>
                      </div>
                    </td>

                    {/* Current Active Focus & Core Responsibilities */}
                    <td className="py-4 px-5 align-top pt-4">
                      {activeProjects.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {activeProjects.map((p) => (
                              <div 
                                key={p.id} 
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-2xs hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors"
                              >
                                <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                                <span className="font-medium text-slate-800 text-xs tracking-tight">
                                  {p.name}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium border border-indigo-200/60 whitespace-nowrap">
                                  {p.count} {p.count === 1 ? 'งาน' : 'งาน'}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Secondary: Core responsibilities scope pills */}
                          {user.responsibilities && user.responsibilities.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap pt-0.5">
                              <span className="text-[10.5px] font-semibold text-slate-400">ขอบเขตงาน:</span>
                              {user.responsibilities.slice(0, 2).map((resp, i) => (
                                <span 
                                  key={i} 
                                  className="text-[10.5px] text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50"
                                >
                                  {resp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              Executive Governance & Strategy
                            </span>
                            <span className="text-[11px] text-slate-400 italic">
                              (กำกับภาพรวม / ไม่ใช่งาน Routine รายวัน)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {user.responsibilities?.slice(0, 3).map((resp, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                <span>{resp}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
