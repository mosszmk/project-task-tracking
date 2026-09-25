import React, { useState } from 'react';
import { Project, ProcurementRecord, ExpenseCategory, ProcurementStatus, SupplierQuotation } from '../../types';
import { currentUser } from '../../mock/mockData';
import { 
  X, 
  Plus, 
  FileText, 
  Receipt, 
  Calendar, 
  Building2, 
  Trash2, 
  Trophy, 
  Clock, 
  Check, 
  ChevronDown, 
  Search,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface NewProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateProcurement: (newRecord: Omit<ProcurementRecord, 'id'>) => void;
  defaultProjectId?: string | null;
}

const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string }[] = [
  { id: 'Packaging Production', label: 'ผลิตแพ็กเกจจิ้ง (Packaging Production)' },
  { id: 'Media & Ads', label: 'ยิงแอด / โฆษณาออนไลน์ (Media & Ads)' },
  { id: 'Influencer & KOL', label: 'ค่าตัว Influencer / KOLs' },
  { id: 'Booth & Space Rental', label: 'ค่าเช่าพื้นที่ / โครงสร้างบูธ (Booth & Space)' },
  { id: 'POSM & Printing', label: 'สื่อสิ่งพิมพ์ ณ จุดขาย (POSM & Printing)' },
  { id: 'Agency & Production', label: 'ค่าโปรดักชัน / เอเจนซี่ (Agency & Production)' },
  { id: 'Logistics & Transport', label: 'ค่าขนส่ง / กระจายสินค้า (Logistics)' },
  { id: 'Other', label: 'ค่าใช้จ่ายอื่นๆ (Other)' },
];

interface QuoteFormItem {
  id: string;
  supplierName: string;
  contactPerson: string;
  phone: string;
  quotedAmountTHB: string;
  vatIncluded: boolean;
  leadTimeDays: string;
  highlights: string;
  fileName: string;
}

