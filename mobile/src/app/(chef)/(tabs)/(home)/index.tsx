import AntDesign from '@expo/vector-icons/AntDesign'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import 'react-native-gesture-handler'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Alert, Image } from 'react-native'
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import LineChart from '@/components/LineChart'
import { useFont } from '@shopify/react-native-skia'
import AnimatedText from '@/components/AnimatedText'
import { useSharedValue } from 'react-native-reanimated'
import HorizontalList from '@/components/HorizontalList'
import { router, useFocusEffect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Order } from '../../../../../hooks/useOrders'
import { useAddresses } from '@/lib/addressStore'
import { useSelectedAddressId } from '@/lib/selectedAddressStore'
import { useAccountAddress } from '../../../../../hooks/useAccountAddress'

const API_URL = process.env.EXPO_PUBLIC_API_URL

type OrderStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'CANCELLED'

type RunningOrder = {
  _id: string
  foodType: 'BREAKFAST' | 'LUNCH' | 'DINNER'
  name: string
  image?: string | null
  orderId: string
  price: number
  status: OrderStatus
}

type GraphPoint = {
  time: string
  revenue: number
}

type GraphResponse = {
  period: string
  date: string | null
  totalRevenue: number
  points: GraphPoint[]
}

type ReviewsSummary = {
  average: number
  total: number
}

type Period = 'DAILY' | 'WEEKLY'

const PERIODS: Period[] = ['DAILY', 'WEEKLY']

const PERIOD_LABELS: Record<Period, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

