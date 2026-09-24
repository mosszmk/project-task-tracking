import React, { useState, useMemo } from 'react';
import { Project, ProjectSummaryStatus, ProjectType, Department } from '../../types';
import { ArtworkThumbnail } from './ArtworkThumbnail';
import { SummaryStatusPill } from './SummaryStatusPill';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate } from '../../utils/dateUtils';
import { 
  Printer, 
  Share2, 
  Search, 
  Filter, 
  Paperclip, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  Layers,
  Receipt,
  AlertTriangle,
  Trophy,
  Clock
} from 'lucide-react';
import { ProcurementRecord } from '../../types';

interface ProjectStatusSummaryProps {
  projects: Project[];
  procurements?: ProcurementRecord[];
  onUpdateSummaryStatus: (projectId: string, status: ProjectSummaryStatus) => void;
  onOpenAttachmentModal: (project: Project) => void;
  onOpenQuotationComparison?: (record: ProcurementRecord) => void;
  onNavigateToBudget?: (projectId?: string) => void;
}

const DEPARTMENTS: ('All' | Department)[] = ['All', 'Event & Trade', 'Design', 'Marketing', 'Brand', 'R&D'];
const PROJECT_TYPES: ('All' | ProjectType)[] = [
  'All', 
  'Event & Exhibition', 
  'Creative & Graphic', 
  'Packaging', 
  'New Product', 
  'Campaign', 
  'POSM'
];
const STATUS_OPTIONS: ('All' | ProjectSummaryStatus)[] = ['All', 'On Track', 'In Progress', 'Planning', 'At Risk'];

