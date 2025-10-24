import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useProperties } from '@/hooks/property-store';
import { useLocation } from '@/hooks/location-store';
import { PropertyFilter, Property } from '@/types';
import Colors, { getThemeColors } from '@/constants/colors';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import FilterModal from '@/components/FilterModal';
import Button from '@/components/Button';
import NetworkErrorCard from '@/components/NetworkErrorCard';
import PropertyProviderDashboard from '@/components/PropertyProviderDashboard';
import { MapPin, Navigation, Target, TrendingUp, MapPinOff, Plus, Package, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { propertyCategories as propertyTypesCategories } from '@/constants/amenities';
import { supabase } from '@/lib/supabase';

const propertyCategories = [
  { id: 'all', label: 'All', propertyType: null, icon: '🏠', description: 'View all properties', gradient: ['#667eea', '#764ba2'] },
  ...propertyTypesCategories.map(cat => ({
    id: cat.id,
    label: cat.label,
    propertyType: cat.id,
    icon: cat.icon,
    description: cat.description,
    gradient: cat.id === 'room-rent' ? ['#4F86F7', '#4F86F7'] :
              cat.id === 'flat-rent' ? ['#a8b3cf', '#a8b3cf'] :
              cat.id === 'shutter-rent' ? ['#FA8BFF', '#2BD2FF'] :
              cat.id === 'house-rent' ? ['#43e97b', '#38f9d7'] :
              cat.id === 'land-rent' ? ['#3eecac', '#ee74e1'] :
              cat.id === 'office-rent' ? ['#ffecd2', '#fcb69f'] :
              cat.id === 'house-buy' ? ['#667eea', '#764ba2'] :
              cat.id === 'land-buy' ? ['#fa709a', '#fee140'] :
              cat.id === 'hostel-available' ? ['#a8edea', '#fed6e3'] :
              cat.id === 'girls-hostel' ? ['#ff9a9e', '#fecfef'] :
              cat.id === 'boys-hostel' ? ['#a1c4fd', '#c2e9fb'] :
              ['#667eea', '#764ba2']
  }))
];

type PropertyStatus = 'active' | 'pending' | 'rejected' | 'booked';

function PropertyProviderScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const themeColors = getThemeColors(user?.userType);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus | 'all'>('all');

  const loadMyProperties = async () => {
    if (!user) return;
    
    try {
      if (!refreshing) {
        setLoading(true);
      }
      
      let query = supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('ERROR Failed to load properties:', error);
        return;
      }

      if (data) {
        const mappedProperties: Property[] = data.map(prop => ({
          id: prop.id,
          title: prop.title,
          description: prop.description,
          price: prop.price,
          deposit: prop.deposit,
          location: {
            address: prop.address,
            city: prop.city,
            state: prop.state,
            pincode: prop.pincode,
            coordinates: {
              latitude: prop.latitude,
              longitude: prop.longitude,
            },
          },
          propertyType: prop.property_type,
          category: prop.category,
          bhk: prop.bhk,
          furnishingType: prop.furnishing_type,
          amenities: prop.amenities,
          rules: {
            petsAllowed: prop.pets_allowed,
            couplesAllowed: prop.couples_allowed,
            familiesAllowed: prop.families_allowed,
            bachelorsAllowed: prop.bachelors_allowed,
          },
          images: prop.images,
          ownerId: prop.owner_id,
          ownerName: prop.owner_name,
          ownerPhone: prop.owner_phone,
          availableFrom: prop.available_from,
          virtualTourUrl: prop.virtual_tour_url,
          status: prop.status,
          createdAt: prop.created_at,
          updatedAt: prop.updated_at,
        }));
        setProperties(mappedProperties);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyProperties();
  }, [user, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMyProperties();
  };

  const handleDeleteProperty = async (propertyId: string) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

              if (error) {
                console.error('Failed to delete property:', error);
                Alert.alert('Error', 'Failed to delete property');
                return;
              }

              Alert.alert('Success', 'Property deleted successfully');
              loadMyProperties();
            } catch (err) {
              console.error('Error deleting property:', err);
              Alert.alert('Error', 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (propertyId: string, newStatus: PropertyStatus) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', propertyId);

      if (error) {
        console.error('Failed to update property status:', error);
        Alert.alert('Error', 'Failed to update property status');
        return;
      }

      Alert.alert('Success', `Property marked as ${newStatus}`);
      loadMyProperties();
    } catch (err) {
      console.error('Error updating property status:', err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const getStatusIcon = (status: PropertyStatus | 'all') => {
    switch (status) {
      case 'active':
        return <CheckCircle size={18} color={Colors.success} />;
      case 'pending':
        return <Clock size={18} color={Colors.warning} />;
      case 'rejected':
        return <XCircle size={18} color={Colors.error} />;
      case 'booked':
        return <CheckCircle size={18} color={Colors.textLight} />;
      default:
        return <Package size={18} color={Colors.primary} />;
    }
  };

  const statusFilters: { id: PropertyStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'booked', label: 'Booked' },
  ];

  const renderHeader = () => (
    <View>
      <PropertyProviderDashboard />
      
      <View style={styles.providerHeader}>
        <Text style={styles.providerTitle}>Property Listings</Text>
        <Text style={styles.providerSubtitle}>
          Manage your properties and track interested finders
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusFilters.map(filter => {
          const count = filter.id === 'all' ? properties.length : properties.filter(p => p.status === filter.id).length;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.statusFilterButton,
                selectedStatus === filter.id && styles.statusFilterButtonActive,
              ]}
              onPress={() => setSelectedStatus(filter.id)}
            >
              {getStatusIcon(filter.id)}
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === filter.id && styles.statusFilterTextActive,
                ]}
              >
                {filter.label}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  selectedStatus === filter.id && styles.statusBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    selectedStatus === filter.id && styles.statusBadgeTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {properties.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderHeader()}
          <View style={styles.emptyProviderContainer}>
            <Package size={64} color={Colors.textLight} />
            <Text style={styles.emptyProviderTitle}>No Properties Found</Text>
            <Text style={styles.emptyProviderText}>
              {selectedStatus === 'all'
                ? "You haven't added any properties yet"
                : `No ${selectedStatus} properties found`}
            </Text>
            {selectedStatus === 'all' && (
              <TouchableOpacity
                style={styles.addFirstPropertyButton}
                onPress={() => router.push('/(tabs)/add-property')}
              >
                <Plus size={20} color={Colors.white} />
                <Text style={styles.addFirstPropertyButtonText}>Add Your First Property</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.propertyCardWrapper}>
              <PropertyCard property={item} />
              <View style={styles.propertyActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => router.push(`/provider/edit-property?id=${item.id}` as any)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                
                {item.status === 'active' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.bookedButton]}
                    onPress={() => handleUpdateStatus(item.id, 'booked')}
                  >
                    <Text style={styles.actionButtonText}>Mark Booked</Text>
                  </TouchableOpacity>
                )}
                
                {item.status === 'booked' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.availableButton]}
                    onPress={() => handleUpdateStatus(item.id, 'active')}
                  >
                    <Text style={styles.actionButtonText}>Mark Available</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProperty(item.id)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.providerListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        onPress={() => router.push('/(tabs)/add-property')}
      >
        <Plus size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

function PropertyFinderScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const themeColors = getThemeColors(user?.userType);
  const { properties, error: propertiesError, refreshProperties, filterProperties } = useProperties();
  const { 
    userLocation, 
    locationEnabled, 
    getCurrentLocation, 
    searchPropertiesNearby, 
    getPropertiesWithDistance,
    loading: locationLoading,
    error: locationError 
  } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<PropertyFilter>({});
  const [filteredProperties, setFilteredProperties] = useState<(Property & { distance?: number })[]>([]);
  const [navigationReady, setNavigationReady] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [locationSearchResult, setLocationSearchResult] = useState<{
    radius: number;
    searchType: 'radius' | 'city' | 'state';
    totalFound: number;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        setNavigationReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  useEffect(() => {
    if (navigationReady && !authLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/auth/login');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router, navigationReady]);

  useEffect(() => {
    let filtered = properties;
    
    if (selectedCategory !== 'all') {
      const selectedPropertyType = propertyCategories.find(cat => cat.id === selectedCategory)?.propertyType;
      if (selectedPropertyType) {
        filtered = filtered.filter(property => property.propertyType === selectedPropertyType);
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(property => 
        property.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (Object.keys(activeFilter).length > 0) {
      filtered = filterProperties(activeFilter).filter(property => {
        if (selectedCategory === 'all') return true;
        const selectedPropertyType = propertyCategories.find(cat => cat.id === selectedCategory)?.propertyType;
        return selectedPropertyType ? property.propertyType === selectedPropertyType : true;
      });
    }
    
    if (locationEnabled && userLocation) {
      const locationResult = searchPropertiesNearby(filtered);
      setLocationSearchResult({
        radius: locationResult.radius,
        searchType: locationResult.searchType,
        totalFound: locationResult.totalFound,
      });
      
      const propertiesWithDistance = getPropertiesWithDistance(locationResult.properties);
      setFilteredProperties(propertiesWithDistance);
    } else {
      setFilteredProperties(filtered);
      setLocationSearchResult(null);
    }
  }, [properties, searchQuery, activeFilter, filterProperties, locationEnabled, userLocation, searchPropertiesNearby, getPropertiesWithDistance, selectedCategory]);

  const handleFilterPress = () => {
    setFilterVisible(true);
  };

  const handleApplyFilter = (filter: PropertyFilter) => {
    setActiveFilter(filter);
  };

  const handleEnableLocation = async () => {
    await getCurrentLocation();
  };

  const renderLocationStatus = () => {
    if (locationLoading) {
      return (
        <View style={[styles.locationStatus, { backgroundColor: themeColors.primary + '10' }]}>
          <ActivityIndicator size="small" color={themeColors.primary} />
          <Text style={[styles.locationStatusText, { color: themeColors.primary }]}>Getting your location...</Text>
        </View>
      );
    }

    if (locationError) {
      return (
        <TouchableOpacity style={styles.locationError} onPress={handleEnableLocation}>
          <Target size={16} color={Colors.error} />
          <Text style={styles.locationErrorText}>Location error - Tap to retry</Text>
        </TouchableOpacity>
      );
    }

    if (!locationEnabled) {
      return (
        <TouchableOpacity style={[styles.locationPrompt, { backgroundColor: themeColors.primary + '10', borderColor: themeColors.primary + '20' }]} onPress={handleEnableLocation}>
          <MapPin size={16} color={themeColors.primary} />
          <Text style={[styles.locationPromptText, { color: themeColors.primary }]}>Enable location for nearby properties</Text>
          <Navigation size={16} color={themeColors.primary} />
        </TouchableOpacity>
      );
    }

    if (locationSearchResult) {
      const { radius, searchType, totalFound } = locationSearchResult;
      let statusText = '';
      
      if (searchType === 'radius') {
        statusText = `Found ${totalFound} properties within ${radius}km`;
      } else if (searchType === 'city') {
        statusText = `Found ${totalFound} properties in your city`;
      } else if (searchType === 'state') {
        statusText = `Found ${totalFound} properties in your state`;
      }
      
      return (
        <View style={styles.locationSuccess}>
          <MapPin size={16} color={Colors.success} />
          <Text style={styles.locationSuccessText}>{statusText}</Text>
        </View>
      );
    }

    return null;
  };

  const renderHeader = () => (
    <View>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.welcomeName}>{user?.name || 'User'}</Text>
      </View>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={handleFilterPress}
        placeholder="Search by location, city..."
      />
      
      {renderLocationStatus()}

      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Property Category & Type</Text>
        </View>
        <Text style={styles.categoriesSubtitle}>Select Property Type</Text>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {propertyCategories.map(category => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCardNew,
                  isSelected && styles.categoryCardNewSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[
                  styles.categoryIconBox,
                  { backgroundColor: category.gradient[0] + '20' },
                  isSelected && { backgroundColor: category.gradient[0] }
                ]}>
                  <Text style={styles.categoryIconEmoji}>{category.icon}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={[
                    styles.categoryLabelNew,
                    isSelected && styles.categoryLabelNewSelected
                  ]}>
                    {category.label}
                  </Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
        </Text>
        {(activeFilter.minPrice || activeFilter.maxPrice || activeFilter.bhk?.length || activeFilter.amenities?.length) && (
          <TouchableOpacity onPress={() => setActiveFilter({})}>
            <Text style={styles.clearFilters}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (propertiesError && propertiesError.includes('Network request failed')) {
    return (
      <View style={styles.container}>
        <NetworkErrorCard 
          message={propertiesError}
          onRetry={refreshProperties}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {filteredProperties.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderHeader()}
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyEmoji}>😔</Text>
              <MapPinOff size={48} color={Colors.textLight} style={styles.emptyIcon} />
            </View>
            <Text style={styles.emptyText}>Oh No! No Properties Found</Text>
            <Text style={styles.emptySubtext}>
              {!locationEnabled 
                ? '📍 Enable location to discover nearby properties or try adjusting your search filters'
                : '🔍 Try adjusting your search criteria or filters to find more properties'
              }
            </Text>
            <View style={styles.emptyActions}>
              <Button 
                title="Reset Filters" 
                onPress={() => {
                  setSearchQuery('');
                  setActiveFilter({});
                  setSelectedCategory('all');
                }}
                variant="outline"
                style={styles.resetButton}
              />
              {!locationEnabled && (
                <Button 
                  title="Enable Location" 
                  onPress={handleEnableLocation}
                  style={styles.locationButton}
                  loading={locationLoading}
                />
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PropertyCard 
              property={item} 
              showDistance={locationEnabled && item.distance !== undefined}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <FilterModal 
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilter}
        initialFilter={activeFilter}
      />
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isPropertyProvider = user?.userType === 'owner';
  const isAdmin = user?.userType === 'admin';

  React.useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/admin');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, router]);

  if (isAdmin) {
    return null;
  }
  
  if (isPropertyProvider) {
    return <PropertyProviderScreen />;
  }
  
  return <PropertyFinderScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  providerListContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    marginTop: 16,
  },
  locationButton: {
    marginTop: 12,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  locationStatusText: {
    marginLeft: 8,
    fontSize: 14,
  },
  locationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationPromptText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    flex: 1,
  },
  locationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.success + '10',
    marginBottom: 8,
    borderRadius: 8,
  },
  locationSuccessText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.success,
  },
  locationError: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.error + '10',
    marginBottom: 8,
    borderRadius: 8,
  },
  locationErrorText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.error,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
  },
  categoriesSection: {
    marginVertical: 16,
  },
  categoriesHeader: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  categoriesSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoriesScrollView: {
    marginBottom: 12,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCardNew: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: 140,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardNewSelected: {
    borderColor: '#4F86F7',
    borderWidth: 2.5,
    elevation: 4,
    shadowOpacity: 0.12,
  },
  categoryIconBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconEmoji: {
    fontSize: 32,
  },
  categoryInfo: {
    gap: 4,
    alignItems: 'center',
  },
  categoryLabelNew: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  categoryLabelNewSelected: {
    color: '#4F86F7',
  },
  categoryDescription: {
    fontSize: 11,
    color: Colors.textLight,
    lineHeight: 16,
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  clearFilters: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  emptyIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  emptyIcon: {
    position: 'absolute',
    bottom: 0,
    right: -10,
  },
  emptyActions: {
    width: '100%',
    gap: 8,
  },
  providerHeader: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  providerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  providerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  statusFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    marginRight: 8,
  },
  statusFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  statusFilterTextActive: {
    color: Colors.white,
  },
  statusBadge: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  statusBadgeTextActive: {
    color: Colors.white,
  },
  emptyProviderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyProviderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyProviderText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addFirstPropertyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  propertyCardWrapper: {
    marginBottom: 8,
  },
  propertyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  bookedButton: {
    backgroundColor: Colors.textLight,
  },
  availableButton: {
    backgroundColor: Colors.success,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  deleteButtonText: {
    color: Colors.error,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
