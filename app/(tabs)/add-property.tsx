import React, { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { MapPin, Navigation, Eye } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useProperties } from '@/hooks/property-store';
import Colors from '@/constants/colors';
import { amenities, bhkTypes, furnishingTypes, propertyCategories } from '@/constants/amenities';
import Button from '@/components/Button';
import ImagePicker from '@/components/ImagePicker';
import { Property } from '@/types';

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



export default function AddPropertyScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { addProperty } = useProperties();
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>(
    { latitude: 26.7288, longitude: 85.9244 }
  );
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
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

  // Redirect if not authenticated or not an owner
  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'owner')) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, authLoading, user, router]);
  
  if (authLoading || !isAuthenticated || user?.userType !== 'owner') {
    return null;
  }

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
        ? prev.amenities.filter(id => id !== amenityId)
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
    if (!user) return;

    setLoading(true);
    try {
      const newProperty: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
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
        ownerId: user.id,
        ownerName: user.name,
        ownerPhone: user.phone,
        availableFrom: form.availableFrom,
      };

      const success = await addProperty(newProperty);
      if (success) {
        Alert.alert(
          'Success',
          'Property added successfully!',
          [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
        );
      } else {
        Alert.alert('Error', 'Failed to add property. Please try again.');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.userType !== 'owner') {
    return (
      <View style={styles.notAuthorizedContainer}>
        <Text style={styles.notAuthorizedText}>Only property owners can add listings</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Add Property',
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

          {/* Pricing */}
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

          {/* Location */}
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

          {/* Property Category & Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Category & Type</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Property Type</Text>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScrollView}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {propertyCategories.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.propertyTypeCard,
                      form.propertyType === type.id && styles.propertyTypeCardSelected
                    ]}
                    onPress={() => {
                      handleInputChange('propertyType', type.id);
                      handleInputChange('category', type.category);
                    }}
                  >
                    <View style={[
                      styles.propertyTypeIconContainer,
                      form.propertyType === type.id && styles.propertyTypeIconContainerSelected
                    ]}>
                      <Text style={styles.propertyTypeIcon}>{type.icon}</Text>
                    </View>
                    <View style={styles.propertyTypeInfo}>
                      <Text 
                        style={[
                          styles.propertyTypeTitle,
                          form.propertyType === type.id && styles.propertyTypeTitleSelected
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text 
                        style={[
                          styles.propertyTypeDescription,
                          form.propertyType === type.id && styles.propertyTypeDescriptionSelected
                        ]}
                      >
                        {type.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Show BHK only for relevant property types */}
            {(['room-rent', 'flat-rent', 'house-rent', 'office-rent', 'house-buy'].includes(form.propertyType)) && (
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
            
            {/* Show Furnishing only for relevant property types */}
            {(['room-rent', 'flat-rent', 'house-rent', 'office-rent', 'house-buy', 'hostel-available', 'girls-hostel', 'boys-hostel'].includes(form.propertyType)) && (
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

          {/* Amenities - Show only for relevant property types */}
          {(['room-rent', 'flat-rent', 'house-rent', 'office-rent', 'house-buy', 'hostel-available', 'girls-hostel', 'boys-hostel'].includes(form.propertyType)) && (
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

          {/* Rules - Show only for rental properties */}
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
          title="Add Property"
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
  notAuthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notAuthorizedText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
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
  categoryScrollView: {
    marginBottom: 12,
  },
  categoryScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  propertyTypeCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: 140,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTypeCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#E0F2FE',
    elevation: 4,
  },
  propertyTypeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyTypeIconContainerSelected: {
    backgroundColor: '#2563EB',
  },
  propertyTypeIcon: {
    fontSize: 32,
  },
  propertyTypeInfo: {
    alignItems: 'center',
  },
  propertyTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  propertyTypeTitleSelected: {
    color: '#2563EB',
  },
  propertyTypeDescription: {
    fontSize: 11,
    color: Colors.textLight,
    lineHeight: 16,
    textAlign: 'center',
  },
  propertyTypeDescriptionSelected: {
    color: '#1E40AF',
  },
});