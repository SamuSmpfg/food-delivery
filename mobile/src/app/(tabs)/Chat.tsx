import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Image, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useRef, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import EmojiPicker from 'rn-emoji-keyboard'

type Message = {
    id: string
    from: 'me' | 'other'
    text: string
    time: string
    read: boolean
}

const REPLIES = [
    'Hay, Congratulation for order',
    "I'm Coming , just wait ...",
]
const REPLY_DELAY = 1200

const getNowTime = () =>
    new Date()
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        .toLowerCase()

const MessageItem = ({ message, userImageUrl }: { message: Message, userImageUrl?: string | null }) => {
    const isMe = message.from === 'me'

    return (
        <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
            {!isMe && <View style={styles.avatarOther}></View>}

            <View style={styles.messageContent}>
                <Text style={styles.time}>{message.time}</Text>
                <View style={styles.bubbleContainer}>
                    {isMe && (
                        <Ionicons
                            name="checkmark-done"
                            size={14}
                            color={message.read ? '#F0803C' : '#C4C7D0'}
                        />
                    )}
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                        <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                            {message.text}
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
    const listRef = useRef<FlatList<Message>>(null)
    const replyIndex = useRef(0)
    const [messages, setMessages] = useState<Message[]>([])
    const [text, setText] = useState('')
    const [emojiOpen, setEmojiOpen] = useState(false)

    const openEmojiPicker = () => {
        Keyboard.dismiss()
        setEmojiOpen(true)
    }

    const handleSend = () => {
        const content = text.trim()
        if (!content) return

        const id = String(Date.now())
        const reply = REPLIES[replyIndex.current % REPLIES.length]
        replyIndex.current += 1

        setMessages((prev) => [
            ...prev,
            { id, from: 'me', text: content, time: getNowTime(), read: false },
        ])
        setText('')

        setTimeout(() => {
            setMessages((prev) => [
                ...prev.map((m) => (m.id === id ? { ...m, read: true } : m)),
                { id: `${id}-reply`, from: 'other', text: reply, time: getNowTime(), read: true },
            ])
        }, REPLY_DELAY)
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
                <Text style={styles.name}>Robert Fox</Text>
            </View>

            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageItem message={item} userImageUrl={userImageUrl} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            />

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
                    />
                    <TouchableOpacity
                        style={styles.sendTouchableOpacity}
                        onPress={handleSend}
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
        fontFamily: 'Sen_400Regular',
        fontSize: 17,
        color: '#181C2E'
    },
    list: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 20
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