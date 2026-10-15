// The 8 built-in colour sets. Spec: docs/specs/sprint-6/index.md § Giao diện.
export type Palette = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  success: string;
  error: string;
  errorSoft: string;
  warning: string;
  warningSoft: string;
  white: string;
  scrim: string;
  // Toast background: `text` in light sets (would be too bright in the dark one).
  toast: string;
};

export const THEME_IDS = ['mint', 'rose', 'sky', 'lavender', 'clay', 'lemon', 'slate', 'dark'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

const shared = {
  success: '#5BBE98',
  error: '#E9787B',
  errorSoft: '#FCE8E8',
  warning: '#F2B45C',
  warningSoft: '#FDF1DE',
  white: '#FFFFFF',
  scrim: 'rgba(47,45,51,0.4)',
};

function light(p: Omit<Palette, keyof typeof shared | 'toast'>): Palette {
  return { ...shared, ...p, toast: p.text };
}

export const PALETTES: Record<ThemeId, Palette> = {
  mint: light({ primary: '#5BBE98', primaryDark: '#3E9E7A', primarySoft: '#E3F5EC', bg: '#FAF8F5', surface: '#FFFFFF', border: '#EFEAE3', text: '#2F2D33', textMuted: '#8C8794' }),
  rose: light({ primary: '#EE8FA9', primaryDark: '#C9607F', primarySoft: '#FDE9EF', bg: '#FFF8F9', surface: '#FFFFFF', border: '#F5E3E8', text: '#33282C', textMuted: '#94838A' }),
  sky: light({ primary: '#5AAEE0', primaryDark: '#3A87B8', primarySoft: '#E3F1FA', bg: '#F6F9FC', surface: '#FFFFFF', border: '#E2EAF1', text: '#263039', textMuted: '#7E8A95' }),
  lavender: light({ primary: '#9C88E0', primaryDark: '#7660C2', primarySoft: '#EEEAFB', bg: '#F9F8FD', surface: '#FFFFFF', border: '#E9E5F4', text: '#2E2B38', textMuted: '#8A8597' }),
  clay: light({ primary: '#E39A6B', primaryDark: '#B96D42', primarySoft: '#FBEDE3', bg: '#FCF8F4', surface: '#FFFFFF', border: '#F0E5DB', text: '#33291F', textMuted: '#928579' }),
  lemon: light({ primary: '#E0B63A', primaryDark: '#9C7A12', primarySoft: '#FBF3D8', bg: '#FDFBF3', surface: '#FFFFFF', border: '#EFE9D3', text: '#2F2C22', textMuted: '#8C8671' }),
  slate: light({ primary: '#66788A', primaryDark: '#4A5A6A', primarySoft: '#E8ECF0', bg: '#F6F7F8', surface: '#FFFFFF', border: '#E5E7EA', text: '#24272B', textMuted: '#80868D' }),
  dark: {
    ...shared,
    primary: '#5BBE98',
    primaryDark: '#7FD1B0',
    primarySoft: '#1F3A30',
    bg: '#17171B',
    surface: '#232328',
    border: '#34343B',
    text: '#EDEBF0',
    textMuted: '#A29EAB',
    errorSoft: '#3D2628',
    warningSoft: '#3B3122',
    toast: '#3A3A42',
  },
};
