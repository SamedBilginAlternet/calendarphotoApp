import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState, useContext, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ThemeContext } from '@/components/ThemeProvider';
import { Camera, FlipHorizontal, X, Check } from 'lucide-react-native';
import { PhotoService } from '@/utils/storage';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
} from 'react-native-reanimated';

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'DancingScript-Bold',
    color: 'white',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default function CameraScreen() {
  const { theme } = useContext(ThemeContext);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const captureScale = useSharedValue(1);

  const captureAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: captureScale.value }],
    };
  });

  const styles = createStyles(theme);

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={theme.colors.primary} />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
            We need access to your camera to capture beautiful moments
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    captureScale.value = withSequence(
      withSpring(0.8, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        const today = new Date().toISOString().split('T')[0];
        await PhotoService.savePhoto(today, photo.uri);
        
        Alert.alert(
          'Photo Saved! 💕',
          'Your beautiful moment has been captured',
          [
            {
              text: 'View Calendar',
              onPress: () => router.push('/(tabs)/'),
            },
            {
              text: 'Take Another',
              style: 'default',
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsCapturing(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Capture Today's Moment</Text>
        </View>

        <View style={styles.controls}>
          <Text style={styles.dateText}>{today}</Text>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => router.back()}
            >
              <X size={24} color="white" />
            </TouchableOpacity>

            <Animated.View style={captureAnimatedStyle}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <Check size={32} color="white" />
                ) : (
                  <Camera size={32} color="white" />
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraFacing}
            >
              <FlipHorizontal size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}