import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAdmin } from '@/hooks/admin-store';
import { Property } from '@/types';
import Colors from '@/constants/colors';
import { Search, Trash2, CheckCircle, Eye } from 'lucide-react-native';

export default function AdminPropertiesScreen() {
  const router = useRouter();
  const { properties, deleteProperty, approveProperty } = useAdmin();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProperty = (propertyId: string) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProperty(propertyId);
            if (success) {
              Alert.alert('Success', 'Property deleted successfully');
            }
          },
        },
      ]
    );
  };

  const handleApproveProperty = async (propertyId: string) => {
    const success = await approveProperty(propertyId);
    if (success) {
      Alert.alert('Success', 'Property approved successfully');
    }
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <View style={styles.propertyCard}>
      <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyLocation}>
          {item.location.city}, {item.location.state}
        </Text>
        <Text style={styles.propertyPrice}>₹{item.price.toLocaleString()}/month</Text>
        <View style={styles.propertyMeta}>
          <Text style={[styles.propertyType, { color: Colors.primary }]}>
            {item.propertyType.toUpperCase()}
          </Text>
          <Text style={styles.propertyOwner}>Owner: {item.ownerName}</Text>
        </View>
      </View>
      <View style={styles.propertyActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          onPress={() => router.push(`/property/${item.id}` as any)}
        >
          <Eye size={16} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() => handleApproveProperty(item.id)}
        >
          <CheckCircle size={16} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleDeleteProperty(item.id)}
        >
          <Trash2 size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Manage Properties' }} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No properties found</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
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
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  propertyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyType: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  propertyOwner: {
    fontSize: 12,
    color: Colors.textLight,
  },
  propertyActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
