import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Send, Phone, Mail, CheckCircle } from 'lucide-react-native';
import { useMessages } from '@/hooks/message-store';
import { useAuth } from '@/hooks/auth-store';
import { mockUsers } from '@/mocks/users';
import Colors from '@/constants/colors';
import MessageItem from '@/components/MessageItem';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    getConversationById, 
    getMessagesByConversationId, 
    sendMessage, 
    markConversationAsRead 
  } = useMessages();
  const { user, isAuthenticated } = useAuth();
  
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  const onViewableItemsChanged = useCallback(() => {
    // Handle viewable items changed
  }, []);
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;
  
  const conversation = getConversationById(id);
  const messages = getMessagesByConversationId(id);
  
  // Get the other participant (not the current user)
  const otherParticipantId = conversation?.participants.find(
    participantId => participantId !== user?.id
  );
  const otherUser = mockUsers.find(u => u.id === otherParticipantId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (conversation && isAuthenticated) {
      markConversationAsRead(conversation.id);
    }
  }, [conversation?.id, isAuthenticated]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;
    
    setSending(true);
    
    try {
      const success = sendMessage(conversation.id, message.trim());
      
      if (success) {
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handlePhonePress = () => {
    if (otherUser?.phone) {
      Linking.openURL(`tel:${otherUser.phone}`);
    }
  };

  const handleEmailPress = () => {
    if (otherUser?.email) {
      Linking.openURL(`mailto:${otherUser.email}`);
    }
  };

  if (!conversation || !otherUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Messages',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {conversation.propertyTitle && (
          <View style={styles.propertyBanner}>
            <Text style={styles.propertyText}>
              Regarding: {conversation.propertyTitle}
            </Text>
          </View>
        )}

        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: otherUser.avatar }} 
                style={styles.avatar}
              />
              {otherUser.status === 'active' && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.ownerName}>{otherUser.name}</Text>
                {otherUser.isOwner && (
                  <View style={styles.verifiedBadge}>
                    <CheckCircle size={14} color={Colors.white} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.ownerRole}>
                {otherUser.isOwner ? 'Property Owner' : 'User'}
              </Text>
            </View>
          </View>

          <View style={styles.contactActions}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handlePhonePress}
            >
              <View style={styles.contactIconBg}>
                <Phone size={18} color={Colors.primary} />
              </View>
              <Text style={styles.contactLabel}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleEmailPress}
            >
              <View style={styles.contactIconBg}>
                <Mail size={18} color={Colors.primary} />
              </View>
              <Text style={styles.contactLabel}>Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageItem message={item} />}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          inverted={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start the conversation by sending a message
              </Text>
            </View>
          }
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Send size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  propertyBanner: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  propertyText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '600',
  },
  ownerRole: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  contactIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});