/** Formats points with up to one decimal, trimming a trailing ".0". */
export function formatPoints(points: number): string {
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

/** First letter of a display name, for avatar placeholders. */
export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
