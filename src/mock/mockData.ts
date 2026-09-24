import { Project, Task, User, ProcurementRecord, SupplierQuotation } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Atiseal Termwat',
    nameTh: 'อธิศีล เติมวัฒน์',
    role: 'Senior Marketing Executive',
    department: 'B2C',
    email: 'atiseal.te@ucck2.co.th',
    title: 'Senior Marketing Executive',
    phone: '080-590-9598',
    phoneGs: '-',
    address: 'Head office',
    avatar: '',
    onTimeRate: 94,
    maxCapacity: 7,
    responsibilities: [
      'ดูแลโปรเจกต์งานอีเวนท์และออกบูธ (Event & Exhibition)',
      'Thailand Coffee Fest 2026',
      'PR Media & Communication Plan',
      'Specialty Coffee KOLs & Barista Seeding',
    ],
  },
  {
    id: 'user-2',
    name: 'Peeradet Pongmekin',
    nameTh: 'พีรเดช ผ่องเมฆินทร์',
    role: 'General Manager',
    department: 'B2C',
    email: 'peeradet@ucck2.co.th',
    title: 'General Manager',
    phone: '094-664-3773',
    phoneGs: '239',
    address: 'Head office',
    avatar: '',
    onTimeRate: 98,
    maxCapacity: 10,
    responsibilities: [
      'กำหนดทิศทางกลยุทธ์ B2C Business Direction',
      'เจรจาธุรกิจและอนุมัติ Presentation นำเสนอ SINO',
      'บริหารจัดการงบประมาณและภาพรวมองค์กร',
    ],
  },
  {
    id: 'user-3',
    name: 'Supaluk Laisupasin',
    nameTh: 'ศุภลักษณ์ ใหลศุภสิน',
    role: 'B2C Assistant GM',
    department: 'B2C',
    email: 'supaluk.la@ucck2.co.th',
    title: 'B2C Assistant GM',
    phone: '080-590-9328',
    phoneGs: '721',
    address: 'Head office',
    avatar: '',
    onTimeRate: 96,
    maxCapacity: 9,
    responsibilities: [
      'บริหารจัดการงาน B2C Operations เชิงกลยุทธ์',
      'กำกับดูแลการดำเนินงานระหว่างทีม Marketing, Trade และ R&D',
      'ติดตามและประเมินผล KPI ประจำไตรมาส',
    ],
  },
  {
    id: 'user-4',
    name: 'Suchaya Jittangboonya',
    nameTh: 'สุชญา จิตตั้งบุญญา',
    role: 'B2C Senior Marketing Manager',
    department: 'B2C',
    email: 'suchaya.ji@ucck2.co.th',
    title: 'B2C Senior Marketing Manager',
    phone: '066-068-7744',
    phoneGs: '212',
    address: 'Head office',
    avatar: '',
    onTimeRate: 97,
    maxCapacity: 8,
    responsibilities: [
      'วางกลยุทธ์แคมเปญการตลาด B2C Campaign Strategy',
      'อนุมัติ Final Concept และ Drip Bag Limited Edition',
      'ประสานงานแผนการเปิดตัวผลิตภัณฑ์ระดับประเทศ',
    ],
  },
  {
    id: 'user-5',
    name: 'Tararak Leepraphatsornkul',
    nameTh: 'ธารารักษ์ ลีประภัสสรกุล',
    role: 'Senior B2C Marketing Executive',
    department: 'B2C',
    email: 'tararak.le@ucck2.co.th',
    title: 'Senior B2C Marketing Executive',
    phone: '066-125-8933',
    phoneGs: '212',
    address: 'Head office',
    avatar: '',
    onTimeRate: 93,
    maxCapacity: 7,
    responsibilities: [
      'ดูแลในส่วนของ Trade Marketing',
      'ประสานงานกับ SINO ด้านการกระจายสินค้า & สต็อก',
      'การออกบูธกิจกรรมในห้าง (In-Mall Pop-Up CentralWorld & Tops)',
      'ดูแลในส่วนของการตรวจตลาด (Supermarket Shelf Audit)',
    ],
  },
  {
    id: 'user-6',
    name: 'Ketsarin Setkhum',
    nameTh: 'เกษรินทร์ เศษคำ',
    role: 'Graphic Designer',
    department: 'B2C',
    email: 'ketsarin.se@ucck2.co.th',
    title: 'Graphic Designer',
    phone: '02-018-9999',
    phoneGs: '115',
    address: 'Head office',
    avatar: '',
    onTimeRate: 95,
    maxCapacity: 6,
    responsibilities: [
      'ดูแลงานดีไซน์ AW Packaging ทั้งหมด',
      '3D Render (Can, Cup, Packaging Mockup)',
      'ไดคัทและจัดวางกล่อง Carton / Master Box',
      'สื่อสิ่งพิมพ์ POSM ทั้งหมด (Floor Standee, Wobbler, Catalog)',
      'Backdrop งานอีเวนท์ และป้ายเวทีขนาดใหญ่',
    ],
  },
  {
    id: 'user-7',
    name: 'Wanwisa Chanpraprai',
    nameTh: 'วรรณวิสา ชาญประไพร',
    role: 'Assistant Product Manager (NPD)',
    department: 'B2C',
    email: 'wanwisa.ch@ucck2.co.th',
    title: 'Assistant Product Manager (NPD)',
    phone: '066-125-8903',
    phoneGs: '-',
    address: 'Head office',
    avatar: '',
    onTimeRate: 99,
    maxCapacity: 8,
    responsibilities: [
      'ดูแลงานด้าน NPD (New Product Development) ทั้งหมด',
      'วิจัยและพัฒนาสินค้าใหม่ Ready-to-Drink (RTD Can & Cup)',
      'กำหนดและคำนวณโครงสร้างราคา (Structure Price Calculation)',
      'ประสานงาน R&D ทดสอบสูตรและสเปกบรรจุภัณฑ์',
      'ควบคุมไทม์ไลน์โครงการ NPD สู่การผลิตและขึ้นเชลฟ์ On-Shelf',
    ],
  },
];

// Current logged in user is Wanwisa Chanpraprai (NPD Lead)
export const currentUser: User = mockUsers[6];

// ========================================================
// Blank initial state - Clean workspace with 0 mock data
// ========================================================
export const mockProjects: Project[] = [];

export const mockTasks: Task[] = [];

// Marketing Budget & PR/PO Procurement
export const marketingTotalBudget = 5000000; // ฿5,000,000 Total Annual/H2 B2C Budget

export const mockProcurements: ProcurementRecord[] = [];
