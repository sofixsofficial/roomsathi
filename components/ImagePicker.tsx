import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePickerExpo from 'expo-image-picker';
import { Camera, Upload, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImagePicker({ images, onImagesChange, maxImages = 6 }: ImagePickerProps) {
  const [loading, setLoading] = useState(false);

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant gallery access to upload images.');
        return;
      }

      setLoading(true);
      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        const updatedImages = [...images, ...newImages].slice(0, maxImages);
        onImagesChange(updatedImages);
        
        if (images.length + newImages.length > maxImages) {
          Alert.alert('Maximum Limit', `You can only upload up to ${maxImages} images.`);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Not Supported', 'Camera is not supported on web. Please use gallery upload.');
        return;
      }

      const { status } = await ImagePickerExpo.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant camera access to take photos.');
        return;
      }

      setLoading(true);
      const result = await ImagePickerExpo.launchCameraAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (images.length >= maxImages) {
          Alert.alert('Maximum Limit', `You can only upload up to ${maxImages} images.`);
          return;
        }
        
        const updatedImages = [...images, result.assets[0].uri];
        onImagesChange(updatedImages);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Property Images *</Text>
        <Text style={styles.subtitle}>
          {images.length}/{maxImages} images
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imagesScrollView}
        contentContainerStyle={styles.imagesContainer}
      >
        {images.length === 0 ? (
          <View style={styles.emptyState}>
            <Upload size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No images uploaded yet</Text>
            <Text style={styles.emptySubtext}>Click buttons below to upload</Text>
          </View>
        ) : (
          images.map((uri, index) => (
            <View key={index} style={styles.imageCard}>
              <Image source={{ uri }} style={styles.image} contentFit="cover" />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={16} color={Colors.white} />
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>Primary</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, !canAddMore && styles.actionButtonDisabled]}
          onPress={pickImageFromGallery}
          disabled={!canAddMore || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Upload size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Gallery</Text>
            </>
          )}
        </TouchableOpacity>

        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={[styles.actionButton, !canAddMore && styles.actionButtonDisabled]}
            onPress={takePhoto}
            disabled={!canAddMore || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Camera size={20} color={Colors.white} />
                <Text style={styles.actionButtonText}>Camera</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.helpText}>
        First image will be the primary photo. Drag to reorder.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    minWidth: '100%',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  imagesScrollView: {
    marginBottom: 16,
  },
  imagesContainer: {
    paddingRight: 16,
  },
  imageCard: {
    position: 'relative',
    width: 160,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
