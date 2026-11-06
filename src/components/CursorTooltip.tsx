import { Group, Path, RoundedRect, Text, useFont } from '@shopify/react-native-skia'
import { clamp, SharedValue, useDerivedValue } from 'react-native-reanimated'

type Props = {
  cx: SharedValue<number>
  cy: SharedValue<number>
  value: SharedValue<number>
  canvasWidth: number
}

const CursorTooltip = ({ cx, cy, value, canvasWidth }: Props) => {
  const font = useFont(require('@expo-google-fonts/sen/700Bold/Sen_700Bold.ttf'), 14)

  const label = useDerivedValue(() => `$${Math.round(value.value)}`)

  const bubbleWidth = useDerivedValue(() =>
    font ? font.measureText(label.value).width + 28 : 0
  )

  const bubbleTransform = useDerivedValue(() => [
    {
      translateX: clamp(cx.value - bubbleWidth.value / 2, 0, canvasWidth - bubbleWidth.value),
    },
    { translateY: cy.value - 46 },
  ])

  const pointerTransform = useDerivedValue(() => [
    { translateX: cx.value },
    { translateY: cy.value - 18 },
  ])

  if (!font) {
    return null
  }

  return (
    <>
      <Group transform={bubbleTransform}>
        <RoundedRect x={0} y={0} width={bubbleWidth} height={28} r={8} color="#32343E" />
        <Text x={14} y={19} text={label} font={font} color="#FFFFFF" />
      </Group>
      <Group transform={pointerTransform}>
        <Path path="M -6 0 L 6 0 L 0 7 Z" color="#32343E" />
      </Group>
    </>
  )
}

export default CursorTooltip