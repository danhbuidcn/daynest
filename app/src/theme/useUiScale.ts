import { useWindowDimensions } from 'react-native';

import { WIDE_SCALE, WIDE_SCREEN_DP } from './index';

export function useUiScale() {
  const { width } = useWindowDimensions();
  return width >= WIDE_SCREEN_DP ? WIDE_SCALE : 1;
}