export const ProjectStatusSummary: React.FC<ProjectStatusSummaryProps> = ({
  projects,
  procurements = [],
  onUpdateSummaryStatus,
  onOpenAttachmentModal,
  onOpenQuotationComparison,
  onNavigateToBudget,
}) => {
  const [selectedDept, setSelectedDept] = useState<'All' | Department>('All');
  const [selectedType, setSelectedType] = useState<'All' | ProjectType>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | ProjectSummaryStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedDept !== 'All' && p.department !== selectedDept) return false;
      if (selectedType !== 'All' && p.type !== selectedType) return false;
      if (selectedStatus !== 'All' && p.summaryStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesOwner = p.lead.name.toLowerCase().includes(q);
        const matchesNotes = p.statusNotes.some((n) => n.toLowerCase().includes(q));
        if (!matchesName && !matchesCode && !matchesOwner && !matchesNotes) return false;
      }
      return true;
    });
  }, [projects, selectedDept, selectedType, selectedStatus, searchQuery]);

  // Statistics
  const totalCount = filteredProjects.length;
  const onTrackCount = filteredProjects.filter((p) => p.summaryStatus === 'On Track').length;
  const inProgressCount = filteredProjects.filter((p) => p.summaryStatus === 'In Progress').length;
  const planningCount = filteredProjects.filter((p) => p.summaryStatus === 'Planning').length;
  const atRiskCount = filteredProjects.filter((p) => p.summaryStatus === 'At Risk').length;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'summary');
    if (selectedDept !== 'All') url.searchParams.set('dept', selectedDept);
    if (selectedType !== 'All') url.searchParams.set('type', selectedType);
    if (selectedStatus !== 'All') url.searchParams.set('status', selectedStatus);

    navigator.clipboard.writeText(url.toString());
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const getTypeBadgeStyle = (type: ProjectType) => {
    switch (type) {
      case 'Event & Exhibition':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-medium';
      case 'Creative & Graphic':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 font-medium';
      case 'Packaging':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-medium';
      case 'New Product':
        return 'bg-slate-900 text-white border-slate-700 font-medium';
      case 'Campaign':
        return 'bg-blue-100 text-blue-800 border-blue-200 font-medium';
      case 'POSM':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 font-medium';
    }
  };

  return (
    <div className="p-6 space-y-5 print-presentation">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Deep-link with active filters copied to clipboard!</span>
        </div>
      )}

      {/* Presentation Header Bar (Clean UCC Thailand Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700 tracking-wide uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>UCC Thailand &bull; Executive Project Status Summary</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Packaging & Product Development Roadmap 2026
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-departmental status report ready for board review & presentation slides.
          </p>
        </div>

        {/* Action Buttons: Export as PDF & Share */}
        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            title="Share report URL"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors"
            title="Export as Landscape 16:9 PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (hidden during print) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Team:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project or notes..."
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Horizontal Presentation Table (UCC Thailand Reference Style) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print:border-slate-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-medium uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 w-12 text-center">No.</th>
                <th className="py-3 px-4 w-72">Project Name & Type</th>
                <th className="py-3 px-4 w-44 text-center">AW / Key Visual</th>
                <th className="py-3 px-4 min-w-[340px]">Status & Key Milestone Updates</th>
                <th className="py-3 px-4 w-48 text-center">งบจัดซื้อ (Budget & PR/PO)</th>
                <th className="py-3 px-4 w-48">Owner & Dept</th>
                <th className="py-3 px-4 w-32 text-center">Target Date</th>
                <th className="py-3 px-3 w-16 text-center no-print">Files</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/90 text-xs">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => {
                  const attachmentCount = (project.attachments || []).length;
                  const projectProcurements = (procurements || []).filter((p) => p.projectId === project.id);
                  const poTotal = projectProcurements
                    .filter((p) => p.procurementStatus === 'PO Issued' || p.procurementStatus === 'Delivered')
                    .reduce((sum, p) => sum + p.amountTHB, 0);
                  const pendingTotal = projectProcurements
                    .filter((p) => p.procurementStatus === 'PR Pending Approval' || p.procurementStatus === 'Awaiting Quotes')
                    .reduce((sum, p) => sum + p.amountTHB, 0);
                  const awaitingQuotesCount = projectProcurements.filter((p) => p.procurementStatus === 'Awaiting Quotes').length;
                  const hasPO = projectProcurements.some((p) => p.procurementStatus === 'PO Issued' || p.procurementStatus === 'Delivered');

                  // Calculate days to Target Date & At-Risk status
                  const targetDateObj = new Date(project.targetDate || project.dueDate);
                  const now = new Date();
                  const daysUntilTarget = Math.ceil((targetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const maxLeadTime = projectProcurements.length > 0 ? Math.max(...projectProcurements.map((p) => p.leadTimeDays)) : 0;
                  
                  // Condition: Target Date within 45 days OR remaining days <= maxLeadTime, and no PO issued yet:
                  const isProcurementAtRisk = projectProcurements.length > 0 && !hasPO && (daysUntilTarget <= 45 || daysUntilTarget <= maxLeadTime);

                  return (
                    <tr 
                      key={project.id} 
                      className="hover:bg-amber-50/20 transition-colors group align-top"
                    >
                      {/* 1. No. */}
                      <td className="py-3.5 px-3 text-center font-medium text-slate-500 bg-slate-50/50">
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* 2. Project Name + Type Pill */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-block w-fit text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${getTypeBadgeStyle(project.type)}`}>
                            {project.type}
                          </span>
                          <span className="font-medium text-slate-900 text-xs tracking-tight group-hover:text-indigo-600 transition-colors">
                            {project.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {project.code}
                          </span>
                        </div>
                      </td>

                      {/* 3. AW / Key Visual Thumbnail (Dual / Before & After support) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center">
                          <ArtworkThumbnail
                            artwork={project.artwork}
                            projectName={project.name}
                          />
                        </div>
                      </td>

                      {/* 4. Status: Pill + Bullet Point Summary + At-Risk Procurement Alert */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-2">
                          <div>
                            <SummaryStatusPill
                              status={isProcurementAtRisk ? 'At Risk' : project.summaryStatus}
                              onChange={(newSt) => onUpdateSummaryStatus(project.id, newSt)}
                            />
                          </div>

                          {/* Automatic At-Risk Alert Box for Procurement Delays */}
                          {isProcurementAtRisk && (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-medium flex items-start gap-1.5 animate-pulse shadow-2xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-rose-900">At Risk (ติดจัดซื้อ):</span>
                                <span className="ml-1 text-rose-700">
                                  ยังไม่ออก PO จากโรงพิมพ์/ซัพพลายเออร์ &bull; ระยะเวลาผลิต {maxLeadTime} วัน
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Bullet points detailing milestone work */}
                          <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside leading-relaxed bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                            {project.statusNotes.map((note, noteIdx) => (
                              <li key={noteIdx} className="text-slate-700">
                                <span className="text-slate-600">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>

                      {/* 4.1 Budget & PR/PO Procurement Badge Column */}
                      <td className="py-3.5 px-4 text-center">
                        {projectProcurements.length > 0 ? (
                          <div className="flex flex-col items-center gap-1.5">
                            {poTotal > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-medium text-xs shadow-2xs">
                                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                <span>PO Issued: ฿{poTotal.toLocaleString()}</span>
                              </span>
                            )}
                            {pendingTotal > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 font-medium text-xs shadow-2xs">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>รออนุมัติ PR: ฿{pendingTotal.toLocaleString()}</span>
                              </span>
                            )}
                            {awaitingQuotesCount > 0 && poTotal === 0 && pendingTotal === 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium text-xs shadow-2xs">
                                <span>🔍 รอใบเสนอราคา</span>
                              </span>
                            )}

                            {/* Comparison Trigger Button */}
                            {projectProcurements[0] && onOpenQuotationComparison && (
                              <button
                                type="button"
                                onClick={() => onOpenQuotationComparison(projectProcurements[0])}
                                className="text-[10.5px] text-indigo-600 hover:text-indigo-800 font-medium underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                                title="คลิกดูการเปรียบเทียบใบเสนอราคา"
                              >
                                <Trophy className="w-3 h-3 text-amber-500" />
                                <span>เทียบราคา ({projectProcurements[0].quotations.length} เจ้า)</span>
                              </button>
                            )}

                            {/* View in Budget View link */}
                            {onNavigateToBudget && (
                              <button
                                type="button"
                                onClick={() => onNavigateToBudget(project.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                                title="ไปที่หน้างบประมาณและจัดซื้อ"
                              >
                                <span>ดู PR/PO ทั้งหมด</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] text-slate-400 font-medium italic">
                              (ยังไม่มี PR)
                            </span>
                            {onNavigateToBudget && (
                              <button
                                type="button"
                                onClick={() => onNavigateToBudget(project.id)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline mt-1 cursor-pointer"
                              >
                                + เปิด PR
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 5. Owner: Avatar + Department */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar user={project.lead} size="sm" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900 leading-tight">
                              {project.lead.name}
                            </span>
                            <span className="text-[10px] font-normal text-slate-500">
                              Dept: <span className="font-medium text-indigo-600">{project.department}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Target Date */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(project.targetDate)}</span>
                        </span>
                      </td>

                      {/* 7. Files / Attachment Modal Trigger */}
                      <td className="py-3.5 px-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => onOpenAttachmentModal(project)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center justify-center relative"
                          title="Open File Attachments"
                        >
                          <Paperclip className="w-4 h-4" />
                          {attachmentCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-medium flex items-center justify-center">
                              {attachmentCount}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400 italic">
                    No projects found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Presentation Summary Footer */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">
              Total Projects:
            </span>
            <span className="text-sm font-semibold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
              {totalCount}
            </span>
          </div>

          {/* Status Breakdown Pills */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">On Track:</span>
              <span className="text-white font-medium">{onTrackCount}</span>
            </div>

            <span className="text-slate-600">&bull;</span>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">In Progress:</span>
              <span className="text-white font-medium">{inProgressCount}</span>
            </div>

            <span className="text-slate-600">&bull;</span>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-300">Planning:</span>
              <span className="text-white font-medium">{planningCount}</span>
            </div>

            <span className="text-slate-600">&bull;</span>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">At Risk:</span>
              <span className="text-white font-medium">{atRiskCount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Exported from <span className="font-medium text-amber-400">B2C Project &amp; Task Tracking — UCC Thailand</span>
          </div>
        </div>
      </div>
    </div>
  );
};
