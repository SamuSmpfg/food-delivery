import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Animated, PanResponder, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { useCart } from '../../context/CartContext'
import useLocation from '../../../hooks/useLocation'
import useBackHandler from '../../../hooks/useBackHandler'
import { RESTAURANTS } from '../../data/mockData'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7
const COLLAPSED_HEIGHT = 210
const MAX_OFFSET = SHEET_HEIGHT - COLLAPSED_HEIGHT
const STEP_INTERVAL_MS = 2 * 60 * 1000

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

const STEPS = [
  'Your order has been received',
  'The restaurant is preparing your food',
  'Your order has been picked up for delivery',
  'Order arriving soon!'
]

const formatOrderedAt = (timestamp: number) => {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = hours >= 12 ? 'pm' : 'am'
  const hours12 = hours % 12 || 12
  const day = String(date.getDate()).padStart(2, '0')
  return `${day} ${MONTHS[date.getMonth()]}, ${hours12}:${minutes}${suffix}`
}

const TrackingOrder = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { from } = useLocalSearchParams<{ from?: string }>()
  const { order, completeOrder } = useCart()
  const { latitude, longitude, getLocation } = useLocation()
  const [now, setNow] = useState(Date.now())

  const translateY = useRef(new Animated.Value(0)).current
  const currentY = useRef(0)
  const startY = useRef(0)

  useEffect(() => {
    getLocation()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(interval)
  }, [])

  const handleBack = () => {
    if (from === 'orders' && router.canGoBack()) {
      router.back()
      return
    }
    if (router.canGoBack()) {
      router.dismissAll()
      return
    }
    router.replace('/(tabs)/HomeScreen')
  }

  useBackHandler(() => {
  if (from === 'orders') handleBack()
})

  const settle = (to: number) => {
    currentY.current = to
    Animated.spring(translateY, {
      toValue: to,
      useNativeDriver: true,
      bounciness: 0
    }).start()
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderGrant: () => {
        translateY.stopAnimation((value) => {
          startY.current = value
          currentY.current = value
        })
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.min(MAX_OFFSET, Math.max(0, startY.current + gesture.dy))
        currentY.current = next
        translateY.setValue(next)
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.vy > 0.5) {
          settle(MAX_OFFSET)
        } else if (gesture.vy < -0.5) {
          settle(0)
        } else {
          settle(currentY.current > MAX_OFFSET / 2 ? MAX_OFFSET : 0)
        }
      }
    })
  ).current

  const restaurantNames = useMemo(
    () => Array.from(new Set((order?.items ?? []).map((item) => item.restaurant).filter(Boolean))),
    [order]
  )

  const etaMinutes = useMemo(() => {
    const times = restaurantNames
      .map((name) => parseInt(RESTAURANTS.find((restaurant) => restaurant.name === name)?.time ?? '', 10))
      .filter((value) => Number.isFinite(value))
    return times.length ? Math.max(...times) : 30
  }, [restaurantNames])

  const detailsOpacity = translateY.interpolate({
    inputRange: [0, MAX_OFFSET * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  })

  const elapsed = order ? now - order.placedAt : 0
  const delivered = !!order && elapsed >= etaMinutes * 60000
  const stage = delivered
    ? STEPS.length
    : Math.min(STEPS.length - 1, 1 + Math.floor(elapsed / STEP_INTERVAL_MS))
  const remaining = Math.max(0, Math.ceil((etaMinutes * 60000 - elapsed) / 60000))

  useEffect(() => {
    if (delivered) completeOrder()
  }, [delivered])

  const hasLocation = latitude !== null && longitude !== null

  return (
    <View style={styles.container}>

      {hasLocation ? (
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: latitude - 0.0018,
            longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012
          }}
        >
          <Marker coordinate={{ latitude, longitude }} tracksViewChanges={false} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.markerOuter}>
              <View style={styles.markerMiddle}>
                <View style={styles.markerInner} />
              </View>
            </View>
          </Marker>
        </MapView>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.mapPlaceholder]} />
      )}

      <View style={[styles.header, { top: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
      </View>

      <Animated.View
        style={[styles.sheet, { height: SHEET_HEIGHT, transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />

        {order ? (
          <View style={styles.sheetContent}>
            <View style={styles.orderHeader}>
              <View style={styles.restaurantImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurantNames.join(', ')}
                </Text>
                <Text style={styles.orderedAt}>Ordered At {formatOrderedAt(order.placedAt)}</Text>
                <View style={styles.itemsList}>
                  {order.items.map((item) => (
                    <Text key={item.key} style={styles.itemText} numberOfLines={1}>
                      <Text style={styles.itemQuantity}>{item.quantity}x </Text>
                      {item.name}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <Animated.View style={[styles.details, { opacity: detailsOpacity }]}>
              <View style={styles.etaBlock}>
                <Text style={styles.etaValue}>{delivered ? 'Delivered' : `${remaining} min`}</Text>
                <Text style={styles.etaLabel}>
                  {delivered ? 'ENJOY YOUR MEAL!' : 'ESTIMATED DELIVERY TIME'}
                </Text>
              </View>

              <View style={styles.steps}>
                {STEPS.map((label, index) => {
                  const done = index < stage
                  const active = index === stage
                  const isLast = index === STEPS.length - 1
                  return (
                    <View key={label} style={styles.stepRow}>
                      <View style={styles.stepIndicator}>
                        <View
                          style={[
                            styles.stepDot,
                            { backgroundColor: done || active ? '#F07F2E' : '#BDBBB9' }
                          ]}
                        >
                          {active ? (
                            <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
                          ) : (
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          )}
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.stepLine,
                              { backgroundColor: done ? '#F07F2E' : '#A0A5BA' }
                            ]}
                          />
                        )}
                      </View>
                      <Text style={[styles.stepLabel, { color: done ? '#F07F2E' : '#A0A5BA' }]}>
                        {label}
                      </Text>
                    </View>
                  )
                })}
              </View>

              <View style={[styles.courierCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.courierAvatar}>
                  <Ionicons name="person" size={28} color="#fff" />
                </View>
                <View style={styles.courierInfo}>
                  <Text style={styles.courierName}>Robert F.</Text>
                  <Text style={styles.courierRole}>Courier</Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => router.navigate('/(tabs)/Call')}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => router.navigate('/(tabs)/Chat')}
                >
                  <FontAwesome5 name="facebook-messenger" size={24} color="#F07F2E" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active order</Text>
          </View>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D9E2'
  },
  mapPlaceholder: {
    backgroundColor: '#D3D9E2'
  },
  header: {
    position: 'absolute',
    left: 24,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: '#181C2E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#fff',
    marginLeft: 16
  },
  markerOuter: {
    width: 64,
    height: 64,
    borderRadius: 100,
    backgroundColor: 'rgba(240,127,46,0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerMiddle: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: 'rgba(245,190,60,0.85)',
    borderWidth: 2,
    borderColor: '#F07F2E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 100,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#F5B63C'
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10
  },
  handle: {
    alignSelf: 'center',
    width: 60,
    height: 6,
    borderRadius: 100,
    backgroundColor: '#DCE3EC',
    marginTop: 8
  },
  sheetContent: {
    flex: 1
  },
  orderHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20
  },
  restaurantImage: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#A0AABB'
  },
  orderInfo: {
    flex: 1,
    marginLeft: 16
  },
  restaurantName: {
    fontFamily: 'Sen_700Bold',
    fontSize: 17,
    color: '#181C2E'
  },
  orderedAt: {
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    color: '#A0A5BA',
    marginTop: 4
  },
  itemsList: {
    marginTop: 8
  },
  itemText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#6B6E82'
  },
  itemQuantity: {
    fontFamily: 'Sen_700Bold'
  },
  details: {
    flex: 1
  },
  etaBlock: {
    alignItems: 'center',
    marginTop: 24
  },
  etaValue: {
    fontFamily: 'Sen_700Bold',
    fontSize: 30,
    color: '#181C2E'
  },
  etaLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#A0A5BA',
    marginTop: 4
  },
  steps: {
    paddingHorizontal: 24,
    marginTop: 24
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  stepIndicator: {
    alignItems: 'center',
    width: 22
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    transform: [{ scale: 0.6 }]
  },
  stepLine: {
    width: 2,
    height: 34
  },
  stepLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 16
  },
  courierCard: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#EDEEF2',
    backgroundColor: '#fff'
  },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#A0AABB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  courierInfo: {
    flex: 1,
    marginLeft: 14
  },
  courierName: {
    fontFamily: 'Sen_700Bold',
    fontSize: 17,
    color: '#181C2E'
  },
  courierRole: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#A0A5BA',
    marginTop: 2
  },
  callButton: {
    width: 56,
    height: 56,
    borderRadius: 100,
    backgroundColor: '#F07F2E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F07F2E',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  messageButton: {
    width: 56,
    height: 56,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#F07F2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#A0A5BA'
  }
})

export default TrackingOrder