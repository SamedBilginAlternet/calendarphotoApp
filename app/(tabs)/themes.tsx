import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useContext, useEffect } from 'react';
import { ThemeContext } from '@/components/ThemeProvider';
import { Heart, Check, Palette } from 'lucide-react-native';
import { themes } from '@/constants/themes';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';

export default function ThemesScreen() {
  const { theme, setTheme, currentThemeKey } = useContext(ThemeContext);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    // Animate heart every 3.5 seconds
    const interval = setInterval(() => {
      heartScale.value = withSpring(1.2, { duration: 350 }, () => {
        heartScale.value = withSpring(1, { duration: 350 });
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

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
      paddingTop: 30,
    },
    themeCard: {
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
    themeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
      color: theme.colors.text,
      marginBottom: 5,
    },
    themeDescription: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    checkIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 15,
    },
    colorPalette: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectButton: {
      marginTop: 15,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      alignItems: 'center',
    },
    selectButtonText: {
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
      color: 'white',
    },
    currentThemeIndicator: {
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      color: theme.colors.primary,
      textAlign: 'center',
      marginTop: 10,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
          <Heart size={28} color="white" fill="white" />
        </Animated.View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tema Seçin</Text>
        </View>
        <Text style={styles.headerSubtitle}>Sevgi takvimizi kişileştirebilirsin :D</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(themes).map(([key, themeData]) => {
          const isSelected = currentThemeKey === key;
          
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.themeCard,
                isSelected && { 
                  borderWidth: 2, 
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.surface,
                }
              ]}
              onPress={() => setTheme(key)}
            >
              <View style={styles.themeHeader}>
                <View style={styles.themeInfo}>
                  <Text style={styles.themeName}>{themeData.name}</Text>
                  <Text style={styles.themeDescription}>{themeData.description}</Text>
                </View>
                <View style={[
                  styles.checkIcon,
                  { backgroundColor: isSelected ? theme.colors.primary : 'transparent' }
                ]}>
                  {isSelected && <Check size={20} color="white" />}
                </View>
              </View>

              <View style={styles.colorPalette}>
                <View style={[styles.colorCircle, { backgroundColor: themeData.colors.primary }]} />
                <View style={[styles.colorCircle, { backgroundColor: themeData.colors.secondary }]} />
                <View style={[styles.colorCircle, { backgroundColor: themeData.colors.accent }]} />
                <View style={[styles.colorCircle, { backgroundColor: themeData.colors.surface }]} />
              </View>

              {!isSelected && (
                <TouchableOpacity
                  style={[styles.selectButton, { backgroundColor: themeData.colors.primary }]}
                  onPress={() => setTheme(key)}
                >
                  <Text style={styles.selectButtonText}>Tema Seçin</Text>
                </TouchableOpacity>
              )}

              {isSelected && (
                <Text style={styles.currentThemeIndicator}>Aktif Tema</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}