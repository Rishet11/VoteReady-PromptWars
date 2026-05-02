/**
 * Site URL Configuration
 * Provides the canonical production URL used by metadata, sitemap, and robots.
 * @module site
 */

export const DEFAULT_SITE_URL = 'https://voteready-462604012263.asia-south1.run.app';

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}
