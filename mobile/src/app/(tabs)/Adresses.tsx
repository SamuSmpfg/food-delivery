import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Address, AddressLabel, removeAddress, useAddresses } from '../../lib/addressStore'
import { setSelectedAddressId, useSelectedAddressId } from '../../lib/selectedAddressStore'

const ICONS: Record<AddressLabel, { name: keyof typeof MaterialIcons.glyphMap; color: string }> = {
  Home: { name: 'home', color: '#4A90C2' },
  Work: { name: 'work-outline', color: '#9B4FB8' },
  Other: { name: 'location-on', color: '#FF7622' },
}

const Adresses = () => {

  const router = useRouter();
  const addresses = useAddresses();
  const { select } = useLocalSearchParams<{ select?: string }>();
  const selectMode = select === 'true';
  const selectedAddressId = useSelectedAddressId();

  const handleSelect = (item: Address) => {
    setSelectedAddressId(item.id)
    router.back()
  }

  const confirmDelete = (item: Address) => {
    Alert.alert('Excluir endereço', `Deseja excluir o endereço "${item.label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeAddress(item.id) },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <View style={styles.goBackTouchableOpacity}>
              <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
            </View>
          </TouchableOpacity>
          <Text style={styles.myAdress}>My Address</Text>
        </View>

        <View style={styles.addressContainer}>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="location-on" size={48} color="#C5CBD6" />
              <Text style={styles.emptyText}>Você ainda não tem endereços salvos</Text>
            </View>
          ) : (
            addresses.map((item) => {
              const icon = ICONS[item.label]
              const complement = item.apartment ? ` - Apt ${item.apartment}` : ''
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={selectMode ? 0.7 : 1}
                  onPress={selectMode ? () => handleSelect(item) : undefined}
                  style={[
                    styles.card,
                    selectMode && item.id === selectedAddressId && styles.cardSelected,
                  ]}
                >
                  <View style={styles.cardIconContainer}>
                    <MaterialIcons name={icon.name} size={26} color={icon.color} />
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.label.toUpperCase()}</Text>
                    <Text style={styles.cardAddress}>
                      {item.address}
                      {complement}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      hitSlop={10}
                      onPress={() =>
                        router.push({ pathname: '/(tabs)/AddAddress', params: { id: item.id } })
                      }
                    >
                      <MaterialIcons name="edit" size={22} color="#FF7622" />
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={10} onPress={() => confirmDelete(item)}>
                      <MaterialIcons name="delete-outline" size={22} color="#FF7622" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>

      <TouchableOpacity 
      style={styles.addAddressTouchableOpacity}
      onPress={() => router.push('/(tabs)/AddAddress')}
      >
        <Text style={styles.addAddressTouchableOpacityText}>ADD NEW ADDRESS</Text>
      </TouchableOpacity>

      </SafeAreaView>
    </ScrollView>
  )
}

const styles =  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24
  },
  headerContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 24
  },
  goBackTouchableOpacity: {
    backgroundColor: '#ECF0F4',
    width: 45,
    height: 45,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myAdress: {
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#181C2E'
  },
  addAddressTouchableOpacity: {
    backgroundColor: '#FF7622',
    width: 'auto',
    height: 62,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  addAddressTouchableOpacityText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  addressContainer: {
    minHeight: 600,
    gap: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12
  },
  emptyText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#A0A5BA'
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F5FA',
    borderRadius: 16,
    padding: 14,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#FF7622',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  cardTitle: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#181C2E',
    marginBottom: 6,
  },
  cardAddress: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#A0A5BA',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 14,
  },
})

export default Adresses