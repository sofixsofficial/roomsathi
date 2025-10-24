import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useHistory } from '@/hooks/history-store';
import Colors from '@/constants/colors';
import {
  Clock,
  Eye,
  Users,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Home,
} from 'lucide-react-native';

export default function ProviderHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const { propertyHistory, loading, loadPropertyHistory } = useHistory();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'created' | 'edited' | 'deleted' | 'status_changed'>('all');

  React.useEffect(() => {
    if (!user || user.userType !== 'owner') {
      router.replace('/');
    }
  }, [user, router]);

  const onRefresh = React.useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await loadPropertyHistory(user.id);
    setRefreshing(false);
  }, [user, loadPropertyHistory]);

  const filteredHistory = filter === 'all'
    ? propertyHistory
    : propertyHistory.filter(h => h.action === filter);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle size={20} color="#10b981" />;
      case 'edited':
        return <Edit size={20} color="#3b82f6" />;
      case 'deleted':
        return <Trash2 size={20} color="#ef4444" />;
      case 'reposted':
        return <RotateCcw size={20} color="#8b5cf6" />;
      case 'status_changed':
        return <XCircle size={20} color="#f59e0b" />;
      default:
        return <Clock size={20} color={Colors.textLight} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return '#10b981';
      case 'edited':
        return '#3b82f6';
      case 'deleted':
        return '#ef4444';
      case 'reposted':
        return '#8b5cf6';
      case 'status_changed':
        return '#f59e0b';
      default:
        return Colors.textLight;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Property History</Text>
        <Text style={styles.headerSubtitle}>Track all your property activities</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'created' && styles.filterButtonActive]}
          onPress={() => setFilter('created')}
        >
          <Text style={[styles.filterButtonText, filter === 'created' && styles.filterButtonTextActive]}>
            Created
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'edited' && styles.filterButtonActive]}
          onPress={() => setFilter('edited')}
        >
          <Text style={[styles.filterButtonText, filter === 'edited' && styles.filterButtonTextActive]}>
            Edited
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'deleted' && styles.filterButtonActive]}
          onPress={() => setFilter('deleted')}
        >
          <Text style={[styles.filterButtonText, filter === 'deleted' && styles.filterButtonTextActive]}>
            Deleted
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'status_changed' && styles.filterButtonActive]}
          onPress={() => setFilter('status_changed')}
        >
          <Text style={[styles.filterButtonText, filter === 'status_changed' && styles.filterButtonTextActive]}>
            Status Changed
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Home size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No history found</Text>
            <Text style={styles.emptySubtext}>Your property activities will appear here</Text>
          </View>
        ) : (
          filteredHistory.map((history) => (
            <TouchableOpacity
              key={history.id}
              style={styles.historyCard}
              onPress={() => history.property && router.push(`/property/${history.property.id}` as any)}
            >
              <View style={styles.historyHeader}>
                <View style={[styles.actionBadge, { backgroundColor: `${getActionColor(history.action)}20` }]}>
                  {getActionIcon(history.action)}
                  <Text style={[styles.actionText, { color: getActionColor(history.action) }]}>
                    {history.action.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.historyDate}>{formatDate(history.timestamp)}</Text>
              </View>

              {history.property && (
                <View style={styles.propertyInfo}>
                  {history.property.images && history.property.images.length > 0 && (
                    <Image
                      source={{ uri: history.property.images[0] }}
                      style={styles.propertyImage}
                    />
                  )}
                  <View style={styles.propertyDetails}>
                    <Text style={styles.propertyTitle} numberOfLines={2}>
                      {history.property.title}
                    </Text>
                    <Text style={styles.propertyPrice}>₹{history.property.price.toLocaleString()}/month</Text>
                    <Text style={styles.propertyLocation} numberOfLines={1}>
                      {history.property.location.city}, {history.property.location.state}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.historyStats}>
                <View style={styles.statItem}>
                  <Eye size={16} color={Colors.textLight} />
                  <Text style={styles.statText}>{history.viewCount} views</Text>
                </View>
                <View style={styles.statItem}>
                  <Users size={16} color={Colors.textLight} />
                  <Text style={styles.statText}>{history.interestedFinders.length} interested</Text>
                </View>
              </View>

              {history.action === 'status_changed' && history.previousStatus && history.newStatus && (
                <View style={styles.statusChange}>
                  <Text style={styles.statusChangeText}>
                    {history.previousStatus} → {history.newStatus}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  propertyInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 12,
    color: Colors.textLight,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statusChange: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  statusChangeText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});
