import { useEffect, useState } from 'react';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { curveBasis, line, scaleLinear, scalePoint } from 'd3';
import {
  clamp,
  useSharedValue,
  withDelay,
  withTiming,
  runOnJS,
  SharedValue
} from 'react-native-reanimated';
import { DataType } from '../data/data';
import Gradient from './Gradient';
import XAxisText from './XAxisText';
import Cursor from './Cursor';
import { getYForX, parse } from 'react-native-redash';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

type Props = {
  data: DataType[];
  chartWidth: number;
  chartHeight: number;
  chartMargin: number;
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
  selectedValue: SharedValue<number>
};

const LineChart = ({ chartHeight, chartMargin, chartWidth, data, setSelectedTime, selectedValue }: Props) => {
  const animationLine = useSharedValue(0);
  const animationGradient = useSharedValue({ x: 0, y: 0 });
  const cx = useSharedValue(0);
  const cy = useSharedValue(0);

  const [showCursor, setShowCursor] = useState(false)

  useEffect(() => {
    animationLine.value = withTiming(1, { duration: 1000 });
    animationGradient.value = withDelay(
      1000,
      withTiming({ x: 0, y: chartHeight }, { duration: 500 })
    );
    selectedValue.value = withTiming(totalValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    !data ||
    data.length < 2 ||
    !Number.isFinite(chartWidth) ||
    !Number.isFinite(chartHeight) ||
    !Number.isFinite(chartMargin)
  ) {
    return null;
  }

  const xDomain = data.map((dataPoint: DataType) => dataPoint.label);
  const xRange = [chartMargin, chartWidth - chartMargin];
  const x = scalePoint().domain(xDomain).range(xRange).padding(0);
  const stepX = x.step()

  const max = Math.max(...data.map(val => val.value));
  const min = Math.min(...data.map(val => val.value));
  
  const totalValue = data.reduce((acc, cur) => acc + cur.value, 0)

  const yDomain = [min, max];
  const yRange = [chartHeight, 0];
  const y = scaleLinear().domain(yDomain).range(yRange);

  const curvedLine = line<DataType>()
    .x(d => x(d.label)!)
    .y(d => y(d.value))
    .curve(curveBasis)(data);

  if (!curvedLine || curvedLine.includes('NaN')) {
    return null;
  }

  const linePath = Skia.Path.MakeFromSVGString(curvedLine);

  if (!linePath) {
    return null;
  }

  const path = parse(linePath.toSVGString());

  const handleGestureEvent = (e: PanGestureHandlerEventPayload) => {
    'worklet'

    const index = Math.floor(e.absoluteX / stepX)
    runOnJS(setSelectedTime)(data[index].label)
    selectedValue.value = withTiming(data[index].value)

    const clampValue = clamp(
      Math.floor(e.absoluteX / stepX) * stepX + chartMargin, chartMargin, chartWidth - chartMargin);
    cx.value = clampValue;
    cy.value = getYForX(path, Math.floor(clampValue))!;
  };

  const pan = Gesture.Pan()
  .onTouchesDown(() => {
    runOnJS(setShowCursor)(true)

  })
  .onTouchesUp(() => {
    runOnJS(setShowCursor)(false)
    runOnJS(setSelectedTime)('Total')
    selectedValue.value = withTiming(totalValue)
  })
    .onBegin(handleGestureEvent)
    .onChange(handleGestureEvent);

  return (
    <GestureDetector gesture={pan}>
      <Canvas
        style={{
          width: chartWidth + 20,
          height: chartHeight + 30,
        }}>
        <Path
          style="stroke"
          path={linePath}
          strokeWidth={4}
          color="#FB6D3A"
          end={animationLine}
          start={0} 
        />
        <Gradient
          chartHeight={chartHeight}
          chartWidth={chartWidth}
          chartMargin={chartMargin}
          curvedLine={curvedLine}
          animationGradient={animationGradient}
        />
        {data.map((dataPoint: DataType, index) => (
          <XAxisText
            x={x(dataPoint.label)! - 11}
            y={chartHeight}
            text={dataPoint.label}
            key={index}
          />
        ))}
        {showCursor && <Cursor cx={cx} cy={cy} chartHeight={chartHeight} />}
      </Canvas>
    </GestureDetector>
  );
};

export default LineChart;