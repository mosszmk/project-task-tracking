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
 * Formats a date range into "15 Jun 2026 – 20 Jun 2026"
 */
export const formatDateRange = (start?: string | null, end?: string | null): string => {
  if (!start && !end) return '—';
  if (start && !end) return formatDate(start);
  if (!start && end) return formatDate(end);
  return `${formatDate(start)} – ${formatDate(end)}`;
};
