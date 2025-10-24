import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Bed, Home, Navigation, TrendingUp, Calendar, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { Property } from '@/types';
import { useProperties } from '@/hooks/property-store';

interface PropertyCardProps {
  property: Property & { distance?: number };
  showDistance?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 32;

export default function PropertyCard({ property, showDistance = false }: PropertyCardProps) {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useProperties();
  const favorite = isFavorite(property.id);

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  const handleFavoritePress = () => {
    toggleFavorite(property.id);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
      testID={`property-card-${property.id}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.5, 1]}
          style={styles.imageGradient}
        />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Heart 
            size={22} 
            color={favorite ? Colors.error : Colors.white} 
            fill={favorite ? Colors.error : 'transparent'} 
          />
        </TouchableOpacity>
        <View style={styles.priceTag}>
          <Sparkles size={14} color={Colors.white} style={styles.sparkleIcon} />
          <Text style={styles.priceText}>NPR रु {property.price.toLocaleString()}</Text>
          <Text style={styles.priceUnit}>/mo</Text>
        </View>
        {(property.status === 'active' || property.status === 'booked') && (
          <View style={[
            styles.statusBadge,
            property.status === 'booked' && styles.statusBadgeBooked
          ]}>
            <TrendingUp size={12} color={property.status === 'active' ? Colors.success : '#6B7280'} />
            <Text style={[
              styles.statusText,
              property.status === 'booked' && styles.statusTextBooked
            ]}>
              {property.status === 'active' ? 'Available' : 'Booked'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.location.city}, {property.location.state}
          </Text>
          {showDistance && property.distance !== undefined && (
            <View style={styles.distanceContainer}>
              <Navigation size={12} color={Colors.primary} />
              <Text style={styles.distanceText}>{property.distance}km</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Bed size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailText}>{property.bhk}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Home size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailText}>{property.furnishingType}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Calendar size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailTextSmall}>Available</Text>
            </View>
          </View>
        </View>
        
        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.amenitiesPreview}>
            <Text style={styles.amenitiesText} numberOfLines={1}>
              {property.amenities.slice(0, 3).join(' • ')}
              {property.amenities.length > 3 && ` • +${property.amenities.length - 3} more`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sparkleIcon: {
    marginRight: 2,
  },
  priceText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  priceUnit: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 12,
    opacity: 0.9,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
  statusBadgeBooked: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
  },
  statusTextBooked: {
    color: '#6B7280',
  },
  contentContainer: {
    padding: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  infoRow: {
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '600',
  },
  detailTextSmall: {
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '600',
  },
  detailDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  amenitiesPreview: {
    marginTop: 8,
  },
  amenitiesText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 2,
  },
});