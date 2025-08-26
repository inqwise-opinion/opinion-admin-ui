/**
 * Utility functions for date formatting and display
 */

/**
 * Format date string to match the original API format
 * Example: "Aug 13, 2025 10:30:45"
 */
export function formatOriginalDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const datePart = date.toLocaleDateString('en-US', options);
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const timePart = `${hours}:${minutes}:${seconds}`;
    
    return `${datePart} ${timePart}`;
  } catch (error) {
    return dateStr;
  }
}

/**
 * Format date for display in tables (shorter format)
 * Example: "Aug 13, 2025"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Get a date string for "yesterday" (for testing/demo purposes)
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return yesterday.toISOString();
}

/**
 * Generate a random date within the specified number of days ago
 */
export function generateRandomPastDate(maxDaysAgo: number): string {
  const randomTime = Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000;
  const pastDate = new Date(Date.now() - randomTime);
  return pastDate.toISOString();
}

/**
 * Format date for API in the expected format
 */
export function formatForApi(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  }) + ' ' + date.toLocaleTimeString('en-US');
}
