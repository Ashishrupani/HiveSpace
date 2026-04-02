import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import pageStyles from '@/constants/styles/page-styles';
import { useAuth, useUser } from '@clerk/expo';
import { useGlobalSearchParams } from 'expo-router';
import { useGroupChat } from '@/hooks/groupChat';

export default function ChatScreen() {
  const { userId } = useAuth();
  const { user } = useUser();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const groupId = Array.isArray(id) ? id[0] : id;

  const [text, setText] = useState('');

  const userName = user?.firstName ?? user?.username ?? userId ?? 'User';

  const { messages, sendMessage, scrollRef } = useGroupChat(
    groupId || '',
    userId || '',
    userName,
  );

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={[pageStyles.container, styles.container]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Group Chat</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View key={m.id} style={[styles.messageRow, m.isOwn ? styles.rowRight : styles.rowLeft]}>
              {!m.isOwn && (
                <Text style={styles.avatar}>{(m.sender ?? '?').charAt(0).toUpperCase()}</Text>
              )}
              <View style={[styles.bubble, m.isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                {!m.isOwn && <Text style={styles.senderName}>{m.sender}</Text>}
                <Text style={[styles.messageText, m.isOwn ? styles.messageTextOwn : styles.messageTextOther]}>
                  {m.text}
                </Text>
                <Text style={styles.timeText}>{m.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton} accessibilityLabel="Send message">
            <Text style={{ color: 'white', fontWeight: '600' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  messages: { padding: 16, paddingBottom: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 8,
    lineHeight: 36,
  },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 12 },
  bubbleOwn: { backgroundColor: '#007AFF', borderTopRightRadius: 4 },
  bubbleOther: { backgroundColor: '#F1F1F3', borderTopLeftRadius: 4 },
  senderName: { fontSize: 11, color: '#888', marginBottom: 2 },
  messageText: { fontSize: 15 },
  messageTextOwn: { color: 'white' },
  messageTextOther: { color: '#111' },
  timeText: { fontSize: 10, color: '#666', marginTop: 6, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
