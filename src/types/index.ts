export type TaskStatus = 
  | 'Backlog' 
  | 'Briefing' 
  | 'Ready for Graphic' 
  | 'Designing' 
  | 'Review' 
  | 'Completed'
  | 'Done'
  | 'In Progress'
  | 'Not Started';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type UserRole = 
  | 'Assistant Product Manager (NPD)'
  | 'Assistant Product Manager'
  | 'Graphic Designer'
  | 'Senior Marketing Executive'
  | 'General Manager'
  | 'B2C Assistant GM'
  | 'B2C Senior Marketing Manager'
  | 'Senior B2C Marketing Executive'
  | 'Marketer'
  | 'Event Coordinator'
  | 'Brand Manager'
  | 'R&D Specialist'
  | string;

export type Department = 'B2C' | 'Marketing' | 'Design' | 'Brand' | 'Event & Trade' | 'R&D' | string;

export interface User {
  id: string;
  name: string;          // EN Name e.g. Wanwisa Chanpraprai
  nameTh?: string;        // TH Name e.g. วรรณวิสา ชาญประไพร
  avatar: string;
  role: string;
  department: Department;
  email: string;
  title: string;
  phone?: string;
  phoneGs?: string;
  address?: string;
  onTimeRate: number;     // e.g. 96 (%)
  maxCapacity: number;    // e.g. 8 tasks
  responsibilities?: string[]; // Specific focus areas & duties
}

export interface GraphicSpecs {
  format: '1:1 Square' | '16:9 Banner' | '9:16 Story/Reels' | '4:5 Portrait' | 'Event Backdrop' | 'Standee' | 'Flyer/Leaflet' | 'Custom';
  dimensions?: string;
  briefUrl?: string;
  moodboardUrl?: string;
  notes?: string;
}

export type TaskAttachmentCategory = 
  | 'pr_quotation'      // เอกสาร PR, ใบเสนอราคา (Quotation), PO
  | 'brief_specs'       // บรีฟงาน, สเปกสินค้า, Packaging Drawing, Technical Specs
  | 'approval_reports'  // ผลทดสอบ, ใบอนุมัติ, รายงานตรวจรับ (Shelf Audit, Test Report)
  | 'general';          // เอกสารทั่วไป

export interface TaskAttachment {
  id: string;
  name: string;
  category: TaskAttachmentCategory;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  fileType: 'pdf' | 'excel' | 'word' | 'image' | 'ai' | 'other';
}

