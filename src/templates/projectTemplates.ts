import { Task, Project, User, TaskPriority, TaskStatus, ProjectType } from '../types';
import { formatDate, toISODate } from '../utils/dateUtils';

export interface TemplateTaskDefinition {
  taskName: string;
  phase: string;
  subCategory?: string; // 'Cup', 'Packaging Box', 'Packaging Carton'
  role: string;
  preferredAssigneeRole: string;
  durationDays: number;
  offsetDays: number;
  isMilestone?: boolean;
  priority?: TaskPriority;
  description?: string;
}

/**
 * Standard Process Workflow for NPD Special Set
 * Source: Official UCC Thailand Product Process Sheet (34 Steps)
 * Covers:
 * 1. MKT (Concept, Structure Price, SINO Presentation)
 * 2. AW Packaging (Brief, 1st/2nd Design, Final Design, Carton AW)
 * 3. MKT (ERP MAT Code, Barcode, Tops Mockup, Structure Price to Sale, Product Master)
 * 4. Material Delivery (Cup, Packaging Box, Packaging Carton)
 * 5. Production & Launch (Re-packaging at UCC, Delivery to SINO, On Shelf)
 */
export const NPD_SPECIAL_SET_WORKFLOW: TemplateTaskDefinition[] = [
  // ----------------------------------------------------
  // Section 1: MKT (Concept & Feasibility)
  // ----------------------------------------------------
  {
    taskName: 'Mock up box no AW',
    phase: 'MKT',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 5,
    offsetDays: 0,
    priority: 'High',
    description: 'จัดทำกล่องตัวอย่างเบื้องต้น (ยังไม่มีลาย AW) เพื่อตรวจสอบขนาดและสัดส่วนบรรจุภัณฑ์',
  },
  {
    taskName: 'Quantation from supplier',
    phase: 'MKT',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 6,
    offsetDays: 5,
    priority: 'High',
    description: 'ขอใบเสนอราคาจากซัพพลายเออร์เพื่อคำนวณต้นทุนบรรจุภัณฑ์และค่าจัดพิมพ์',
  },
  {
    taskName: 'Structure Price',
    phase: 'MKT',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 4,
    offsetDays: 11,
    priority: 'High',
    description: 'คำนวณและกำหนดโครงสร้างราคาต้นทุน กำไร และราคาขายส่ง/ขายปลีก',
  },
  {
    taskName: 'Final Concept',
    phase: 'MKT',
    role: 'B2C Senior Marketing Manager',
    preferredAssigneeRole: 'B2C Senior Marketing Manager',
    durationDays: 4,
    offsetDays: 15,
    priority: 'High',
    description: 'สรุปคอนเซปต์สินค้าฉบับสมบูรณ์ พร้อมจุดขาย (USP) สำหรับนำเสนอผู้บริหาร',
  },
  {
    taskName: 'Summit Presentation to SINO',
    phase: 'MKT',
    role: 'General Manager',
    preferredAssigneeRole: 'General Manager',
    durationDays: 5,
    offsetDays: 19,
    priority: 'Urgent',
    description: 'นำเสนอแผนสินค้าชุดของขวัญ Special Set ให้แก่ตัวแทนจำหน่าย SINO',
  },
  {
    taskName: 'Feedback from Customer',
    phase: 'MKT',
    role: 'Senior Marketing Executive',
    preferredAssigneeRole: 'Senior Marketing Executive',
    durationDays: 5,
    offsetDays: 24,
    priority: 'Medium',
    description: 'รวบรวมข้อเสนอแนะและยอดสั่งซื้อล่วงหน้าจากลูกค้าและคู่ค้า',
  },

  // ----------------------------------------------------
  // Section 2: AW Packaging
  // ----------------------------------------------------
  {
    taskName: 'Design Brief',
    phase: 'AW Packaging',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 3,
    offsetDays: 28,
    priority: 'High',
    description: 'บรีฟรายละเอียดงานดีไซน์ Key Visual และอัตลักษณ์ของกล่องชุดของขวัญ',
  },
  {
    taskName: '1st Design',
    phase: 'AW Packaging',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 7,
    offsetDays: 31,
    priority: 'High',
    description: 'ดีไซเนอร์ออกแบบรอบที่ 1 เพื่อตรวจโครงสร้างสีและกราฟิก',
  },
  {
    taskName: '2nd Design',
    phase: 'AW Packaging',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 5,
    offsetDays: 38,
    priority: 'Medium',
    description: 'ปรับปรุงแบบดีไซน์รอบที่ 2 ตามข้อเสนอแนะของทีมการตลาด',
  },
  {
    taskName: 'Feedback to Designer',
    phase: 'AW Packaging',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 3,
    offsetDays: 43,
    priority: 'Medium',
    description: 'คอมเมนต์ตรวจสอบข้อความ ภาษา ข้อกำหนดทางกฎหมาย และโภชนาการ',
  },
  {
    taskName: 'Final Design',
    phase: 'AW Packaging',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 4,
    offsetDays: 46,
    priority: 'Urgent',
    description: 'อนุมัติแบบดีไซน์ขั้นสุดท้าย (Final Artwork) พร้อมส่งโรงพิมพ์',
  },
  {
    taskName: 'Carton AW Brief',
    phase: 'AW Packaging',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 2,
    offsetDays: 50,
    priority: 'Medium',
    description: 'บรีฟลายกล่องลูกฟูกด้านนอก (Master Carton Box)',
  },
  {
    taskName: '1st Design',
    phase: 'AW Packaging',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 4,
    offsetDays: 52,
    priority: 'Medium',
    description: 'ตรวจแบบกล่อง Carton ครั้งที่ 1',
  },
  {
    taskName: 'Final Design',
    phase: 'AW Packaging',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 3,
    offsetDays: 56,
    priority: 'High',
    description: 'อนุมัติแบบกล่อง Carton ขั้นสุดท้าย',
  },

  // ----------------------------------------------------
  // Section 3: MKT (Registration & Operations)
  // ----------------------------------------------------
  {
    taskName: 'Product Register to ERP (MAT Code)',
    phase: 'MKT (Operations)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 5,
    offsetDays: 48,
    priority: 'High',
    description: 'ลงทะเบียนรหัสสินค้า (Material Code) เข้าสู่ระบบ ERP',
  },
  {
    taskName: 'Product Barcode',
    phase: 'MKT (Operations)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 3,
    offsetDays: 53,
    priority: 'Medium',
    description: 'ขอและลงทะเบียนรหัสบาร์โค้ด EAN-13 ของสินค้า',
  },
  {
    taskName: 'Product Mock up (เหมือนจริงส่งให้ TOPS)',
    phase: 'MKT (Operations)',
    role: 'Senior B2C Marketing Executive',
    preferredAssigneeRole: 'Senior B2C Marketing Executive',
    durationDays: 7,
    offsetDays: 56,
    priority: 'Urgent',
    description: 'ผลิตตัวอย่างสินค้ากล่องจริงบรรจุสมบูรณ์ส่งให้ฝ่ายจัดซื้อ TOPS',
  },
  {
    taskName: 'Summit Structure Price & Packshot to Sale',
    phase: 'MKT (Operations)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 4,
    offsetDays: 63,
    priority: 'High',
    description: 'ส่งราคาขายและรูปภาพแพ็กช็อตความละเอียดสูงให้ทีมขาย',
  },
  {
    taskName: 'Product Master',
    phase: 'MKT (Operations)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 3,
    offsetDays: 67,
    priority: 'High',
    description: 'สรุปไฟล์ Product Master ข้อมูลขนาด น้ำหนัก บาร์โค้ด และสเปก',
  },

  // ----------------------------------------------------
  // Section 4: Material delivery (Cup, Packaging Box, Packaging Carton)
  // ----------------------------------------------------
  // --- Cup ---
  {
    taskName: 'Confirm QTY Cup',
    phase: 'Material delivery',
    subCategory: 'Cup',
    role: 'Senior B2C Marketing Executive',
    preferredAssigneeRole: 'Senior B2C Marketing Executive',
    durationDays: 3,
    offsetDays: 50,
    priority: 'High',
    description: 'ยืนยันยอดสั่งผลิตแก้วกาแฟพรีเมียมในเซ็ต',
  },
  {
    taskName: 'Cup Production',
    phase: 'Material delivery',
    subCategory: 'Cup',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 20,
    offsetDays: 53,
    priority: 'High',
    description: 'โรงงานดำเนินการผลิตแก้วกาแฟ',
  },
  {
    taskName: 'Cup delivery',
    phase: 'Material delivery',
    subCategory: 'Cup',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 2,
    offsetDays: 73,
    isMilestone: true, // Yellow milestone
    priority: 'Urgent',
    description: '⭐ จุดส่งมอบสำคัญ: แก้วกาแฟจัดส่งถึงคลังสินค้า UCC',
  },

  // --- Packaging Box ---
  {
    taskName: 'Submit AW Packaging',
    phase: 'Material delivery',
    subCategory: 'Packaging Box',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 2,
    offsetDays: 58,
    priority: 'High',
    description: 'ส่งไฟล์ดราฟท์ Packaging พร้อมบล็อกปั๊มให้โรงพิมพ์',
  },
  {
    taskName: 'Confirm design to supplier (digital proof) 7days',
    phase: 'Material delivery',
    subCategory: 'Packaging Box',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 7,
    offsetDays: 60,
    priority: 'High',
    description: 'ตรวจและเซ็นอนุมัติปรู๊ฟดิจิทัลจากโรงพิมพ์ภายใน 7 วัน',
  },
  {
    taskName: 'On site proof',
    phase: 'Material delivery',
    subCategory: 'Packaging Box',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 3,
    offsetDays: 67,
    priority: 'High',
    description: 'ทีมดีไซน์ตรวจหน้าแท่นพิมพ์จริง (On site proof)',
  },
  {
    taskName: 'Packaging Production',
    phase: 'Material delivery',
    subCategory: 'Packaging Box',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 20,
    offsetDays: 70,
    priority: 'High',
    description: 'โรงพิมพ์ดำเนินการผลิตกล่องและประกอบโครงสร้าง',
  },
  {
    taskName: 'Box : 1 Months',
    phase: 'Material delivery',
    subCategory: 'Packaging Box',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 30,
    offsetDays: 60,
    isMilestone: true, // Yellow milestone
    priority: 'Urgent',
    description: '⭐ จุดส่งมอบสำคัญ: กล่องบรรจุภัณฑ์ผลิตเสร็จและส่งมอบถึงคลัง (Lead time 1 เดือน)',
  },

  // --- Packaging Carton ---
  {
    taskName: 'Submit AW Carton',
    phase: 'Material delivery',
    subCategory: 'Packaging Carton',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 2,
    offsetDays: 59,
    priority: 'High',
    description: 'ส่งไฟล์ Artwork กล่อง Carton ให้โรงงานกล่องลูกฟูก',
  },
  {
    taskName: 'Confirm design to supplier (digital proof) 7days',
    phase: 'Material delivery',
    subCategory: 'Packaging Carton',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 7,
    offsetDays: 61,
    priority: 'High',
    description: 'ตรวจปรู๊ฟกล่อง Carton ภายใน 7 วัน',
  },
  {
    taskName: 'Carton Production',
    phase: 'Material delivery',
    subCategory: 'Packaging Carton',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 20,
    offsetDays: 68,
    priority: 'High',
    description: 'โรงงานผลิตกล่องลังลูกฟูก Carton',
  },
  {
    taskName: 'Carton : 1 Months',
    phase: 'Material delivery',
    subCategory: 'Packaging Carton',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 30,
    offsetDays: 61,
    isMilestone: true, // Yellow milestone
    priority: 'Urgent',
    description: '⭐ จุดส่งมอบสำคัญ: กล่อง Carton จัดส่งถึงคลังสินค้า (Lead time 1 เดือน)',
  },

  // ----------------------------------------------------
  // Section 5: Production & Final Distribution
  // ----------------------------------------------------
  {
    taskName: 'Re-packaging Production at UCC',
    phase: 'Production & Launch',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 10,
    offsetDays: 91,
    priority: 'Urgent',
    description: 'ประกอบเซ็ตบรรจุสินค้ากาแฟ แก้ว และของพรีเมียมลงในกล่อง ณ โรงงาน UCC',
  },
  {
    taskName: 'Delivery to SINO ( 1 m. before on shelf)',
    phase: 'Production & Launch',
    role: 'Senior B2C Marketing Executive',
    preferredAssigneeRole: 'Senior B2C Marketing Executive',
    durationDays: 5,
    offsetDays: 101,
    isMilestone: true, // Yellow milestone
    priority: 'Urgent',
    description: '⭐ จุดส่งมอบสำคัญ: ขนส่งสินค้าไปยังศูนย์กระจายสินค้า SINO (1 เดือนก่อนวางขาย)',
  },
  {
    taskName: 'On Shelf',
    phase: 'Production & Launch',
    role: 'General Manager',
    preferredAssigneeRole: 'General Manager',
    durationDays: 1,
    offsetDays: 106,
    isMilestone: true, // Final Launch Milestone
    priority: 'Urgent',
    description: '🚀 สินค้าวางจำหน่ายบนเชลฟ์ Gourmet Market / TOPS ทั่วประเทศ (Target Launch Date)',
  },
];

