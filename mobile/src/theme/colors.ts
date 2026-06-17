/**
 * "Fiesta vibrante" palette. Existing keys are kept (so every screen recolors
 * automatically) and new accent tokens are added for the bolder look.
 */
export const colors = {
  // Brand
  primary: '#7C3AED', // electric violet
  primaryDark: '#5B21B6',
  primarySoft: '#F1E9FF',
  accent: '#EC4899', // hot pink
  accentSoft: '#FCE7F3',
  highlight: '#FACC15', // party yellow
  cyan: '#22D3EE',

  // Gradient stops (use as [gradientStart, gradientEnd])
  gradientStart: '#7C3AED',
  gradientEnd: '#EC4899',

  // Neutrals
  text: '#171221',
  textMuted: '#6B7280',
  border: '#E8E4F0',
  background: '#FFFFFF',
  surface: '#F6F4FB',

  // Status
  danger: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
} as const;
