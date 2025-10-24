import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useProperties } from '@/hooks/property-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Plus, Edit, Trash2, Eye, MapPin, DollarSign, Home, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyPropertiesScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { loadAllPropertiesByOwner, deleteProperty, updateProperty } = useProperties();
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'pending' | 'rented'>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOwnerProperties = useCallback(async () => {
    if (!user) return;
    try {
      console.log('Loading properties for owner:', user.id);
      const properties = await loadAllPropertiesByOwner(user.id);
      console.log('Loaded properties:', properties.length);
      setMyProperties(properties);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, loadAllPropertiesByOwner]);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'owner') {
      router.replace('/auth/login');
      return;
    }
    
    loadOwnerProperties();
  }, [user, isAuthenticated, loadOwnerProperties, router]);

  const activeProperties = myProperties.filter(p => p.status === 'active');
  const pendingProperties = myProperties.filter(p => p.status === 'pending');
  const rentedProperties = myProperties.filter(p => p.status === 'rented' || p.status === 'booked');

  const displayProperties = selectedTab === 'active' ? activeProperties : 
                           selectedTab === 'pending' ? pendingProperties : 
                           rentedProperties;

  const totalViews = 0;
  const totalInquiries = 0;

  const handleDeleteProperty = (propertyId: string, propertyTitle: string) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProperty(propertyId);
            if (success) {
              Alert.alert('Success', 'Property deleted successfully!');
              await loadOwnerProperties();
            } else {
              Alert.alert('Error', 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (propertyId: string) => {
    router.push(`/provider/edit-property?id=${propertyId}`);
  };

  const handleStatusChange = async (propertyId: string, currentStatus: string, propertyTitle: string) => {
    const newStatus = currentStatus === 'active' ? 'booked' : 'active';
    const statusLabel = newStatus === 'active' ? 'Active' : 'Booked';
    
    Alert.alert(
      'Change Property Status',
      `Mark "${propertyTitle}" as ${statusLabel}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await updateProperty(propertyId, { status: newStatus as any });
            if (success) {
              Alert.alert('Success', `Property marked as ${statusLabel}`);
              await loadOwnerProperties();
            } else {
              Alert.alert('Error', 'Failed to update property status');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOwnerProperties();
  };

  const renderPropertyCard = ({ item }: { item: any }) => (
    <View style={styles.propertyCard}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.propertyImage}
        contentFit="cover"
      />
      <View style={styles.propertyInfo}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'active' && styles.statusBadgeActive,
            item.status === 'pending' && styles.statusBadgePending,
            item.status === 'rented' && styles.statusBadgeRented,
          ]}>
            <Text style={styles.statusBadgeText}>
              {item.status === 'active' ? '✓ Active' : 
               item.status === 'pending' ? '⏳ Pending' : 
               '🏠 Rented'}
            </Text>
          </View>
        </View>
        
        <View style={styles.propertyDetails}>
          <View style={styles.propertyDetail}>
            <MapPin size={14} color={Colors.textLight} />
            <Text style={styles.propertyDetailText} numberOfLines={1}>
              {item.location.city}, {item.location.state}
            </Text>
          </View>
          <View style={styles.propertyDetail}>
            <DollarSign size={14} color={Colors.textLight} />
            <Text style={styles.propertyDetailText}>₹{item.price.toLocaleString()}/month</Text>
          </View>
        </View>

        <View style={styles.statusActions}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === 'active' ? styles.statusButtonActive : styles.statusButtonBooked
            ]}
            onPress={() => handleStatusChange(item.id, item.status || 'active', item.title)}
          >
            {item.status === 'active' ? (
              <CheckCircle size={18} color="#10B981" />
            ) : (
              <XCircle size={18} color="#6B7280" />
            )}
            <Text
              style={[
                styles.statusButtonText,
                item.status === 'active' ? styles.statusButtonTextActive : styles.statusButtonTextBooked
              ]}
            >
              {item.status === 'active' ? 'Mark as Booked' : 'Mark as Active'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.propertyStats}>
          <View style={styles.statItem}>
            <Eye size={16} color={Colors.primary} />
            <Text style={styles.statText}>{Math.floor(Math.random() * 100)} views</Text>
          </View>
          <View style={styles.statItem}>
            <TrendingUp size={16} color={Colors.success} />
            <Text style={styles.statText}>{Math.floor(Math.random() * 20)} inquiries</Text>
          </View>
        </View>

        <View style={styles.propertyActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/property/${item.id}`)}
          >
            <Eye size={18} color={Colors.primary} />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEdit(item.id)}
          >
            <Edit size={18} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProperty(item.id, item.title)}
          >
            <Trash2 size={18} color={Colors.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'My Properties', headerShown: true }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Home size={24} color={Colors.white} />
            <Text style={styles.statValue}>{myProperties.length}</Text>
            <Text style={styles.statLabel}>Total Properties</Text>
          </View>
          <View style={styles.statCard}>
            <Eye size={24} color={Colors.white} />
            <Text style={styles.statValue}>{totalViews}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={Colors.white} />
            <Text style={styles.statValue}>{totalInquiries}</Text>
            <Text style={styles.statLabel}>Inquiries</Text>
          </View>
        </LinearGradient>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
            onPress={() => setSelectedTab('active')}
          >
            <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
              Active ({activeProperties.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
            onPress={() => setSelectedTab('pending')}
          >
            <Text style={[styles.tabText, selectedTab === 'pending' && styles.tabTextActive]}>
              Pending ({pendingProperties.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'rented' && styles.tabActive]}
            onPress={() => setSelectedTab('rented')}
          >
            <Text style={[styles.tabText, selectedTab === 'rented' && styles.tabTextActive]}>
              Rented ({rentedProperties.length})
            </Text>
          </TouchableOpacity>
        </View>

        {displayProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Home size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No properties found</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'active' && 'You don\'t have any active properties yet'}
              {selectedTab === 'pending' && 'No properties pending approval'}
              {selectedTab === 'rented' && 'No rented properties'}
            </Text>
            <Button
              title="Add New Property"
              onPress={() => router.push('/(tabs)/add-property')}
              icon={<Plus size={20} color={Colors.white} />}
              style={styles.addButton}
            />
          </View>
        ) : (
          <FlatList
            data={displayProperties}
            keyExtractor={item => item.id}
            renderItem={renderPropertyCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/(tabs)/add-property')}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Plus size={28} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: '100%',
    height: 180,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: Colors.success + '20',
  },
  statusBadgePending: {
    backgroundColor: '#FFA500' + '20',
  },
  statusBadgeRented: {
    backgroundColor: Colors.primary + '20',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  propertyDetails: {
    marginBottom: 12,
  },
  propertyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  propertyDetailText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 6,
    flex: 1,
  },
  propertyStats: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 6,
    fontWeight: '500',
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: Colors.error + '10',
  },
  deleteButtonText: {
    color: Colors.error,
  },
  statusActions: {
    marginBottom: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  statusButtonActive: {
    backgroundColor: '#10B98110',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusButtonBooked: {
    backgroundColor: '#6B728010',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#10B981',
  },
  statusButtonTextBooked: {
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
