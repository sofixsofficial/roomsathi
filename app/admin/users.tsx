import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAdmin } from '@/hooks/admin-store';
import { useAuth } from '@/hooks/auth-store';
import { User } from '@/types';
import Colors from '@/constants/colors';
import { Search, Trash2, CheckCircle, ShieldBan, Users, Home as HomeIcon } from 'lucide-react-native';

export default function AdminUsersScreen() {
  const { users, updateUserStatus, deleteUser, logAdminAction } = useAdmin();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'finders' | 'providers'>('all');

  let filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      user.userType !== 'admin'
  );

  if (selectedTab === 'finders') {
    filteredUsers = filteredUsers.filter(u => u.userType === 'renter');
  } else if (selectedTab === 'providers') {
    filteredUsers = filteredUsers.filter(u => u.userType === 'owner');
  }

  const handleStatusChange = (userId: string, userName: string, status: 'active' | 'suspended' | 'blocked') => {
    const statusAction = status === 'blocked' ? 'block' : status === 'active' ? 'activate' : 'suspend';
    const statusMessage = status === 'blocked' 
      ? 'This user will be unable to access the platform.' 
      : status === 'suspended'
      ? 'This user will have limited access to the platform.'
      : 'This user will have full access to the platform.';

    Alert.alert(
      `${statusAction.charAt(0).toUpperCase() + statusAction.slice(1)} User`,
      `Are you sure you want to ${statusAction} "${userName}"?\n\n${statusMessage}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: status === 'blocked' ? 'destructive' : 'default',
          onPress: async () => {
            const success = await updateUserStatus(userId, status);
            if (success) {
              if (currentUser) {
                await logAdminAction(
                  currentUser.id,
                  status === 'blocked' ? 'block_user' : 'unblock_user',
                  'user',
                  userId,
                  `Changed status to ${status}`
                );
              }
              Alert.alert('Success', `User status updated to ${status}`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${userName}"? This action cannot be undone and will remove all their data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(userId);
            if (success) {
              if (currentUser) {
                await logAdminAction(
                  currentUser.id,
                  'delete_user',
                  'user',
                  userId,
                  'User deleted permanently'
                );
              }
              Alert.alert('Success', 'User deleted successfully');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: item.userType === 'owner' ? '#f59e0b' : '#10b981' }]}>
            <Text style={styles.typeBadgeText}>
              {item.userType === 'owner' ? 'PROVIDER' : 'FINDER'}
            </Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        {item.status && (
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'active' ? '#10b98120' : item.status === 'suspended' ? '#f59e0b20' : '#ef444420' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.status === 'active' ? '#10b981' : item.status === 'suspended' ? '#f59e0b' : '#ef4444' }
              ]}>
                ● {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.userActions}>
        {item.status !== 'active' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => handleStatusChange(item.id, item.name, 'active')}
          >
            <CheckCircle size={18} color={Colors.white} />
            <Text style={styles.actionButtonText}>Activate</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'blocked' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => handleStatusChange(item.id, item.name, 'blocked')}
          >
            <ShieldBan size={18} color={Colors.white} />
            <Text style={styles.actionButtonText}>Block</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6b7280', borderWidth: 1, borderColor: '#d1d5db' }]}
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <Trash2 size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const finders = users.filter(u => u.userType === 'renter');
  const providers = users.filter(u => u.userType === 'owner');
  const blockedCount = users.filter(u => u.status === 'blocked').length;

  return (
    <>
      <Stack.Screen options={{ title: 'Manage Users' }} />
      <View style={styles.container}>
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Users size={20} color="#10b981" />
            <Text style={styles.statValue}>{finders.length}</Text>
            <Text style={styles.statLabel}>Finders</Text>
          </View>
          <View style={styles.statItem}>
            <HomeIcon size={20} color="#f59e0b" />
            <Text style={styles.statValue}>{providers.length}</Text>
            <Text style={styles.statLabel}>Providers</Text>
          </View>
          <View style={styles.statItem}>
            <ShieldBan size={20} color="#ef4444" />
            <Text style={styles.statValue}>{blockedCount}</Text>
            <Text style={styles.statLabel}>Blocked</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>All Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'finders' && styles.tabActive]}
            onPress={() => setSelectedTab('finders')}
          >
            <Text style={[styles.tabText, selectedTab === 'finders' && styles.tabTextActive]}>Finders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'providers' && styles.tabActive]}
            onPress={() => setSelectedTab('providers')}
          >
            <Text style={[styles.tabText, selectedTab === 'providers' && styles.tabTextActive]}>Providers</Text>
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
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
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
    paddingVertical: 8,
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
    margin: 16,
    marginTop: 8,
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
  listContainer: {
    padding: 16,
    paddingTop: 0,
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
    marginBottom: 16,
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
    paddingHorizontal: 8,
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
  userActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
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
