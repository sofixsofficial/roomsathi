import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { PropertyHistory, FinderHistory, Property } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/auth-store';

export const [HistoryContext, useHistory] = createContextHook(() => {
  const { user } = useAuth();
  const [propertyHistory, setPropertyHistory] = useState<PropertyHistory[]>([]);
  const [finderHistory, setFinderHistory] = useState<FinderHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPropertyHistory = useCallback(async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: historyData, error: historyError } = await supabase
        .from('property_history')
        .select(`
          *,
          properties (*)
        `)
        .eq('provider_id', providerId)
        .order('timestamp', { ascending: false });

      if (historyError) {
        console.error('Failed to load property history:', historyError);
        setError('Failed to load property history');
        return;
      }

      if (historyData) {
        const mappedHistory: PropertyHistory[] = historyData.map((h: any) => ({
          id: h.id,
          propertyId: h.property_id,
          providerId: h.provider_id,
          property: h.properties ? {
            id: h.properties.id,
            title: h.properties.title,
            description: h.properties.description,
            price: h.properties.price,
            deposit: h.properties.deposit,
            location: {
              address: h.properties.address,
              city: h.properties.city,
              state: h.properties.state,
              pincode: h.properties.pincode,
              coordinates: {
                latitude: h.properties.latitude,
                longitude: h.properties.longitude,
              },
            },
            propertyType: h.properties.property_type,
            category: h.properties.category,
            bhk: h.properties.bhk,
            furnishingType: h.properties.furnishing_type,
            amenities: h.properties.amenities,
            rules: {
              petsAllowed: h.properties.pets_allowed,
              couplesAllowed: h.properties.couples_allowed,
              familiesAllowed: h.properties.families_allowed,
              bachelorsAllowed: h.properties.bachelors_allowed,
            },
            images: h.properties.images,
            ownerId: h.properties.owner_id,
            ownerName: h.properties.owner_name,
            ownerPhone: h.properties.owner_phone,
            availableFrom: h.properties.available_from,
            virtualTourUrl: h.properties.virtual_tour_url,
            status: h.properties.status,
            createdAt: h.properties.created_at,
            updatedAt: h.properties.updated_at,
          } : {} as Property,
          action: h.action,
          previousStatus: h.previous_status,
          newStatus: h.new_status,
          viewCount: h.view_count || 0,
          interestedFinders: h.interested_finders || [],
          timestamp: h.timestamp,
          createdAt: h.created_at,
        }));

        setPropertyHistory(mappedHistory);
      }
    } catch (err) {
      console.error('Failed to load property history:', err);
      setError('Failed to load property history');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFinderHistory = useCallback(async (finderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: historyData, error: historyError } = await supabase
        .from('finder_history')
        .select(`
          *,
          properties (*)
        `)
        .eq('finder_id', finderId)
        .order('timestamp', { ascending: false });

      if (historyError) {
        console.error('Failed to load finder history:', historyError);
        setError('Failed to load finder history');
        return;
      }

      if (historyData) {
        const mappedHistory: FinderHistory[] = historyData.map((h: any) => ({
          id: h.id,
          finderId: h.finder_id,
          propertyId: h.property_id,
          property: h.properties ? {
            id: h.properties.id,
            title: h.properties.title,
            description: h.properties.description,
            price: h.properties.price,
            deposit: h.properties.deposit,
            location: {
              address: h.properties.address,
              city: h.properties.city,
              state: h.properties.state,
              pincode: h.properties.pincode,
              coordinates: {
                latitude: h.properties.latitude,
                longitude: h.properties.longitude,
              },
            },
            propertyType: h.properties.property_type,
            category: h.properties.category,
            bhk: h.properties.bhk,
            furnishingType: h.properties.furnishing_type,
            amenities: h.properties.amenities,
            rules: {
              petsAllowed: h.properties.pets_allowed,
              couplesAllowed: h.properties.couples_allowed,
              familiesAllowed: h.properties.families_allowed,
              bachelorsAllowed: h.properties.bachelors_allowed,
            },
            images: h.properties.images,
            ownerId: h.properties.owner_id,
            ownerName: h.properties.owner_name,
            ownerPhone: h.properties.owner_phone,
            availableFrom: h.properties.available_from,
            virtualTourUrl: h.properties.virtual_tour_url,
            status: h.properties.status,
            createdAt: h.properties.created_at,
            updatedAt: h.properties.updated_at,
          } : {} as Property,
          action: h.action,
          timestamp: h.timestamp,
          createdAt: h.created_at,
          isFavorite: h.is_favorite,
          contactDetails: h.contact_details,
        }));

        setFinderHistory(mappedHistory);
      }
    } catch (err) {
      console.error('Failed to load finder history:', err);
      setError('Failed to load finder history');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPropertyHistory = useCallback(async (
    propertyId: string,
    action: 'created' | 'edited' | 'deleted' | 'reposted' | 'status_changed',
    previousStatus?: 'active' | 'pending' | 'rejected' | 'rented',
    newStatus?: 'active' | 'pending' | 'rejected' | 'rented'
  ) => {
    if (!user) return;

    try {
      const { error: insertError } = await supabase
        .from('property_history')
        .insert({
          property_id: propertyId,
          provider_id: user.id,
          action,
          previous_status: previousStatus,
          new_status: newStatus,
        });

      if (insertError) {
        console.error('Failed to add property history:', insertError);
        return;
      }

      await loadPropertyHistory(user.id);
    } catch (err) {
      console.error('Failed to add property history:', err);
    }
  }, [user, loadPropertyHistory]);

  const addFinderHistory = useCallback(async (
    propertyId: string,
    action: 'viewed' | 'contacted' | 'favorited' | 'unfavorited',
    contactDetails?: {
      providerName: string;
      providerPhone: string;
      providerEmail?: string;
    }
  ) => {
    if (!user) return;

    try {
      const { error: insertError } = await supabase
        .from('finder_history')
        .insert({
          finder_id: user.id,
          property_id: propertyId,
          action,
          is_favorite: action === 'favorited',
          contact_details: contactDetails,
        });

      if (insertError) {
        console.error('Failed to add finder history:', insertError);
        return;
      }

      await loadFinderHistory(user.id);
    } catch (err) {
      console.error('Failed to add finder history:', err);
    }
  }, [user, loadFinderHistory]);

  useEffect(() => {
    if (user) {
      if (user.userType === 'owner') {
        loadPropertyHistory(user.id);
      } else if (user.userType === 'renter') {
        loadFinderHistory(user.id);
      }
    }
  }, [user, loadPropertyHistory, loadFinderHistory]);

  return useMemo(() => ({
    propertyHistory,
    finderHistory,
    loading,
    error,
    loadPropertyHistory,
    loadFinderHistory,
    addPropertyHistory,
    addFinderHistory,
  }), [
    propertyHistory,
    finderHistory,
    loading,
    error,
    loadPropertyHistory,
    loadFinderHistory,
    addPropertyHistory,
    addFinderHistory,
  ]);
});
