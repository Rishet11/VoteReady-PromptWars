function formatAllDayDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Formats a date string into a Google Calendar all-day date range.
 * @param dateString - ISO date string (YYYY-MM-DD).
 * @returns A start/end date string in the format YYYYMMDD/YYYYMMDD.
 */
export function getAllDayDateRange(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, day));
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 1);

  return `${formatAllDayDate(startDate)}/${formatAllDayDate(endDate)}`;
}

/**
 * Builds a Google Calendar event creation URL.
 * Opens Google Calendar with a pre-filled event template.
 * @param eventName - The event title.
 * @param eventDate - The event date in ISO format (YYYY-MM-DD).
 * @param description - The event description.
 * @returns A full Google Calendar URL.
 */
export function buildGoogleCalendarUrl(
  eventName: string,
  eventDate: string,
  description: string
) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventName,
    dates: getAllDayDateRange(eventDate),
    details: description,
    sf: 'true',
    output: 'xml',
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}
