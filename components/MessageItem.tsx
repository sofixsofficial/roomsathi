import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Check, CheckCheck } from 'lucide-react-native';
import { Message } from '@/types';
import { useAuth } from '@/hooks/auth-store';
import Colors from '@/constants/colors';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.id;
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };
  
  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessage : styles.otherMessage,
    ]}>
      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble,
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownText : styles.otherText,
        ]}>
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          {isOwnMessage && (
            <View style={styles.readStatus}>
              {message.read ? (
                <CheckCheck size={16} color={Colors.white} opacity={0.8} />
              ) : (
                <Check size={16} color={Colors.white} opacity={0.8} />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 2,
  },
  ownText: {
    color: Colors.white,
  },
  otherText: {
    color: Colors.textDark,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
  },
  ownTimestamp: {
    color: Colors.white,
    opacity: 0.8,
  },
  otherTimestamp: {
    color: Colors.textLight,
  },
  readStatus: {
    marginLeft: 4,
  },
});