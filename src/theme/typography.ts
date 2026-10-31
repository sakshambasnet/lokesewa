import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';

/** Fonts loaded once in the root layout. Supports Nepali Unicode and Latin. */
export const fontAssets = {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
};

export const fonts = {
  regular: 'NotoSansDevanagari_400Regular',
  semiBold: 'NotoSansDevanagari_600SemiBold',
  bold: 'NotoSansDevanagari_700Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 36 },
  heading: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 26 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
} as const;

export type TypographyVariant = keyof typeof typography;
