import { BeVietnamPro_600SemiBold, BeVietnamPro_700Bold, BeVietnamPro_800ExtraBold } from '@expo-google-fonts/be-vietnam-pro';
import { Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Itim_400Regular } from '@expo-google-fonts/itim';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';

import type { FontId } from '@/lib/theme/appearance';

export type Weight = 'semibold' | 'bold' | 'extrabold';
export type FontFamilies = Record<Weight, string>;

// A font missing a weight uses the nearest one it has (Quicksand tops out at 700; the two
// handwriting fonts have one weight).
export const FONT_FAMILIES: Record<FontId, FontFamilies> = {
  nunito: { semibold: 'Nunito_600SemiBold', bold: 'Nunito_700Bold', extrabold: 'Nunito_800ExtraBold' },
  'be-vietnam-pro': { semibold: 'BeVietnamPro_600SemiBold', bold: 'BeVietnamPro_700Bold', extrabold: 'BeVietnamPro_800ExtraBold' },
  quicksand: { semibold: 'Quicksand_600SemiBold', bold: 'Quicksand_700Bold', extrabold: 'Quicksand_700Bold' },
  'baloo-2': { semibold: 'Baloo2_600SemiBold', bold: 'Baloo2_700Bold', extrabold: 'Baloo2_800ExtraBold' },
  itim: { semibold: 'Itim_400Regular', bold: 'Itim_400Regular', extrabold: 'Itim_400Regular' },
  'patrick-hand': { semibold: 'PatrickHand_400Regular', bold: 'PatrickHand_400Regular', extrabold: 'PatrickHand_400Regular' },
};

// All files, loaded once at start so a font change applies at once.
export const FONT_FILES = {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  BeVietnamPro_800ExtraBold,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  Itim_400Regular,
  PatrickHand_400Regular,
};
