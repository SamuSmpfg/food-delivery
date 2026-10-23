import { View, Text, StyleSheet } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import TabButtons, { TabButtonType } from './TabButtons'

export enum FoodTab {
  All,
  Breakfast,
  Lunch,
  Dinner,
}

export const FOOD_CLASSIFICATIONS: TabButtonType[] = [
  { title: 'All' },
  { title: 'Breakfast' },
  { title: 'Lunch' },
  { title: 'Dinner' },
]

type FoodClassTabScreenProps = {
  selectedFoodTab: FoodTab
  setSelectedFoodTab: Dispatch<SetStateAction<FoodTab>>
  totalItems: number
}

const FoodClassTabScreen = ({
  selectedFoodTab,
  setSelectedFoodTab,
  totalItems,
}: FoodClassTabScreenProps) => {
  return (
    <>
      <TabButtons
        buttons={FOOD_CLASSIFICATIONS}
        selectedTab={selectedFoodTab}
        setSelectedTab={setSelectedFoodTab}
      />

      <View style={styles.centerContainer}>
        <Text style={styles.totalItems}>Total Items ({totalItems})</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    gap: 16,
  },
  totalItems: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#9C9BA6',
    marginVertical: 32
  },
})

export default FoodClassTabScreen