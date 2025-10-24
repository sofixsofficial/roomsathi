import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from '@/utils/dateFormat';
import Colors from '@/constants/colors';
import { Conversation } from '@/types';
import { mockUsers } from '@/mocks/users';
import { useAuth } from '@/hooks/auth-store';

interface ConversationItemProps {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Get the other participant (not the current user)
  const otherParticipantId = conversation.participants.find(id => id !== user?.id);
  const otherUser = mockUsers.find(u => u.id === otherParticipantId);
  
  const handlePress = () => {
    router.push(`/messages/${conversation.id}`);
  };

  if (!otherUser) return null;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: otherUser.avatar || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
        contentFit="cover"
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.name} numberOfLines={1}>{otherUser.name}</Text>
          <Text style={styles.time}>{formatDistanceToNow(conversation.lastMessageTime)}</Text>
        </View>
        
        <View style={styles.messageContainer}>
          {conversation.propertyTitle && (
            <Text style={styles.propertyTitle} numberOfLines={1}>
              Re: {conversation.propertyTitle}
            </Text>
          )}
          <Text style={styles.message} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: Colors.textLight,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyTitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});