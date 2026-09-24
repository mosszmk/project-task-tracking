import React from 'react';
import { ProcurementRecord, SupplierQuotation, ProcurementStatus } from '../../types';
import { 
  X, 
  Trophy, 
  Download, 
  FileText, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Calendar,
  AlertCircle,
  Tag
} from 'lucide-react';

interface QuotationComparisonModalProps {
  procurement: ProcurementRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectWinner?: (quotationId: string, reason: string) => void;
  onUpdateStatus?: (newStatus: ProcurementStatus) => void;
}

export const QuotationComparisonModal: React.FC<QuotationComparisonModalProps> = ({
  procurement,
  isOpen,
  onClose,
  onSelectWinner,
  onUpdateStatus,
}) => {
  if (!isOpen || !procurement) return null;

  const quotations = procurement.quotations || [];
  const selectedQuote = quotations.find((q) => q.isSelected) || quotations[0];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-white">
                  {procurement.prNumber}
                </span>
                {procurement.poNumber && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {procurement.poNumber}
                  </span>
                )}
                <span className="text-xs font-medium text-slate-500">
                  &bull; โครงการ: <strong className="text-slate-800 font-semibold">{procurement.projectName}</strong>
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                เปรียบเทียบใบเสนอราคาซัพพลายเออร์: {procurement.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Summary Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">หมวดหมู่งบประมาณ</span>
                <p className="font-semibold text-indigo-700">{procurement.expenseCategory}</p>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[11px] text-slate-400 font-medium">สถานะจัดซื้อ</span>
                <p className="font-semibold text-slate-800">{procurement.procurementStatus}</p>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[11px] text-slate-400 font-medium">จำนวนซัพพลายเออร์ที่เทียบ</span>
                <p className="font-semibold text-slate-800">{quotations.length} บริษัท</p>
              </div>
            </div>

            {selectedQuote && (
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium">ยอดจัดซื้อที่คัดเลือก (สุทธิ)</span>
                <p className="text-lg font-semibold text-emerald-700">
                  {formatMoney(selectedQuote.quotedAmountTHB)}
                  <span className="text-xs font-normal text-slate-500 ml-1.5">
                    ({selectedQuote.vatIncluded ? 'รวม VAT 7%' : 'ยังไม่รวม VAT'})
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Quotations Comparison Cards Grid (Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quotations.map((quote, idx) => {
              const isWinner = quote.isSelected;
              return (
                <div
                  key={quote.id || idx}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isWinner
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Top Badge */}
                  {isWinner ? (
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 fill-white" />
                        <span>🏆 ผู้ชนะการคัดเลือก (Selected)</span>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-700/60 px-1.5 py-0.2 rounded">
                        Option #{idx + 1}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-100 text-slate-600 px-3 py-1.5 text-xs font-medium flex items-center justify-between">
                      <span>ตัวเลือกเสนอราคา #{idx + 1}</span>
                      <span className="text-[10px] font-mono text-slate-400">Option #{idx + 1}</span>
                    </div>
                  )}

                  <div className="p-4 space-y-3.5 flex-1">
                    {/* Supplier Name & Contact */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug flex items-start gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{quote.supplierName}</span>
                      </h4>
                      {quote.contactPerson && (
                        <p className="text-[11px] text-slate-500 mt-1 pl-5">
                          ผู้ติดต่อ: <span className="font-semibold text-slate-700">{quote.contactPerson}</span>
                        </p>
                      )}
                      {quote.phone && (
                        <p className="text-[11px] text-slate-500 pl-5 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{quote.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Price Tag */}
                    <div className={`p-3 rounded-xl border ${isWinner ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        ราคาเสนอ (Quoted Price)
                      </span>
                      <div className="text-xl font-semibold text-slate-900 mt-0.5">
                        {formatMoney(quote.quotedAmountTHB)}
                      </div>
                      <span className={`inline-block text-[10px] font-medium mt-0.5 px-1.5 py-0.2 rounded ${
                        quote.vatIncluded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {quote.vatIncluded ? '✓ รวม VAT 7% แล้ว' : 'ยังไม่รวม VAT (+7%)'}
                      </span>
                    </div>

                    {/* Lead Time */}
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> ระยะเวลาผลิต (Lead Time)
                      </span>
                      <span className="font-semibold text-slate-900">{quote.leadTimeDays} วันทำการ</span>
                    </div>

                    {/* Highlights & Pros/Cons */}
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        จุดเด่น / เงื่อนไขใบเสนอราคา
                      </span>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                        {quote.highlights || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </p>
                    </div>

                    {/* Winner Selection Rationale */}
                    {isWinner && quote.selectionReason && (
                      <div className="p-2.5 bg-amber-50/90 border border-amber-300 rounded-xl">
                        <span className="text-[11px] font-medium text-amber-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          เหตุผลในการคัดเลือก (Rationale):
                        </span>
                        <p className="text-[11.5px] text-amber-800 mt-1 leading-relaxed">
                          {quote.selectionReason}
                        </p>
                      </div>
                    )}

                    {/* Change Winner Action */}
                    {!isWinner && onSelectWinner && (
                      <button
                        type="button"
                        onClick={() => {
                          const reason = prompt(`ระบุเหตุผลในการคัดเลือก ${quote.supplierName} เป็นผู้ชนะ:`, 'ราคาและเงื่อนไขคุ้มค่าตรงตามงบประมาณ');
                          if (reason) {
                            onSelectWinner(quote.id, reason);
                          }
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg border border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>เลือกเจ้านี้เป็นผู้ชนะ (Select Winner)</span>
                      </button>
                    )}
                  </div>

                  {/* Card Bottom: Download PDF Button */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <FileText className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="text-[10px] text-slate-600 font-mono truncate">
                        {quote.fileName || `Quotation_${quote.supplierName.slice(0, 10)}.pdf`}
                      </span>
                    </div>

                    <a
                      href={quote.fileUrl || '#'}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`กำลังเปิดดูเอกสารใบเสนอราคา: ${quote.fileName || 'Quotation.pdf'}`);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-medium shadow-2xs transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ผ่านการตรวจสอบความถูกต้องโดยฝ่ายจัดซื้อ &bull; อนุมัติตามระเบียบจัดซื้อ UCC</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
