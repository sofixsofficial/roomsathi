import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { supabase } from '@/lib/supabase';
import { Screenshot } from '@/types';

export const captureScreenshot = async (
  viewRef: any,
  userId: string,
  propertyId: string
): Promise<string | null> => {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.8,
    });

    const filename = `screenshot_${propertyId}_${Date.now()}.png`;
    const newPath = `${FileSystem.documentDirectory}${filename}`;

    if (Platform.OS !== 'web') {
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
    }

    const { error: insertError } = await supabase
      .from('screenshots')
      .insert({
        user_id: userId,
        property_id: propertyId,
        image_uri: Platform.OS === 'web' ? uri : newPath,
        watermark: 'Captured via RoomRent App',
      });

    if (insertError) {
      console.error('Failed to save screenshot record:', insertError);
      return Platform.OS === 'web' ? uri : newPath;
    }

    return Platform.OS === 'web' ? uri : newPath;
  } catch (err) {
    console.error('Failed to capture screenshot:', err);
    return null;
  }
};

export const getScreenshots = async (userId: string): Promise<Screenshot[]> => {
  try {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Failed to load screenshots:', error);
      return [];
    }

    return data.map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      propertyId: s.property_id,
      imageUri: s.image_uri,
      watermark: s.watermark,
      timestamp: s.timestamp,
      createdAt: s.created_at,
    }));
  } catch (err) {
    console.error('Failed to load screenshots:', err);
    return [];
  }
};

export const deleteScreenshot = async (screenshotId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('screenshots')
      .delete()
      .eq('id', screenshotId);

    if (error) {
      console.error('Failed to delete screenshot:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete screenshot:', err);
    return false;
  }
};

export const shareScreenshot = async (uri: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = uri;
      link.download = `roomrent_screenshot_${Date.now()}.png`;
      link.click();
    } else {
      const { default: Sharing } = await import('expo-sharing');
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      }
    }
  } catch (err) {
    console.error('Failed to share screenshot:', err);
  }
};
