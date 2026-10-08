import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import TabButtons, { TabButtonType } from './TabButtons'
import { useRouter, useFocusEffect } from 'expo-router'
import OrderCard from './OrderCard'
import useOrders from '../../hooks/useOrders'

export enum CustomTab {
  Tab1,
  Tab2,
}

const TabScreen = () => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<CustomTab>(CustomTab.Tab1)
  const { orders, loading, error, refetch, cancelOrder } = useOrders()

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const buttons: TabButtonType[] = [{ title: 'Ongoing' }, { title: 'History' }]

  const ongoingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status !== 'delivered' && order.status !== 'cancelled'
      ),
    [orders]
  )

  const historyOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'delivered' || order.status === 'cancelled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  )

  const visibleOrders = selectedTab === CustomTab.Tab1 ? ongoingOrders : historyOrders

  const handleCancel = (id: string) => {
    Alert.alert('Cancel order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(id)
          } catch {
            Alert.alert('Error', 'Could not cancel the order')
          }
        },
      },
    ])
  }

  return (
    <>
      <TabButtons
        buttons={buttons}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <View>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF7622" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryTouchableOpacity} onPress={refetch}>
              <Text style={styles.retryTouchableOpacityText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : visibleOrders.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {selectedTab === CustomTab.Tab1
                ? 'You have no ongoing orders'
                : 'You have no order history yet'}
            </Text>
          </View>
        ) : (
          visibleOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onTrack={() => router.push({ pathname: '/(tabs)/TrackingOrder', params: { from: 'orders' } })}
              onCancel={() => handleCancel(order._id)}
            />
          ))
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    marginVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#6B6E82',
    textAlign: 'center',
  },
  retryTouchableOpacity: {
    backgroundColor: '#FF7622',
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryTouchableOpacityText: {
    color: '#fff',
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
  },
})

export default TabScreen