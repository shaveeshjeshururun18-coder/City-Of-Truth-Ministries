export interface GetInitialsOptions {
  fallback?: string;
  maxChars?: number;
  useFirstAndLast?: boolean;
}

/**
 * Robust string formatting utility to extract initials from a name.
 *
 * @param name The name string to extract initials from.
 * @param options Configuration options for fallback, max characters, or first-and-last logic.
 * @returns The formatted initials string in uppercase.
 */
export const getInitials = (name?: string, options: GetInitialsOptions = {}): string => {
  const { fallback = 'CT', maxChars = 2, useFirstAndLast = false } = options;
  const safeName = (name || '').trim();
  if (!safeName) return fallback;

  // Clean special characters if needed, while keeping letters, numbers, and whitespace
  const cleanName = safeName.replace(/[^a-zA-Z0-9\s\u0B80-\u0BFF]/g, ' ').trim();
  if (!cleanName) return fallback;

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;

  if (parts.length >= 2) {
    if (useFirstAndLast) {
      const first = parts[0];
      const last = parts[parts.length - 1];
      return (first.charAt(0) + last.charAt(0)).toUpperCase();
    }
    return parts.slice(0, maxChars).map(p => p.charAt(0)).join('').toUpperCase();
  }

  return cleanName.slice(0, maxChars).toUpperCase();
};
