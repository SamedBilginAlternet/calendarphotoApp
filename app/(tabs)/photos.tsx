import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '@/components/ThemeProvider';
import { PhotoService, PhotoItem } from '@/utils/storage';
import { Heart, Calendar, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 2;

interface PhotoWithDate extends PhotoItem {
  date: string;
  formattedDate: string;
}

export default function PhotosScreen() {
  const { theme } = useContext(ThemeContext);
  const [photos, setPhotos] = useState<PhotoWithDate[]>([]);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    loadPhotos();
    
    // Animate heart every 4 seconds
    const interval = setInterval(() => {
      heartScale.value = withSpring(1.3, { duration: 400 }, () => {
        heartScale.value = withSpring(1, { duration: 400 });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const loadPhotos = async () => {
    const allPhotos = await PhotoService.getAllPhotos();
    const photoArray: PhotoWithDate[] = [];
    
    Object.entries(allPhotos).forEach(([date, dayPhotos]) => {
      dayPhotos.forEach(photo => {
        photoArray.push({
          ...photo,
          date,
          formattedDate: new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        });
      });
    });
    
    // Sort by timestamp (newest first)
    photoArray.sort((a, b) => b.timestamp - a.timestamp);
    setPhotos(photoArray);
  };

  const deletePhoto = async (date: string, photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await PhotoService.deletePhoto(date, photoId);
            loadPhotos();
          },
        },
      ]
    );
  };

  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
    };
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 30,
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'DancingScript-Bold',
      color: 'white',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginTop: 5,
    },
    heartContainer: {
      position: 'absolute',
      right: 20,
      top: 20,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 24,
      fontFamily: 'Poppins-Bold',
      color: theme.colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
    },
    emptyButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
    },
    emptyButtonText: {
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
      color: 'white',
    },
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    photoItem: {
      width: PHOTO_SIZE,
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 15,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    photoImage: {
      width: '100%',
      height: PHOTO_SIZE,
    },
    photoInfo: {
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    photoDetails: {
      flex: 1,
    },
    photoDate: {
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      color: theme.colors.text,
    },
    photoTime: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    deleteButton: {
      padding: 4,
    },
    countText: {
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
  });

  if (photos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
            <Heart size={28} color="white" fill="white" />
          </Animated.View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Fotoğraf Galerisi</Text>
          </View>
          <Text style={styles.headerSubtitle}>Değerli anılarımız</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Heart size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Henüz Fotoğraf Yok</Text>
          <Text style={styles.emptyText}>
            Güzel anılarınızı yakalamaya başlayın! Sevgi takviminizi oluşturmaya başlamak için ilk fotoğrafınızı çekin.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/camera')}
          >
            <Text style={styles.emptyButtonText}>İlk Fotoğrafı Çek</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
          <Heart size={28} color="white" fill="white" />
        </Animated.View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Fotoğraf Galerisi</Text>
        </View>
        <Text style={styles.headerSubtitle}>Değerli anılarımız</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>
          {photos.length} güzel anı{photos.length !== 1 ? 's' : ''} yakalandı
        </Text>
        
        <View style={styles.photosGrid}>
          {photos.map((photo) => (
            <View key={`${photo.date}-${photo.id}`} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <View style={styles.photoInfo}>
                <View style={styles.photoDetails}>
                  <Text style={styles.photoDate}>{photo.formattedDate}</Text>
                  <Text style={styles.photoTime}>
                    {new Date(photo.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deletePhoto(photo.date, photo.id)}
                >
                  <Trash2 size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}