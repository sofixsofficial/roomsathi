import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useMessages } from '@/hooks/message-store';
import { useHistory } from '@/hooks/history-store';
import Colors, { getThemeColors } from '@/constants/colors';
import ConversationItem from '@/components/ConversationItem';
import { MessageCircle, History as HistoryIcon, Phone, MessageSquare, MapPin, Eye } from 'lucide-react-native';

type HistoryActionFilter = 'all' | 'viewed' | 'contacted' | 'favorited' | 'booked';

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { conversations } = useMessages();
  const { finderHistory, loading: historyLoading } = useHistory();
  const [navigationReady, setNavigationReady] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<HistoryActionFilter>('all');
  
  const themeColors = getThemeColors(user?.userType);

  // Wait for navigation to be ready before attempting to navigate
  useFocusEffect(
    React.useCallback(() => {
      setNavigationReady(true);
    }, [])
  );

  const isProvider = user?.userType === 'owner';

  const filteredHistory = finderHistory.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'booked') return item.property?.status === 'booked';
    return item.action === selectedFilter;
  });

  useEffect(() => {
    if (navigationReady && !authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, authLoading, router, navigationReady]);

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isProvider) {
    return (
      <View style={styles.container}>
          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={64} color={themeColors.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start a conversation with a property finder to see messages here
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <ConversationItem conversation={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.filterContainer, { backgroundColor: themeColors.primaryAccent }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <HistoryIcon size={18} color={selectedFilter === 'all' ? Colors.white : themeColors.primary} />
            <Text style={[
              styles.filterText,
              selectedFilter === 'all' && styles.filterTextActive,
            ]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'viewed' && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setSelectedFilter('viewed')}
          >
            <Eye size={18} color={selectedFilter === 'viewed' ? Colors.white : themeColors.primary} />
            <Text style={[
              styles.filterText,
              selectedFilter === 'viewed' && styles.filterTextActive,
            ]}>Viewed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'contacted' && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setSelectedFilter('contacted')}
          >
            <Phone size={18} color={selectedFilter === 'contacted' ? Colors.white : themeColors.primary} />
            <Text style={[
              styles.filterText,
              selectedFilter === 'contacted' && styles.filterTextActive,
            ]}>Contacted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'favorited' && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setSelectedFilter('favorited')}
          >
            <MessageSquare size={18} color={selectedFilter === 'favorited' ? Colors.white : themeColors.primary} />
            <Text style={[
              styles.filterText,
              selectedFilter === 'favorited' && styles.filterTextActive,
            ]}>Favorited</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'booked' && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setSelectedFilter('booked')}
          >
            <MapPin size={18} color={selectedFilter === 'booked' ? Colors.white : themeColors.primary} />
            <Text style={[
              styles.filterText,
              selectedFilter === 'booked' && styles.filterTextActive,
            ]}>Booked</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {historyLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading history...</Text>
        </View>
      ) : filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <HistoryIcon size={64} color={themeColors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No history yet</Text>
          <Text style={styles.emptySubtext}>
            Your property viewing and interaction history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => router.push(`/property/${item.propertyId}`)}
            >
              <View style={styles.historyContent}>
                <View style={[styles.actionBadge, { backgroundColor: themeColors.primaryAccent }]}>
                  {item.action === 'viewed' && <Eye size={16} color={themeColors.primary} />}
                  {item.action === 'contacted' && <Phone size={16} color={themeColors.primary} />}
                  {item.action === 'favorited' && <MessageCircle size={16} color={themeColors.primary} />}
                  {item.property?.status === 'booked' && <MapPin size={16} color={themeColors.primary} />}
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {item.property?.title || 'Property'}
                  </Text>
                  <Text style={styles.propertyLocation} numberOfLines={1}>
                    {item.property?.location?.city}, {item.property?.location?.state}
                  </Text>
                  <Text style={styles.historyAction}>
                    {item.action === 'viewed' && 'Viewed'}
                    {item.action === 'contacted' && 'Contacted'}
                    {item.action === 'favorited' && 'Added to favorites'}
                    {item.action === 'unfavorited' && 'Removed from favorites'}
                    {item.property?.status === 'booked' && ' • Booked'}
                  </Text>
                  <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, { color: themeColors.primary }]}>₹{item.property?.price}</Text>
                  <Text style={styles.priceLabel}>/ month</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  historyItem: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  actionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  historyAction: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
});