import React, { useEffect, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { Canvas, Circle, Group, Path, Skia } from '@shopify/react-native-skia'
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

type ParticleProps = {
  kind: 'star' | 'dot'
  x: number
  y: number
  radius: number
  color: string
  delay: number
  center: number
}

type SparkleBurstProps = {
  size?: number
}

const buildStarPath = (radius: number) => {
  const k = radius * 0.16
  const d = `M 0 ${-radius} Q ${k} ${-k} ${radius} 0 Q ${k} ${k} 0 ${radius} Q ${-k} ${k} ${-radius} 0 Q ${-k} ${-k} 0 ${-radius} Z`
  return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make()
}

const Particle = ({ kind, x, y, radius, color, delay, center }: ParticleProps) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.back(2.2)) })
    )
  }, [])

  const starPath = useMemo(() => buildStarPath(radius), [radius])

  const transform = useDerivedValue(() => [
    { translateX: center + x },
    { translateY: center + y },
    { scale: progress.value },
    { rotate: (1 - progress.value) * 0.9 },
  ])

  const opacity = useDerivedValue(() => Math.min(progress.value * 2.5, 1))

  return (
    <Group transform={transform} opacity={opacity}>
      {kind === 'star' ? (
        <Path path={starPath} color={color} />
      ) : (
        <Circle cx={0} cy={0} r={radius} color={color} />
      )}
    </Group>
  )
}

const SparkleBurst = ({ size = 320 }: SparkleBurstProps) => {
  const center = size / 2

  return (
    <Canvas style={[styles.canvas, { width: size, height: size }]} pointerEvents="none">
      <Particle kind="star" x={-45} y={-130} radius={17} color="#FBC4B0" delay={0} center={center} />
      <Particle kind="star" x={136} y={-17} radius={17} color="#FBC4B0" delay={80} center={center} />
      <Particle kind="star" x={-62} y={-64} radius={10} color="#FB6D3A" delay={140} center={center} />
      <Particle kind="star" x={129} y={-102} radius={10} color="#FB6D3A" delay={200} center={center} />
      <Particle kind="star" x={87} y={-48} radius={10} color="#FB6D3A" delay={260} center={center} />
      <Particle kind="star" x={-132} y={1} radius={6} color="#FB6D3A" delay={320} center={center} />
      <Particle kind="dot" x={36} y={-79} radius={6} color="#FBC4B0" delay={180} center={center} />
      <Particle kind="dot" x={-130} y={-17} radius={6} color="#FBC4B0" delay={300} center={center} />
    </Canvas>
  )
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: -105,
    left: -105,
  },
})

export default SparkleBurst