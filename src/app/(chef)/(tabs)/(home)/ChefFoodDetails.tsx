import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';

type Props = {}

type Ingredient = {
  id: string
  name: string
  allergy?: boolean
}

const INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Salt' },
  { id: '2', name: 'Chicken' },
  { id: '3', name: 'Onion', allergy: true },
  { id: '4', name: 'Garlic' },
  { id: '5', name: 'Pappers', allergy: true },
  { id: '6', name: 'Ginger' },
  { id: '7', name: 'Broccoli' },
  { id: '8', name: 'Orange' },
  { id: '9', name: 'Walnut' },
]

const ChefFoodDetails = (props: Props) => {

  const router = useRouter()

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <TouchableOpacity style={styles.ingredientItem}>
      <View style={styles.ingredientCircle}>
        <Text style={styles.ingredientCircleText} numberOfLines={1} adjustsFontSizeToFit>
          {item.name}
        </Text>
      </View>
      {item.allergy && <Text style={styles.ingredientAllergy}>(Alergy)</Text>}
    </TouchableOpacity>
  )

  const renderListHeader = () => (
    <View>
      <View style={styles.foodImg}>
        <View style={styles.foodClass}>
          <Text style={styles.foodClassText}>Breakfest</Text>
        </View>
        <View style={styles.foodClass}>
          <Text style={styles.foodClassText}>Delivery</Text>
        </View>
      </View>

      <View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.foodNameAndPrice}>Chicken Thai Biriyani</Text>
          <Text style={styles.foodNameAndPrice}>$60</Text>
        </View>

        <View style={{flexDirection: 'row', marginTop: 8, alignItems: 'center'}}>
          <FontAwesome6 name="location-dot" size={16} color="#AFAFAF" />
          <Text style={styles.addressAndReviews}>Kentucky 39495</Text>

          <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto'}}>
            <AntDesign name="star" size={24} color="#FB6D3A" />
            <Text style={styles.rating}>4.9</Text>
            <Text style={styles.addressAndReviews}>(10 reviews)</Text>
          </View>
        </View>
      </View>

      <View style={styles.lineSeparator}/>

      <Text style={styles.ingredientsTitle}>INGRIDENTS</Text>
    </View>
  )

  const renderListFooter = () => (
    <View style={styles.footer}>
      <View style={styles.lineSeparator}/>

      <Text style={styles.ingredientsTitle}>DESCRIPTION</Text>
      <Text style={styles.descriptionText}>
        Lorem ipsum dolor sit amet, consetdur Maton adipiscing elit. Bibendum in vel, mattis et amet dui mauris turpis.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackTouchableOpacity}>
          <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
        </TouchableOpacity>

        <Text style={styles.title}>Food Details</Text>
        <TouchableOpacity>
          <Text style={styles.editTouchableOpacity}>EDIT</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={INGREDIENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderIngredient}
        numColumns={5}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ingredientsList}
      />

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        paddingHorizontal: 24
    },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

  },
    goBackTouchableOpacity: {
    backgroundColor: '#ECF0F4',
    height: 45,
    width: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
    title: {
    color: '#32343E',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    marginRight: 'auto'
  },
  editTouchableOpacity: {
    color: '#FB6D3A',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
  },
  foodImg: {
    width: 'auto',
    height: 230,
    borderRadius: 20,
    backgroundColor: '#98A8B8',
    marginTop: 32,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between'
  },
  foodClass: {
    backgroundColor: '#FFFFFFCC',
    width: 'auto',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  foodClassText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#32343E'
  },
  addressAndReviews: {
    color: '#AFAFAF',
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    marginLeft: 8
  },
  rating: {
    color: '#FB6D3A',
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    marginLeft: 8
  },
  foodNameAndPrice: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#32343E'
  },
  lineSeparator: {
    width: 'auto',
    backgroundColor: '#F0F4F9',
    height: 1,
    marginVertical: 24
  },
  ingredientsTitle: {
    color: '#32343E',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    marginBottom: 16
  },
  ingredientsList: {
    rowGap: 16,
    paddingBottom: 120
  },
  ingredientItem: {
    width: '20%',
    alignItems: 'center'
  },
  ingredientCircle: {
    width: '88%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#FDEBE4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  ingredientCircleText: {
    color: '#FF7622',
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    textAlign: 'center'
  },
  ingredientAllergy: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 9,
    marginTop: 4
  },
  footer: {
    width: '100%'
  },
  descriptionText: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 22
  }
})

export default ChefFoodDetails