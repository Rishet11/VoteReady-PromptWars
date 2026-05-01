/**
 * Sanitizes input strings to prevent XSS.
 * Removes potentially dangerous characters and HTML tags.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  // Remove HTML tags
  let sanitized = input.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Remove special characters except alphanumeric, space, dash, and underscore
  sanitized = sanitized.replace(/[^\w\s-]/gi, "");
  
  return sanitized.trim();
}

/**
 * Validates if the given input is a valid 6-digit Indian PIN code.
 */
export function isValidPinCode(pin: string): boolean {
  const sanitized = sanitizeInput(pin);
  // Indian PIN codes are exactly 6 digits
  return /^\d{6}$/.test(sanitized);
}
