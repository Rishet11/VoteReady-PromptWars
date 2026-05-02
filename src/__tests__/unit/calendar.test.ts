import { describe, expect, it } from 'vitest';
import { buildGoogleCalendarUrl, getAllDayDateRange } from '@/lib/calendar';

describe('calendar helpers', () => {
  it('builds timezone-safe all-day ranges', () => {
    expect(getAllDayDateRange('2026-05-15')).toBe('20260515/20260516');
  });

  it('builds a Google Calendar template URL', () => {
    const url = new URL(
      buildGoogleCalendarUrl(
        'Registration Deadline: Delhi',
        '2026-05-15',
        'Last day to register'
      )
    );

    expect(url.origin).toBe('https://www.google.com');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('dates')).toBe('20260515/20260516');
  });
});
