import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdmin } from '@/hooks/admin-store';
import { useAuth } from '@/hooks/auth-store';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import {
  Users,
  Search,
  ShieldBan,
  CheckCircle,
  Home,
  AlertTriangle,
} from 'lucide-react-native';
import { User } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { users, properties, syncData, updateUserStatus, logAdminAction } = useAdmin();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'finders' | 'providers'>('all');

  useEffect(() => {
    if (user?.userType !== 'admin') {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/index');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [user, router]);



  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await syncData();
    setRefreshing(false);
  }, [syncData]);

  let filteredUsers = users.filter(
    (u) =>
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      u.userType !== 'admin'
  );

  if (selectedTab === 'finders') {
    filteredUsers = filteredUsers.filter(u => u.userType === 'renter');
  } else if (selectedTab === 'providers') {
    filteredUsers = filteredUsers.filter(u => u.userType === 'owner');
  }

  const handleBlockUser = (userId: string, userName: string, currentStatus: string) => {
    const isBlocked = currentStatus === 'blocked';
    const action = isBlocked ? 'unblock' : 'block';
    const message = isBlocked
      ? 'This user will be able to access the platform again.'
      : 'This user will be unable to access the platform for misconduct.';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} "${userName}"?\n\n${message}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            const newStatus = isBlocked ? 'active' : 'blocked';
            const success = await updateUserStatus(userId, newStatus);
            if (success) {
              if (user) {
                await logAdminAction(
                  user.id,
                  isBlocked ? 'unblock_user' : 'block_user',
                  'user',
                  userId,
                  `Changed status to ${newStatus}`
                );
              }
              Alert.alert('Success', `User ${action}ed successfully`);
            } else {
              Alert.alert('Error', `Failed to ${action} user`);
            }
          },
        },
      ]
    );
  };

  const getPropertyCountForUser = (userId: string) => {
    return properties.filter(p => p.ownerId === userId).length;
  };

  const renderUserCard = (item: User) => {
    const propertyCount = item.userType === 'owner' ? getPropertyCountForUser(item.id) : 0;
    const isBlocked = item.status === 'blocked';

    return (
      <View key={item.id} style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{item.name}</Text>
            <View style={[
              styles.typeBadge,
              { backgroundColor: item.userType === 'owner' ? '#f59e0b' : '#10b981' }
            ]}>
              <Text style={styles.typeBadgeText}>
                {item.userType === 'owner' ? 'PROVIDER' : 'FINDER'}
              </Text>
            </View>
          </View>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
          
          {item.userType === 'owner' && (
            <View style={styles.propertyCountContainer}>
              <Home size={16} color="#8b5cf6" />
              <Text style={styles.propertyCountText}>
                {propertyCount} {propertyCount === 1 ? 'Property' : 'Properties'} Listed
              </Text>
            </View>
          )}

          {item.status && (
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isBlocked ? '#ef444420' : '#10b98120' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: isBlocked ? '#ef4444' : '#10b981' }
                ]}>
                  ● {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isBlocked ? '#10b981' : '#ef4444' }
          ]}
          onPress={() => handleBlockUser(item.id, item.name, item.status || 'active')}
        >
          {isBlocked ? (
            <>
              <CheckCircle size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Unblock</Text>
            </>
          ) : (
            <>
              <ShieldBan size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Block</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const finders = users.filter(u => u.userType === 'renter');
  const providers = users.filter(u => u.userType === 'owner');
  const blockedCount = users.filter(u => u.status === 'blocked').length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.gradientContainer}>
          <LinearGradient
            colors={['#3b82f6', '#2563eb'] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🔐 Admin Panel</Text>
              <Text style={styles.headerSubtitle}>
                Manage Users & Monitor Platform
              </Text>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Users size={24} color="#10b981" />
              <Text style={styles.statValue}>{finders.length}</Text>
              <Text style={styles.statLabel}>Finders</Text>
            </View>
            <View style={styles.statItem}>
              <Home size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{providers.length}</Text>
              <Text style={styles.statLabel}>Providers</Text>
            </View>
            <View style={styles.statItem}>
              <AlertTriangle size={24} color="#ef4444" />
              <Text style={styles.statValue}>{blockedCount}</Text>
              <Text style={styles.statLabel}>Blocked</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Manage property finders and providers. Block users for misuse or misconduct.
            </Text>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
              onPress={() => setSelectedTab('all')}
            >
              <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
                All Users
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'finders' && styles.tabActive]}
              onPress={() => setSelectedTab('finders')}
            >
              <Text style={[styles.tabText, selectedTab === 'finders' && styles.tabTextActive]}>
                Finders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'providers' && styles.tabActive]}
              onPress={() => setSelectedTab('providers')}
            >
              <Text style={[styles.tabText, selectedTab === 'providers' && styles.tabTextActive]}>
                Providers
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.usersList}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              filteredUsers.map(renderUserCard)
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientContainer: {
    backgroundColor: '#3b82f6',
  },
  headerGradient: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    padding: 0,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  usersList: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  propertyCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  propertyCountText: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '600' as const,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
});
