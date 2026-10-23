import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { AntDesign, Feather } from '@expo/vector-icons'

type Props = {
    name: string,
    category: string,
    price: number,
    rating: number,
    numberOfRating: string,
    deliveryMode: string
}

const ChefOrderItems = ({name, category, price, rating, numberOfRating, deliveryMode}: Props) => {
  return (
    <View style={styles.foodContainer}>

      <View style={styles.foodImg}/>

      <View style={styles.foodContainerInfo}>
      <Text style={styles.foodPrincipals}>{name}</Text>
        <TouchableOpacity style={styles.moreTouchableOpacity}>
        <Feather name="more-horizontal" size={22} color="#181C2E" />
        </TouchableOpacity>

        <View>
            <View style={styles.categoryBackground}>
                <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            <Text style={styles.foodPrincipals}>{price}</Text>
        </View>
        
        <View>
          <AntDesign name="star" size={24} color="#FB6D3A" />
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.grayTexts}>{numberOfRating}</Text>
            <Text style={styles.grayTexts}>{deliveryMode}</Text>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    moreTouchableOpacity: {
    height: 55,
    width: 55,
    borderRadius: 100,
    backgroundColor: '#ECF0F4',
    alignItems: 'center',
    justifyContent: 'center', 
    marginLeft: 'auto'
  },
  foodContainer: {
    marginHorizontal: 24,
    width: 'auto',
    flexDirection: 'row',
    marginBottom: 16
  },
  foodImg: {
    width: 102,
    height: 102,
    backgroundColor: '#98A8B8',
    borderRadius: 20,
  },
  foodContainerInfo: {
    marginLeft: 16,
    justifyContent: 'space-between'
  },
  foodPrincipals: {
    color: '#32343E',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  },
  categoryBackground: {
    backgroundColor: '#FF762233',
    width: 'auto',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryTitle: {
    color: '#FF7622',
    fontFamily: 'Sen_400Regular',
    fontSize: 14
  },
  rating: {
    color: '#FF7622',
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    marginLeft: 16
  },
  grayTexts: {
    color: '#AFAFAF',
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
  }
})

export default ChefOrderItems