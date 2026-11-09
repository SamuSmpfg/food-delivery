import { LinearGradient, Path, Skia } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

type Props = {
  chartHeight: number;
  chartWidth: number;
  chartMargin: number;
  curvedLine: string;
  animationGradient: SharedValue<{ x: number; y: number }>;
};

const getGradient = (
  chartLine: string | undefined | null,
  width: number,
  height: number,
  margin: number
) => {
  if (!chartLine || !chartLine.trim().startsWith('M')) {
    return null;
  }

  if (![width, height, margin].every(Number.isFinite)) {
    return null;
  }

  if (chartLine.includes('NaN') || chartLine.includes('undefined')) {
    return null;
  }

  return Skia.Path.MakeFromSVGString(
    `${chartLine} L ${width - margin} ${height} L ${margin} ${height} Z`
  );
};

const Gradient = ({
  chartHeight,
  chartMargin,
  chartWidth,
  curvedLine,
  animationGradient,
}: Props) => {
  const path = useMemo(
    () => getGradient(curvedLine, chartWidth, chartHeight, chartMargin),
    [curvedLine, chartWidth, chartHeight, chartMargin]
  );

  if (!path) {
    return null;
  }

  return (
    <Path path={path}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={animationGradient}
        colors={['rgba(251, 109, 58, 0.3)', 'rgba(255, 255, 255, 0)']}
      />
    </Path>
  );
};

export default Gradient;