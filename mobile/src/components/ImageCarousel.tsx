import {
  View, Animated, StyleSheet, useWindowDimensions, LayoutChangeEvent,
} from 'react-native'
import { useRef, useState } from 'react'

type Props = {
  images: string[]
  height?: number
  dotsBottom?: number
  variant?: 'ring' | 'pill'
}

export const getImages = (item: any): string[] => {
  if (Array.isArray(item?.images) && item.images.length) {
    return item.images.filter((uri: unknown) => typeof uri === 'string' && uri)
  }
  return item?.image ? [item.image] : []
}

type DotProps = {
  index: number
  width: number
  scrollX: Animated.Value
  variant: 'ring' | 'pill'
}

const INACTIVE = 'rgba(255,255,255,0.5)'
const ACTIVE = 'rgba(255,255,255,1)'

const Dot = ({ index, width, scrollX, variant }: DotProps) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
  const clamp = { extrapolate: 'clamp' as const }

  const color = scrollX.interpolate({
    inputRange,
    outputRange: [INACTIVE, ACTIVE, INACTIVE],
    ...clamp,
  })

  if (variant === 'pill') {
    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [10, 28, 10],
      ...clamp,
    })
    return (
      <Animated.View
        style={{ width: dotWidth, height: 10, borderRadius: 100, backgroundColor: color }}
      />
    )
  }

  const outerSize = scrollX.interpolate({
    inputRange,
    outputRange: [10, 22, 10],
    ...clamp,
  })
  const innerSize = scrollX.interpolate({
    inputRange,
    outputRange: [10, 12, 10],
    ...clamp,
  })
  const borderWidth = scrollX.interpolate({
    inputRange,
    outputRange: [0, 2, 0],
    ...clamp,
  })

  return (
    <Animated.View
      style={{
        width: outerSize,
        height: outerSize,
        borderRadius: 100,
        borderWidth,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: 100,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  )
}

type SlideProps = {
  uri: string
  index: number
  width: number
  height: number
  scrollX: Animated.Value
}

const Slide = ({ uri, index, width, height, scrollX }: SlideProps) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [1.12, 1, 1.12],
    extrapolate: 'clamp',
  })
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  })

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Animated.Image
        source={{ uri }}
        style={{ width, height, opacity, transform: [{ scale }] }}
        resizeMode="cover"
      />
    </View>
  )
}

const ImageCarousel = ({ images, height = 320, dotsBottom = 16, variant = 'ring' }: Props) => {
  const { width: windowWidth } = useWindowDimensions()
  const [width, setWidth] = useState(windowWidth)
  const scrollX = useRef(new Animated.Value(0)).current

  if (images.length === 0) return null

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0 && w !== width) setWidth(w)
  }

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  )

  return (
    <View style={StyleSheet.absoluteFill} onLayout={handleLayout}>
      <Animated.FlatList
        data={images}
        extraData={width}
        horizontal
        pagingEnabled
        bounces={false}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(uri: string, i: number) => `${uri}-${i}`}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_: unknown, i: number) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index }: { item: string; index: number }) => (
          <Slide uri={item} index={index} width={width} height={height} scrollX={scrollX} />
        )}
      />

      {images.length > 1 && (
        <View style={[styles.dots, { bottom: dotsBottom }]} pointerEvents="none">
          {images.map((_, i) => (
            <Dot key={i} index={i} width={width} scrollX={scrollX} variant={variant} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})

export default ImageCarousel