/**
 * Standard Process Workflow for NPD New Product with Formula Development (สินค้าใหม่ มีการพัฒนาสูตร)
 * Source: Official UCC Thailand Product Process Sheet (34 Steps)
 * Covers:
 * 1. MKT : Concept (Research DATA, 1st Concept Proposal, present to team)
 * 2. MKT/RD (Confirm final formula)
 * 3. MKT (Design Brief, 1st/2nd Design Proposal, 3rd revision, AP Approvals, Final Thai version)
 * 4. FDA Registration (Submit FDA)
 * 5. Lab Test (Product sample for Client+SINO)
 * 6. MKT (Costing, SRP, ERP MAT Code, Barcode, Product info, Mockup, Sales presentation)
 * 7. Material delivery (Submit AW, Digital proof, Mold development, On site proof, Film, Packaging delivery label ⭐, Box 1 Month)
 * 8. Production & Launch (Production at UCC, Delivery to SINO ⭐, On Shelf ⭐)
 */
export const NPD_NEW_PRODUCT_WORKFLOW: TemplateTaskDefinition[] = [
  // ----------------------------------------------------
  // Section 1: MKT : Concept
  // ----------------------------------------------------
  {
    taskName: 'Research DATA',
    phase: 'MKT : Concept',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 8,
    offsetDays: 0,
    priority: 'High',
    description: 'ศึกษาและวิเคราะห์ข้อมูลตลาด เทรนด์ผู้บริโภค กาแฟ และคู่แข่ง (Market & Consumer Research Data)',
  },
  {
    taskName: '1st Concept Proposal',
    phase: 'MKT : Concept',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 6,
    offsetDays: 8,
    priority: 'High',
    description: 'จัดทำร่างข้อเสนอแนวคิดผลิตภัณฑ์รอบแรก (Product Concept, Positioning & USP)',
  },
  {
    taskName: 'present to team',
    phase: 'MKT : Concept',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'B2C Senior Marketing Manager',
    durationDays: 3,
    offsetDays: 14,
    priority: 'High',
    description: 'นำเสนอคอนเซปต์สินค้าใหม่ต่อทีมการตลาดและทีมผู้บริหารภายใน',
  },

  // ----------------------------------------------------
  // Section 2: MKT/RD
  // ----------------------------------------------------
  {
    taskName: 'Confirm final formula',
    phase: 'MKT/RD',
    role: 'R&D Specialist',
    preferredAssigneeRole: 'R&D Specialist',
    durationDays: 14,
    offsetDays: 17,
    priority: 'Urgent',
    description: 'ทดสอบ Cupping, Sensory Evaluation และยืนยันสูตรกาแฟฉบับสมบูรณ์ (Confirm final formula) ร่วมกับ R&D',
  },

  // ----------------------------------------------------
  // Section 3: MKT (Packaging Design & AP Approvals)
  // ----------------------------------------------------
  {
    taskName: 'Design Brief',
    phase: 'Packaging Design (MKT)',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 4,
    offsetDays: 31,
    priority: 'High',
    description: 'จัดทำบรีฟออกแบบบรรจุภัณฑ์ ไดคัท ข้อมูลฉลาก และ mood & tone ให้กราฟิกดีไซเนอร์',
  },
  {
    taskName: '1st Design Proposal',
    phase: 'Packaging Design (MKT)',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 7,
    offsetDays: 35,
    priority: 'High',
    description: 'ดีไซเนอร์นำเสนอแบบร่างดีไซน์บรรจุภัณฑ์รอบแรก (1st Design Proposal)',
  },
  {
    taskName: 'Present to AP',
    phase: 'Packaging Design (MKT)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 3,
    offsetDays: 42,
    priority: 'High',
    description: 'นำเสนอแบบร่างดีไซน์รอบแรกแก่ทีม UCC Asia Pacific (AP)',
  },
  {
    taskName: 'Feedback to Designer',
    phase: 'Packaging Design (MKT)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 2,
    offsetDays: 45,
    priority: 'Medium',
    description: 'สรุปและส่งต่อคอมเมนต์/ข้อเสนอแนะจาก AP ให้นักออกแบบเพื่อปรับแก้',
  },
  {
    taskName: '2nd Design Proposal',
    phase: 'Packaging Design (MKT)',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 6,
    offsetDays: 47,
    priority: 'High',
    description: 'นำเสนอแบบดีไซน์รอบที่สองหลังปรับแก้ตามข้อเสนอแนะ (2nd Design Proposal)',
  },
  {
    taskName: 'Present to AP',
    phase: 'Packaging Design (MKT)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 3,
    offsetDays: 53,
    priority: 'High',
    description: 'นำเสนอแบบดีไซน์รอบสองต่อทีม UCC Asia Pacific (AP)',
  },
  {
    taskName: 'Feedback to Designer',
    phase: 'Packaging Design (MKT)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 2,
    offsetDays: 56,
    priority: 'Medium',
    description: 'ส่งต่อคอมเมนต์รอบสองจาก AP ให้กราฟิกดีไซเนอร์',
  },
  {
    taskName: '3rd revision',
    phase: 'Packaging Design (MKT)',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 4,
    offsetDays: 58,
    priority: 'High',
    description: 'ปรับแก้งานดีไซน์รอบที่ 3 ตามรายละเอียดขั้นสุดท้าย (3rd revision)',
  },
  {
    taskName: 'Present to AP',
    phase: 'Packaging Design (MKT)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'General Manager',
    durationDays: 3,
    offsetDays: 62,
    priority: 'High',
    description: 'นำเสนอแบบดีไซน์รอบไฟนอลแก่ UCC Asia Pacific (AP)',
  },
  {
    taskName: 'Feedback from AP',
    phase: 'Packaging Design (MKT)',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 2,
    offsetDays: 65,
    priority: 'High',
    description: 'รับผลการอนุมัติและข้อเสนอแนะขั้นสุดท้ายอย่างเป็นทางการจาก AP',
  },
  {
    taskName: 'Final Thai version',
    phase: 'Packaging Design (MKT)',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 4,
    offsetDays: 67,
    priority: 'High',
    description: 'จัดทำ Artwork ฉบับภาษาไทย ตรวจสอบข้อความ ตารางโภชนาการ และข้อมูลกฎหมาย อย.',
  },

  // ----------------------------------------------------
  // Section 4: FDA Registration
  // ----------------------------------------------------
  {
    taskName: 'Submit FDA',
    phase: 'FDA Registration',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 22,
    offsetDays: 71,
    priority: 'Urgent',
    description: 'ยื่นคำขอขึ้นทะเบียนตำรับอาหารและยา (อย.) กับสำนักงานคณะกรรมการอาหารและยา',
  },

  // ----------------------------------------------------
  // Section 5: Lab Test
  // ----------------------------------------------------
  {
    taskName: 'Product sample for Client+SINO',
    phase: 'Lab Test',
    role: 'R&D Specialist',
    preferredAssigneeRole: 'R&D Specialist',
    durationDays: 9,
    offsetDays: 48,
    priority: 'High',
    description: 'จัดเตรียมตัวอย่างผลิตภัณฑ์สำหรับส่งตรวจแล็บวิเคราะห์ และส่งให้ลูกค้า + SINO ทดสอบ',
  },

  // ----------------------------------------------------
  // Section 6: MKT (Commercialization & Operations)
  // ----------------------------------------------------
  {
    taskName: 'Product costing',
    phase: 'MKT Operations',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 5,
    offsetDays: 71,
    priority: 'High',
    description: 'คำนวณและสรุปต้นทุนการผลิตจริง (COGS, วัตถุดิบ, ฉลาก, บรรจุภัณฑ์ และค่าดำเนินการ)',
  },
  {
    taskName: 'SRP finalization',
    phase: 'MKT Operations',
    role: 'B2C Senior Marketing Manager',
    preferredAssigneeRole: 'B2C Senior Marketing Manager',
    durationDays: 4,
    offsetDays: 76,
    priority: 'High',
    description: 'สรุปราคาขายปลีกแนะนำ (Suggested Retail Price : SRP) และอัตรากำไรขั้นต้น (GP)',
  },
  {
    taskName: 'Product register in ERP (MAT Code)',
    phase: 'MKT Operations',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 5,
    offsetDays: 80,
    priority: 'High',
    description: 'ยื่นขอเปิดรหัสสินค้าใหม่ (MAT Code) ในระบบ ERP เพื่อรองรับการสั่งซื้อและกระจายสินค้า',
  },
  {
    taskName: 'Product/carton barcode',
    phase: 'MKT Operations',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 4,
    offsetDays: 85,
    priority: 'Medium',
    description: 'ขอรหัสบาร์โค้ดสากล (EAN-13) สำหรับตัวสินค้าเดี่ยวและลังบรรจุสินค้า (Carton Barcode)',
  },
  {
    taskName: 'Product info',
    phase: 'MKT Operations',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 4,
    offsetDays: 88,
    priority: 'Medium',
    description: 'จัดทำเอกสารข้อมูลสเปกสินค้า (Product Spec Sheet / Item Master Info)',
  },
  {
    taskName: 'Product mockup / sampling',
    phase: 'MKT Operations',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 6,
    offsetDays: 90,
    priority: 'High',
    description: 'จัดทำตัวอย่างสินค้าและ Mockup เสมือนจริงสำหรับส่งให้ทีมขายและคู่ค้าโมเดิร์นเทรด',
  },
  {
    taskName: 'Presentation for sales team',
    phase: 'MKT Operations',
    role: 'Senior Marketing Executive',
    preferredAssigneeRole: 'Senior Marketing Executive',
    durationDays: 4,
    offsetDays: 94,
    priority: 'Medium',
    description: 'จัดทำ Sales Kit และสไลด์นำเสนอผลิตภัณฑ์เพื่อบรีฟและเตรียมความพร้อมแก่ทีมฝ่ายขาย',
  },

  // ----------------------------------------------------
  // Section 7: Material delivery
  // ----------------------------------------------------
  {
    taskName: 'Submit AW',
    phase: 'Material delivery',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 3,
    offsetDays: 71,
    priority: 'High',
    description: 'ส่งมอบไฟล์ Artwork ฉบับสมบูรณ์ (AI / Die-cut) ให้แก่โรงงานซัพพลายเออร์',
  },
  {
    taskName: 'Confirm design to supplier (digital proof) 7days',
    phase: 'Material delivery',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 7,
    offsetDays: 74,
    priority: 'High',
    description: 'ตรวจสอบและยืนยันแบบ Digital Proof กับซัพพลายเออร์ภายใน 7 วัน',
  },
  {
    taskName: 'Mold development (2weeks)',
    phase: 'Material delivery',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 14,
    offsetDays: 74,
    priority: 'High',
    description: 'ซัพพลายเออร์ดำเนินการพัฒนาและขึ้นรูปแม่พิมพ์บรรจุภัณฑ์ใหม่ (ใช้เวลา 2 สัปดาห์)',
  },
  {
    taskName: 'On site proof',
    phase: 'Material delivery',
    role: 'Graphic Designer',
    preferredAssigneeRole: 'Graphic Designer',
    durationDays: 3,
    offsetDays: 88,
    priority: 'High',
    description: 'ลงพื้นที่ตรวจสอบสีและความคมชัดของงานพิมพ์จริงหน้าแท่นพิมพ์ ณ โรงงานซัพพลายเออร์',
  },
  {
    taskName: 'Film production',
    phase: 'Material delivery',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 14,
    offsetDays: 91,
    priority: 'High',
    description: 'โรงงานดำเนินการผลิตม้วนฟิล์มบรรจุภัณฑ์ / ฉลากฟิล์มสินค้า',
  },
  {
    taskName: 'Packaging delivery (label)',
    phase: 'Material delivery',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 4,
    offsetDays: 105,
    isMilestone: true, // ⭐ Yellow Highlight Milestone in official sheet
    priority: 'Urgent',
    description: '⭐ ส่งมอบฉลากและบรรจุภัณฑ์ (Packaging delivery label) เข้าสู่โรงงานผลิต UCC',
  },
  {
    taskName: 'Box : 1 Month',
    phase: 'Material delivery',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 30,
    offsetDays: 78,
    priority: 'Medium',
    description: 'ระยะเวลาการผลิตและส่งมอบกล่องบรรจุภัณฑ์ภายนอก (ระยะเวลา 1 เดือน)',
  },

  // ----------------------------------------------------
  // Section 8: Production & Launch
  // ----------------------------------------------------
  {
    taskName: 'Production at UCC',
    phase: 'Production & Launch',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'Assistant Product Manager (NPD)',
    durationDays: 8,
    offsetDays: 107,
    priority: 'Urgent',
    description: 'โรงงาน UCC ดำเนินการผลิต บรรจุ และตรวจสอบคุณภาพน้ำกาแฟสูตรใหม่ตามมาตรฐานสากล',
  },
  {
    taskName: 'Delivery to SINO',
    phase: 'Production & Launch',
    role: 'Assistant Product Manager (NPD)',
    preferredAssigneeRole: 'General Manager',
    durationDays: 4,
    offsetDays: 115,
    isMilestone: true, // Key Logistics Milestone
    priority: 'Urgent',
    description: '⭐ จัดส่งสินค้าล็อตแรกไปยังคลังสินค้าของตัวแทนจัดจำหน่าย SINO',
  },
  {
    taskName: 'On Shelf',
    phase: 'Production & Launch',
    role: 'General Manager',
    preferredAssigneeRole: 'General Manager',
    durationDays: 1,
    offsetDays: 120,
    isMilestone: true, // Final Launch Milestone
    priority: 'Urgent',
    description: '🚀 สินค้าใหม่วางจำหน่ายบนเชลฟ์ Gourmet Market / TOPS / ซูเปอร์มาร์เก็ตทั่วประเทศ (Target Launch Date)',
  },
];

