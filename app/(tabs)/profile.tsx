import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useProperties } from '@/hooks/property-store';
import { useSession } from '@/hooks/session-store';
import Colors, { getThemeColors } from '@/constants/colors';
import Button from '@/components/Button';
import { 
  LogOut, 
  Settings, 
  Heart, 
  MessageCircle, 
  HelpCircle, 
  Shield, 
  ChevronRight,
  User,
  Home,
  BarChart3,
  Camera,
  Plus,
  Eye,
  TrendingUp
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { endSession } = useSession();
  const themeColors = getThemeColors(user?.userType);
  const { properties } = useProperties();
  const insets = useSafeAreaInsets();
  const [userTypeModalVisible, setUserTypeModalVisible] = useState<boolean>(false);
  const [navigationReady, setNavigationReady] = useState<boolean>(false);
  const [switchingUserType, setSwitchingUserType] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const myProperties = properties.filter(p => p.ownerId === user?.id);
  const activeProperties = myProperties.filter(p => p.status === 'active');
  const totalViews = myProperties.reduce((acc) => acc + Math.floor(Math.random() * 100), 0);
  const totalInquiries = myProperties.reduce((acc) => acc + Math.floor(Math.random() * 20), 0);

  useFocusEffect(
    React.useCallback(() => {
      setNavigationReady(true);
    }, [])
  );

  useEffect(() => {
    if (navigationReady && !authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, authLoading, router, navigationReady]);

  if (authLoading) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await endSession();
            await logout();
            router.replace('/auth/login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleImagePick = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const imageUri = result.assets[0].uri;
        
        if (!user) return;

        const { error } = await supabase
          .from('users')
          .update({ avatar: imageUri })
          .eq('id', user.id);

        if (error) {
          Alert.alert('Error', 'Failed to update profile picture. Please try again.');
          console.error('Update avatar error:', error);
          return;
        }

        Alert.alert('Success', 'Profile picture updated successfully!');
        if (Platform.OS === 'web') {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Image pick error:', err);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSwitchUserType = async (newType: 'renter' | 'owner') => {
    if (!user || user.userType === newType) {
      setUserTypeModalVisible(false);
      return;
    }

    try {
      setSwitchingUserType(true);

      const { error } = await supabase
        .from('users')
        .update({ user_type: newType })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', 'Failed to switch user type. Please try again.');
        console.error('Switch user type error:', error);
        return;
      }

      Alert.alert(
        'Success',
        `Successfully switched to ${newType === 'owner' ? 'Property Provider' : 'Property Finder'} account!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setUserTypeModalVisible(false);
              if (Platform.OS === 'web') {
                window.location.reload();
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error('Switch user type error:', err);
      Alert.alert('Error', 'Failed to switch user type. Please try again.');
    } finally {
      setSwitchingUserType(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={handleImagePick} disabled={uploadingImage} style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar || 'https://via.placeholder.com/120' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <LinearGradient
              colors={[
                themeColors.primary,
                themeColors.primaryDark,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cameraIconContainer}
            >
              <Camera size={18} color={Colors.white} />
            </LinearGradient>
          </View>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.phone}>📞 +9779829911255</Text>
          <Text style={styles.location}>📍 Serving Entire Nepal</Text>
        </View>
        
        <LinearGradient
          colors={[
            themeColors.primary,
            themeColors.primaryLight,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userTypeBadge}
        >
          <Text style={styles.userTypeText}>
            {user.userType === 'owner' ? '🏠 Property Provider' : '🔍 Property Finder'}
          </Text>
        </LinearGradient>
      </View>

      {user.userType === 'owner' && (
        <View style={styles.dashboardSection}>
          <View style={styles.dashboardHeader}>
            <Text style={styles.dashboardTitle}>Property Provider Dashboard</Text>
            <TouchableOpacity onPress={() => router.push('/profile/my-properties')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Home size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{myProperties.length}</Text>
              <Text style={styles.statLabel}>Total Properties</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <BarChart3 size={24} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{activeProperties.length}</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Eye size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{totalViews}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{totalInquiries}</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.addPropertyButton}
            onPress={() => router.push('/(tabs)/add-property')}
          >
            <LinearGradient
              colors={[
                themeColors.primary,
                themeColors.primaryDark,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addPropertyGradient}
            >
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addPropertyText}>List New Property</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/account-settings')}
        >
          <Settings size={20} color={Colors.textDark} />
          <Text style={styles.menuText}>Account Settings</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/favorites')}
        >
          <Heart size={20} color={Colors.textDark} />
          <Text style={styles.menuText}>Saved Properties</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        {user.userType !== 'owner' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <MessageCircle size={20} color={Colors.textDark} />
            <Text style={styles.menuText}>Messages</Text>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        
        {user.userType === 'owner' && (
          <>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/my-properties')}
            >
              <BarChart3 size={20} color={Colors.textDark} />
              <Text style={styles.menuText}>My Properties</Text>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/messages')}
            >
              <MessageCircle size={20} color={Colors.textDark} />
              <Text style={styles.menuText}>Messages</Text>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/help-center')}
        >
          <HelpCircle size={20} color={Colors.textDark} />
          <Text style={styles.menuText}>Help Center</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/privacy-policy')}
        >
          <Shield size={20} color={Colors.textDark} />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Contact Us</Text>
        <Text style={styles.contactText}>📧 mail.roomrent@gmail.com</Text>
        <Text style={styles.contactText}>📞 +9779829911255</Text>
        <Text style={styles.contactText}>📍 Serving Entire Nepal</Text>
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        icon={<LogOut size={20} color={Colors.primary} />}
        style={styles.logoutButton}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={userTypeModalVisible}
        onRequestClose={() => setUserTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Switch User Type</Text>
            <Text style={styles.modalSubtitle}>
              Choose how you want to use the app
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.userTypeOption,
                user.userType === 'renter' && styles.userTypeOptionSelected
              ]}
              onPress={() => handleSwitchUserType('renter')}
              disabled={switchingUserType}
            >
              <User size={24} color={user.userType === 'renter' ? Colors.primary : Colors.textDark} />
              <View style={styles.userTypeOptionContent}>
                <Text style={[
                  styles.userTypeOptionTitle,
                  user.userType === 'renter' && styles.userTypeOptionTitleSelected
                ]}>Property Finder</Text>
                <Text style={styles.userTypeOptionDescription}>
                  Search and rent properties
                </Text>
              </View>
              {user.userType === 'renter' && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.userTypeOption,
                user.userType === 'owner' && styles.userTypeOptionSelected
              ]}
              onPress={() => handleSwitchUserType('owner')}
              disabled={switchingUserType}
            >
              <Home size={24} color={user.userType === 'owner' ? Colors.primary : Colors.textDark} />
              <View style={styles.userTypeOptionContent}>
                <Text style={[
                  styles.userTypeOptionTitle,
                  user.userType === 'owner' && styles.userTypeOptionTitleSelected
                ]}>Property Provider</Text>
                <Text style={styles.userTypeOptionDescription}>
                  List and manage your properties
                </Text>
              </View>
              {user.userType === 'owner' && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <Button
              title="Cancel"
              onPress={() => setUserTypeModalVisible(false)}
              variant="outline"
              style={styles.modalCancelButton}
              disabled={switchingUserType}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#f0f0f0',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  phone: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  userTypeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userTypeText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '700',
  },
  dashboardSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.provider.primaryAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textLight,
  },
  addPropertyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addPropertyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addPropertyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    fontSize: 16,
    color: Colors.textDark,
    marginLeft: 12,
    flex: 1,
  },
  contactSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  userTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  userTypeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  userTypeOptionContent: {
    marginLeft: 12,
    flex: 1,
  },
  userTypeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  userTypeOptionTitleSelected: {
    color: Colors.primary,
  },
  userTypeOptionDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  currentBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  modalCancelButton: {
    marginTop: 16,
  },
});
