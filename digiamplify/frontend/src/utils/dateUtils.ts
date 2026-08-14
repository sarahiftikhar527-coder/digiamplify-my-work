/**
 * Standardized Date Formatting Utilities for Digiamplify Portal
 * Ensures uniform, professional date representations across all modules.
 */

/**
 * Formats a date string, ISO timestamp, or Date object into a clean standard date format.
 * Example output: "14 Aug 2026"
 */
export const formatDateStandard = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formats a date into a full display string with weekday.
 * Example output: "Friday, Aug 14, 2026"
 */
export const formatDateWithDay = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats a date into a compact short format for tables and shift logs.
 * Example output: "Fri, 14 Aug"
 */
export const formatDateShort = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
};

/**
 * Formats a date into a combined date and time string.
 * Example output: "14 Aug 2026, 02:30 PM"
 */
export const formatDateTime = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const datePart = formatDateStandard(date);
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${datePart}, ${timePart}`;
};

/**
 * Formats relative activity time for activity feeds, logs, and comments.
 * Example output: "Today, 02:30 PM", "Yesterday, 10:15 AM", or "14 Aug, 02:30 PM"
 */
export const formatRelativeActivityTime = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  if (activityDate.getTime() === today.getTime()) {
    return `Today, ${timeStr}`;
  } else if (activityDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  } else {
    const monthDayStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
    return `${monthDayStr}, ${timeStr}`;
  }
};
