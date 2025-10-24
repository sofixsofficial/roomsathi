import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Property, PropertyFilter } from '@/types';
import { supabase } from '@/lib/supabase';

export const [PropertyContext, useProperties] = createContextHook(() => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadProperties = useCallback(async (retryCount = 0) => {
    try {
      if (retryCount === 0) {
        setLoading(true);
      }
      console.log('Loading properties...');
      
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) {
        if (fetchError.message?.includes('Abort') || fetchError.message?.includes('aborted')) {
          console.log('Request aborted, skipping error handling');
          return;
        }
        
        console.error('ERROR Failed to load properties:', JSON.stringify({
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
        }, null, 2));
        
        const isNetworkError = 
          fetchError.message?.includes('Network request failed') ||
          fetchError.message?.includes('fetch failed') ||
          fetchError.message?.includes('Failed to fetch') ||
          fetchError.code === 'ETIMEDOUT' ||
          fetchError.code === 'ECONNREFUSED';
        
        if (isNetworkError && retryCount < 3) {
          console.log(`Retrying... Attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          return loadProperties(retryCount + 1);
        }
        
        const errorMsg = isNetworkError 
          ? 'Cannot connect to server. Please check your internet connection and try again.'
          : fetchError.message || 'Failed to load properties';
        
        setError(errorMsg);
        console.error('ERROR Warning: Failed to load properties:', {
          message: fetchError.message,
          details: fetchError.message,
          hint: fetchError.hint || '',
          code: fetchError.code || '',
        });
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
        setError(null);
        console.log(`Successfully loaded ${mappedProperties.length} properties`);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred';
      
      if (errorMessage.includes('Abort') || errorMessage.includes('aborted')) {
        console.log('Request aborted, skipping error handling');
        return;
      }
      
      console.error('ERROR Failed to load properties:', err);
      
      const isNetworkError = 
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('timeout');
      
      if (isNetworkError && retryCount < 3) {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return loadProperties(retryCount + 1);
      }
      
      const displayError = isNetworkError
        ? 'Cannot connect to server. Please check your internet connection and try again.'
        : errorMessage;
      
      setError(displayError);
      console.error('ERROR Warning: Failed to load properties:', {
        message: errorMessage,
        details: errorMessage,
        hint: '',
        code: '',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
    
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      }
    };
    
    loadFavorites();
  }, [loadProperties]);

  const getPropertyById = useCallback((id: string): Property | undefined => {
    return properties.find(property => property.id === id);
  }, [properties]);

  const filterProperties = useCallback((filter: PropertyFilter): Property[] => {
    return properties.filter(property => {
      if (filter.location && 
          !property.location.address.toLowerCase().includes(filter.location.toLowerCase()) && 
          !property.location.city.toLowerCase().includes(filter.location.toLowerCase())) {
        return false;
      }

      if (filter.minPrice !== undefined && property.price < filter.minPrice) {
        return false;
      }
      if (filter.maxPrice !== undefined && property.price > filter.maxPrice) {
        return false;
      }

      if (filter.propertyType && filter.propertyType.length > 0 && !filter.propertyType.includes(property.propertyType)) {
        return false;
      }

      if (filter.category && filter.category.length > 0 && !filter.category.includes(property.category)) {
        return false;
      }

      if (filter.bhk && filter.bhk.length > 0 && !filter.bhk.includes(property.bhk)) {
        return false;
      }

      if (filter.furnishingType && filter.furnishingType.length > 0 && !filter.furnishingType.includes(property.furnishingType)) {
        return false;
      }

      if (filter.amenities && filter.amenities.length > 0) {
        const hasAllAmenities = filter.amenities.every(amenity => property.amenities.includes(amenity));
        if (!hasAllAmenities) {
          return false;
        }
      }

      if (filter.petsAllowed !== undefined && property.rules.petsAllowed !== filter.petsAllowed) {
        return false;
      }
      if (filter.couplesAllowed !== undefined && property.rules.couplesAllowed !== filter.couplesAllowed) {
        return false;
      }
      if (filter.familiesAllowed !== undefined && property.rules.familiesAllowed !== filter.familiesAllowed) {
        return false;
      }
      if (filter.bachelorsAllowed !== undefined && property.rules.bachelorsAllowed !== filter.bachelorsAllowed) {
        return false;
      }

      if (filter.status && filter.status.length > 0 && property.status && !filter.status.includes(property.status)) {
        return false;
      }

      return true;
    });
  }, [properties]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    try {
      let updatedFavorites: string[];
      
      if (favorites.includes(propertyId)) {
        updatedFavorites = favorites.filter(id => id !== propertyId);
      } else {
        updatedFavorites = [...favorites, propertyId];
      }
      
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (err) {
      console.error('Failed to update favorites:', err);
      setError('Failed to update favorites');
    }
  }, [favorites]);

  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.includes(propertyId);
  }, [favorites]);

  const getFavoriteProperties = useCallback((): Property[] => {
    return properties.filter(property => favorites.includes(property.id));
  }, [properties, favorites]);

  const addProperty = useCallback(async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert({
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price,
          deposit: propertyData.deposit,
          address: propertyData.location.address,
          city: propertyData.location.city,
          state: propertyData.location.state,
          pincode: propertyData.location.pincode,
          latitude: propertyData.location.coordinates.latitude,
          longitude: propertyData.location.coordinates.longitude,
          property_type: propertyData.propertyType,
          category: propertyData.category,
          bhk: propertyData.bhk,
          furnishing_type: propertyData.furnishingType,
          amenities: propertyData.amenities,
          pets_allowed: propertyData.rules.petsAllowed,
          couples_allowed: propertyData.rules.couplesAllowed,
          families_allowed: propertyData.rules.familiesAllowed,
          bachelors_allowed: propertyData.rules.bachelorsAllowed,
          images: propertyData.images,
          owner_id: propertyData.ownerId,
          owner_name: propertyData.ownerName,
          owner_phone: propertyData.ownerPhone,
          available_from: propertyData.availableFrom,
          virtual_tour_url: propertyData.virtualTourUrl,
          status: 'active',
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Failed to add property:', insertError);
        setError('Failed to add property');
        return false;
      }
      
      if (data) {
        await loadProperties();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Failed to add property:', err);
      setError('Failed to add property');
      return false;
    }
  }, [loadProperties]);

  const refreshProperties = useCallback(async () => {
    await loadProperties();
  }, [loadProperties]);

  const updateProperty = useCallback(async (propertyId: string, propertyData: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    try {
      const updatePayload: any = {};
      
      if (propertyData.title !== undefined) updatePayload.title = propertyData.title;
      if (propertyData.description !== undefined) updatePayload.description = propertyData.description;
      if (propertyData.price !== undefined) updatePayload.price = propertyData.price;
      if (propertyData.deposit !== undefined) updatePayload.deposit = propertyData.deposit;
      if (propertyData.location) {
        updatePayload.address = propertyData.location.address;
        updatePayload.city = propertyData.location.city;
        updatePayload.state = propertyData.location.state;
        updatePayload.pincode = propertyData.location.pincode;
        updatePayload.latitude = propertyData.location.coordinates.latitude;
        updatePayload.longitude = propertyData.location.coordinates.longitude;
      }
      if (propertyData.propertyType !== undefined) updatePayload.property_type = propertyData.propertyType;
      if (propertyData.category !== undefined) updatePayload.category = propertyData.category;
      if (propertyData.bhk !== undefined) updatePayload.bhk = propertyData.bhk;
      if (propertyData.furnishingType !== undefined) updatePayload.furnishing_type = propertyData.furnishingType;
      if (propertyData.amenities !== undefined) updatePayload.amenities = propertyData.amenities;
      if (propertyData.rules) {
        updatePayload.pets_allowed = propertyData.rules.petsAllowed;
        updatePayload.couples_allowed = propertyData.rules.couplesAllowed;
        updatePayload.families_allowed = propertyData.rules.familiesAllowed;
        updatePayload.bachelors_allowed = propertyData.rules.bachelorsAllowed;
      }
      if (propertyData.images !== undefined) updatePayload.images = propertyData.images;
      if (propertyData.availableFrom !== undefined) updatePayload.available_from = propertyData.availableFrom;
      if (propertyData.virtualTourUrl !== undefined) updatePayload.virtual_tour_url = propertyData.virtualTourUrl;
      if (propertyData.status !== undefined) updatePayload.status = propertyData.status;
      
      updatePayload.updated_at = new Date().toISOString();
      
      const { data, error: updateError } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', propertyId)
        .select()
        .single();
      
      if (updateError) {
        console.error('ERROR Failed to update property:', JSON.stringify({
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        }, null, 2));
        setError('Failed to update property: ' + updateError.message);
        return false;
      }
      
      if (data) {
        await loadProperties();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Failed to update property:', err);
      setError('Failed to update property');
      return false;
    }
  }, [loadProperties]);

  const deleteProperty = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (deleteError) {
        console.error('ERROR Failed to delete property:', JSON.stringify({
          code: deleteError.code,
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
        }, null, 2));
        setError('Failed to delete property: ' + deleteError.message);
        return false;
      }
      
      await loadProperties();
      return true;
    } catch (err) {
      console.error('ERROR Failed to delete property:', err);
      setError('Failed to delete property');
      return false;
    }
  }, [loadProperties]);

  const getPropertiesByOwner = useCallback((ownerId: string): Property[] => {
    return properties.filter(property => property.ownerId === ownerId);
  }, [properties]);

  const loadAllPropertiesByOwner = useCallback(async (ownerId: string): Promise<Property[]> => {
    try {
      console.log(`Loading all properties for owner: ${ownerId}`);
      
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('ERROR Failed to load owner properties:', JSON.stringify({
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
        }, null, 2));
        return [];
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
        console.log(`Loaded ${mappedProperties.length} properties for owner`);
        return mappedProperties;
      }

      return [];
    } catch (err: any) {
      console.error('ERROR Failed to load owner properties:', err);
      return [];
    }
  }, []);

  return useMemo(() => ({
    properties,
    loading,
    error,
    getPropertyById,
    filterProperties,
    toggleFavorite,
    isFavorite,
    getFavoriteProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByOwner,
    loadAllPropertiesByOwner,
    refreshProperties,
  }), [
    properties,
    loading,
    error,
    getPropertyById,
    filterProperties,
    toggleFavorite,
    isFavorite,
    getFavoriteProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByOwner,
    loadAllPropertiesByOwner,
    refreshProperties,
  ]);
});
