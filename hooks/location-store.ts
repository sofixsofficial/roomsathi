import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Property } from '@/types';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface LocationSearchResult {
  properties: Property[];
  radius: number;
  searchType: 'radius' | 'city' | 'state';
  totalFound: number;
}

const SEARCH_RADII = [10, 20, 50, 100]; // km
const EARTH_RADIUS = 6371; // km

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

export const [LocationContext, useLocation] = createContextHook(() => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);

  useEffect(() => {
    loadStoredLocation();
    checkLocationPermission();
  }, []);

  const loadStoredLocation = async () => {
    try {
      const stored = await AsyncStorage.getItem('userLocation');
      if (stored) {
        setUserLocation(JSON.parse(stored));
        setLocationEnabled(true);
      }
    } catch (err) {
      console.error('Failed to load stored location:', err);
    }
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === Location.PermissionStatus.GRANTED;
    } catch (err) {
      console.error('Failed to check location permission:', err);
      return false;
    }
  };

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setError('Location services are disabled. Please enable them in your device settings.');
        return false;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Location permission denied. Please enable location access to find nearby properties.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to request location permission:', err);
      setError('Failed to request location permission');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    try {
      setLoading(true);
      setError(null);

      // Check permission first
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      // Reverse geocode to get address
      let address, city, state, country;
      try {
        if (Platform.OS !== 'web') {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (reverseGeocode.length > 0) {
            const result = reverseGeocode[0];
            address = `${result.name || ''} ${result.street || ''} ${result.district || ''}`.trim();
            city = result.city || result.subregion || undefined;
            state = result.region || undefined;
            country = result.country || undefined;
          }
        }
      } catch (geocodeErr) {
        console.warn('Reverse geocoding failed:', geocodeErr);
      }

      const userLoc: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
        city,
        state,
        country,
      };

      setUserLocation(userLoc);
      setLocationEnabled(true);
      
      // Store location for future use
      await AsyncStorage.setItem('userLocation', JSON.stringify(userLoc));
      
      return userLoc;
    } catch (err) {
      console.error('Failed to get current location:', err);
      setError('Failed to get your location. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestLocationPermission]);

  const searchPropertiesNearby = useCallback((
    properties: Property[],
    userLoc?: UserLocation
  ): LocationSearchResult => {
    const searchLocation = userLoc || userLocation;
    
    if (!searchLocation) {
      return {
        properties,
        radius: 0,
        searchType: 'city',
        totalFound: properties.length,
      };
    }

    // Try different radii
    for (const radius of SEARCH_RADII) {
      const nearbyProperties = properties.filter(property => {
        const distance = calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          property.location.coordinates.latitude,
          property.location.coordinates.longitude
        );
        return distance <= radius;
      });

      if (nearbyProperties.length > 0) {
        return {
          properties: nearbyProperties,
          radius,
          searchType: 'radius',
          totalFound: nearbyProperties.length,
        };
      }
    }

    // If no properties found in radius, search by city
    if (searchLocation.city) {
      const cityProperties = properties.filter(property =>
        property.location.city.toLowerCase() === searchLocation.city?.toLowerCase()
      );

      if (cityProperties.length > 0) {
        return {
          properties: cityProperties,
          radius: 0,
          searchType: 'city',
          totalFound: cityProperties.length,
        };
      }
    }

    // If no properties found in city, search by state
    if (searchLocation.state) {
      const stateProperties = properties.filter(property =>
        property.location.state.toLowerCase() === searchLocation.state?.toLowerCase()
      );

      if (stateProperties.length > 0) {
        return {
          properties: stateProperties,
          radius: 0,
          searchType: 'state',
          totalFound: stateProperties.length,
        };
      }
    }

    // Return all properties if nothing found
    return {
      properties,
      radius: 0,
      searchType: 'city',
      totalFound: properties.length,
    };
  }, [userLocation]);

  const getPropertiesWithDistance = useCallback((properties: Property[]): (Property & { distance?: number })[] => {
    if (!userLocation) return properties;

    return properties.map(property => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        property.location.coordinates.latitude,
        property.location.coordinates.longitude
      );

      return {
        ...property,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation]);

  const clearLocation = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userLocation');
      setUserLocation(null);
      setLocationEnabled(false);
    } catch (err) {
      console.error('Failed to clear location:', err);
    }
  }, []);

  return useMemo(() => ({
    userLocation,
    loading,
    error,
    permissionStatus,
    locationEnabled,
    getCurrentLocation,
    requestLocationPermission,
    searchPropertiesNearby,
    getPropertiesWithDistance,
    clearLocation,
    hasLocationPermission: permissionStatus === Location.PermissionStatus.GRANTED,
  }), [
    userLocation,
    loading,
    error,
    permissionStatus,
    locationEnabled,
    getCurrentLocation,
    requestLocationPermission,
    searchPropertiesNearby,
    getPropertiesWithDistance,
    clearLocation,
  ]);
});