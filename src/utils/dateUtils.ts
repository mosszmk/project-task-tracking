/**
 * Formats date string (e.g. "2026-04-25" or "2026-06-15") into "25 Apr 2026" format
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  
  const trimmed = dateStr.trim();
  
  // If date is in ISO YYYY-MM-DD format
  const parts = trimmed.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }
  
  // If already like "25 Apr 2026" or "15 Nov 2026"
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Try fallback Date parse
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  
  return trimmed;
};

/**
 * Converts any date format ("2026-10-18", "18 Oct 2026", "2026/10/18", etc.)
 * into standard "YYYY-MM-DD" suitable for <input type="date">
 */
export const toISODate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Format like "18 Oct 2026" or "18 October 2026"
  const textMonthMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (textMonthMatch) {
    const day = textMonthMatch[1].padStart(2, '0');
    const monthStr = textMonthMatch[2].toLowerCase().slice(0, 3);
    const year = textMonthMatch[3];
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    if (monthMap[monthStr]) {
      return `${year}-${monthMap[monthStr]}-${day}`;
    }
  }

  // Fallback to Date parser
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
};

/**
 * Formats a date range into "15 Jun 2026 – 20 Jun 2026"
 */
export const formatDateRange = (start?: string | null, end?: string | null): string => {
  if (!start && !end) return '—';
  if (start && !end) return formatDate(start);
  if (!start && end) return formatDate(end);
  return `${formatDate(start)} – ${formatDate(end)}`;
};

/**
 * Calculates the inclusive number of working days (Mon-Fri) between two dates.
 * e.g., 2026-09-21 to 2026-09-21 = 1 day (same day)
 *       2026-09-21 to 2026-09-22 = 2 days (Monday & Tuesday)
 *       2026-09-21 to 2026-09-25 = 5 days (Mon to Fri)
 */
export const calculateWorkingDaysInclusive = (startDateStr?: string | null, dueDateStr?: string | null): number => {
  const startIso = toISODate(startDateStr);
  const dueIso = toISODate(dueDateStr) || startIso;
  if (!startIso || !dueIso) return 1;

  if (startIso > dueIso) return 1;

  let count = 0;
  const cur = new Date(startIso);
  const end = new Date(dueIso);

  while (cur <= end) {
    const dow = cur.getDay(); // 0 Sun, 1 Mon, ... 5 Fri, 6 Sat
    if (dow >= 1 && dow <= 5) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return Math.max(1, count);
};

/**
 * Adds working days (Mon-Fri) starting from startDate inclusive.
 * e.g., 1 working day starting Mon 2026-09-21 -> Mon 2026-09-21 (finishes same day)
 *       2 working days starting Mon 2026-09-21 -> Tue 2026-09-22
 *       5 working days starting Mon 2026-09-21 -> Fri 2026-09-25
 */
export const addWorkingDays = (startDateStr?: string | null, workingDaysCount: number = 1): string => {
  const startIso = toISODate(startDateStr);
  if (!startIso) return '';
  const days = Math.max(1, workingDaysCount);

  const cur = new Date(startIso);
  // If starting on weekend, push to Monday
  while (cur.getDay() === 0 || cur.getDay() === 6) {
    cur.setDate(cur.getDate() + 1);
  }

  let remaining = days - 1;
  while (remaining > 0) {
    cur.setDate(cur.getDate() + 1);
    const dow = cur.getDay();
    if (dow >= 1 && dow <= 5) {
      remaining--;
    }
  }

  return cur.toISOString().slice(0, 10);
};