export interface Task {
  id: string;
  taskName: string;
  projectId: string;
  projectName: string;
  projectLead: User;
  assignee: User;
  role: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  phase?: string;          // e.g. 'MKT', 'AW Packaging', 'Material delivery', 'Booth Design & 3D'
  durationDays?: number;   // e.g. 45, 30, 7 days
  isMilestone?: boolean;   // true for yellow highlighted milestone rows
  graphicSpecs?: GraphicSpecs;
  attachments?: TaskAttachment[];
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export type ProjectType = 
  | 'Packaging' 
  | 'New Product' 
  | 'Event & Exhibition' 
  | 'Creative & Graphic' 
  | 'POSM' 
  | 'Campaign' 
  | 'Branding';

export type ProjectSummaryStatus = 'On Track' | 'In Progress' | 'Planning' | 'At Risk' | 'Completed';

export interface ArtworkInfo {
  type: 'single' | 'before_after' | 'dual';
  primaryUrl: string;
  secondaryUrl?: string;
  labelPrimary?: string;
  labelSecondary?: string;
  aspectRatio?: string;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  category: 'brief_specs' | 'design_drafts' | 'final_production';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  fileType: 'pdf' | 'ai' | 'figma' | 'image' | 'doc';
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  lead: User;
  dueDate: string;
  category: string;
  type: ProjectType;
  department: Department;
  summaryStatus: ProjectSummaryStatus;
  statusNotes: string[];
  targetDate: string;
  artwork?: ArtworkInfo;
  attachments: ProjectAttachment[];
  budgetAllocated?: number; // Optional allocated budget for this project (THB)
}

// ==========================================
// Marketing Budget & PR/PO Procurement Types
// ==========================================

export type ExpenseCategory = 
  | 'Packaging Production' // ผลิตแพ็กเกจจิ้ง / Can Sleeve / กล่องลูกฟูก Carton
  | 'Media & Ads'          // ยิงแอด / โฆษณาออนไลน์ (Facebook, IG, TikTok)
  | 'Influencer & KOL'     // ค่าตัว Influencer / Barista KOL
  | 'Booth & Space Rental' // ค่าเช่าพื้นที่จัดงาน / โครงสร้างบูธ 3D
  | 'POSM & Printing'      // สื่อสิ่งพิมพ์ ณ จุดขาย (Tent card, Wobbler, Standee)
  | 'Agency & Production'  // ค่าโปรดักชันสตูดิโอ / เอเจนซี่
  | 'Logistics & Transport'// ค่าขนส่ง / กระจายสินค้าไปศูนย์ Sino
  | 'Other';               // อื่นๆ

export type ProcurementStatus = 
  | 'Draft'                 // ร่างขอซื้อ (ยังไม่ส่ง)
  | 'Awaiting Quotes'       // รอใบเสนอราคาครบ 2-3 เจ้า
  | 'PR Pending Approval'   // ยื่น PR แล้ว รอผู้บริหารอนุมัติ
  | 'PO Issued'             // ออกใบสั่งซื้อ (PO) เรียบร้อยแล้ว
  | 'Delivered';            // ซัพพลายเออร์ส่งมอบของ/ตรวจรับเรียบร้อย

export interface SupplierQuotation {
  id: string;
  supplierName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  quotedAmountTHB: number;
  vatIncluded: boolean;      // true = รวม VAT 7%, false = ยังไม่รวม VAT
  leadTimeDays: number;      // ระยะเวลาผลิต (วัน)
  highlights: string;        // จุดเด่น / เงื่อนไข เช่น "สเปกสีตรงตามมาตรฐาน UCC", "ราคาถูกที่สุดแต่ Lead Time นาน"
  fileUrl?: string;          // PDF URL
  fileName?: string;
  fileSize?: string;
  isSelected: boolean;       // ซัพพลายเออร์ที่ผ่านการคัดเลือก
  selectionReason?: string;  // เหตุผลในการคัดเลือก
}

export interface ProcurementRecord {
  id: string;
  prNumber: string;          // e.g. "PR-2026-015"
  poNumber?: string;         // e.g. "PO-2026-042" (เมื่อได้รับอนุมัติออก PO แล้ว)
  projectId: string;         // ผูกกับ Project 1 โครงการ (One-to-Many)
  projectName: string;
  projectCode?: string;
  title: string;             // ชื่องานจัดซื้อ เช่น "พิมพ์ Can Sleeve & กล่องลูกฟูก Carton 280ml"
  expenseCategory: ExpenseCategory;
  supplierName: string;      // ชื่อซัพพลายเออร์ที่เลือก
  supplierContact?: string;  // เบอร์ติดต่อ / ผู้ประสานงาน
  amountTHB: number;         // ยอดเงินสุทธิตามเจ้าที่เลือก (THB)
  vatIncluded: boolean;
  procurementStatus: ProcurementStatus;
  leadTimeDays: number;      // ระยะเวลาผลิตของซัพพลายเออร์ (วัน)
  quotations: SupplierQuotation[]; // รองรับการเปรียบเทียบ 2-3 เจ้า
  requestedBy: User;
  createdAt: string;
  targetDeliveryDate?: string; // วันที่ต้องการของหน้างาน
  notes?: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'gantt' 
  | 'table' 
  | 'summary' 
  | 'my-work' 
  | 'graphic-queue'
  | 'workload' 
  | 'kanban' 
  | 'budget';

export type QuickFilterType = 'all' | 'my-tasks' | 'graphic-design';
