import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useProperties } from '@/hooks/property-store';
import Colors from '@/constants/colors';
import PropertyCard from '@/components/PropertyCard';
import { Heart } from 'lucide-react-native';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { getFavoriteProperties } = useProperties();
  const [navigationReady, setNavigationReady] = useState(false);
  
  const favoriteProperties = getFavoriteProperties();

  // Wait for navigation to be ready before attempting to navigate
  useFocusEffect(
    React.useCallback(() => {
      setNavigationReady(true);
    }, [])
  );

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

  return (
    <View style={styles.container}>
      {favoriteProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={Colors.primary} />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Save properties you like by tapping the heart icon
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteProperties}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PropertyCard property={item} />}
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  },
});