/**
 * Static reference data mirroring the backend `serving_formats` seed (V2 migration).
 * These are stable lookup values, so we keep them client-side for an instant,
 * offline-friendly picker instead of an extra round-trip.
 */
export interface ServingFormatOption {
  id: number;
  code: string;
  label: string;
  /** Short English helper shown under the label. */
  hint: string;
  volumeMl: number;
  emoji: string;
  /** Most common formats are surfaced first for speed. */
  primary: boolean;
}

export const SERVING_FORMATS: ServingFormatOption[] = [
  { id: 1, code: 'CANA', label: 'Caña', hint: 'Small beer · 200 ml', volumeMl: 200, emoji: '🍺', primary: true },
  { id: 3, code: 'TERCIO', label: 'Tercio', hint: 'Bottle · 330 ml', volumeMl: 330, emoji: '🍾', primary: true },
  { id: 2, code: 'JARRA', label: 'Jarra', hint: 'Pint · 500 ml', volumeMl: 500, emoji: '🍺', primary: true },
  { id: 6, code: 'CHUPITO', label: 'Chupito', hint: 'Shot · 40 ml', volumeMl: 40, emoji: '🥃', primary: true },
  { id: 5, code: 'COPA_VINO', label: 'Copa de vino', hint: 'Wine glass · 150 ml', volumeMl: 150, emoji: '🍷', primary: true },
  { id: 7, code: 'COMBINADO', label: 'Combinado', hint: 'Mixed drink · 50 ml spirit', volumeMl: 50, emoji: '🍹', primary: false },
  { id: 4, code: 'BOTELLIN', label: 'Botellín', hint: 'Quinto · 200 ml', volumeMl: 200, emoji: '🍺', primary: false },
  { id: 8, code: 'COPA_CAVA', label: 'Copa de cava', hint: 'Sparkling · 120 ml', volumeMl: 120, emoji: '🥂', primary: false },
];
