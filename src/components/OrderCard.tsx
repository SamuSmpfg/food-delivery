import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { Order } from '../../hooks/useOrders'
import { MaterialIcons } from '@expo/vector-icons'

type OrderCardProps = {
  order: Order
  onTrack?: () => void
  onCancel?: () => void
}

const OrderCard = ({ order, onTrack, onCancel }: OrderCardProps) => {
  const isOngoing = order.status !== 'delivered' && order.status !== 'cancelled'
  const date = new Date(order.createdAt)
  const dateLabel = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  const timeLabel = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const itemsLabel = `${String(order.itemsCount).padStart(2, '0')} Items`

  return (
    <SafeAreaView style={styles.orderContainer} edges={['left', 'right']}>
      {isOngoing ? (
        <Text style={styles.orderLabel}>Food</Text>
      ) : (
        <View style={styles.orderStatus}>
          <Text style={styles.orderLabel}>Food</Text>
          {order.status === 'delivered' ? (
            <Text style={styles.orderStatusTextCompleted}>Completed</Text>
          ) : (
            <Text style={styles.orderStatusTextCancelled}>Cancelled</Text>
          )}
        </View>
      )}

      <View style={styles.lineSeparator}/>

      <View>
        <View>
          <View style={styles.foodDetailContainer}>
            <View style={styles.foodImg}/>
            <View style={styles.restaurantDetail}>
              <View style={styles.restaurantAndId}>
                <Text style={[styles.restaurantAndPrice, styles.restaurantName]} numberOfLines={1}>{order.restaurantName}</Text>
                <Text style={styles.id}>#{order._id.slice(-6).toUpperCase()}</Text>
              </View>
              <View style={styles.priceAndFood}>
                <Text style={styles.restaurantAndPrice}>${order.total.toFixed(2)}</Text>
                <View style={styles.lineDivisor}/>
                <Text style={styles.order}>
                  {isOngoing ? itemsLabel : `${dateLabel}, ${timeLabel} - ${itemsLabel}`}
                </Text>
              </View>
            </View>
          </View>
          {isOngoing && (
            <View style={styles.TouchableOpacityContainer}>
              <TouchableOpacity
                style={styles.trackOrderTouchableOpacity}
                onPress={onTrack}>
                <Text style={styles.trackOrderTouchableOpacityText}>Track Order</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelOrderTouchableOpacity} onPress={onCancel}>
                <Text style={styles.cancelOrderTouchableOpacityText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  orderContainer: {
    marginVertical: 30
  },
  lineSeparator: {
    backgroundColor: '#EEF2F6',
    width: 'auto',
    height: 1,
    marginVertical: 12
  },
  orderLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
  },
  foodDetailContainer: {
    flexDirection: 'row',
  },
  foodImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#98A8B8',
  },
  restaurantDetail: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  restaurantAndId: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  restaurantName: {
    flex: 1
  },
  priceAndFood: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
    alignItems: 'center'
  },
  lineDivisor: {
    height: 16,
    width: 1,
    backgroundColor: '#CACCDA',
    borderRadius: 100
  },
  restaurantAndPrice: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    color: '#181C2E'
  },
  id: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#6B6E82',
    textDecorationLine: 'underline'
  },
  order: {
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    color: '#6B6E82',
  },
  TouchableOpacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 48
  },
  trackOrderTouchableOpacity: {
    backgroundColor: '#FF7622',
    flex: 1,
    width: 'auto',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trackOrderTouchableOpacityText: {
    color: '#fff',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  },
  cancelOrderTouchableOpacity: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF7622',
    flex: 1,
    width: 'auto',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelOrderTouchableOpacityText: {
    color: '#FF7622',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  },
  orderStatus: {
    flexDirection: 'row',
    gap: 16
  },
  orderStatusTextCompleted: {
    color: '#059C6A',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  },
  orderStatusTextCancelled: {
    color: '#FF0000',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  }
})

export default OrderCard