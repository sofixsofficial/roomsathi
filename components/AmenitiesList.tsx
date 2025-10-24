import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { 
  Wifi, 
  Wind, 
  Thermometer, 
  Tv, 
  Droplet, 
  Coffee, 
  Home, 
  Car, 
  Activity, 
  ArrowUpDown, 
  Shield, 
  BatteryCharging, 
  Flame 
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { amenities as amenitiesList } from '@/constants/amenities';

interface AmenitiesListProps {
  amenities: string[];
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  const getIcon = (id: string) => {
    const size = 18;
    const color = Colors.primary;
    
    switch (id) {
      case 'wifi':
        return <Wifi size={size} color={color} />;
      case 'ac':
        return <Wind size={size} color={color} />;
      case 'fridge':
        return <Thermometer size={size} color={color} />;
      case 'tv':
        return <Tv size={size} color={color} />;
      case 'washing_machine':
        return <Droplet size={size} color={color} />;
      case 'kitchen':
        return <Coffee size={size} color={color} />;
      case 'balcony':
        return <Home size={size} color={color} />;
      case 'parking':
        return <Car size={size} color={color} />;
      case 'gym':
        return <Activity size={size} color={color} />;
      case 'lift':
        return <ArrowUpDown size={size} color={color} />;
      case 'security':
        return <Shield size={size} color={color} />;
      case 'power_backup':
        return <BatteryCharging size={size} color={color} />;
      case 'water_supply':
        return <Droplet size={size} color={color} />;
      case 'gas_pipeline':
        return <Flame size={size} color={color} />;
      default:
        return <Home size={size} color={color} />;
    }
  };

  const getLabel = (id: string): string => {
    const amenity = amenitiesList.find(a => a.id === id);
    return amenity ? amenity.label : id;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amenities</Text>
      <View style={styles.amenitiesGrid}>
        {amenities.map(amenity => (
          <View key={amenity} style={styles.amenityItem}>
            {getIcon(amenity)}
            <Text style={styles.amenityLabel}>{getLabel(amenity)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    minWidth: '30%',
    flexShrink: 1,
    flexGrow: 1,
    maxWidth: '48%',
  },
  amenityLabel: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    flexShrink: 1,
  },
});