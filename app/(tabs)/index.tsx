import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '@/components/ThemeProvider';
import { CalendarGrid } from '@/components/CalendarGrid';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react-native';
import { PhotoService, PhotoItem } from '@/utils/storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const { theme } = useContext(ThemeContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [photos, setPhotos] = useState<{[key: string]: PhotoItem[]}>({});
  const heartScale = useSharedValue(1);

  useEffect(() => {
    loadPhotos();
    
    // Animate heart every 3 seconds
    const interval = setInterval(() => {
      heartScale.value = withSpring(1.2, { duration: 300 }, () => {
        heartScale.value = withSpring(1, { duration: 300 });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadPhotos = async () => {
    const allPhotos = await PhotoService.getAllPhotos();
    setPhotos(allPhotos);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
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
      fontWeight: 'bold',
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
    monthNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 15,
      elevation: 3,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    monthText: {
      fontSize: 20,
      fontFamily: 'Poppins-SemiBold',
      color: theme.colors.text,
    },
    navButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calendarContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    heartContainer: {
      position: 'absolute',
      right: 20,
      top: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
          <Heart size={28} color="white" fill="white" />
        </Animated.View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ece ve Samed Anıları</Text>
        </View>
        <Text style={styles.headerSubtitle}>Her güzel anımız</Text>
      </View>

      <View style={styles.monthNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={24} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {formatMonthYear(currentDate)}
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={24} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        <CalendarGrid 
          currentDate={currentDate} 
          photos={photos}
          onPhotoUpdate={loadPhotos}
        />
      </ScrollView>
    </View>
  );
}