import React from 'react';
import { 
  X, 
  Sparkles, 
  FolderKanban, 
  Plus, 
  CalendarRange, 
  Table2, 
  UserCheck, 
  Presentation, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  Flag, 
  Layers, 
  Search,
  ArrowRight,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProjectModal?: () => void;
  onOpenNewTaskModal?: () => void;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenNewProjectModal,
  onOpenNewTaskModal,
}) => {
  if (!isOpen) return null;

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
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">แนะนำวิธีใช้งานระบบ (Quick Guide)</h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  30 วินาทีเข้าใจทันที
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ระบบจัดการงาน B2C Project &amp; Task Tracking — ใช้งานง่าย ไม่ต้องเปิดคู่มือ
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: 3-Step Simple Workflow */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>3 ขั้นตอนเริ่มต้นทำงาน (Simple 3-Step Flow)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                      ขั้นตอนที่ 1
                    </span>
                    <FolderKanban className="w-4 h-4 text-amber-600" />
                  </div>
                  <h5 className="text-xs font-medium text-slate-900 mb-1">
                    เลือกหรือสร้างโปรเจกต์
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    คลิกเลือกโครงการจากเมนูด้านซ้าย หรือกดปุ่ม <strong>"+ Create Project"</strong> เพื่อเปิดโครงการใหม่ (เช่น สินค้าใหม่ NPD, แคมเปญ, ออกบูธ)
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-amber-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewProjectModal?.();
                    }}
                    className="w-full text-center text-[11px] font-medium text-amber-800 hover:text-amber-900 bg-white hover:bg-amber-100/50 py-1.5 rounded-lg border border-amber-300 transition-colors shadow-2xs"
                  >
                    + สร้างโปรเจกต์ใหม่
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-900">
                      ขั้นตอนที่ 2
                    </span>
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h5 className="text-xs font-medium text-slate-900 mb-1">
                    เพิ่มงาน &amp; แนบเอกสาร
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    กดปุ่ม <strong>"+ Add Task"</strong> เพื่อเพิ่มขั้นตอน ระบุผู้รับผิดชอบ และแนบไฟล์เอกสาร เช่น <strong>ใบเสนอราคา, เอกสาร PR, หรือบรีฟสินค้า</strong>
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-indigo-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewTaskModal?.();
                    }}
                    className="w-full text-center text-[11px] font-medium text-indigo-800 hover:text-indigo-900 bg-white hover:bg-indigo-100/50 py-1.5 rounded-lg border border-indigo-300 transition-colors shadow-2xs"
                  >
                    + เพิ่มงานในโปรเจกต์
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                      ขั้นตอนที่ 3
                    </span>
                    <CalendarRange className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h5 className="text-xs font-medium text-slate-900 mb-1">
                    ติดตาม &amp; อัปเดตสถานะ
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ดูไทม์ไลน์รายสัปดาห์ใน <strong>Gantt Schedule</strong> หรือจัดการรายการใน <strong>Table View</strong> เมื่อทำงานเสร็จเพียงคลิกเปลี่ยนสถานะเป็น <strong>Done</strong>
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-emerald-200/50 flex items-center justify-center gap-1 text-[11px] font-medium text-emerald-700 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ซิงค์ข้อมูลเรียลไทม์ 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: View Explanations */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>แนะนำมุมมองต่างๆ (Which view to use?)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="text-xs font-medium text-slate-900">Gantt Schedule (ไทม์ไลน์ 15 สัปดาห์)</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ตามตาราง UCC Excel จริง (มิ.ย. - ต.ค. 2026) เห็นระยะเวลาแต่ละขั้นตอน พร้อมแถบสีเหลืองแจ้งเตือน Milestone วันสำคัญ
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Table2 className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="text-xs font-medium text-slate-900">Table View (ตารางรวมงาน &amp; แนบไฟล์)</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ตารางดูง่ายสไตล์ Monday.com สามารถเปลี่ยนสถานะได้ในคลิกเดียว และคลิกปุ่ม <strong>[📎 N files]</strong> เพื่อเปิดดูเอกสาร PR หรือสเปก
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Presentation className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="text-xs font-medium text-slate-900">Status Summary (สรุปผู้บริหาร)</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    หน้าต่างสรุปพร้อมภาพอาร์ตเวิร์กสินค้า สเตตัสโครงการ และประเด็นสำคัญ เหมาะสำหรับใช้แคปเจอร์สไลด์นำเสนอในที่ประชุม
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="text-xs font-medium text-slate-900">My Work (งานเฉพาะของฉัน)</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    คัดกรองเฉพาะงานที่ฉันเป็นผู้รับผิดชอบโดยตรง เรียงตามกำหนดส่ง (Due Date) ช่วยให้ไม่พลาดงานด่วนประจำวัน
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Visual Badges & Status Legend */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-600 mb-2.5">
              ความหมายของสัญลักษณ์และสี (Quick Legend)
            </h4>
            <div className="flex flex-wrap gap-2.5 items-center text-xs">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Done (เสร็จสิ้น)</span>
              </span>

              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>In Progress (กำลังดำเนินการ)</span>
              </span>

              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Not Started (ยังไม่เริ่ม)</span>
              </span>

              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-medium">
                <Flag className="w-3.5 h-3.5 text-amber-600" />
                <span>Milestone (จุดหมุดหมายสำคัญ)</span>
              </span>

              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300 font-medium">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                <span>📎 N (มีไฟล์แนบ PR/ใบเสนอราคา)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            * หากต้องการเปิดคู่มือนี้อีกครั้ง สามารถคลิกปุ่ม <strong>"📖 วิธีใช้งาน"</strong> ด้านบนได้ตลอดเวลา
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            เข้าใจแล้ว &bull; เริ่มใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};
