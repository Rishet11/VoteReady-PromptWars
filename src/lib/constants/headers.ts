export const CACHE_HEADERS = {
  PUBLIC_SHORT: {
    'Cache-Control': 'public, s-maxage=60',
  },
  PUBLIC_LONG: {
    'Cache-Control': 'public, s-maxage=3600',
  },
  NO_STORE: {
    'Cache-Control': 'no-store',
  },
} as const;
