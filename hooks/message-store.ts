import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { Conversation, Message } from '@/types';
import { mockConversations, mockMessages } from '@/mocks/conversations';
import { useAuth } from './auth-store';

export const [MessageContext, useMessages] = createContextHook(() => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (!user) return;
        
        // In a real app, this would be an API call filtered by user
        const userConversations = mockConversations.filter(
          conv => conv.participants.includes(user.id)
        );
        setConversations(userConversations);
        setMessages(mockMessages);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  const getConversationById = useCallback((id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id);
  }, [conversations]);

  const getMessagesByConversationId = useCallback((conversationId: string): Message[] => {
    return messages[conversationId] || [];
  }, [messages]);

  const sendMessage = useCallback((conversationId: string, content: string): boolean => {
    try {
      if (!user) return false;
      
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) return false;
      
      const receiverId = conversation.participants.find(id => id !== user.id);
      if (!receiverId) return false;
      
      const newMessage: Message = {
        id: `msg${Date.now()}${Math.random()}`,
        senderId: user.id,
        receiverId,
        propertyId: conversation.propertyId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      // Update messages
      setMessages(prevMessages => ({
        ...prevMessages,
        [conversationId]: [...(prevMessages[conversationId] || []), newMessage],
      }));
      
      // Update conversation with last message
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: content,
              lastMessageTime: newMessage.timestamp,
              unreadCount: 0, // Reset unread for the sender
            };
          }
          return conv;
        })
      );
      
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [user, conversations]);

  const createConversation = useCallback((receiverId: string, propertyId: string, propertyTitle: string): string => {
    try {
      if (!user) return '';
      
      // Check if conversation already exists
      const existingConv = conversations.find(
        conv => conv.participants.includes(user.id) && 
               conv.participants.includes(receiverId) &&
               conv.propertyId === propertyId
      );
      
      if (existingConv) return existingConv.id;
      
      // Create new conversation
      const newConversationId = `conv${Date.now()}`;
      const newConversation: Conversation = {
        id: newConversationId,
        participants: [user.id, receiverId],
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        propertyId,
        propertyTitle,
      };
      
      setConversations([...conversations, newConversation]);
      setMessages({
        ...messages,
        [newConversationId]: [],
      });
      
      return newConversationId;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setError('Failed to create conversation');
      return '';
    }
  }, [user, conversations, messages]);

  const markConversationAsRead = useCallback((conversationId: string): void => {
    try {
      if (!user) return;
      
      // Update conversation unread count
      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      
      // Mark messages as read
      if (messages[conversationId]) {
        const updatedConvMessages = messages[conversationId].map(msg => {
          if (msg.receiverId === user.id && !msg.read) {
            return {
              ...msg,
              read: true,
            };
          }
          return msg;
        });
        
        setMessages({
          ...messages,
          [conversationId]: updatedConvMessages,
        });
      }
    } catch (err) {
      console.error('Failed to mark conversation as read:', err);
      setError('Failed to mark conversation as read');
    }
  }, [user, conversations, messages]);

  return {
    conversations,
    loading,
    error,
    getConversationById,
    getMessagesByConversationId,
    sendMessage,
    createConversation,
    markConversationAsRead,
  };
});