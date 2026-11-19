import { Canvas, SkFont, Text } from '@shopify/react-native-skia'
import { useWindowDimensions } from 'react-native'
import { SharedValue, useDerivedValue } from 'react-native-reanimated'

type Props = {
  selectedValue: SharedValue<number>
  font: SkFont
}

const AnimatedText = ({ selectedValue, font }: Props) => {
  const { width } = useWindowDimensions()

  const animatedText = useDerivedValue(() => {
    return `$${Math.round(selectedValue.value)}`
  })

  const fontSize = font.measureText('0')

  const textX = useDerivedValue(() => {
    const textWidth = font.measureText(animatedText.value).width
    return (width - textWidth) / 500
  }, [font, width])

  return (
    <Canvas style={{ height: fontSize.height }}>
      <Text
        font={font}
        text={animatedText}
        color={'#32343E'}
        y={fontSize.height}
        x={textX}
      />
    </Canvas>
  )
}

export default AnimatedText