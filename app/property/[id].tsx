import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  Linking,
  Share,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Phone, 
  Share2, 
  Bed, 
  Home,
  Navigation,
  Eye,
  Video
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useProperties } from '@/hooks/property-store';
import { useAuth } from '@/hooks/auth-store';
import { useMessages } from '@/hooks/message-store';
import Colors from '@/constants/colors';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import AmenitiesList from '@/components/AmenitiesList';
import PropertyRules from '@/components/PropertyRules';
import Button from '@/components/Button';
import { captureScreenshot } from '@/utils/screenshot-capture';
import NativeMapView from '@/components/NativeMapView';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPropertyById, toggleFavorite, isFavorite } = useProperties();
  const { isAuthenticated, user } = useAuth();
  const { createConversation, sendMessage } = useMessages();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const contentViewRef = useRef<any>(null);
  const favorite = property ? isFavorite(property.id) : false;
  const lastScreenshotTime = useRef<number>(0);

  const handleAutoScreenshot = useCallback(async () => {
    if (!isAuthenticated || !user || !property) return;
    
    const now = Date.now();
    if (now - lastScreenshotTime.current < 3000) {
      return;
    }
    
    lastScreenshotTime.current = now;
    
    try {
      const screenshotUri = await captureScreenshot(
        contentViewRef.current,
        user.id,
        property.id
      );

      if (screenshotUri) {
        console.log('Screenshot automatically captured and saved');
      }
    } catch (error) {
      console.error('Auto screenshot capture failed:', error);
    }
  }, [isAuthenticated, user, property]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        handleAutoScreenshot();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [handleAutoScreenshot]);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      
      setLoading(true);
      let prop = getPropertyById(id);
      
      if (!prop) {
        try {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();
          
          if (data && !error) {
            prop = {
              id: data.id,
              title: data.title,
              description: data.description,
              price: data.price,
              deposit: data.deposit,
              location: {
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                coordinates: {
                  latitude: data.latitude,
                  longitude: data.longitude,
                },
              },
              propertyType: data.property_type,
              category: data.category,
              bhk: data.bhk,
              furnishingType: data.furnishing_type,
              amenities: data.amenities,
              rules: {
                petsAllowed: data.pets_allowed,
                couplesAllowed: data.couples_allowed,
                familiesAllowed: data.families_allowed,
                bachelorsAllowed: data.bachelors_allowed,
              },
              images: data.images,
              ownerId: data.owner_id,
              ownerName: data.owner_name,
              ownerPhone: data.owner_phone,
              availableFrom: data.available_from,
              virtualTourUrl: data.virtual_tour_url,
              status: data.status,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
          }
        } catch (err) {
          console.error('Failed to load property:', err);
        }
      }
      
      setProperty(prop);
      setLoading(false);
    };
    
    loadProperty();
  }, [id, getPropertyById]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading property...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Property not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline"
          style={styles.goBackButton}
        />
      </View>
    );
  }

  const handleFavoritePress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to save properties to favorites',
        [
          { text: 'Cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }
    
    toggleFavorite(property.id);
  };

  const handleContactPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to contact property owners',
        [
          { text: 'Cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }
    
    setLoading(true);
    
    try {
      const conversationId = createConversation(
        property.ownerId,
        property.id,
        property.title
      );
      
      if (conversationId) {
        // Send an initial greeting message
        const greetingMessage = `Hi ${property.ownerName}, I'm interested in your property "${property.title}". Could you please provide more details? Thank you!`;
        
        setTimeout(() => {
          sendMessage(conversationId, greetingMessage);
          router.push(`/messages/${conversationId}`);
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallPress = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to call property owners',
        [
          { text: 'Cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }
    
    Alert.alert(
      'Call Owner',
      `Do you want to call ${property.ownerName}?\n${property.ownerPhone}`,
      [
        { text: 'Cancel' },
        {
          text: 'Call Now',
          onPress: async () => {
            try {
              if (Platform.OS === 'web') {
                // For web, show phone number and copy to clipboard
                if (navigator.clipboard) {
                  await navigator.clipboard.writeText(property.ownerPhone);
                  Alert.alert('Phone Number Copied', `${property.ownerPhone} has been copied to clipboard`);
                } else {
                  Alert.alert('Phone Number', `Please call: ${property.ownerPhone}`);
                }
              } else {
                // For mobile, open phone dialer
                const phoneUrl = `tel:${property.ownerPhone}`;
                const canOpen = await Linking.canOpenURL(phoneUrl);
                
                if (canOpen) {
                  await Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Error', 'Unable to make phone calls on this device');
                }
              }
            } catch (error) {
              console.error('Error making phone call:', error);
              Alert.alert('Error', 'Failed to initiate call. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleScheduleVisit = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to schedule property visits',
        [
          { text: 'Cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    Alert.alert(
      'Schedule Property Visit',
      `Schedule a visit to see "${property.title}" in person. Choose your preferred time slot:`,
      [
        { text: 'Cancel' },
        { 
          text: `Today ${today.toLocaleDateString()} 2-4 PM`, 
          onPress: () => scheduleVisitForTime('today', '2-4 PM', today)
        },
        { 
          text: `Tomorrow ${tomorrow.toLocaleDateString()} 10-12 AM`, 
          onPress: () => scheduleVisitForTime('tomorrow', '10-12 AM', tomorrow)
        },
        { 
          text: `${dayAfterTomorrow.toLocaleDateString()} 3-5 PM`, 
          onPress: () => scheduleVisitForTime(dayAfterTomorrow.toLocaleDateString(), '3-5 PM', dayAfterTomorrow)
        },
      ]
    );
  };
  
  const scheduleVisitForTime = (day: string, time: string, date: Date) => {
    try {
      // Create conversation with visit request
      const conversationId = createConversation(
        property.ownerId,
        property.id,
        property.title
      );
      
      if (conversationId) {
        // Send an automated message about the visit request
        const visitMessage = `Hi ${property.ownerName}, I would like to schedule a visit to see "${property.title}" on ${day} between ${time}. Please confirm if this time works for you. Thank you!`;
        
        setTimeout(() => {
          sendMessage(conversationId, visitMessage);
        }, 100);
        
        Alert.alert(
          'Visit Request Sent! 📅', 
          `Your visit request for ${day} ${time} has been sent to ${property.ownerName}. They will respond to confirm the appointment.`,
          [
            { text: 'OK' },
            { 
              text: 'View Messages', 
              onPress: () => router.push(`/messages/${conversationId}`) 
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to schedule visit. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling visit:', error);
      Alert.alert('Error', 'Failed to schedule visit. Please try again.');
    }
  };

  const handleSharePress = async () => {
    try {
      const shareContent = {
        message: `Check out this amazing property: ${property.title}\n\n` +
                `📍 ${property.location.address}, ${property.location.city}\n` +
                `💰 ₹${property.price.toLocaleString()}/month\n` +
                `🏠 ${property.bhk} | ${property.furnishingType}\n\n` +
                `Contact: ${property.ownerName} - ${property.ownerPhone}`,
        title: property.title,
      };
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share(shareContent);
        } else {
          await navigator.clipboard.writeText(shareContent.message);
          Alert.alert('Copied!', 'Property details copied to clipboard');
        }
      } else {
        await Share.share(shareContent);
      }
    } catch (error) {
      console.error('Error sharing property:', error);
      Alert.alert('Error', 'Failed to share property. Please try again.');
    }
  };

  const handleWhatsAppPress = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to contact property owners via WhatsApp',
        [
          { text: 'Cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }
    
    try {
      const phoneNumber = property.ownerPhone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        `Hi ${property.ownerName}, I'm interested in your property "${property.title}" listed on RoomRent. Could you please provide more details?`
      );
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp Not Available',
          'Please make sure WhatsApp is installed on your device.'
        );
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'Failed to open WhatsApp. Please try again.');
    }
  };

  const handleViewOnMap = async () => {
    try {
      const { latitude, longitude } = property.location.coordinates;
      const label = encodeURIComponent(property.title);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;
      
      await WebBrowser.openBrowserAsync(mapUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: Colors.primary,
      });
    } catch (error) {
      console.error('Error opening map:', error);
      Alert.alert('Error', 'Failed to open map. Please try again.');
    }
  };

  const handleView360 = async () => {
    try {
      const { latitude, longitude } = property.location.coordinates;
      const streetViewUrl = `https://www.google.com/maps/@${latitude},${longitude},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s0:0!7i16384!8i8192`;
      
      await WebBrowser.openBrowserAsync(streetViewUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: Colors.primary,
      });
    } catch (error) {
      console.error('Error opening 360° view:', error);
      Alert.alert('Error', 'Failed to open 360° view. Please try again.');
    }
  };

  const handleVirtualTour = async () => {
    try {
      if (!property.virtualTourUrl) {
        Alert.alert(
          'Virtual Tour Not Available',
          'This property does not have a virtual tour available at the moment.'
        );
        return;
      }
      
      await WebBrowser.openBrowserAsync(property.virtualTourUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: Colors.primary,
      });
    } catch (error) {
      console.error('Error opening virtual tour:', error);
      Alert.alert('Error', 'Failed to open virtual tour. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View ref={contentViewRef} collapsable={false}>
          <PropertyImageGallery images={property.images} />
        
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.locationText}>
                {property.location.address}, {property.location.city}
              </Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>NPR रु {property.price.toLocaleString()}</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>
            
            <View style={styles.depositContainer}>
              <Text style={styles.depositLabel}>Security Deposit: </Text>
              <Text style={styles.depositAmount}>NPR रु {property.deposit.toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Bed size={20} color={Colors.textDark} />
              <Text style={styles.detailText}>{property.bhk}</Text>
            </View>
            <View style={styles.detailItem}>
              <Home size={20} color={Colors.textDark} />
              <Text style={styles.detailText}>{property.furnishingType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={20} color={Colors.textDark} />
              <Text style={styles.detailText}>
                Available from {new Date(property.availableFrom).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
          
          <AmenitiesList amenities={property.amenities} />
          
          <PropertyRules rules={property.rules} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Views</Text>
            <View style={styles.viewOptionsContainer}>
              <Button
                title="View on Map"
                onPress={handleViewOnMap}
                variant="outline"
                icon={<Navigation size={18} color={Colors.primary} />}
                style={styles.viewButton}
              />
              
              <Button
                title="360° View"
                onPress={handleView360}
                variant="outline"
                icon={<Eye size={18} color={Colors.primary} />}
                style={styles.viewButton}
              />
              
              {property.virtualTourUrl && (
                <Button
                  title="Virtual Tour"
                  onPress={handleVirtualTour}
                  variant="outline"
                  icon={<Video size={18} color={Colors.primary} />}
                  style={styles.viewButton}
                />
              )}
            </View>
            
            {Platform.OS !== 'web' && (
              <NativeMapView property={property} />
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Owner</Text>
            <View style={styles.ownerContainer}>
              <View style={styles.ownerInfo}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerAvatarText}>
                    {property.ownerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>{property.ownerName}</Text>
                  <Text style={styles.ownerPhone}>☎ {property.ownerPhone || '+9779829911255'}</Text>
                  <Text style={styles.ownerEmail}>✉ mail.roomrent@gmail.com</Text>
                </View>
              </View>
              <Text style={styles.ownerLocation}>📍 Serving Entire Nepal</Text>
              
              <View style={styles.ownerContactActions}>
                <TouchableOpacity
                  style={styles.ownerActionButton}
                  onPress={handleCallPress}
                  activeOpacity={0.7}
                >
                  <Phone size={18} color="#2563EB" />
                  <Text style={styles.ownerActionText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.ownerActionButton}
                  onPress={handleWhatsAppPress}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={18} color="#25D366" />
                  <Text style={[styles.ownerActionText, { color: '#25D366' }]}>WhatsApp</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.ownerActionButton}
                  onPress={handleScheduleVisit}
                  activeOpacity={0.7}
                >
                  <Calendar size={18} color="#7C3AED" />
                  <Text style={[styles.ownerActionText, { color: '#7C3AED' }]}>Visit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.ownerActionButton, styles.ownerActionButtonPrimary]}
                  onPress={handleContactPress}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={18} color={Colors.white} />
                  <Text style={[styles.ownerActionText, { color: Colors.white }]}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <Heart 
            size={24} 
            color={favorite ? Colors.error : Colors.textDark} 
            fill={favorite ? Colors.error : 'transparent'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleSharePress}
          activeOpacity={0.7}
        >
          <Share2 size={24} color={Colors.textDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 4,
  },
  depositContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  depositLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  depositAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: Colors.textDark,
    marginLeft: 8,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textDark,
    lineHeight: 24,
  },
  ownerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  ownerPhone: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 2,
    fontWeight: '500',
  },
  ownerEmail: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  ownerLocation: {
    fontSize: 14,
    color: Colors.textLight,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    gap: 20,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  goBackButton: {
    width: 200,
  },
  viewOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    minWidth: 110,
  },
  ownerContactActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownerActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  ownerActionButtonPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  ownerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 6,
    textAlign: 'center',
  },

});