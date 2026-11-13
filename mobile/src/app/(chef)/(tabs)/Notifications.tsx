import NotificationsTabScreen, { NotificationTab } from '../../../components/NotificationsTabScreen'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '@clerk/clerk-expo'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const API_URL = process.env.EXPO_PUBLIC_API_URL

type Restaurant = { _id: string; name: string; image?: string }
type Dish = { _id: string; name: string; image?: string }

type NotificationItem = {
  _id: string
  title: string
  description: string
  rating?: number
  createdAt: string
  restaurantId?: Restaurant | null
  dishId?: Dish | null
}

type Conversation = {
  _id: string
  orderId: string
  user: { _id: string; name: string }
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

const request = async (path: string, token: string | null, method = 'GET') => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(String(response.status))
  return response.status === 204 ? null : response.json()
}

const formatTime = (date: string) => {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d`
  return new Date(date).toLocaleDateString()
}

const Separator = () => <View style={styles.lineSeparator} />

type NotificationListProps = {
  data: NotificationItem[]
  refreshing: boolean
  onRefresh: () => void
  onRemove: (id: string) => void
}

const NotificationList = ({ data, refreshing, onRefresh, onRemove }: NotificationListProps) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onLongPress={() =>
            Alert.alert('Delete notification', 'Remove this notification?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onRemove(item._id) },
            ])
          }
          style={styles.notificationRow}
        >
          {item.restaurantId?.image ? (
            <Image source={{ uri: item.restaurantId.image }} style={styles.profileImg} />
          ) : (
            <View style={styles.profileImg} />
          )}
          <View style={styles.notifMinorContainer}>
            <Text style={styles.userName}>
              {item.title}
              <Text style={styles.orderCategory}> {item.description}</Text>
            </Text>
            <Text style={styles.time}>
              {formatTime(item.createdAt)}
              {item.rating ? `  ·  ★ ${item.rating}` : ''}
            </Text>
          </View>
          {item.dishId?.image ? (
            <Image source={{ uri: item.dishId.image }} style={styles.foodImg} />
          ) : (
            <View style={styles.foodImg} />
          )}
        </TouchableOpacity>
      )}
    />
  )
}

type MessagesListProps = {
  data: Conversation[]
  refreshing: boolean
  onRefresh: () => void
  onRead: (orderId: string, userId: string) => void
  onRemove: (orderId: string, userId: string) => void
}

const MessagesList = ({ data, refreshing, onRefresh, onRead, onRemove }: MessagesListProps) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => `${item.orderId}-${item.user._id}`}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={<Text style={styles.emptyText}>No messages</Text>}
      renderItem={({ item }) => {
        const unread = item.unreadCount > 0

        return (
          <TouchableOpacity
            style={styles.messageRow}
            onPress={() => onRead(item.orderId, item.user._id)}
            onLongPress={() =>
              Alert.alert('Delete conversation', 'Remove this conversation?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onRemove(item.orderId, item.user._id),
                },
              ])
            }
          >
            <View style={styles.messageAvatar}>
              <Text style={styles.avatarInitial}>
                {item.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.messageTextContainer}>
              <Text style={styles.messageName}>{item.user.name}</Text>
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
                {formatTime(item.lastMessageAt)}
              </Text>
              {unread && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
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
  const { getToken } = useAuth()
  const [tab, setTab] = useState<NotificationTab>(NotificationTab.Notifications)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const token = await getToken()
      const [notificationsData, conversationsData] = await Promise.all([
        request('/api/notifications', token),
        request('/api/messages/conversations', token),
      ])
      setNotifications(notificationsData)
      setConversations(conversationsData)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getToken])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  const removeNotification = async (id: string) => {
    setNotifications((current) => current.filter((item) => item._id !== id))
    try {
      await request(`/api/notifications/${id}`, await getToken(), 'DELETE')
    } catch {
      load()
    }
  }

  const markAsRead = async (orderId: string, userId: string) => {
    setConversations((current) =>
      current.map((item) =>
        item.orderId === orderId && item.user._id === userId
          ? { ...item, unreadCount: 0 }
          : item
      )
    )
    try {
      await request(
        `/api/messages/order/${orderId}/read?userId=${userId}`,
        await getToken(),
        'PATCH'
      )
    } catch {
      load()
    }
  }

  const removeConversation = async (orderId: string, userId: string) => {
    setConversations((current) =>
      current.filter((item) => !(item.orderId === orderId && item.user._id === userId))
    )
    try {
      await request(
        `/api/messages/order/${orderId}?userId=${userId}`,
        await getToken(),
        'DELETE'
      )
    } catch {
      load()
    }
  }

  const unreadMessages = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  )

  const showClear = tab === NotificationTab.Notifications && notifications.length > 0

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
        {showClear && (
          <TouchableOpacity style={styles.clearButton}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <NotificationsTabScreen
        selectedTab={tab}
        setSelectedTab={setTab}
        messagesCount={unreadMessages}
      />

      <View style={styles.listWrapper}>
        {loading ? (
          <ActivityIndicator style={styles.loader} color="#FF7622" />
        ) : error ? (
          <Text style={styles.emptyText}>Could not load data</Text>
        ) : tab === NotificationTab.Notifications ? (
          <NotificationList
            data={notifications}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onRemove={removeNotification}
          />
        ) : (
          <MessagesList
            data={conversations}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onRead={markAsRead}
            onRemove={removeConversation}
          />
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
  clearButton: {
    marginLeft: 'auto',
  },
  clearText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#FF7622',
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
  loader: {
    marginTop: 32,
  },
  emptyText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#A0A5BA',
    textAlign: 'center',
    marginTop: 32,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Sen_700Bold',
    fontSize: 18,
    color: '#fff',
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