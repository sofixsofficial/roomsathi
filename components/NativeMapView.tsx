import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Colors from '@/constants/colors';

interface NativeMapViewProps {
  property: {
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
      address: string;
    };
    title: string;
  };
}

const NativeMapView = memo(({ property }: NativeMapViewProps) => {
  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: property.location.coordinates.latitude,
          longitude: property.location.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        <Marker
          coordinate={{
            latitude: property.location.coordinates.latitude,
            longitude: property.location.coordinates.longitude,
          }}
          title={property.title}
          description={property.location.address}
        />
      </MapView>
    </View>
  );
});

NativeMapView.displayName = 'NativeMapView';

export default NativeMapView;

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
