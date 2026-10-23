import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '../../../components/TabBar'

export default function ChefTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="FoodList" />
      <Tabs.Screen name="AddNew" />
      <Tabs.Screen name="Notifications" />
      <Tabs.Screen name="Profile" />
    </Tabs>
  )
}