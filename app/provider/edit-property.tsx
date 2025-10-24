import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { MapPin, Navigation, Eye } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useProperties } from '@/hooks/property-store';
import Colors from '@/constants/colors';
import { amenities, bhkTypes, furnishingTypes, propertyCategories } from '@/constants/amenities';
import Button from '@/components/Button';
import ImagePicker from '@/components/ImagePicker';

interface PropertyForm {
  title: string;
  description: string;
  price: string;
  deposit: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  propertyType: 'room-rent' | 'flat-rent' | 'shutter-rent' | 'house-rent' | 'land-rent' | 'office-rent' | 'house-buy' | 'land-buy' | 'hostel-available' | 'girls-hostel' | 'boys-hostel';
  category: 'rent' | 'buy' | 'hostel';
  bhk: string;
  furnishingType: 'fully' | 'semi' | 'unfurnished';
  amenities: string[];
  rules: {
    petsAllowed: boolean;
    couplesAllowed: boolean;
    familiesAllowed: boolean;
    bachelorsAllowed: boolean;
  };
  availableFrom: string;
}

export default function EditPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { getPropertyById, updateProperty } = useProperties();
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>(
    { latitude: 26.7288, longitude: 85.9244 }
  );
  const [form, setForm] = useState<PropertyForm>({
    title: '',
    description: '',
    price: '',
    deposit: '',
    address: '',
    city: '',
    state: 'Province 2',
    pincode: '',
    propertyType: 'room-rent',
    category: 'rent',
    bhk: '1BHK',
    furnishingType: 'semi',
    amenities: [],
    rules: {
      petsAllowed: false,
      couplesAllowed: true,
      familiesAllowed: true,
      bachelorsAllowed: true,
    },
    availableFrom: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'owner') {
      router.replace('/auth/login');
      return;
    }

    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Property ID not found');
      router.back();
      return;
    }

    const property = getPropertyById(id);
    if (!property) {
      Alert.alert('Error', 'Property not found');
      router.back();
      return;
    }

    if (property.ownerId !== user?.id) {
      Alert.alert('Error', 'You can only edit your own properties');
      router.back();
      return;
    }

    setForm({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      deposit: property.deposit.toString(),
      address: property.location.address,
      city: property.location.city,
      state: property.location.state,
      pincode: property.location.pincode,
      propertyType: property.propertyType,
      category: property.category,
      bhk: property.bhk,
      furnishingType: property.furnishingType,
      amenities: property.amenities,
      rules: property.rules,
      availableFrom: property.availableFrom,
    });
    setPropertyImages(property.images || []);
    setCoordinates(property.location.coordinates);
  }, [id, user, isAuthenticated, getPropertyById, router]);

  const handleInputChange = (field: keyof PropertyForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permission to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCoordinates(newCoords);

      const [address] = await Location.reverseGeocodeAsync(newCoords);
      if (address) {
        setForm(prev => ({
          ...prev,
          address: `${address.street || ''} ${address.streetNumber || ''}`.trim() || prev.address,
          city: address.city || prev.city,
          state: address.region || prev.state,
          pincode: address.postalCode || prev.pincode,
        }));
      }

      Alert.alert('Success', 'Location detected successfully!');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleViewOnMap = async () => {
    try {
      const mapUrl = Platform.select({
        ios: `maps:0,0?q=${coordinates.latitude},${coordinates.longitude}`,
        android: `geo:0,0?q=${coordinates.latitude},${coordinates.longitude}`,
        web: `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`,
        default: `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`,
      });
      
      if (Platform.OS === 'web') {
        await WebBrowser.openBrowserAsync(mapUrl);
      } else {
        const canOpen = await Linking.canOpenURL(mapUrl);
        if (canOpen) {
          await Linking.openURL(mapUrl);
        } else {
          const webMapUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
          await WebBrowser.openBrowserAsync(webMapUrl);
        }
      }
    } catch (error) {
      console.error('Error opening map:', error);
      Alert.alert('Error', 'Failed to open map.');
    }
  };

  const handleView360 = async () => {
    try {
      const streetViewUrl = `https://www.google.com/maps/@${coordinates.latitude},${coordinates.longitude},3a,75y,90t/data=!3m7!1e1!3m5!1s0x0:0x0!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com!7i16384!8i8192`;
      
      await WebBrowser.openBrowserAsync(streetViewUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: Colors.primary,
      });
    } catch (error) {
      console.error('Error opening 360° view:', error);
      Alert.alert('Error', 'Failed to open 360° view.');
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(amenId => amenId !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleRuleToggle = (rule: keyof PropertyForm['rules']) => {
    setForm(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [rule]: !prev.rules[rule]
      }
    }));
  };

  const validateForm = (): boolean => {
    if (propertyImages.length === 0) {
      Alert.alert('Error', 'Please upload at least one property image');
      return false;
    }
    if (!form.title.trim()) {
      Alert.alert('Error', 'Please enter property title');
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert('Error', 'Please enter property description');
      return false;
    }
    if (!form.price || isNaN(Number(form.price))) {
      Alert.alert('Error', 'Please enter valid rent amount');
      return false;
    }
    if (!form.deposit || isNaN(Number(form.deposit))) {
      Alert.alert('Error', 'Please enter valid deposit amount');
      return false;
    }
    if (!form.address.trim()) {
      Alert.alert('Error', 'Please enter property address');
      return false;
    }
    if (!form.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!form.state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return false;
    }
    if (!form.pincode.trim()) {
      Alert.alert('Error', 'Please enter pincode');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!id || typeof id !== 'string') return;

    setLoading(true);
    try {
      const success = await updateProperty(id, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        deposit: Number(form.deposit),
        location: {
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          coordinates: coordinates,
        },
        propertyType: form.propertyType,
        category: form.category,
        bhk: form.bhk,
        furnishingType: form.furnishingType,
        amenities: form.amenities,
        rules: form.rules,
        images: propertyImages,
        availableFrom: form.availableFrom,
      });

      if (success) {
        Alert.alert(
          'Success',
          'Property updated successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to update property. Please try again.');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Property',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.textDark,
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ImagePicker
            images={propertyImages}
            onImagesChange={setPropertyImages}
            maxImages={6}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Title *</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholder="e.g., Spacious 2BHK in Koramangala"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe your property..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  {form.category === 'buy' ? 'Sale Price (₹) *' : 
                   form.category === 'rent' ? 'Monthly Rent (₹) *' : 
                   'Monthly Fee (₹) *'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={form.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  placeholder={form.category === 'buy' ? '2500000' : '25000'}
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  {form.category === 'buy' ? 'Token Amount (₹) *' : 'Security Deposit (₹) *'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={form.deposit}
                  onChangeText={(value) => handleInputChange('deposit', value)}
                  placeholder={form.category === 'buy' ? '100000' : '50000'}
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <View style={styles.locationButtons}>
              <Button
                title="Get Current Location"
                onPress={getCurrentLocation}
                loading={locationLoading}
                icon={<Navigation size={20} color={Colors.white} />}
                style={styles.locationButton}
              />
            </View>

            <View style={styles.mapPreviewContainer}>
              <View style={styles.mapPreviewInfo}>
                <MapPin size={20} color={Colors.primary} />
                <View style={styles.coordinatesInfo}>
                  <Text style={styles.coordinatesLabel}>Selected Location:</Text>
                  <Text style={styles.coordinatesText}>
                    {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
              <View style={styles.mapActions}>
                <TouchableOpacity style={styles.mapActionButton} onPress={handleViewOnMap}>
                  <MapPin size={16} color={Colors.primary} />
                  <Text style={styles.mapActionText}>View Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapActionButton} onPress={handleView360}>
                  <Eye size={16} color={Colors.primary} />
                  <Text style={styles.mapActionText}>360° View</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Street address"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={form.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="Enter city name"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={form.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="Province 2"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode *</Text>
              <TextInput
                style={[styles.input, { width: '50%' }]}
                value={form.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
                placeholder="45600"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Category & Type</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Property Type</Text>
              <View style={styles.categoryGrid}>
                {propertyCategories.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.categoryCard,
                      form.propertyType === type.id && styles.categoryCardSelected
                    ]}
                    onPress={() => {
                      handleInputChange('propertyType', type.id);
                      handleInputChange('category', type.category);
                    }}
                  >
                    <Text style={styles.categoryIcon}>{type.icon}</Text>
                    <Text 
                      style={[
                        styles.categoryTitle,
                        form.propertyType === type.id && styles.categoryTitleSelected
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text 
                      style={[
                        styles.categoryDescription,
                        form.propertyType === type.id && styles.categoryDescriptionSelected
                      ]}
                    >
                      {type.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {(['room-rent', 'flat-rent', 'house-rent', 'house-buy'].includes(form.propertyType)) && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>BHK Type</Text>
                <View style={styles.optionsContainer}>
                  {bhkTypes.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.optionButton,
                        form.bhk === type.id && styles.optionButtonSelected
                      ]}
                      onPress={() => handleInputChange('bhk', type.id)}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          form.bhk === type.id && styles.optionTextSelected
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {(['room-rent', 'flat-rent', 'house-rent', 'house-buy', 'hostel-available'].includes(form.propertyType)) && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Furnishing</Text>
                <View style={styles.optionsContainer}>
                  {furnishingTypes.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.optionButton,
                        form.furnishingType === type.id && styles.optionButtonSelected
                      ]}
                      onPress={() => handleInputChange('furnishingType', type.id)}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          form.furnishingType === type.id && styles.optionTextSelected
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available From</Text>
              <TextInput
                style={[styles.input, { width: '50%' }]}
                value={form.availableFrom}
                onChangeText={(value) => handleInputChange('availableFrom', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>

          {(['room-rent', 'flat-rent', 'house-rent', 'house-buy', 'hostel-available'].includes(form.propertyType)) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.optionsContainer}>
                {amenities.map(amenity => (
                  <TouchableOpacity
                    key={amenity.id}
                    style={[
                      styles.optionButton,
                      form.amenities.includes(amenity.id) && styles.optionButtonSelected
                    ]}
                    onPress={() => handleAmenityToggle(amenity.id)}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        form.amenities.includes(amenity.id) && styles.optionTextSelected
                      ]}
                    >
                      {amenity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(form.category === 'rent' || form.category === 'hostel') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property Rules</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    form.rules.petsAllowed && styles.optionButtonSelected
                  ]}
                  onPress={() => handleRuleToggle('petsAllowed')}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      form.rules.petsAllowed && styles.optionTextSelected
                    ]}
                  >
                    Pets Allowed
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    form.rules.couplesAllowed && styles.optionButtonSelected
                  ]}
                  onPress={() => handleRuleToggle('couplesAllowed')}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      form.rules.couplesAllowed && styles.optionTextSelected
                    ]}
                  >
                    Couples Allowed
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    form.rules.familiesAllowed && styles.optionButtonSelected
                  ]}
                  onPress={() => handleRuleToggle('familiesAllowed')}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      form.rules.familiesAllowed && styles.optionTextSelected
                    ]}
                  >
                    Families Allowed
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    form.rules.bachelorsAllowed && styles.optionButtonSelected
                  ]}
                  onPress={() => handleRuleToggle('bachelorsAllowed')}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      form.rules.bachelorsAllowed && styles.optionTextSelected
                    ]}
                  >
                    Bachelors Allowed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Update Property"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  submitButton: {
    width: '100%',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    minHeight: 120,
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryTitleSelected: {
    color: Colors.primary,
  },
  categoryDescription: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryDescriptionSelected: {
    color: Colors.primary,
  },
  locationButtons: {
    marginBottom: 16,
  },
  locationButton: {
    width: '100%',
  },
  mapPreviewContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapPreviewInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  coordinatesInfo: {
    marginLeft: 12,
    flex: 1,
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 13,
    color: Colors.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mapActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    gap: 6,
  },
  mapActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
