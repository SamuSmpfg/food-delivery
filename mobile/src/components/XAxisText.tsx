import { Text, useFont } from '@shopify/react-native-skia'

type Props = {
  x: number
  y: number
  text: string
}

const XAxisText = ({ x, y, text }: Props) => {
  const font = useFont(
    require('@expo-google-fonts/sen/400Regular/Sen_400Regular.ttf'),
    12
  )

  if (!font) return null

  return <Text text={text} color={'#9C9BA6'} x={x} y={y + 10} font={font} />
}

export default XAxisText