import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Edit, Trash2, Eye, MapPin, Home, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/auth-store';
import { useProperties } from '@/hooks/property-store';
import Colors from '@/constants/colors';
import { Property } from '@/types';

export default function MyListingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { loadAllPropertiesByOwner, deleteProperty, updateProperty } = useProperties();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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
    }
  }, [user, loadAllPropertiesByOwner]);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'owner') {
      router.replace('/auth/login');
      return;
    }
    
    loadOwnerProperties();
  }, [user, isAuthenticated, loadOwnerProperties, router]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOwnerProperties();
    setRefreshing(false);
  };

  const handleDelete = (propertyId: string, propertyTitle: string) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProperty(propertyId);
            if (success) {
              Alert.alert('Success', 'Property deleted successfully');
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

  const handleViewDetails = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };

  const handleStatusChange = (propertyId: string, currentStatus: string, propertyTitle: string) => {
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
            console.log(`Updating property ${propertyId} status to: ${newStatus}`);
            const success = await updateProperty(propertyId, { status: newStatus as any });
            if (success) {
              Alert.alert('Success', `Property marked as ${statusLabel}`);
              await loadOwnerProperties();
            } else {
              Alert.alert('Error', 'Failed to update property status. Please check console for details.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'booked':
        return '#F59E0B';
      default:
        return Colors.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'booked':
        return 'Booked';
      default:
        return status;
    }
  };

  if (!user || user.userType !== 'owner') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'My Properties',
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Property Listings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your properties and track interested finders
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myProperties.length}</Text>
            <Text style={styles.statLabel}>Total Properties</Text>
          </View>
        </View>

        {myProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <Home size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Properties Listed</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first property to get found by renters
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/add-property')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>Add Property</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.propertiesList}>
            {myProperties.map((property) => (
              <TouchableOpacity
                key={property.id}
                style={styles.propertyCard}
                onPress={() => handleViewDetails(property.id)}
                activeOpacity={0.7}
              >
                <View style={styles.propertyHeader}>
                  <View style={styles.propertyInfo}>
                    <Text style={styles.propertyTitle} numberOfLines={2}>
                      {property.title}
                    </Text>
                    <View style={styles.locationRow}>
                      <MapPin size={14} color={Colors.textLight} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {property.location.city}, {property.location.state}
                      </Text>
                    </View>
                  </View>
                  {property.status === 'booked' ? (
                    <View style={styles.bookedBadgeWrapper}>
                      <LinearGradient
                        colors={['#F59E0B', '#DC2626']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bookedBadge}
                      >
                        <View style={styles.bookedBadgeInner}>
                          <View style={styles.bookedIconWrapper}>
                            <CheckCircle size={16} color="#ffffff" strokeWidth={3} />
                          </View>
                          <Text style={styles.bookedText}>BOOKED</Text>
                        </View>
                      </LinearGradient>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(property.status || 'active') + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(property.status || 'active') },
                        ]}
                      >
                        {getStatusLabel(property.status || 'active')}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.propertyDetails}>
                  <View style={styles.propertyDetailItem}>
                    <Text style={styles.propertyDetailLabel}>Type:</Text>
                    <Text style={styles.propertyDetailValue}>
                      {property.propertyType.replace('-', ' ')}
                    </Text>
                  </View>
                  <View style={styles.propertyDetailItem}>
                    <Text style={styles.propertyDetailLabel}>BHK:</Text>
                    <Text style={styles.propertyDetailValue}>{property.bhk}</Text>
                  </View>
                  <View style={styles.propertyDetailItem}>
                    <Text style={styles.propertyDetailLabel}>Rent:</Text>
                    <Text style={styles.propertyDetailValue}>रु {property.price.toLocaleString()}/mo</Text>
                  </View>
                </View>

                <View style={styles.statusActions}>
                  <TouchableOpacity
                    style={[
                      styles.statusButtonWrapper,
                      property.status === 'booked' && styles.statusButtonWrapperBooked
                    ]}
                    onPress={() => handleStatusChange(property.id, property.status || 'active', property.title)}
                    activeOpacity={0.8}
                  >
                    {property.status === 'active' ? (
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.statusButton}
                      >
                        <View style={styles.statusButtonContent}>
                          <CheckCircle size={20} color="#ffffff" strokeWidth={2.5} />
                          <Text style={styles.statusButtonText}>
                            Mark as Booked
                          </Text>
                        </View>
                      </LinearGradient>
                    ) : (
                      <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.statusButton}
                      >
                        <View style={styles.statusButtonContent}>
                          <CheckCircle size={20} color="#ffffff" strokeWidth={2.5} />
                          <Text style={styles.statusButtonText}>
                            Mark as Available
                          </Text>
                        </View>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.propertyActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => handleViewDetails(property.id)}
                  >
                    <Eye size={16} color={Colors.primary} />
                    <Text style={[styles.actionButtonText, styles.viewButtonText]}>
                      View
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(property.id)}
                  >
                    <Edit size={16} color="#10B981" />
                    <Text style={[styles.actionButtonText, styles.editButtonText]}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(property.id, property.title)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  propertiesList: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyInfo: {
    flex: 1,
    marginRight: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textLight,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookedBadgeWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bookedBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookedBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookedIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  propertyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  propertyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyDetailLabel: {
    fontSize: 13,
    color: Colors.textLight,
    marginRight: 4,
  },
  propertyDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  propertyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: Colors.primaryLight,
  },
  viewButtonText: {
    color: Colors.primary,
  },
  editButton: {
    backgroundColor: '#10B98120',
  },
  editButtonText: {
    color: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF444420',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  statusActions: {
    marginBottom: 12,
  },
  statusButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  statusButtonWrapperBooked: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  statusButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  statusButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  statsContainer: {
    padding: 16,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
});
