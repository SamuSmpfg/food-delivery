import NotificationsTabScreen, { NotificationTab } from '../../../components/NotificationsTabScreen'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NOTIFICATIONS, MESSAGES } from '@/data/mockData'

const Separator = () => <View style={styles.lineSeparator} />

const NotificationList = () => {
  return (
    <FlatList
      data={NOTIFICATIONS}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.notificationRow}>
          <View style={styles.profileImg} />
          <View style={styles.notifMinorContainer}>
            <Text style={styles.userName}>
              {item.name}
              <Text style={styles.orderCategory}> {item.notificationCategory}</Text>
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <View style={styles.foodImg} />
        </View>
      )}
    />
  )
}

const MessagesList = () => {
  return (
    <FlatList
      data={MESSAGES}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const unread = item.notificationsNumber !== false

        return (
          <TouchableOpacity style={styles.messageRow}>
            <View style={styles.messageAvatar}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.status ? '#3FCB4F' : '#A0A5BA' },
                ]}
              />
            </View>

            <View style={styles.messageTextContainer}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.lastMessage,
                  { color: unread ? '#181C2E' : '#A0A5BA' },
                ]}
              >
                {item.lastMessage}
              </Text>
            </View>

            <View style={styles.messageMeta}>
              <Text
                style={[
                  styles.messageTime,
                  { color: unread ? '#181C2E' : '#A0A5BA' },
                ]}
              >
                {item.time}
              </Text>
              {unread && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.notificationsNumber}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )
      }}
    />
  )
}

  const Notifications = () => {
  const router = useRouter()
  const [tab, setTab] = useState<NotificationTab>(NotificationTab.Notifications)

  const unreadMessages = MESSAGES.reduce(
    (total, message) => total + (message.notificationsNumber || 0),
    0
  )

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackTouchableOpacity}
        >
          <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tab === NotificationTab.Notifications ? 'Notifications' : 'Messages'}
        </Text>
      </View>

      <NotificationsTabScreen
        selectedTab={tab}
        setSelectedTab={setTab}
        messagesCount={unreadMessages}
      />

      <View style={styles.listWrapper}>
        {tab === NotificationTab.Notifications ? (
          <NotificationList />
        ) : (
          <MessagesList />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#181C2E',
  },
  goBackTouchableOpacity: {
    backgroundColor: '#ECF0F4',
    height: 45,
    width: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  lineSeparator: {
    height: 1,
    backgroundColor: '#F0F5FA',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  profileImg: {
    backgroundColor: '#98A8B8',
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  notifMinorContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingRight: 16,
  },
  userName: {
    fontFamily: 'Sen_400Regular',
    color: '#181C2E',
    fontSize: 13,
  },
  orderCategory: {
    color: '#98A8B8',
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
  },
  time: {
    color: '#98A8B8',
    fontFamily: 'Sen_400Regular',
    fontSize: 11,
    marginTop: 8,
  },
  foodImg: {
    backgroundColor: '#98A8B8',
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  messageAvatar: {
    backgroundColor: '#98A8B8',
    width: 48,
    height: 48,
    borderRadius: 100,
  },
  statusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageTextContainer: {
    flex: 1,
    gap: 6,
  },
  messageName: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#181C2E',
  },
  lastMessage: {
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
  },
  messageMeta: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 32,
  },
  messageTime: {
    fontFamily: 'Sen_400Regular',
    fontSize: 10,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 12,
    color: '#fff',
  },
})

export default Notifications