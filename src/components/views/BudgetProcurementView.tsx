import React, { useState, useMemo } from 'react';
import { Project, ProcurementRecord, ProcurementStatus, ExpenseCategory } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { 
  DollarSign, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Trophy, 
  Building2, 
  Calendar, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';

interface BudgetProcurementViewProps {
  projects: Project[];
  procurements: ProcurementRecord[];
  totalBudget?: number;
  onOpenNewPRModal: (defaultProjectId?: string) => void;
  onOpenQuotationComparison: (record: ProcurementRecord) => void;
  onUpdateProcurementStatus: (id: string, newStatus: ProcurementStatus) => void;
  onDeleteProcurement: (id: string) => void;
}

export const BudgetProcurementView: React.FC<BudgetProcurementViewProps> = ({
  projects,
  procurements,
  totalBudget = 5000000,
  onOpenNewPRModal,
  onOpenQuotationComparison,
  onUpdateProcurementStatus,
  onDeleteProcurement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Format currency helper (supports decimals e.g. 1134.40)
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB', 
      minimumFractionDigits: val % 1 === 0 ? 0 : 2, 
      maximumFractionDigits: 2 
    }).format(val);
  };

  // 1. Calculate KPI Metrics
  const committedPOAmount = useMemo(() => {
    return procurements
      .filter((p) => p.procurementStatus === 'PO Issued' || p.procurementStatus === 'Delivered')
      .reduce((sum, p) => sum + p.amountTHB, 0);
  }, [procurements]);

  const pendingPRAmount = useMemo(() => {
    return procurements
      .filter((p) => p.procurementStatus === 'PR Pending Approval' || p.procurementStatus === 'Awaiting Quotes')
      .reduce((sum, p) => sum + p.amountTHB, 0);
  }, [procurements]);

  const draftAmount = useMemo(() => {
    return procurements
      .filter((p) => p.procurementStatus === 'Draft')
      .reduce((sum, p) => sum + p.amountTHB, 0);
  }, [procurements]);

  const remainingBudget = totalBudget - committedPOAmount - pendingPRAmount;
  const committedPct = Math.min(100, Math.round((committedPOAmount / totalBudget) * 100));
  const pendingPct = Math.min(100, Math.round((pendingPRAmount / totalBudget) * 100));
  const remainingPct = Math.max(0, 100 - committedPct - pendingPct);

  // 2. Filter records
  const filteredProcurements = useMemo(() => {
    return procurements.filter((p) => {
      if (selectedProjectId !== 'all' && p.projectId !== selectedProjectId) return false;
      if (selectedCategory !== 'all' && p.expenseCategory !== selectedCategory) return false;
      if (selectedStatus !== 'all' && p.procurementStatus !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPR = p.prNumber.toLowerCase().includes(q);
        const matchesPO = p.poNumber ? p.poNumber.toLowerCase().includes(q) : false;
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSupplier = p.supplierName.toLowerCase().includes(q);
        const matchesProject = p.projectName.toLowerCase().includes(q);
        if (!matchesPR && !matchesPO && !matchesTitle && !matchesSupplier && !matchesProject) {
          return false;
        }
      }

      return true;
    });
  }, [procurements, selectedProjectId, selectedCategory, selectedStatus, searchQuery]);

  const getStatusBadgeStyle = (st: ProcurementStatus) => {
    switch (st) {
      case 'PO Issued':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium';
      case 'Delivered':
        return 'bg-teal-50 text-teal-800 border-teal-300 font-medium';
      case 'PR Pending Approval':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-medium';
      case 'Awaiting Quotes':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300 font-medium';
      case 'Draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  return (
    <div className="w-full px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>UCC Thailand &bull; B2C Marketing Procurement &amp; Budget Hub</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Marketing Budget &amp; PR/PO Procurement Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track marketing budget, PR/PO procurement items, compare supplier quotations, and monitor production lead times.
          </p>
        </div>

        {/* Top Action: + Record Expense */}
        <button
          onClick={() => onOpenNewPRModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ บันทึกค่าใช้จ่ายใหม่ (+ Record Expense)</span>
        </button>
      </div>

      {/* 1. Dashboard KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Budget */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Allocated Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-medium">
              ฿
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-slate-900 tracking-tight">
              {formatMoney(totalBudget)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Total Allocated B2C Marketing Budget
            </p>
          </div>
        </div>

        {/* Card 2: Committed PO */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
              Committed PO Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-emerald-700 tracking-tight">
              {formatMoney(committedPOAmount)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
              <span>Approved PO Issued</span>
              <span className="font-medium text-emerald-700">{committedPct}% of Budget</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending PR */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 uppercase tracking-wider">
              Pending PR Approval
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-medium">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-amber-700 tracking-tight">
              {formatMoney(pendingPRAmount)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
              <span>PR Submitted / Quoting</span>
              <span className="font-medium text-amber-700">{pendingPct}% of Budget</span>
            </div>
          </div>
        </div>

        {/* Card 4: Remaining Budget */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-800 uppercase tracking-wider">
              Remaining Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-semibold tracking-tight ${remainingBudget >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
              {formatMoney(remainingBudget)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
              <span>Available for Procurement</span>
              <span className="font-medium text-indigo-700">{remainingPct}% Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Utilization Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-700 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <span>Budget Utilization Rate</span>
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>PO Issued: {committedPct}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Pending PR: {pendingPct}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
              <span>Remaining: {remainingPct}%</span>
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${committedPct}%` }}
            className="h-full bg-emerald-500 transition-all duration-300"
            title={`PO Issued: ${formatMoney(committedPOAmount)} (${committedPct}%)`}
          />
          <div
            style={{ width: `${pendingPct}%` }}
            className="h-full bg-amber-400 transition-all duration-300"
            title={`Pending PR: ${formatMoney(pendingPRAmount)} (${pendingPct}%)`}
          />
          <div
            style={{ width: `${remainingPct}%` }}
            className="h-full bg-slate-200 transition-all duration-300"
            title={`Remaining: ${formatMoney(remainingBudget)} (${remainingPct}%)`}
          />
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PR, PO, item title, or supplier..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Expense Categories</option>
            <option value="Packaging Production">Packaging Production</option>
            <option value="Media & Ads">Media & Ads</option>
            <option value="Influencer & KOL">Influencer & KOL</option>
            <option value="Booth & Space Rental">Booth & Space Rental</option>
            <option value="POSM & Printing">POSM & Printing</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="PO Issued">PO Issued</option>
            <option value="PR Pending Approval">PR Pending Approval</option>
            <option value="Awaiting Quotes">Awaiting Quotes</option>
            <option value="Draft">Draft</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* 3. Procurement Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-medium uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 w-36">PR / PO No.</th>
                <th className="py-3 px-4 min-w-[300px] lg:min-w-[340px]">Project</th>
                <th className="py-3 px-4 min-w-[250px]">Item &amp; Category</th>
                <th className="py-3 px-4 min-w-[180px]">Selected Supplier</th>
                <th className="py-3 px-4 w-36 text-right">Amount (THB)</th>
                <th className="py-3 px-3 w-32 text-center">Lead Time</th>
                <th className="py-3 px-4 w-44 text-center">Quotations</th>
                <th className="py-3 px-4 w-40 text-center">Status</th>
                <th className="py-3 px-3 w-12 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProcurements.length > 0 ? (
                filteredProcurements.map((proc, index) => {
                  const targetProj = projects.find((p) => p.id === proc.projectId);
                  const quoteCount = proc.quotations ? proc.quotations.length : 0;

                  return (
                    <tr key={proc.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* # Index */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* PR & PO Number */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded w-fit text-[11px]">
                            {proc.prNumber}
                          </span>
                          {proc.poNumber ? (
                            <span className="font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-fit text-[10.5px]">
                              {proc.poNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono italic">
                              (Pending PO)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project Link */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: targetProj?.color || '#4f46e5' }}
                          />
                          <div>
                            <p className="font-medium text-slate-900 leading-tight">
                              {proc.projectName}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              {targetProj?.code || proc.projectCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Item Title & Category */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 leading-snug">
                            {proc.title}
                          </p>
                          <span className="inline-block text-[9.5px] font-medium uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 mt-1">
                            {proc.expenseCategory}
                          </span>
                        </div>
                      </td>

                      {/* Selected Supplier & Contact */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800 leading-tight">
                            {proc.supplierName}
                          </p>
                          {proc.supplierContact && (
                            <p className="text-[10.5px] text-slate-400 mt-0.5">
                              {proc.supplierContact}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Amount THB */}
                      <td className="py-3 px-4 text-right">
                        <div>
                          <span className="font-semibold text-slate-900 text-sm">
                            {formatMoney(proc.amountTHB)}
                          </span>
                          <span className={`block text-[9.5px] font-normal ${proc.vatIncluded ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {proc.vatIncluded ? 'Incl. 7% VAT' : 'Excl. VAT'}
                          </span>
                        </div>
                      </td>

                      {/* Lead Time Days */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg font-medium text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{proc.leadTimeDays} days</span>
                        </div>
                        {proc.targetDeliveryDate && (
                          <span className="block text-[9.5px] text-slate-400 mt-0.5">
                            Target: {formatDate(proc.targetDeliveryDate)}
                          </span>
                        )}
                      </td>

                      {/* Quotation Comparison Trigger */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenQuotationComparison(proc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer group/quote"
                          title="Click to view 2-3 supplier quotation comparison card"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-600 group-hover/quote:scale-110 transition-transform" />
                          <span>Compare {quoteCount} Quotes</span>
                        </button>
                      </td>

                      {/* Status Dropdown Pill */}
                      <td className="py-3 px-4 text-center">
                        <select
                          value={proc.procurementStatus}
                          onChange={(e) => onUpdateProcurementStatus(proc.id, e.target.value as ProcurementStatus)}
                          className={`px-2.5 py-1 rounded-xl text-xs border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusBadgeStyle(
                            proc.procurementStatus
                          )}`}
                        >
                          <option value="PO Issued">PO Issued</option>
                          <option value="PR Pending Approval">PR Pending Approval</option>
                          <option value="Awaiting Quotes">Awaiting Quotes</option>
                          <option value="Draft">Draft</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteProcurement(proc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Delete this procurement record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400 italic">
                    No procurement records match the filter criteria &bull; Click <strong>"+ New PR Request"</strong> to create a new purchase request.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
