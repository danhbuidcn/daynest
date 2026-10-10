// Tokens, kept in sync with docs/specs/design-system.md. Screens use only these values.
export const colors = {
  primary: '#5BBE98',
  primaryDark: '#3E9E7A',
  primarySoft: '#E3F5EC',
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  border: '#EFEAE3',
  text: '#2F2D33',
  textMuted: '#8C8794',
  success: '#5BBE98',
  error: '#E9787B',
  errorSoft: '#FCE8E8',
  warning: '#F2B45C',
  white: '#FFFFFF',
  scrim: 'rgba(47,45,51,0.4)',
} as const;

export const eventColors = {
  mint: '#7FD1B0',
  sky: '#8CC8EE',
  lavender: '#B9A6EC',
  pink: '#F4A6C0',
  peach: '#F7BE8A',
  lemon: '#F2D67A',
} as const;

export const fonts = {
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

export const type = {
  title: { fontSize: 22, lineHeight: 28, fontFamily: fonts.extrabold },
  heading: { fontSize: 17, lineHeight: 24, fontFamily: fonts.bold },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fonts.semibold },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
  micro: { fontSize: 10, lineHeight: 12, fontFamily: fonts.semibold },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { card: 20, button: 16, dialog: 24, icon: 10, pill: 999 } as const;

export const shadow = {
  shadowColor: colors.text,
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;
