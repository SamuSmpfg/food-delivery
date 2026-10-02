import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

export type RestaurantFilters = {
  offers: string[]
  deliverTime: string
  pricing: string
  rating: number
}

type FilterModalProps = {
  visible: boolean
  onClose: () => void
  onApply: (filters: RestaurantFilters) => void
}

const OFFERS = ['Delivery', 'Pick Up', 'Offer', 'Online payment available']
const DELIVER_TIMES = ['10-15 min', '20 min', '30 min']
const PRICES = ['$', '$$', '$$$']

const FilterModal = ({ visible, onClose, onApply }: FilterModalProps) => {
  const [offers, setOffers] = useState<string[]>([])
  const [deliverTime, setDeliverTime] = useState('10-15 min')
  const [pricing, setPricing] = useState('$$')
  const [rating, setRating] = useState(4)

  const toggleOffer = (offer: string) => {
    setOffers((current) =>
      current.includes(offer) ? current.filter((item) => item !== offer) : [...current, offer]
    )
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter your search</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={18} color="#181C2E" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>OFFERS</Text>
          <View style={styles.chipsWrap}>
            {OFFERS.map((offer) => {
              const selected = offers.includes(offer)
              return (
                <TouchableOpacity
                  key={offer}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleOffer(offer)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{offer}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={styles.label}>DELIVER TIME</Text>
          <View style={styles.chipsWrap}>
            {DELIVER_TIMES.map((time) => {
              const selected = deliverTime === time
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setDeliverTime(time)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{time}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={styles.label}>PRICING</Text>
          <View style={styles.chipsWrap}>
            {PRICES.map((price) => {
              const selected = pricing === price
              return (
                <TouchableOpacity
                  key={price}
                  style={[styles.roundChip, selected && styles.chipSelected]}
                  onPress={() => setPricing(price)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{price}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={styles.label}>RATING</Text>
          <View style={styles.chipsWrap}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} style={styles.roundChip} onPress={() => setRating(star)}>
                <MaterialIcons
                  name="star"
                  size={22}
                  color={star <= rating ? '#FF7622' : '#CACCD3'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              onApply({ offers, deliverTime, pricing, rating })
              onClose()
            }}
          >
            <Text style={styles.filterButtonText}>FILTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(50,60,80,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#181C2E'
  },
  closeButton: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: '#ECF0F4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    color: '#32343E',
    marginTop: 20,
    marginBottom: 12
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    height: 46,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#EDEDED',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  roundChip: {
    width: 46,
    height: 46,
    borderWidth: 2,
    borderColor: '#EDEDED',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipSelected: {
    backgroundColor: '#FF7622',
    borderColor: '#FF7622'
  },
  chipText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#181C2E'
  },
  chipTextSelected: {
    color: '#fff'
  },
  filterButton: {
    height: 62,
    borderRadius: 12,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28
  },
  filterButtonText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: '#fff'
  }
})

export default FilterModal