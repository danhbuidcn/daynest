// Static tokens, kept in sync with docs/specs/design-system.md. Colours and fonts depend on the
// chosen theme: read them with useTheme() (src/theme/ThemeProvider.tsx), not from here.
export const eventColors = {
  mint: '#7FD1B0',
  sky: '#8CC8EE',
  lavender: '#B9A6EC',
  pink: '#F4A6C0',
  peach: '#F7BE8A',
  lemon: '#F2D67A',
} as const;

// Text and icons on an event / category colour: fixed dark in every theme, because the
// dark theme's `text` is light (it flips to white only when the colour itself is dark).
export const ON_COLOR = '#2F2D33';

export const typeSizes = {
  title: { fontSize: 22, lineHeight: 28, weight: 'extrabold' },
  heading: { fontSize: 17, lineHeight: 24, weight: 'bold' },
  body: { fontSize: 15, lineHeight: 22, weight: 'semibold' },
  caption: { fontSize: 12, lineHeight: 16, weight: 'semibold' },
  micro: { fontSize: 10, lineHeight: 12, weight: 'semibold' },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { card: 20, button: 16, dialog: 24, icon: 10, pill: 999 } as const;

// Tablets in landscape (≥ 900 dp wide) get larger text and icons; phones and portrait tablets keep 1.
export const WIDE_SCREEN_DP = 900;
export const WIDE_SCALE = 1.2;
