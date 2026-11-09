import AntDesign from '@expo/vector-icons/AntDesign'
import { useCallback, useMemo, useRef, useState } from 'react'
import 'react-native-gesture-handler'
import { Feather, Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Alert } from 'react-native'
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import LineChart from '@/components/LineChart'
import { data, RUNNING } from '@/data/mockData'
import { useFont } from '@shopify/react-native-skia'
import AnimatedText from '@/components/AnimatedText'
import { useSharedValue } from 'react-native-reanimated'
import HorizontalList from '@/components/HorizontalList'
import { router } from 'expo-router'
import { Order } from '../../../../../hooks/useOrders'

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

  const [runningOrders, setRunningOrders] = useState(RUNNING)

  const font = useFont(
    require('@expo-google-fonts/sen/700Bold/Sen_700Bold.ttf'),
    24
  )

  const sheetRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['75%'], [])

  const handleSheetOpen = useCallback(() => {
    sheetRef.current?.present()
  }, [])

  const handleCancelPress = useCallback(
    (orderId: string | number) => {
      Alert.alert(
        'Cancel order?',
        `Are you sure you want to cancel order ${orderId}? This action cannot be undone.`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, cancel',
            style: 'destructive',
            onPress: () => {
              setRunningOrders((prev) =>
                prev.filter((o) => String(o.orderId) !== String(orderId))
              )
              onCancel?.(orderId)
            },
          },
        ],
        { cancelable: true }
      )
    },
    [onCancel]
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

              <TouchableOpacity>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressTouchableOpacity}>Add an address</Text>
                  <Ionicons name="caret-down" size={12} color="#181C2E" />
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.user} />

          </View>

          <View style={styles.ordersContainer}>
            <TouchableOpacity style={styles.orderBox} onPress={handleSheetOpen}>
              <Text style={styles.orderNumbers}>{String(runningOrders.length).padStart(2, '0')}</Text>
              <Text style={styles.orderLabel}>RUNNING ORDERS</Text>
            </TouchableOpacity>
            <TouchableOpacity>
            <View style={styles.orderBox}>
              <Text style={styles.orderNumbers}>05</Text>
              <Text style={styles.orderLabel}>ORDER REQUEST</Text>
            </View>
              </TouchableOpacity>
          </View>
        </View>

        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.containerHeaderTitle}>Total Revenue</Text>
            <TouchableOpacity style={styles.graphExpandButton}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.graphExpandButtonText}>Daily</Text>
                <Feather name="chevron-down" size={12} color="#181C2E" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
            <Text style={styles.seeAllButton}>See Details</Text>
            </TouchableOpacity>
          </View>
          <AnimatedText font={font} selectedValue={selectedValue} />
          <GestureHandlerRootView style={{ height: CHART_HEIGHT }}>
            <LineChart
              data={data}
              chartWidth={CHART_WIDTH}
              chartHeight={CHART_HEIGHT}
              chartMargin={CHART_MARGIN}
              selectedValue={selectedValue}
            />
          </GestureHandlerRootView>
        </View>

        <View style={styles.reviewContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.containerHeaderTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All Reviews</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', paddingTop: 32, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <AntDesign name="star" size={24} color="#FB6D3A" />
              <Text style={styles.restaurantRating}>4.9</Text>
            </View>
            <Text style={styles.totalReviews}>Total 20 Reviews</Text>
          </View>
        </View>

        <View>
          <HorizontalList />
        </View>
        </SafeAreaView>
        </ScrollView>


      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetFlatList
          data={runningOrders}
          keyExtractor={(item) => String(item.orderId)}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.ordinarySheetText}>{runningOrders.length} Running orders</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.sheetOrder}>
              <View style={styles.foodImgSheet} />
              <View style={{ flexDirection: 'column', gap: 4, marginLeft: 16 }}>
                <Text style={styles.foodClass}>{item.class}</Text>
                <Text style={styles.foodName}>{item.title}</Text>
                <Text style={styles.foodId}>ID: {item.orderId}</Text>

                <View style={styles.sheetButtons}>
                  <Text style={[styles.foodName, { fontFamily: 'Sen_400Regular', marginRight: 40 }]}>${item.price}</Text>
                  <TouchableOpacity style={styles.doneTouchableOpacity}>
                    <Text style={{ fontFamily: 'Sen_400Regular', fontSize: 14, color: '#fff' }}>Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelTouchableOpacity}
                    onPress={() => handleCancelPress(item.orderId)}
                  >
                    <Text style={{ fontFamily: 'Sen_400Regular', fontSize: 14, color: '#FF3326' }}>Cancel</Text>
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
  }
})