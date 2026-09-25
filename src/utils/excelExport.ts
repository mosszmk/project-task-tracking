import ExcelJS from 'exceljs';
import { Project, Task } from '../types';
import { MonthGroup, WeekSlot, WorkingDayItem } from '../components/views/GanttView';
import { formatDate, calculateWorkingDaysInclusive } from './dateUtils';

interface ExportExcelOptions {
  currentProject: Project;
  phaseGroups: { phase: string; tasks: Task[] }[];
  monthGroups: MonthGroup[];
  allWorkingDays?: WorkingDayItem[];
  timelineSlots?: WeekSlot[];
  calculateBarPosition: (startDateStr: string, dueDateStr: string) => { startCol: number; spanCols: number };
}

// Convert Tailwind/Hex colors to ARGB for ExcelJS
const MONTH_ARGB_PALETTE: { bg: string; fg: string }[] = [
  { bg: '92400E', fg: 'FFFFFF' }, // amber-800
  { bg: 'D97706', fg: 'FFFFFF' }, // amber-600
  { bg: '047857', fg: 'FFFFFF' }, // emerald-700
  { bg: '115E59', fg: 'FFFFFF' }, // teal-800
  { bg: '4338CA', fg: 'FFFFFF' }, // indigo-700
  { bg: '1D4ED8', fg: 'FFFFFF' }, // blue-700
  { bg: '6B21A8', fg: 'FFFFFF' }, // purple-800
  { bg: 'BE123C', fg: 'FFFFFF' }, // rose-700
  { bg: '0E7490', fg: 'FFFFFF' }, // cyan-800
];

const STATUS_EXCEL_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  'Done': { bg: '059669', fg: 'FFFFFF', label: '✔ Done' },
  'Completed': { bg: '059669', fg: 'FFFFFF', label: '✔ Done' },
  'In Progress': { bg: 'F59E0B', fg: 'FFFFFF', label: '⏳ In Progress' },
  'Review': { bg: 'E11D48', fg: 'FFFFFF', label: '🔍 Review' },
  'Designing': { bg: 'D97706', fg: 'FFFFFF', label: '🎨 Designing' },
  'Ready for Graphic': { bg: '7C3AED', fg: 'FFFFFF', label: '📐 Ready for Graphic' },
  'Briefing': { bg: '0284C7', fg: 'FFFFFF', label: '📝 Briefing' },
  'Backlog': { bg: '64748B', fg: 'FFFFFF', label: '📋 Backlog' },
  'Not Started': { bg: '94A3B8', fg: 'FFFFFF', label: '⚪ Not Started' },
};

