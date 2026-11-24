import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
    Keyboard,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import EmojiPicker from 'rn-emoji-keyboard'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const POLL_INTERVAL_MS = 3000

type ApiMessage = {
    _id: string
    senderId: string
    receiverId: string
    message: string
    isRead: boolean
    createdAt: string
}

type Contact = {
    _id: string
    name: string
    image?: string | null
}

type SearchParams = {
    orderId?: string | string[]
    userId?: string | string[]
    name?: string | string[]
}

const first = <T,>(value?: T | T[]) => (Array.isArray(value) ? value[0] : value)

const formatTime = (value: string) =>
    new Date(value)
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        .toLowerCase()

type MessageItemProps = {
    message: ApiMessage
    isMe: boolean
    contact: Contact | null
    userImageUrl?: string | null
}

const MessageItem = ({ message, isMe, contact, userImageUrl }: MessageItemProps) => {
    return (
        <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
            {!isMe && (
                contact?.image ? (
                    <Image source={{ uri: contact.image }} style={styles.avatarOther} />
                ) : (
                    <View style={[styles.avatarOther, styles.avatarCenter]}>
                        <Text style={styles.avatarInitial}>
                            {(contact?.name ?? '?').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )
            )}

            <View style={styles.messageContent}>
                <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
                <View style={styles.bubbleContainer}>
                    {isMe && (
                        <Ionicons
                            name="checkmark-done"
                            size={14}
                            color={message.isRead ? '#F0803C' : '#C4C7D0'}
                        />
                    )}
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                        <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                            {message.message}
                        </Text>
                    </View>
                </View>
            </View>

            {isMe && (
                userImageUrl ? (
                    <Image source={{ uri: userImageUrl }} style={styles.avatarMe} />
                ) : (
                    <View style={styles.avatarMe}></View>
                )
            )}
        </View>
    )
}

const Chat = () => {
    const router = useRouter()
    const { user } = useUser()
    const userImageUrl = user?.hasImage ? user.imageUrl : null

    const params = useLocalSearchParams<SearchParams>()
    const orderId = first(params.orderId)
    const paramUserId = first(params.userId)
    const paramName = first(params.name)

    const { getToken } = useAuth()
    const getTokenRef = useRef(getToken)
    getTokenRef.current = getToken

    const listRef = useRef<FlatList<ApiMessage>>(null)
    const signature = useRef('')

    const [contact, setContact] = useState<Contact | null>(
        paramUserId ? { _id: paramUserId, name: paramName ?? '' } : null
    )
    const [messages, setMessages] = useState<ApiMessage[]>([])
    const [text, setText] = useState('')
    const [emojiOpen, setEmojiOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const request = useCallback(async (path: string, init: { method?: string; body?: string } = {}) => {
        const token = await getTokenRef.current()
        return fetch(`${API_URL}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
    }, [])

    useEffect(() => {
        if (!orderId || !API_URL) {
            setError('Missing order identifier.')
            setLoading(false)
            return
        }

        let active = true

        const loadContact = async () => {
            try {
                const response = await request(`/api/messages/order/${orderId}/contact`)
                if (!response.ok) throw new Error('Request failed')
                const data: Contact = await response.json()
                if (active) setContact(data)
            } catch {
                if (active) setError('Could not load the conversation.')
            } finally {
                if (active) setLoading(false)
            }
        }

        loadContact()

        return () => {
            active = false
        }
    }, [orderId, request])

    const contactId = contact?._id

    const loadMessages = useCallback(async () => {
        if (!orderId || !contactId || !API_URL) return

        try {
            const response = await request(`/api/messages/order/${orderId}`)
            if (!response.ok) return
            const data: ApiMessage[] = await response.json()

            const conversation = data.filter(
                (item) => String(item.senderId) === contactId || String(item.receiverId) === contactId
            )

            const next = conversation.map((item) => `${item._id}:${item.isRead}`).join(',')
            if (next !== signature.current) {
                signature.current = next
                setMessages(conversation)
            }

            const hasUnread = conversation.some(
                (item) => String(item.senderId) === contactId && !item.isRead
            )
            if (hasUnread) {
                await request(`/api/messages/order/${orderId}/read?userId=${contactId}`, { method: 'PATCH' })
            }
        } catch {
            return
        }
    }, [orderId, contactId, request])

    useFocusEffect(
        useCallback(() => {
            loadMessages()
            const interval = setInterval(loadMessages, POLL_INTERVAL_MS)
            return () => clearInterval(interval)
        }, [loadMessages])
    )

    const openEmojiPicker = () => {
        Keyboard.dismiss()
        setEmojiOpen(true)
    }

    const handleSend = async () => {
        const content = text.trim()
        if (!content || !contactId || !orderId || sending) return

        setSending(true)
        setText('')

        try {
            const response = await request('/api/messages', {
                method: 'POST',
                body: JSON.stringify({ orderId, receiverId: contactId, message: content }),
            })
            if (!response.ok) throw new Error('Request failed')
            const created: ApiMessage = await response.json()
            setMessages((prev) =>
                prev.some((item) => item._id === created._id) ? prev : [...prev, created]
            )
        } catch {
            setText(content)
            Alert.alert('Error', 'Could not send your message.')
        } finally {
            setSending(false)
        }
    }

    const renderBody = () => {
        if (loading) {
            return (
                <View style={styles.feedback}>
                    <ActivityIndicator size="large" color="#F0803C" />
                </View>
            )
        }

        if (error && !contact) {
            return (
                <View style={styles.feedback}>
                    <Text style={styles.feedbackText}>{error}</Text>
                </View>
            )
        }

        return (
            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <MessageItem
                        message={item}
                        isMe={String(item.senderId) !== contactId}
                        contact={contact}
                        userImageUrl={userImageUrl}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                ListEmptyComponent={
                    <View style={styles.feedback}>
                        <Text style={styles.feedbackText}>No messages yet. Say hello!</Text>
                    </View>
                }
            />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeTouchableOpacity}
                        onPress={() => router.back()}
                    >
                        <Feather name="x" size={22} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.name} numberOfLines={1}>{contact?.name ?? ''}</Text>
                </View>

                {renderBody()}

                <View style={styles.inputContainer}>
                    <View style={styles.inputBox}>
                        <TouchableOpacity onPress={openEmojiPicker}>
                            <Feather name="smile" size={26} color="#A0A5BA" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            value={text}
                            onChangeText={setText}
                            placeholder="Write somethings"
                            placeholderTextColor="#A0A5BA"
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                            editable={!!contactId}
                        />
                        <TouchableOpacity
                            style={styles.sendTouchableOpacity}
                            onPress={handleSend}
                            disabled={sending || !contactId}
                        >
                            <Feather name="send" size={22} color="#F0803C" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <EmojiPicker
                open={emojiOpen}
                onClose={() => setEmojiOpen(false)}
                onEmojiSelected={(emoji) => setText((prev) => prev + emoji.emoji)}
                enableSearchBar
                categoryPosition="top"
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    keyboardContainer: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 8
    },
    closeTouchableOpacity: {
        backgroundColor: '#ECF0F4',
        borderRadius: 100,
        width: 45,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center'
    },
    name: {
        flex: 1,
        fontFamily: 'Sen_400Regular',
        fontSize: 17,
        color: '#181C2E'
    },
    list: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 20
    },
    feedback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80
    },
    feedbackText: {
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#A0A5BA',
        textAlign: 'center'
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12
    },
    messageRowMe: {
        justifyContent: 'flex-end'
    },
    messageRowOther: {
        justifyContent: 'flex-start'
    },
    avatarMe: {
        backgroundColor: '#F6C9B3',
        width: 40,
        height: 40,
        borderRadius: 100
    },
    avatarOther: {
        backgroundColor: '#98A8B8',
        width: 40,
        height: 40,
        borderRadius: 100
    },
    avatarCenter: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarInitial: {
        color: '#fff',
        fontFamily: 'Sen_700Bold',
        fontSize: 16
    },
    messageContent: {
        maxWidth: '70%',
        alignItems: 'flex-end',
        gap: 6
    },
    time: {
        fontFamily: 'Sen_400Regular',
        fontSize: 12,
        color: '#A0A5BA'
    },
    bubbleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12
    },
    bubbleMe: {
        backgroundColor: '#F0803C'
    },
    bubbleOther: {
        backgroundColor: '#F0F4F9'
    },
    bubbleText: {
        fontFamily: 'Sen_400Regular',
        fontSize: 15
    },
    bubbleTextMe: {
        color: '#fff'
    },
    bubbleTextOther: {
        color: '#181C2E'
    },
    inputContainer: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F0F4F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10
    },
    input: {
        flex: 1,
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#181C2E',
        paddingVertical: 8
    },
    sendTouchableOpacity: {
        backgroundColor: '#fff',
        borderRadius: 100,
        width: 58,
        height: 58,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default Chat