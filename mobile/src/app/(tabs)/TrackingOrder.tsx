import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Animated, PanResponder, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import useLocation from '../../../hooks/useLocation'
import useBackHandler from '../../../hooks/useBackHandler'

const API_URL = process.env.EXPO_PUBLIC_API_URL

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7
const COLLAPSED_HEIGHT = 210
const MAX_OFFSET = SHEET_HEIGHT - COLLAPSED_HEIGHT
const POLL_INTERVAL_MS = 10000
const RECENT_FINISHED_MS = 60 * 60 * 1000

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

const STEPS = [
  'Your order has been received',
  'The restaurant is preparing your food',
  'Your order has been picked up for delivery',
  'Order arriving soon!'
]

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'

type ApiOrderItem = {
  _id?: string
  name: string
  quantity: number
}

type ApiOrder = {
  _id: string
  status: OrderStatus
  items: ApiOrderItem[]
  restaurantName?: string
  restaurantImage?: string
  estimatedMinutes?: number
  createdAt: string
  updatedAt: string
}

type Chef = {
  _id: string
  name: string
  image?: string | null
}

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'delivering']

const STAGE_BY_STATUS: Record<OrderStatus, number> = {
  pending: 0,
  accepted: 1,
  preparing: 1,
  ready: 2,
  delivering: 3,
  delivered: STEPS.length,
  cancelled: 0
}

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
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { latitude, longitude, getLocation } = useLocation()
  const [now, setNow] = useState(Date.now())
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loaded, setLoaded] = useState(false)
  const [chef, setChef] = useState<Chef | null>(null)

  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const translateY = useRef(new Animated.Value(0)).current
  const currentY = useRef(0)
  const startY = useRef(0)

  useEffect(() => {
    getLocation()
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !API_URL) return
    try {
      const token = await getTokenRef.current()
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data: ApiOrder[] = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoaded(true)
      setNow(Date.now())
    }
  }, [isLoaded, isSignedIn])

  useFocusEffect(
    useCallback(() => {
      fetchOrders()
      const interval = setInterval(fetchOrders, POLL_INTERVAL_MS)
      return () => clearInterval(interval)
    }, [fetchOrders])
  )

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

  const order = useMemo(() => {
    const active = orders.find((item) => ACTIVE_STATUSES.includes(item.status))
    if (active) return active

    return (
      orders.find(
        (item) =>
          (item.status === 'delivered' || item.status === 'cancelled') &&
          now - new Date(item.updatedAt).getTime() < RECENT_FINISHED_MS
      ) ?? null
    )
  }, [orders, now])

  const orderId = order?._id

  useEffect(() => {
    if (!orderId || !isLoaded || !isSignedIn || !API_URL) return

    let active = true
    setChef(null)

    const loadChef = async () => {
      try {
        const token = await getTokenRef.current()
        const res = await fetch(`${API_URL}/api/messages/order/${orderId}/contact`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const data: Chef = await res.json()
        if (active) setChef(data)
      } catch (error) {
        console.error('Error loading chef:', error)
      }
    }

    loadChef()

    return () => {
      active = false
    }
  }, [orderId, isLoaded, isSignedIn])

  const detailsOpacity = translateY.interpolate({
    inputRange: [0, MAX_OFFSET * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  })

  const cancelled = order?.status === 'cancelled'
  const delivered = order?.status === 'delivered'
  const stage = order ? STAGE_BY_STATUS[order.status] : 0

  const etaMinutes = order?.estimatedMinutes && order.estimatedMinutes > 0 ? order.estimatedMinutes : 30
  const elapsed = order ? now - new Date(order.createdAt).getTime() : 0
  const remaining = Math.max(0, Math.ceil((etaMinutes * 60000 - elapsed) / 60000))

  const etaValue = cancelled
    ? 'Cancelled'
    : delivered
      ? 'Delivered'
      : remaining > 0
        ? `${remaining} min`
        : 'Soon'

  const etaLabel = cancelled
    ? 'THIS ORDER WAS CANCELLED'
    : delivered
      ? 'ENJOY YOUR MEAL!'
      : 'ESTIMATED DELIVERY TIME'

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

        {!loaded ? (
          <View style={styles.empty}>
            <ActivityIndicator color="#F07F2E" />
          </View>
        ) : order ? (
          <View style={styles.sheetContent}>
            <View style={styles.orderHeader}>
              {order.restaurantImage ? (
                <Image source={{ uri: order.restaurantImage }} style={styles.restaurantImage} resizeMode="cover" />
              ) : (
                <View style={styles.restaurantImage} />
              )}
              <View style={styles.orderInfo}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {order.restaurantName ?? ''}
                </Text>
                <Text style={styles.orderedAt}>Ordered At {formatOrderedAt(new Date(order.createdAt).getTime())}</Text>
                <View style={styles.itemsList}>
                  {order.items.map((item, index) => (
                    <Text key={item._id ?? String(index)} style={styles.itemText} numberOfLines={1}>
                      <Text style={styles.itemQuantity}>{item.quantity}x </Text>
                      {item.name}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <Animated.View style={[styles.details, { opacity: detailsOpacity }]}>
              <View style={styles.etaBlock}>
                <Text style={styles.etaValue}>{etaValue}</Text>
                <Text style={styles.etaLabel}>{etaLabel}</Text>
              </View>

              {!cancelled && (
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
              )}

              {!cancelled && (
                <View style={[styles.courierCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                  {chef?.image ? (
                    <Image source={{ uri: chef.image }} style={styles.courierAvatar} resizeMode="cover" />
                  ) : (
                    <View style={styles.courierAvatar}>
                      <Ionicons name="person" size={28} color="#fff" />
                    </View>
                  )}
                  <View style={styles.courierInfo}>
                    <Text style={styles.courierName} numberOfLines={1}>
                      {chef?.name ?? order.restaurantName ?? ''}
                    </Text>
                    <Text style={styles.courierRole}>Chef</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => router.navigate('/(tabs)/Call')}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() =>
                      router.navigate({ pathname: '/(tabs)/Chat', params: { orderId: order._id } })
                    }
                  >
                    <FontAwesome5 name="facebook-messenger" size={24} color="#F07F2E" />
                  </TouchableOpacity>
                </View>
              )}
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