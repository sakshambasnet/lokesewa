import { View, type DimensionValue } from 'react-native';

import { radius, useColors } from '@/theme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
};

/** Static placeholder block. No animation, to stay light on low-end phones. */
export function Skeleton({ width = '100%', height = 16 }: SkeletonProps) {
  const colors = useColors();
  return (
    <View
      accessibilityLabel="Loading"
      style={{ width, height, borderRadius: radius.sm, backgroundColor: colors.skeleton }}
    />
  );
}
