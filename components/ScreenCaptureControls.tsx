import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Camera, Video, Image as ImageIcon, X, Download } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/auth-store';
import Colors from '@/constants/colors';

interface ScreenCaptureControlsProps {
  viewRef: React.RefObject<View | null>;
  propertyId: string;
  propertyTitle: string;
}

export default function ScreenCaptureControls({
  viewRef,
  propertyId,
  propertyTitle,
}: ScreenCaptureControlsProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [showCaptured, setShowCaptured] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [captureType, setCaptureType] = useState<'screenshot' | 'video' | null>(null);
  const recordingFrames = useRef<string[]>([]);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleScreenshot = async () => {
    if (!user || !viewRef.current) {
      Alert.alert('Error', 'Unable to capture screenshot');
      return;
    }

    try {
      const uri = await captureRef(viewRef.current, {
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
          user_id: user.id,
          property_id: propertyId,
          image_uri: Platform.OS === 'web' ? uri : newPath,
          watermark: `Property: ${propertyTitle} | Captured via RoomRent Nepal`,
        });

      if (insertError) {
        console.error('Failed to save screenshot record:', insertError);
      }

      const { error: historyError } = await supabase
        .from('finder_history')
        .insert({
          finder_id: user.id,
          property_id: propertyId,
          action: 'screenshot',
          timestamp: new Date().toISOString(),
        });

      if (historyError) {
        console.error('Failed to log history:', historyError);
      }

      setCapturedUri(Platform.OS === 'web' ? uri : newPath);
      setCaptureType('screenshot');
      setShowCaptured(true);

      Alert.alert('Success', 'Screenshot captured successfully!');
    } catch (error) {
      console.error('Screenshot capture error:', error);
      Alert.alert('Error', 'Failed to capture screenshot');
    }
  };

  const startRecording = async () => {
    if (!user || !viewRef.current) {
      Alert.alert('Error', 'Unable to start recording');
      return;
    }

    Alert.alert(
      'Start Screen Recording',
      'This will capture the property details as a series of screenshots. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            setIsRecording(true);
            recordingFrames.current = [];

            recordingInterval.current = setInterval(async () => {
              try {
                if (viewRef.current) {
                  const uri = await captureRef(viewRef.current, {
                    format: 'jpg',
                    quality: 0.6,
                  });
                  recordingFrames.current.push(uri);
                }
              } catch (error) {
                console.error('Error capturing frame:', error);
              }
            }, 500);

            setTimeout(() => {
              if (isRecording) {
                stopRecording();
              }
            }, 30000);
          },
        },
      ]
    );
  };

  const stopRecording = async () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }

    setIsRecording(false);

    if (recordingFrames.current.length === 0) {
      Alert.alert('Error', 'No frames captured');
      return;
    }

    try {
      const firstFrameUri = recordingFrames.current[0];
      const filename = `recording_${propertyId}_${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${filename}`;

      if (Platform.OS !== 'web') {
        await FileSystem.copyAsync({
          from: firstFrameUri,
          to: newPath,
        });
      }

      const { error: insertError } = await supabase.from('screenshots').insert({
        user_id: user!.id,
        property_id: propertyId,
        image_uri: Platform.OS === 'web' ? firstFrameUri : newPath,
        watermark: `Screen Recording: ${propertyTitle} | ${recordingFrames.current.length} frames | RoomRent Nepal`,
      });

      if (insertError) {
        console.error('Failed to save recording:', insertError);
      }

      const { error: historyError } = await supabase
        .from('finder_history')
        .insert({
          finder_id: user!.id,
          property_id: propertyId,
          action: 'video_recording',
          timestamp: new Date().toISOString(),
        });

      if (historyError) {
        console.error('Failed to log history:', historyError);
      }

      setCapturedUri(Platform.OS === 'web' ? firstFrameUri : newPath);
      setCaptureType('video');
      setShowCaptured(true);

      Alert.alert(
        'Recording Complete',
        `Captured ${recordingFrames.current.length} frames. First frame saved.`
      );

      recordingFrames.current = [];
    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  const handleShare = async () => {
    if (!capturedUri) return;

    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = capturedUri;
        link.download = `roomrent_${captureType}_${Date.now()}.${captureType === 'screenshot' ? 'png' : 'jpg'}`;
        link.click();
        Alert.alert('Success', 'File downloaded!');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(capturedUri);
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  };

  if (user?.userType !== 'renter') {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.screenshotButton]}
          onPress={handleScreenshot}
          activeOpacity={0.7}
        >
          <Camera size={20} color={Colors.white} />
          <Text style={styles.buttonText}>Screenshot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isRecording ? styles.stopButton : styles.recordButton,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.7}
        >
          <Video size={20} color={Colors.white} />
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop Recording' : 'Record'}
          </Text>
        </TouchableOpacity>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
      </View>

      <Modal
        visible={showCaptured}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCaptured(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {captureType === 'screenshot' ? 'Screenshot' : 'Recording'} Captured
              </Text>
              <TouchableOpacity
                onPress={() => setShowCaptured(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {captureType === 'screenshot' ? (
                <ImageIcon size={64} color={Colors.primary} />
              ) : (
                <Video size={64} color={Colors.primary} />
              )}
              <Text style={styles.modalMessage}>
                Your {captureType} has been saved successfully!
              </Text>
              <Text style={styles.modalSubtext}>
                Property: {propertyTitle}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButton]}
                onPress={handleShare}
              >
                <Download size={18} color={Colors.white} />
                <Text style={styles.modalButtonText}>Share/Download</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.doneButton]}
                onPress={() => setShowCaptured(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  screenshotButton: {
    backgroundColor: '#2563EB',
  },
  recordButton: {
    backgroundColor: '#DC2626',
  },
  stopButton: {
    backgroundColor: '#16A34A',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  recordingIndicator: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DC2626',
    borderRadius: 20,
    alignSelf: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  shareButton: {
    backgroundColor: '#2563EB',
  },
  doneButton: {
    backgroundColor: Colors.textLight,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});
