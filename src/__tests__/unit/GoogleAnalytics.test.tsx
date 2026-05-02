import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  GoogleAnalytics,
  isValidGaMeasurementId,
  trackEvent,
} from '@/components/GoogleAnalytics';

describe('GoogleAnalytics', () => {
  const originalGaId = process.env.NEXT_PUBLIC_GA_ID;

  beforeEach(() => {
    delete window.gtag;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GA_ID = originalGaId;
  });

  it('validates GA4 measurement IDs', () => {
    expect(isValidGaMeasurementId('G-ABC123XYZ')).toBe(true);
    expect(isValidGaMeasurementId('G-XXXXXXXXXX')).toBe(false);
    expect(isValidGaMeasurementId('UA-123')).toBe(false);
    expect(isValidGaMeasurementId(undefined)).toBe(false);
  });

  it('renders no scripts without a valid measurement ID', () => {
    process.env.NEXT_PUBLIC_GA_ID = '';

    const { container } = render(<GoogleAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it('tracks no-op safely when gtag is unavailable', () => {
    expect(() => trackEvent('register_click', 'conversion', 'eci')).not.toThrow();
  });

  it('sends events when gtag is available', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackEvent('register_click', 'conversion', 'eci', 1);

    expect(gtag).toHaveBeenCalledWith('event', 'register_click', {
      event_category: 'conversion',
      event_label: 'eci',
      value: 1,
    });
  });
});