export const NewProcurementModal: React.FC<NewProcurementModalProps> = ({
  isOpen,
  onClose,
  projects,
  onCreateProcurement,
  defaultProjectId,
}) => {
  const [projectId, setProjectId] = useState<string>(defaultProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Packaging Production');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<ProcurementStatus>('PO Issued');
  const [notes, setNotes] = useState('');

  // 1-3 Supplier Quotes state
  const [quotes, setQuotes] = useState<QuoteFormItem[]>([
    {
      id: 'quote-1',
      supplierName: '',
      contactPerson: '',
      phone: '',
      quotedAmountTHB: '',
      vatIncluded: true,
      leadTimeDays: '15',
      highlights: '',
      fileName: 'Quotation_Supplier_1.pdf',
    },
  ]);

  const [selectedWinnerIndex, setSelectedWinnerIndex] = useState<number>(0);
  const [selectionReason, setSelectionReason] = useState('ราคาและคุณภาพตรงตามมาตรฐาน และ Lead time ทันกำหนดส่งมอบ');

  if (!isOpen) return null;

  const handleAddQuoteOption = () => {
    if (quotes.length >= 3) return;
    const nextIdx = quotes.length + 1;
    setQuotes((prev) => [
      ...prev,
      {
        id: `quote-${Date.now()}`,
        supplierName: '',
        contactPerson: '',
        phone: '',
        quotedAmountTHB: '',
        vatIncluded: true,
        leadTimeDays: '20',
        highlights: '',
        fileName: `Quotation_Supplier_${nextIdx}.pdf`,
      },
    ]);
  };

  const handleRemoveQuoteOption = (index: number) => {
    if (quotes.length <= 1) return;
    const updated = quotes.filter((_, i) => i !== index);
    setQuotes(updated);
    if (selectedWinnerIndex >= updated.length) {
      setSelectedWinnerIndex(0);
    }
  };

  const handleUpdateQuote = (index: number, field: keyof QuoteFormItem, value: any) => {
    setQuotes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedProj = projects.find((p) => p.id === projectId) || projects[0];
    if (!selectedProj) {
      alert('Please create at least one project first before creating a purchase request.');
      return;
    }
    const winnerQuote = quotes[selectedWinnerIndex] || quotes[0];
    const winningAmount = parseFloat(winnerQuote.quotedAmountTHB) || 0;
    const winningLeadTime = parseInt(winnerQuote.leadTimeDays) || 15;

    const supplierQuotations: SupplierQuotation[] = quotes.map((q, idx) => ({
      id: `q-${Date.now()}-${idx}`,
      supplierName: q.supplierName.trim() || `ซัพพลายเออร์รายที่ ${idx + 1}`,
      contactPerson: q.contactPerson.trim() || undefined,
      phone: q.phone.trim() || undefined,
      quotedAmountTHB: parseFloat(q.quotedAmountTHB) || 0,
      vatIncluded: q.vatIncluded,
      leadTimeDays: parseInt(q.leadTimeDays) || 15,
      highlights: q.highlights.trim() || 'เงื่อนไขเสนอราคาปกติ',
      fileUrl: '#',
      fileName: q.fileName || `Quotation_${idx + 1}.pdf`,
      isSelected: idx === selectedWinnerIndex,
      selectionReason: idx === selectedWinnerIndex ? selectionReason : undefined,
    }));

    const prNum = prNumber.trim() || `PR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const finalPoNum = poNumber.trim() || (status === 'PO Issued' ? `PO-2026-${Math.floor(100 + Math.random() * 900)}` : undefined);

    onCreateProcurement({
      prNumber: prNum,
      poNumber: finalPoNum,
      projectId: selectedProj.id,
      projectName: selectedProj.name,
      projectCode: selectedProj.code,
      title: title.trim(),
      expenseCategory,
      supplierName: winnerQuote.supplierName.trim() || 'ซัพพลายเออร์ที่คัดเลือก',
      supplierContact: winnerQuote.phone.trim() || undefined,
      amountTHB: winningAmount,
      vatIncluded: winnerQuote.vatIncluded,
      procurementStatus: status,
      leadTimeDays: winningLeadTime,
      quotations: supplierQuotations,
      requestedBy: currentUser,
      createdAt: new Date().toISOString().slice(0, 10),
      targetDeliveryDate,
      notes: notes.trim() || undefined,
    });

    onClose();
    // Reset form
    setTitle('');
    setPrNumber('');
    setPoNumber('');
    setNotes('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-medium shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">บันทึกค่าใช้จ่ายโครงการ / ข้อมูลจัดซื้อ (Project Expense & Procurement)</h3>
              <p className="text-xs text-slate-500">
                กรอกข้อมูลเพื่อบันทึกค่าใช้จ่ายในโปรเจกต์ (สำหรับติดตามงบประมาณโครงการ ไม่มีการขออนุมัติในระบบ)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Note Banner */}
          <div className="px-3.5 py-2.5 bg-blue-50/80 border border-blue-200/90 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong>หน้านี้ใช้สำหรับบันทึกค่าใช้จ่ายในโปรเจกต์เท่านั้น</strong> เพื่อติดตามงบประมาณจริงและข้อมูลซัพพลายเออร์ (ไม่มีการขออนุมัติในระบบ)
            </span>
          </div>

          {/* Section 1: Basic Info & Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Project */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                โครงการเป้าหมาย (Target Project) *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Expense Category */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                หมวดหมู่งบประมาณ (Expense Category) *
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item Title */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              รายการจัดซื้อจัดจ้าง (Item Description) *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ค่า Paper Sleeve Makro Capsule pack3 : 2609PQKT000081, พิมพ์กล่องลูกฟูก Carton"
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>

          {/* Reference Numbers, Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* PR Number */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                เลขที่ PR (PR Number)
              </label>
              <input
                type="text"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
                placeholder="เช่น 2609PQKT000081 หรือ PR-001"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                เลขที่ PO (PO Number - ถ้ามี)
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="เช่น PO-2026-001"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                สถานะ (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcurementStatus)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              >
                <option value="PO Issued">PO Issued (ได้รับเลข PO แล้ว)</option>
                <option value="PR Pending Approval">PR Recorded (บันทึกเลข PR แล้ว)</option>
                <option value="Delivered">Delivered (ตรวจรับสินค้าแล้ว)</option>
                <option value="Awaiting Quotes">Awaiting Quotes (กำลังรอใบเสนอราคา)</option>
                <option value="Draft">Draft (แบบร่าง)</option>
              </select>
            </div>

            {/* Target Delivery Date */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
                วันที่ต้องการรับสินค้า
              </label>
              <input
                type="date"
                required
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>
          </div>

          {/* Section 2: Supplier Quotations Comparison (1-3 Suppliers) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>ข้อมูลใบเสนอราคาเปรียบเทียบซัพพลายเออร์ (1-3 เจ้า)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  กรอกราคาและเงื่อนไขของแต่ละเจ้า พร้อมคลิกเลือกซัพพลายเออร์ที่ชนะการคัดเลือก 🏆
                </p>
              </div>

              {quotes.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddQuoteOption}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มเจ้าที่ {quotes.length + 1}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {quotes.map((quote, idx) => {
                const isSelected = selectedWinnerIndex === idx;
                return (
                  <div
                    key={quote.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    {/* Option Header & Selection Radio */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="selectedWinner"
                          checked={isSelected}
                          onChange={() => setSelectedWinnerIndex(idx)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className={`text-xs font-semibold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                          ซัพพลายเออร์เจ้าที่ #{idx + 1} {isSelected && '🏆 (คัดเลือกเจ้านี้)'}
                        </span>
                      </label>

                      {quotes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuoteOption(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 text-xs transition-colors cursor-pointer"
                          title="ลบตัวเลือกนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Supplier Name */}
                      <div className="sm:col-span-1">
                        <label className="block text-[10.5px] font-medium text-slate-600 mb-0.5">
                          ชื่อบริษัทซัพพลายเออร์ *
                        </label>
                        <input
                          type="text"
                          required
                          value={quote.supplierName}
                          onChange={(e) => handleUpdateQuote(idx, 'supplierName', e.target.value)}
                          placeholder="เช่น บจก. สยามบรรจุภัณฑ์"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                        />
                      </div>

                      {/* Quoted Amount & VAT */}
                      <div>
                        <label className="block text-[10.5px] font-medium text-slate-600 mb-0.5">
                          ราคาเสนอ (บาท THB) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min={0}
                            step="any"
                            value={quote.quotedAmountTHB}
                            onChange={(e) => handleUpdateQuote(idx, 'quotedAmountTHB', e.target.value)}
                            placeholder="เช่น 1134.40 หรือ 850000"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                          />
                        </div>
                        <label className="inline-flex items-center gap-1.5 mt-1 text-[10.5px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={quote.vatIncluded}
                            onChange={(e) => handleUpdateQuote(idx, 'vatIncluded', e.target.checked)}
                            className="rounded text-indigo-600 w-3 h-3 cursor-pointer"
                          />
                          <span>รวม VAT 7% แล้ว</span>
                        </label>
                      </div>

                      {/* Lead Time */}
                      <div>
                        <label className="block text-[10.5px] font-medium text-slate-600 mb-0.5">
                          ระยะเวลาผลิต (Lead Time วัน)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={quote.leadTimeDays}
                          onChange={(e) => handleUpdateQuote(idx, 'leadTimeDays', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                        />
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mt-2.5">
                      <label className="block text-[10.5px] font-medium text-slate-600 mb-0.5">
                        จุดเด่น / เงื่อนไขใบเสนอราคา
                      </label>
                      <input
                        type="text"
                        value={quote.highlights}
                        onChange={(e) => handleUpdateQuote(idx, 'highlights', e.target.value)}
                        placeholder="เช่น สเปกตรงตามมาตรฐาน UCC Japan, มีบริการจัดส่งถึงที่"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection Reason Input */}
            <div className="mt-3.5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
              <label className="block text-xs font-medium text-amber-950 mb-1">
                เหตุผลในการคัดเลือก / บันทึกราคา (Selection Rationale / Note)
              </label>
              <input
                type="text"
                value={selectionReason}
                onChange={(e) => setSelectionReason(e.target.value)}
                placeholder="ระบุเหตุผลในการตัดสินใจเลือกหรือเงื่อนไขราคา เช่น ราคาและคุณภาพตรงตามมาตรฐาน หรือซัพพลายเออร์เจ้าประจำ"
                className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-700 mb-1">
              หมายเหตุเพิ่มเติม (Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกรายละเอียดเพิ่มเติมเกี่ยวกับค่าใช้จ่ายนี้ (ถ้ามี)..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกค่าใช้จ่าย (Save Expense Record)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
