/**
 * Generates a Google Maps directions URL for a given destination.
 */
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Generates a Google Maps embed URL for a given location.
 * Requires an API key in production, but uses a standard maps url structure.
 */
export function getEmbedUrl(lat: number, lng: number, apiKey: string = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""): string {
  if (!apiKey) {
    // Fallback if no API key
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}`;
}