export async function exportGanttToExcel({
  currentProject,
  phaseGroups,
  monthGroups,
  allWorkingDays = [],
  calculateBarPosition,
}: ExportExcelOptions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'UCC Thailand Task Tracker';
  workbook.created = new Date();

  // Create worksheet with landscape orientation and frozen panes
  const sheet = workbook.addWorksheet('Gantt Schedule', {
    views: [
      {
        state: 'frozen',
        xSplit: 6, // Freeze left 6 columns (No, List Process, Status, Duration, Start Date, Due Date)
        ySplit: 2, // Freeze top 2 rows (Month headers & Day sub-headers)
        showGridLines: true,
      },
    ],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } },
  };

  // Row 1: Month Header & Table Title Row
  const startRow = 1;
  sheet.getRow(startRow).height = 30; // Month Header row
  sheet.getRow(startRow + 1).height = 32; // Columns & Days row

  // Top Left Header Span in Row 1 (Cols 1 to 6)
  sheet.mergeCells(startRow, 1, startRow, 6);
  const leftTopCell = sheet.getCell(startRow, 1);
  const projTitle = currentProject ? currentProject.name.toUpperCase() : 'NO PROJECT SELECTED';
  leftTopCell.value = `PROCESS BREAKDOWN & SCHEDULE (${projTitle})`;
  leftTopCell.font = { name: 'Kanit', size: 10.5, bold: true, color: { argb: '0F172A' } };
  leftTopCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
  leftTopCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  for (let c = 1; c <= 6; c++) {
    sheet.getCell(startRow, c).border = thinBorder;
  }

  // Left Fixed Columns Headers in Row 2
  const leftHeaders = [
    { col: 1, key: 'No', width: 6, label: 'No' },
    { col: 2, key: 'List Process', width: 44, label: 'List Process (ขั้นตอนการทำงาน)' },
    { col: 3, key: 'Status', width: 17, label: 'Status' },
    { col: 4, key: 'Duration', width: 11, label: 'Duration' },
    { col: 5, key: 'Start Date', width: 14, label: 'Start Date' },
    { col: 6, key: 'Due Date', width: 14, label: 'Due Date' },
  ];

  leftHeaders.forEach((h) => {
    sheet.getColumn(h.col).width = h.width;
    const cell = sheet.getCell(startRow + 1, h.col);
    cell.value = h.label;
    cell.font = { name: 'Kanit', size: 10, bold: true, color: { argb: '0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    cell.alignment = { vertical: 'middle', horizontal: h.col === 2 ? 'left' : 'center', wrapText: true };
    cell.border = thinBorder;
  });

  // Dynamic Timeline Columns (Columns 7 onwards)
  let currentTimelineCol = 7;

  monthGroups.forEach((mg, mgIdx) => {
    const palette = MONTH_ARGB_PALETTE[mgIdx % MONTH_ARGB_PALETTE.length];
    const monthStartCol = currentTimelineCol;
    const monthEndCol = currentTimelineCol + mg.workingDays.length - 1;

    // Merge month header across its working days in Row 1
    if (monthEndCol >= monthStartCol) {
      if (monthEndCol > monthStartCol) {
        sheet.mergeCells(startRow, monthStartCol, startRow, monthEndCol);
      }
      for (let c = monthStartCol; c <= monthEndCol; c++) {
        const mc = sheet.getCell(startRow, c);
        mc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.bg } };
        mc.border = thinBorder;
      }
      const mCell = sheet.getCell(startRow, monthStartCol);
      mCell.value = mg.label;
      mCell.font = { name: 'Kanit', size: 11, bold: true, color: { argb: palette.fg } };
      mCell.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    // Days sub-headers in Row 2
    mg.workingDays.forEach((day: WorkingDayItem) => {
      const colIdx = currentTimelineCol;
      sheet.getColumn(colIdx).width = 4.8; // Compact day column width in Excel

      const dCell = sheet.getCell(startRow + 1, colIdx);
      dCell.value = `${day.dayNum}\n${day.dayLetter}`;
      dCell.font = { name: 'Kanit', size: 8, bold: true, color: { argb: '1E293B' } };
      dCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: day.isMonday ? 'EEF2FF' : 'FFFFFF' } };
      dCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      dCell.border = {
        ...thinBorder,
        left: day.isMonday ? { style: 'medium', color: { argb: '94A3B8' } } : thinBorder.left,
      };

      currentTimelineCol++;
    });
  });

  const totalCols = currentTimelineCol - 1;

  // 3. Body Rows: Phases and Tasks starting at startRow + 2 (Row 3)
  let currentRow = startRow + 2;
  let overallTaskNo = 1;

  phaseGroups.forEach((group) => {
    // Phase Header Row
    sheet.getRow(currentRow).height = 26;
    sheet.mergeCells(currentRow, 1, currentRow, 6);
    const phaseCell = sheet.getCell(currentRow, 1);
    phaseCell.value = `❖  ${group.phase.toUpperCase()} (${group.tasks.length} items)`;
    phaseCell.font = { name: 'Kanit', size: 10, bold: true, color: { argb: '1E1B4B' } };
    phaseCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
    phaseCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    for (let c = 1; c <= 6; c++) {
      sheet.getCell(currentRow, c).border = thinBorder;
    }

    // Timeline background for phase row
    for (let c = 7; c <= totalCols; c++) {
      const tc = sheet.getCell(currentRow, c);
      tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      tc.border = thinBorder;
    }

    currentRow++;

    // Tasks in this Phase
    group.tasks.forEach((task) => {
      const r = sheet.getRow(currentRow);
      r.height = 28;

      const isMilestone = task.isMilestone;
      const rowBg = isMilestone ? 'FEF3C7' : 'FFFFFF'; // Yellow highlight for milestone, white for standard

      // Col 1: No
      const noCell = sheet.getCell(currentRow, 1);
      noCell.value = overallTaskNo++;
      noCell.font = { name: 'Kanit', size: 9.5, bold: true, color: { argb: isMilestone ? '78350F' : '475569' } };
      noCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      noCell.alignment = { vertical: 'middle', horizontal: 'center' };
      noCell.border = thinBorder;

      // Col 2: List Process
      const nameCell = sheet.getCell(currentRow, 2);
      nameCell.value = isMilestone ? `★ ${task.taskName}` : task.taskName;
      nameCell.font = { name: 'Kanit', size: 10, bold: isMilestone, color: { argb: isMilestone ? '78350F' : '0F172A' } };
      nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      nameCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
      nameCell.border = thinBorder;

      // Col 3: Status
      const statusStyle = STATUS_EXCEL_STYLE[task.status] || STATUS_EXCEL_STYLE['Not Started'];
      const stCell = sheet.getCell(currentRow, 3);
      stCell.value = statusStyle.label;
      stCell.font = { name: 'Kanit', size: 9, bold: true, color: { argb: statusStyle.fg } };
      stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusStyle.bg } };
      stCell.alignment = { vertical: 'middle', horizontal: 'center' };
      stCell.border = thinBorder;

      // Col 4: Duration
      const effectiveDuration = (task.startDate && task.dueDate)
        ? calculateWorkingDaysInclusive(task.startDate, task.dueDate)
        : (task.durationDays || 1);
      const durCell = sheet.getCell(currentRow, 4);
      durCell.value = `${effectiveDuration} d`;
      durCell.font = { name: 'Kanit', size: 9.5, bold: true, color: { argb: isMilestone ? '78350F' : '334155' } };
      durCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      durCell.alignment = { vertical: 'middle', horizontal: 'center' };
      durCell.border = thinBorder;

      // Col 5: Start Date
      const sdCell = sheet.getCell(currentRow, 5);
      sdCell.value = task.startDate ? formatDate(task.startDate) : '-';
      sdCell.font = { name: 'Kanit', size: 9, color: { argb: isMilestone ? '78350F' : '334155' } };
      sdCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      sdCell.alignment = { vertical: 'middle', horizontal: 'center' };
      sdCell.border = thinBorder;

      // Col 6: Due Date
      const ddCell = sheet.getCell(currentRow, 6);
      ddCell.value = task.dueDate ? formatDate(task.dueDate) : '-';
      ddCell.font = { name: 'Kanit', size: 9, bold: true, color: { argb: isMilestone ? '78350F' : '0F172A' } };
      ddCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      ddCell.alignment = { vertical: 'middle', horizontal: 'center' };
      ddCell.border = thinBorder;

      // Timeline Grid Cells (Col 7 onwards)
      const { startCol, spanCols } = calculateBarPosition(task.startDate, task.dueDate);
      const barStartCol = 6 + startCol;
      const barEndCol = Math.min(totalCols, barStartCol + spanCols - 1);

      for (let c = 7; c <= totalCols; c++) {
        const cell = sheet.getCell(currentRow, c);
        cell.border = thinBorder;

        if (c < barStartCol || c > barEndCol) {
          // Empty cell outside bar (milestone row gets warm yellow highlight)
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isMilestone ? 'FFFBEB' : (c % 2 === 0 ? 'FAFAFA' : 'FFFFFF') }
          };
        }
      }

      // If bar is within bounds, merge & paint Gantt Bar with full solid fill
      if (barStartCol <= totalCols && barEndCol >= 7) {
        const actualStart = Math.max(7, barStartCol);
        const actualEnd = Math.min(totalCols, barEndCol);

        if (actualEnd > actualStart) {
          sheet.mergeCells(currentRow, actualStart, currentRow, actualEnd);
        }

        const barSpan = actualEnd - actualStart + 1;
        const barFillColor = isMilestone ? 'FBBF24' : '2563EB'; // Golden Amber vs Royal Blue
        const barBorderColor = isMilestone ? 'D97706' : '1D4ED8';

        // Apply solid fill and borders to all cells in the bar span to guarantee clean render in Excel
        for (let c = actualStart; c <= actualEnd; c++) {
          const cCell = sheet.getCell(currentRow, c);
          cCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: barFillColor },
          };
          cCell.border = {
            top: { style: 'medium', color: { argb: barBorderColor } },
            bottom: { style: 'medium', color: { argb: barBorderColor } },
            left: c === actualStart ? { style: 'medium', color: { argb: barBorderColor } } : thinBorder.left,
            right: c === actualEnd ? { style: 'medium', color: { argb: barBorderColor } } : thinBorder.right,
          };
        }

        const barCell = sheet.getCell(currentRow, actualStart);
        if (barSpan === 1) {
          barCell.value = isMilestone ? '★' : `${effectiveDuration}d`;
        } else if (barSpan === 2) {
          barCell.value = `${effectiveDuration}d`;
        } else {
          barCell.value = `${task.taskName}  (${effectiveDuration}d)`;
        }
        
        barCell.font = {
          name: 'Kanit',
          size: 9,
          bold: true,
          color: { argb: isMilestone ? '78350F' : 'FFFFFF' },
        };
        barCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      }

      currentRow++;
    });
  });

  // 4. Legend & Summary Footer Row at the bottom
  sheet.getRow(currentRow).height = 24;
  sheet.mergeCells(currentRow, 1, currentRow, 6);
  const legendLeft = sheet.getCell(currentRow, 1);
  legendLeft.value = `■ Standard Process Bar (น้ำเงิน)        ■ Yellow Milestone (จุดส่งมอบสำคัญ)`;
  legendLeft.font = { name: 'Kanit', size: 9.5, bold: true, color: { argb: '334155' } };
  legendLeft.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
  legendLeft.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  for (let c = 1; c <= 6; c++) {
    sheet.getCell(currentRow, c).border = thinBorder;
  }

  if (totalCols >= 7) {
    sheet.mergeCells(currentRow, 7, currentRow, totalCols);
    const legendRight = sheet.getCell(currentRow, 7);
    legendRight.value = `* ปรับเฉพาะวันทำงาน จันทร์ - ศุกร์ (เว้นเสาร์-อาทิตย์)   |   UCC Thailand Production Pipeline`;
    legendRight.font = { name: 'Kanit', size: 8.5, italic: true, color: { argb: '64748B' } };
    legendRight.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    legendRight.alignment = { vertical: 'middle', horizontal: 'right' };
    for (let c = 7; c <= totalCols; c++) {
      sheet.getCell(currentRow, c).border = thinBorder;
    }
  }

  // Generate Excel buffer and trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeProjectName = currentProject.name.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_');
  link.download = `UCC_Gantt_Timeline_${safeProjectName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
