import { SvgXml } from 'react-native-svg';

import { colors } from '@/theme';

const PATH = 'M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z';

// Period marker on the calendar: solid for a logged day, outlined and faded for a predicted one.
export function CycleDrop({ predicted = false, size = 12 }: { predicted?: boolean; size?: number }) {
  const c = colors.error;
  const xml = predicted
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"><path d="${PATH}"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="${c}"><path d="${PATH}"/></svg>`;
  return <SvgXml xml={xml} width={size} height={size} opacity={predicted ? 0.6 : 1} />;
}
