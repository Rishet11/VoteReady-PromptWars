'use client';

import Script from 'next/script';

type Gtag = (
  command: 'config' | 'event' | 'js',
  target: string | Date,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function isValidGaMeasurementId(value: string | undefined): value is string {
  return /^G-[A-Z0-9]+$/.test(value ?? '') && value !== 'G-XXXXXXXXXX';
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;

  if (!isValidGaMeasurementId(measurementId)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

export function trackEvent(
  action: string,
  category: string,
  label: string,
  value?: number
) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}
