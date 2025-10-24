import { Property, LocationSearch } from '@/types';
import { supabase } from '@/lib/supabase';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const earthRadius = 6371;
  
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return earthRadius * c;
};

export const searchPropertiesByLocation = async (
  search: LocationSearch,
  maxRadius: number = 100
): Promise<{ properties: Property[]; radius: number }> => {
  try {
    let currentRadius = 10;
    let properties: Property[] = [];

    while (properties.length === 0 && currentRadius <= maxRadius) {
      console.log(`Searching properties within ${currentRadius}km radius...`);

      const { data, error } = await supabase.rpc('search_properties_by_location', {
        search_lat: search.latitude,
        search_lon: search.longitude,
        max_radius: currentRadius,
      });

      if (error) {
        console.error('Failed to search properties:', error);
        
        const { data: allProperties, error: fallbackError } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          throw fallbackError;
        }

        if (allProperties) {
          const filteredProperties = allProperties
            .map((prop: any) => {
              const distance = calculateDistance(
                search.latitude,
                search.longitude,
                prop.latitude,
                prop.longitude
              );

              return {
                property: {
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
                },
                distance,
              };
            })
            .filter(({ distance }) => distance <= currentRadius)
            .sort((a, b) => a.distance - b.distance)
            .map(({ property }) => property);

          if (filteredProperties.length > 0) {
            return { properties: filteredProperties, radius: currentRadius };
          }
        }

        currentRadius += 10;
        continue;
      }

      if (data && data.length > 0) {
        properties = data.map((prop: any) => ({
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
      } else {
        currentRadius += 10;
      }
    }

    return { properties, radius: currentRadius };
  } catch (err) {
    console.error('Failed to search properties by location:', err);
    throw err;
  }
};

export const getCurrentLocation = async (): Promise<LocationSearch | null> => {
  try {
    if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radius: 10,
            });
          },
          (error) => {
            console.error('Failed to get current location:', error);
            resolve(null);
          }
        );
      });
    }
    return null;
  } catch (err) {
    console.error('Failed to get current location:', err);
    return null;
  }
};
