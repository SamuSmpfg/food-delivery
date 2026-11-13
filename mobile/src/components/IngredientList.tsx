import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { INGREDIENTS, IngredientCategory } from '@/data/mockData'

export type SelectedIngredient = { id: string; name: string; kind: string }

type Props = {
  selectedIds: string[]
  onToggle: (ingredient: SelectedIngredient) => void
}

const SECTIONS: IngredientCategory[] = ['Basic', 'Fruit']

const IngredientList = ({ selectedIds, onToggle }: Props) => {
  return (
    <View>
      {SECTIONS.map((section) => (
        <View key={section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section}</Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            data={INGREDIENTS.filter((item) => item.category === section)}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }) => {
              const selected = selectedIds.includes(item.id)
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    onToggle({
                      id: item.id,
                      name: item.name,
                      kind: item.category.toLowerCase(),
                    })
                  }
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#32343E',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  chip: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E8EAED',
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#FDE9E2',
    borderColor: '#FDE9E2',
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: 'Sen_400Regular',
    color: '#7E8A97',
  },
  chipLabelSelected: {
    color: '#FF7622',
  },
})

export default IngredientList