async function api<T>(path: string, token: string | null, method: string = 'GET'): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL não está definida no .env do app')
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Erro ${res.status}`)
  }

  return res.json()
}

function toChartData(points: GraphPoint[], period: Period) {
  return points.map((p) => {
    const d = new Date(p.time)
    const label =
      period === 'DAILY'
        ? `${d.getHours() % 12 || 12}${d.getHours() < 12 ? 'AM' : 'PM'}`
        : WEEK_DAYS[d.getDay()]

    return { label, value: p.revenue }
  })
}

type ChefHomeProps = {
  order: Order
  onTrack?: () => void
  onCancel?: (orderId?: string | number) => void
}

export default function ChefHome({ order, onTrack, onCancel }: ChefHomeProps) {
  const CHART_HEIGHT = 180
  const CHART_MARGIN = 10
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CHART_WIDTH = SCREEN_WIDTH - 82
  const selectedValue = useSharedValue(0)
  const { getToken } = useAuth()

  const addresses = useAddresses();
  const selectedAddressId = useSelectedAddressId();

  const selectedAddress = addresses.find((item) => item.id === selectedAddressId);
  const selectedAddressText = selectedAddress
    ? `${selectedAddress.address}${selectedAddress.apartment ? ` - Apt ${selectedAddress.apartment}` : ''}`
    : null;
    
  const { address, loading } = useAccountAddress();

  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const [runningOrders, setRunningOrders] = useState<RunningOrder[]>([])
  const [orderRequests, setOrderRequests] = useState<RunningOrder[]>([])
  const [period, setPeriod] = useState<Period>('DAILY')
  const [graph, setGraph] = useState<GraphResponse | null>(null)
  const [graphError, setGraphError] = useState<string | null>(null)
  const [reviewsSummary, setReviewsSummary] = useState<ReviewsSummary>({ average: 0, total: 0 })

  const font = useFont(
    require('@expo-google-fonts/sen/700Bold/Sen_700Bold.ttf'),
    24
  )

  const runningSheetRef = useRef<BottomSheetModal>(null)
  const requestSheetRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['75%'], [])

  const loadOrders = useCallback(async () => {
    try {
      const token = await getTokenRef.current()
      const res = await api<{ count: number; orders: RunningOrder[] }>('/api/running-orders', token)
      setRunningOrders(res.orders)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    }
  }, [])

  const loadOrderRequests = useCallback(async () => {
    try {
      const token = await getTokenRef.current()
      const res = await api<{ count: number; orders: RunningOrder[] }>('/api/running-orders?status=PENDING', token)
      setOrderRequests(res.orders)
    } catch (error) {
      console.error('Erro ao carregar order requests:', error)
    }
  }, [])

  const loadReviewsSummary = useCallback(async () => {
    try {
      const token = await getTokenRef.current()
      const res = await api<ReviewsSummary>('/api/reviews/mine/summary', token)
      setReviewsSummary({ average: res.average ?? 0, total: res.total ?? 0 })
    } catch (error) {
      console.error('Erro ao carregar resumo das reviews:', error)
    }
  }, [])

  useEffect(() => {
    loadOrders()
    loadOrderRequests()
  }, [loadOrders, loadOrderRequests])

  useFocusEffect(
    useCallback(() => {
      loadReviewsSummary()
    }, [loadReviewsSummary])
  )

  useEffect(() => {
    let cancelled = false

    async function loadGraph() {
      try {
        setGraphError(null)

        const token = await getTokenRef.current()
        const res = await api<GraphResponse>(`/api/graph?period=${period}`, token)

        if (cancelled) return

        setGraph(res)
        selectedValue.value = res.totalRevenue
      } catch (error) {
        if (cancelled) return

        console.error('Erro ao carregar gráfico:', error)
        setGraph(null)
        setGraphError(error instanceof Error ? error.message : 'Erro ao carregar gráfico')
      }
    }

    loadGraph()

    return () => {
      cancelled = true
    }
  }, [period])

  const chartData = useMemo(
    () => toChartData(graph?.points ?? [], period),
    [graph, period]
  )

  const ratingText = reviewsSummary.total > 0 ? reviewsSummary.average.toFixed(1) : '--'
  const totalReviewsText = `Total ${reviewsSummary.total} ${reviewsSummary.total === 1 ? 'Review' : 'Reviews'}`

  const handlePeriodPress = useCallback(() => {
    setPeriod((current) => PERIODS[(PERIODS.indexOf(current) + 1) % PERIODS.length])
  }, [])

  const handleSeeAllReviews = useCallback(() => {
    router.push({ pathname: '/(chef)/(tabs)/(profile)/Reviews', params: { type: 'mine' } })
  }, [])

  const handleSheetOpenRunningOrders = useCallback(() => {
    loadOrders()
    runningSheetRef.current?.present()
  }, [loadOrders])

  const handleSheetOpenRequestOrders = useCallback(() => {
    loadOrderRequests()
    requestSheetRef.current?.present()
  }, [loadOrderRequests])

  const handleDonePress = useCallback(
    async (item: RunningOrder) => {
      try {
        const token = await getTokenRef.current()
        await api(`/api/running-orders/${item._id}/done`, token, 'PATCH')
        setRunningOrders((prev) => prev.filter((o) => o._id !== item._id))
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Could not finish the order')
      }
    },
    []
  )

  const handleCancelPress = useCallback(
    (item: RunningOrder) => {
      Alert.alert(
        'Cancel order?',
        `Are you sure you want to cancel order ${item.orderId}? This action cannot be undone.`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                const token = await getTokenRef.current()
                await api(`/api/running-orders/${item._id}/cancel`, token, 'PATCH')
                setRunningOrders((prev) => prev.filter((o) => o._id !== item._id))
                onCancel?.(item.orderId)
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Could not cancel the order')
              }
            },
          },
        ],
        { cancelable: true }
      )
    },
    [onCancel]
  )

  const handleAcceptRequest = useCallback(
    async (item: RunningOrder) => {
      try {
        const token = await getTokenRef.current()
        await api(`/api/running-orders/${item._id}/accept`, token, 'PATCH')

        setOrderRequests((prev) => prev.filter((o) => o._id !== item._id))
        setRunningOrders((prev) => [{ ...item, status: 'RUNNING' }, ...prev])
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Could not accept the order')
      }
    },
    []
  )

  const handleDeclineRequest = useCallback(
    (item: RunningOrder) => {
      Alert.alert(
        'Decline order?',
        `Are you sure you want to decline order ${item.orderId}?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, decline',
            style: 'destructive',
            onPress: async () => {
              try {
                const token = await getTokenRef.current()
                await api(`/api/running-orders/${item._id}/decline`, token, 'PATCH')
                setOrderRequests((prev) => prev.filter((o) => o._id !== item._id))
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Could not decline the order')
              }
            },
          },
        ],
        { cancelable: true }
      )
    },
    []
  )

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.67}
        pressBehavior="close"
        style={[props.style, { backgroundColor: '#273F55AB' }]}
      />
    ),
    []
  )

  if (!font) { return null };
  return (
    <>
      <ScrollView  style={styles.rootContainer}>
    <SafeAreaView style={styles.scrollView}>
        <View style={styles.safeAreaContainer}>
          <View style={styles.headerContainer}>

            <TouchableOpacity style={styles.linesTouchableOpacity}>
              <AntDesign name="align-left" size={24} color="#181C2E" />
            </TouchableOpacity>

            <View style={styles.locationContainer}>
              <Text style={styles.addressLabel}>Location</Text>

              <TouchableOpacity
                style={styles.locationUserPopUp}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({ pathname: '/(chef)/(tabs)/(home)/Adresses', params: { select: 'true' } })
                }
              >
                <Text
                  style={styles.locationUser}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedAddressText ?? (loading ? 'Loading...' : address || 'Add an address')}
                </Text>
                <MaterialCommunityIcons name="menu-down" size={24} color="#676767" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.user} />

          </View>

          <View style={styles.ordersContainer}>
            <TouchableOpacity style={styles.orderBox} onPress={handleSheetOpenRunningOrders}>
              <Text style={styles.orderNumbers}>{String(runningOrders.length).padStart(2, '0')}</Text>
              <Text style={styles.orderLabel}>RUNNING ORDERS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderBox} onPress={handleSheetOpenRequestOrders}>
              <Text style={styles.orderNumbers}>{String(orderRequests.length).padStart(2, '0')}</Text>
              <Text style={styles.orderLabel}>ORDER REQUEST</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.containerHeaderTitle}>Total Revenue</Text>
            <TouchableOpacity style={styles.graphExpandButton} onPress={handlePeriodPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.graphExpandButtonText}>{PERIOD_LABELS[period]}</Text>
                <Feather name="chevron-down" size={12} color="#181C2E" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
            <Text style={styles.seeAllButton}>See Details</Text>
            </TouchableOpacity>
          </View>
          <AnimatedText font={font} selectedValue={selectedValue} />
          <GestureHandlerRootView style={{ height: CHART_HEIGHT }}>
            {graphError ? (
              <View style={styles.emptyChart}>
                <Text style={styles.chartErrorText}>{graphError}</Text>
              </View>
            ) : chartData.length >= 2 ? (
              <LineChart
                key={period}
                data={chartData}
                chartWidth={CHART_WIDTH}
                chartHeight={CHART_HEIGHT}
                chartMargin={CHART_MARGIN}
                selectedValue={selectedValue}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.containerHeaderTitle}>No revenue data yet</Text>
              </View>
            )}
          </GestureHandlerRootView>
        </View>

        <View style={styles.reviewContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.containerHeaderTitle}>Reviews</Text>
            <TouchableOpacity onPress={handleSeeAllReviews}>
              <Text style={styles.seeAllButton}>See All Reviews</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', paddingTop: 32, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <AntDesign name="star" size={24} color="#FB6D3A" />
              <Text style={styles.restaurantRating}>{ratingText}</Text>
            </View>
            <Text style={styles.totalReviews}>{totalReviewsText}</Text>
          </View>
        </View>

        <View>
          <HorizontalList />
        </View>
        </SafeAreaView>
        </ScrollView>

      <BottomSheetModal
        ref={runningSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetFlatList
          data={runningOrders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.ordinarySheetText}>{runningOrders.length} Running orders</Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No running orders</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.sheetOrder}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.foodImgSheet} resizeMode="cover" />
              ) : (
                <View style={styles.foodImgSheet} />
              )}
              <View style={{ flexDirection: 'column', gap: 4, marginLeft: 16 }}>
                <Text style={styles.foodClass}>{item.foodType}</Text>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodId}>ID: {item.orderId}</Text>

                <View style={styles.sheetButtons}>
                  <Text style={[styles.foodName, { fontFamily: 'Sen_400Regular', marginRight: 40 }]}>${item.price}</Text>
                  <TouchableOpacity
                    style={styles.doneTouchableOpacity}
                    onPress={() => handleDonePress(item)}
                  >
                    <Text style={{ fontFamily: 'Sen_400Regular', fontSize: 14, color: '#fff' }}>Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelTouchableOpacity}
                    onPress={() => handleCancelPress(item)}
                  >
                    <Text style={{ fontFamily: 'Sen_400Regular', fontSize: 14, color: '#FF3326' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={requestSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetFlatList
          data={orderRequests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.ordinarySheetText}>{orderRequests.length} Order requests</Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No order requests</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.sheetOrder}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.foodImgSheet} resizeMode="cover" />
              ) : (
                <View style={styles.foodImgSheet} />
              )}
              <View style={{ flexDirection: 'column', gap: 4, marginLeft: 16 }}>
                <Text style={styles.foodClass}>{item.foodType}</Text>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodId}>ID: {item.orderId}</Text>

                <View style={styles.sheetButtons}>
                  <Text style={[styles.foodName, { fontFamily: 'Sen_400Regular', marginRight: 24 }]}>${item.price}</Text>
                  <TouchableOpacity
                    style={styles.acceptTouchableOpacity}
                    onPress={() => handleAcceptRequest(item)}
                  >
                    <Text style={{ fontFamily: 'Sen_400Regular', fontSize: 14, color: '#fff' }}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelTouchableOpacity}
                    onPress={() => handleDeclineRequest(item)}
                  >
                    <Text style={{ fontFamily: 'Sen_400Regular', fontSize: 14, color: '#FF3326' }}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </BottomSheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f7f8f9',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 54
  },
  safeAreaContainer: {
    paddingHorizontal: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationContainer: {
    marginLeft: 16
  },
  linesTouchableOpacity: {
    backgroundColor: '#fff',
    width: 55,
    height: 55,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addressLabel: {
    color: '#FF7622',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  },
  addressTouchableOpacity: {
    color: '#676767',
    fontFamily: 'Sen_400Regular',
    fontSize: 12
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  user: {
    backgroundColor: '#98A8B8',
    width: 55,
    height: 55,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto'
  },
  ordersContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 16
  },
  orderBox: {
    backgroundColor: '#fff',
    width: 168,
    height: 136,
    borderRadius: 20,
    justifyContent: 'center',
    padding: 16,
  },
  orderNumbers: {
    fontFamily: 'Sen_700Bold',
    fontSize: 52,
    marginBottom: 4,
    color: '#32343E'
  },
  orderLabel: {
    fontFamily: 'Sen_700Bold',
    fontSize: 12,
    color: '#838799'
  },
  sheetBackground: {
    backgroundColor: '#fff'
  },
  sheetContent: {
    padding: 24
  },
  sheetOrder: {
    flexDirection: 'row',
    marginVertical: 16,
    alignItems: 'center',
  },
  foodImgSheet: {
    height: 102,
    width: 102,
    borderRadius: 20,
    backgroundColor: '#98A8B8'
  },
  foodClass: {
    color: '#ED7A63',
    fontFamily: 'Sen_400Regular',
    fontSize: 14
  },
  foodId: {
    color: '#9C9BA6',
    fontFamily: 'Sen_400Regular',
    fontSize: 14
  },
  foodName: {
    color: '#32343E',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  },
  priceAndTouchableOpacities: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '83%'
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1
  },
  doneTouchableOpacity: {
    backgroundColor: '#FF7622',
    width: 61,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptTouchableOpacity: {
    backgroundColor: '#FF7622',
    width: 'auto',
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelTouchableOpacity: {
    borderColor: '#FF3326',
    borderWidth: 1,
    width: 'auto',
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  ordinarySheetText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#181C2E'
  },
  emptyListText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#9C9BA6',
    textAlign: 'center',
    marginTop: 48
  },
  graphContainer: {
    backgroundColor: '#fff',
    width: 'auto',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 24,
    overflow: 'hidden'
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  graphExpandButton: {
    borderColor: '#E8EAED',
    width: 'auto',
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  graphExpandButtonText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    color: '#9C9BA6',
    marginRight: 8
  },
  emptyChart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartErrorText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    color: '#FF3326',
    textAlign: 'center',
    paddingHorizontal: 16
  },
  containerHeaderTitle: {
    color: '#32343E',
    fontSize: 14,
    fontFamily: 'Sen_400Regular'
  },
  seeAllButton: {
    color: '#FB6D3A',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    textDecorationLine: 'underline',
  },
  graphPrice: {
    fontFamily: 'Sen_700Bold',
    fontSize: 22,
    color: '#32343E'
  },
  reviewContainer: {
    width: 'auto',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 16
  },
  restaurantRating: {
    color: '#FB6D3A',
    fontSize: 21,
    fontFamily: 'Sen_700Bold'
  },
  totalReviews: {
    color: '#32343E',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    marginLeft: 16
  },
    locationUserPopUp: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%'
  },
    locationUser: {
    flexShrink: 1,
    color: '#676767',
    fontSize: 12,
    fontFamily: 'Sen_400Regular',
    maxWidth: 160
  },
})