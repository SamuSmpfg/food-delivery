import React from 'react';
import {
  Circle,
  Group,
  LinearGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

type Props = {
  cx: SharedValue<number>;
  cy: SharedValue<number>;
  chartHeight: number;
};

const Cursor = ({ cx, cy, chartHeight }: Props) => {
  const path = useDerivedValue(() => {
    return Skia.Path.MakeFromSVGString(
      `M ${cx.value} ${cy.value} L ${cx.value} ${chartHeight}`
    )!;
  });

  const start = useDerivedValue(() => vec(cx.value, cy.value));
  const end = useDerivedValue(() => vec(cx.value, chartHeight - 10));

  return (
    <Group>
      <Path path={path} style="stroke" strokeWidth={5} strokeCap="round">
        <LinearGradient start={start} end={end} colors={['rgba(251, 109, 58, 1)', 'rgba(255, 255, 255, 0)']} />
      </Path>
      <Circle cx={cx} cy={cy} r={10} style="stroke" strokeWidth={6} color="#FB6D3A" />
      <Circle cx={cx} cy={cy} r={8} style="fill" color="#fff" />
    </Group>
  );
};

export default Cursor;