export interface ProjectTemplateInfo {
  key: string;
  name: string;
  nameTh: string;
  stepCount: number;
  description: string;
  targetType: ProjectType;
}

export const AVAILABLE_TEMPLATES: ProjectTemplateInfo[] = [
  {
    key: 'npd_new_product',
    name: 'NPD New Product (Formula Development)',
    nameTh: 'NPD สินค้าใหม่ (พัฒนาสูตร 34 ขั้นตอน)',
    stepCount: 34,
    description: 'MKT Concept, R&D Confirm Formula, Design & AP Approval, ยื่น อย., Lab Test, Costing, Mold, Film, Label ⭐, UCC Production, Delivery to SINO, On Shelf',
    targetType: 'NPD (New Formula)',
  },
  {
    key: 'npd_special_set',
    name: 'NPD Special Set (Gift / Bundling)',
    nameTh: 'NPD Special Set (ชุดของขวัญ 34 ขั้นตอน)',
    stepCount: 34,
    description: 'Mock up, Quotation, Structure Price, SINO Presentation, Cup / Box / Carton Delivery, Re-pack UCC, On Shelf',
    targetType: 'NPD (Special Set)',
  },
];

/**
 * Generate full Task objects for a project using an official NPD Template
 */
export function generateTasksForProject(
  project: Project,
  templateKey?: string,
  users: User[] = []
): Task[] {
  // Determine which workflow definition to use
  let selectedWorkflow = NPD_SPECIAL_SET_WORKFLOW;
  let standardTotalDays = 106;

  const isNewProduct = 
    templateKey === 'npd_new_product' ||
    (!templateKey && (project.type === 'New Product' || project.type === 'NPD (New Formula)'));

  if (isNewProduct) {
    selectedWorkflow = NPD_NEW_PRODUCT_WORKFLOW;
    standardTotalDays = 120;
  } else {
    selectedWorkflow = NPD_SPECIAL_SET_WORKFLOW;
    standardTotalDays = 106;
  }

  // 1. Determine timeline start and finish bounds
  let targetDateIso = toISODate(project.targetDate) || toISODate(project.dueDate);
  if (!targetDateIso) {
    const d = new Date();
    d.setDate(d.getDate() + standardTotalDays);
    targetDateIso = d.toISOString().slice(0, 10);
  }

  let startDateIso = toISODate(project.startDate);
  if (!startDateIso) {
    const targetObj = new Date(targetDateIso);
    const startObj = new Date(targetObj);
    startObj.setDate(startObj.getDate() - standardTotalDays);
    startDateIso = startObj.toISOString().slice(0, 10);
  }

  const startBase = new Date(startDateIso);
  const targetBase = new Date(targetDateIso);
  const totalAvailableDays = Math.max(
    Math.round((targetBase.getTime() - startBase.getTime()) / (1000 * 60 * 60 * 24)),
    30
  );

  // Time scale factor if project duration is shorter or longer than standard days
  const timeScale = totalAvailableDays / standardTotalDays;

  // Helper to find best assignee
  const findAssignee = (preferredRole: string): User => {
    const match = users.find(
      (u) =>
        u.role.toLowerCase() === preferredRole.toLowerCase() ||
        u.title.toLowerCase() === preferredRole.toLowerCase()
    );
    if (match) return match;
    return project.lead || users[0];
  };

  const tasks: Task[] = selectedWorkflow.map((def, idx) => {
    // Calculate scaled start date
    const scaledOffset = Math.round(def.offsetDays * timeScale);
    const taskStart = new Date(startBase);
    taskStart.setDate(taskStart.getDate() + scaledOffset);

    // Calculate scaled due date
    const scaledDuration = Math.max(Math.round(def.durationDays * timeScale), 1);
    const taskDue = new Date(taskStart);
    taskDue.setDate(taskDue.getDate() + scaledDuration);

    // If it's the very last milestone 'On Shelf', lock it exactly on targetDate
    if (idx === selectedWorkflow.length - 1) {
      taskDue.setTime(targetBase.getTime());
      taskStart.setTime(targetBase.getTime());
    }

    const startIso = taskStart.toISOString().slice(0, 10);
    const dueIso = taskDue.toISOString().slice(0, 10);

    const assignee = findAssignee(def.preferredAssigneeRole);

    return {
      id: `task-template-${project.id}-${idx + 1}-${Date.now()}`,
      taskName: def.taskName,
      projectId: project.id,
      projectName: project.name,
      projectLead: project.lead,
      assignee,
      role: def.role,
      status: 'Not Started' as TaskStatus,
      priority: def.priority || 'Medium',
      startDate: startIso,
      dueDate: dueIso,
      phase: def.phase,
      durationDays: def.durationDays,
      isMilestone: def.isMilestone || false,
      description: def.description,
    };
  });

  return tasks;
}

