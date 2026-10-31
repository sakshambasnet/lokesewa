import { useColorScheme } from 'react-native';

import { palette, type Colors } from './colors';

export { palette, type ColorScheme, type Colors } from './colors';
export { MIN_TOUCH_SIZE, radius, spacing } from './spacing';
export { fontAssets, fonts, typography, type TypographyVariant } from './typography';

/** Colors for the current light/dark mode. */
export function useColors(): Colors {
  const scheme = useColorScheme();
  return palette[scheme === 'dark' ? 'dark' : 'light'];
}
