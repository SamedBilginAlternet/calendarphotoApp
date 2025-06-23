import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Modal, ScrollView, Alert } from 'react-native';
import { useContext, useState } from 'react';
import { ThemeContext } from '@/components/ThemeProvider';
import { Camera, Heart, X, Plus, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PhotoService, PhotoItem } from '@/utils/storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { TextInput } from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 80) / 7;

interface CalendarGridProps {
  currentDate: Date;
  photos: {[key: string]: PhotoItem[]};
  onPhotoUpdate: () => void;
}

const emojiList = ['😍', '🥰', '😂', '😎', '😭', '❤️', '🎉', '🌟', '👍', '💖'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  photos, 
  onPhotoUpdate 
}) => {
  const { theme } = useContext(ThemeContext);
  const [selectedDate, setSelectedDate] = useState<{date: string, photos: PhotoItem[], displayDate: string} | null>(null);

  // Slide modal state
  const [photoModal, setPhotoModal] = useState<{visible: boolean, photos: PhotoItem[], index: number}>({visible: false, photos: [], index: 0});
  const [note, setNote] = useState('');
  const [emoji, setEmoji] = useState('');
  const [editingNote, setEditingNote] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const cellDate = new Date(year, month, day);
    
    return cellDate < today;
  };

  const handleDatePress = (day: number) => {
    const dateKey = formatDateKey(day);
    const dayPhotos = photos[dateKey] || [];
    
    if (isToday(day)) {
      router.push('/(tabs)/camera');
    } else {
      // Show photos modal for any day (past or future)
      setSelectedDate({
        date: dateKey,
        photos: dayPhotos,
        displayDate: formatDisplayDate(day)
      });
    }
  };

  const pickImageFromGallery = async () => {
    if (!selectedDate) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await PhotoService.savePhoto(selectedDate.date, result.assets[0].uri);
        onPhotoUpdate();
        
        // Update the modal with new photos
        const updatedPhotos = await PhotoService.getPhotosForDate(selectedDate.date);
        setSelectedDate({
          ...selectedDate,
          photos: updatedPhotos
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!selectedDate) return;

    try {
      await PhotoService.deletePhoto(selectedDate.date, photoId);
      onPhotoUpdate();
      
      // Update the modal with remaining photos
      const updatedPhotos = await PhotoService.getPhotosForDate(selectedDate.date);
      setSelectedDate({
        ...selectedDate,
        photos: updatedPhotos
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  // Fotoğrafa tıklayınca slide modalı aç
  const openPhotoModal = (photos: PhotoItem[], index: number) => {
    setPhotoModal({ visible: true, photos, index });
    setNote(photos[index]?.note || '');
    setEmoji(photos[index]?.emoji || '');
    setEditingNote(false);
  };

  // Not ve emoji kaydet
  const saveNoteAndEmoji = async () => {
    if (!selectedDate) return;
    const photo = photoModal.photos[photoModal.index];
    await PhotoService.updatePhotoNoteAndEmoji(selectedDate.date, photo.id, note, emoji);
    // Güncel fotoğrafları al
    const updatedPhotos = await PhotoService.getPhotosForDate(selectedDate.date);
    // Şu anki fotoğrafın yeni index'ini bul
    const newIndex = updatedPhotos.findIndex(p => p.id === photo.id);
    setPhotoModal(pm => ({
      ...pm,
      photos: updatedPhotos,
      index: newIndex !== -1 ? newIndex : 0,
    }));
    setSelectedDate({
      ...selectedDate,
      photos: updatedPhotos
    });
    setEditingNote(false);
  };

  // Slide modalı kapatınca gün modalı açık kalır
  const closePhotoModal = () => setPhotoModal({ ...photoModal, visible: false });

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      elevation: 3,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    weekDaysContainer: {
      flexDirection: 'row',
      marginBottom: 15,
    },
    weekDayText: {
      width: CELL_SIZE,
      fontSize: 14,
      fontFamily: 'Poppins-SemiBold',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      borderRadius: 12,
    },
    dayText: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: theme.colors.text,
    },
    todayCell: {
      backgroundColor: theme.colors.primary,
    },
    todayText: {
      color: 'white',
      fontFamily: 'Poppins-Bold',
    },
    pastCell: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    pastText: {
      color: theme.colors.textSecondary,
    },
    photoCell: {
      backgroundColor: theme.colors.accent,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    photoImage: {
      width: CELL_SIZE - 8,
      height: CELL_SIZE - 8,
      borderRadius: 8,
    },
    emptyCell: {
      backgroundColor: 'transparent',
    },
    heartIcon: {
      position: 'absolute',
      bottom: 2,
      right: 2,
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 2,
      right: 2,
    },
    photoCount: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoCountText: {
      fontSize: 10,
      fontFamily: 'Poppins-Bold',
      color: 'white',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: width - 40,
      maxHeight: '80%',
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalHeader: {
      padding: 20,
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Poppins-Bold',
      color: 'white',
      flex: 1,
    },
    closeButton: {
      padding: 5,
    },
    modalBody: {
      padding: 20,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 15,
      marginBottom: 20,
    },
    addPhotoButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
    },
    addPhotoButtonText: {
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
      color: 'white',
      marginLeft: 8,
    },
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    photoItem: {
      width: (width - 100) / 2,
      marginBottom: 15,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
    },
    modalPhotoImage: {
      width: '100%',
      height: (width - 100) / 2,
    },
    photoActions: {
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    photoTime: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      color: theme.colors.textSecondary,
    },
    deletePhotoButton: {
      padding: 5,
    },
    modalFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: 'center',
    },
    modalDate: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 15,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>
        
        <View style={styles.daysContainer}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={index} style={[styles.dayCell, styles.emptyCell]} />;
            }
            
            const dateKey = formatDateKey(day);
            const dayPhotos = photos[dateKey] || [];
            const hasPhotos = dayPhotos.length > 0;
            const latestPhoto = hasPhotos ? dayPhotos.sort((a, b) => b.timestamp - a.timestamp)[0] : null;
            const isTodayDate = isToday(day);
            const isPast = isPastDate(day);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isTodayDate && styles.todayCell,
                  isPast && !hasPhotos && styles.pastCell,
                  hasPhotos && styles.photoCell,
                ]}
                onPress={() => handleDatePress(day)}
              >
                {hasPhotos && latestPhoto ? (
                  <>
                    <Image source={{ uri: latestPhoto.uri }} style={styles.photoImage} />
                    {dayPhotos.length > 1 && (
                      <View style={styles.photoCount}>
                        <Text style={styles.photoCountText}>{dayPhotos.length}</Text>
                      </View>
                    )}
                    <View style={styles.heartIcon}>
                      <Heart size={12} color={theme.colors.primary} fill={theme.colors.primary} />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[
                      styles.dayText,
                      isTodayDate && styles.todayText,
                      isPast && styles.pastText,
                    ]}>
                      {day}
                    </Text>
                    {isTodayDate && (
                      <View style={styles.cameraIcon}>
                        <Camera size={12} color="white" />
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Photos Modal */}
      <Modal
        visible={selectedDate !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate?.photos.length === 0 ? 'Fotoğraf ekle' : 'Anılarımız'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedDate(null)}
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedDate?.photos.length === 0 ? (
                <View style={styles.emptyState}>
                  <ImageIcon size={48} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    Bugün henüz fotoğrafımız yok.{'\n'}Bazı güzel anılar ekleyelim!
                  </Text>
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={pickImageFromGallery}
                  >
                    <Plus size={20} color="white" />
                    <Text style={styles.addPhotoButtonText}>Fotoğraf Ekle</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photosGrid}>
                  {selectedDate?.photos.map((photo, idx) => (
                    <TouchableOpacity
                      key={photo.id}
                      style={styles.photoItem}
                      onPress={() => openPhotoModal(selectedDate.photos, idx)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.modalPhotoImage} />
                      <View style={styles.photoActions}>
                        <Text style={styles.photoTime}>
                          {new Date(photo.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        <TouchableOpacity
                          style={styles.deletePhotoButton}
                          onPress={() => deletePhoto(photo.id)}
                        >
                          <Trash2 size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      {(photo.note || photo.emoji) && (
                        <View style={{ position: 'absolute', left: 8, top: 8, backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ color: 'white', fontSize: 12 }}>{photo.emoji} {photo.note ? 'Not' : ''}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {selectedDate && selectedDate.photos.length > 0 && (
              <View style={styles.modalFooter}>
                <Text style={styles.modalDate}>{selectedDate.displayDate}</Text>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={pickImageFromGallery}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.addPhotoButtonText}>Daha Fazla Fotoğraf Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* SLIDE MODAL: Fotoğrafa tıklayınca açılır */}
      <Modal
        visible={photoModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closePhotoModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,1)', // Tam siyah arka plan
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {photoModal.photos.length > 0 && (
            <>
              <Carousel
                width={width}
                height={width * 1.3}
                data={photoModal.photos}
                defaultIndex={photoModal.index}
                onSnapToItem={i => {
                  setPhotoModal(pm => ({ ...pm, index: i }));
                  const newPhoto = photoModal.photos[i];
                  setNote(newPhoto?.note || '');
                  setEmoji(newPhoto?.emoji || '');
                  setEditingNote(false);
                }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.uri }}
                    style={{
                      width: width,
                      height: width * 1.3,
                      resizeMode: 'cover',
                      borderRadius: 0,
                      backgroundColor: '#222'
                    }}
                  />
                )}
                loop={false}
              />
              <TouchableOpacity
                style={{ position: 'absolute', top: 40, right: 20, zIndex: 2, padding: 8 }}
                onPress={closePhotoModal}
              >
                <X size={32} color="white" />
              </TouchableOpacity>
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0)', // Alt kısımda siyahlık yok
                padding: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}>
                <Text style={{
                  fontSize: 40,
                  textAlign: 'center',
                  marginBottom: 8,
                  color: 'white'
                }}>
                  {photoModal.photos[photoModal.index]?.emoji || ''}
                </Text>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
};

