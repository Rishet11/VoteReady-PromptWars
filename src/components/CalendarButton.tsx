'use client';

import { Calendar, ExternalLink } from 'lucide-react';
import { trackEvent } from './GoogleAnalytics';
import { buildGoogleCalendarUrl } from '@/lib/calendar';

interface CalendarButtonProps {
  eventName: string;
  eventDate: string; // ISO format
  description: string;
  className?: string;
}

export function CalendarButton({ eventName, eventDate, description, className }: CalendarButtonProps) {
  const calendarUrl = buildGoogleCalendarUrl(eventName, eventDate, description);

  return (
    <a
      href={calendarUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('add_to_calendar', 'engagement', eventName)}
      className={`inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100 ${className}`}
      aria-label={`Add ${eventName} to Google Calendar`}
    >
      <Calendar className="w-4 h-4" />
      Add to Google Calendar
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  );
}
