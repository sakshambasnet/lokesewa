import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { typography, useColors, type TypographyVariant } from '@/theme';

type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  muted?: boolean;
};

export function Text({ variant = 'body', muted = false, style, ...rest }: TextProps) {
  const colors = useColors();
  return (
    <RNText
      style={[typography[variant], { color: muted ? colors.textMuted : colors.text }, style]}
      {...rest}
    />
  );
}
