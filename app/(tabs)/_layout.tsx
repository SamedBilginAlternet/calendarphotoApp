import { Tabs } from 'expo-router';
import { Calendar, Camera, Image, Palette } from 'lucide-react-native';
import { useContext } from 'react';
import { ThemeContext } from '@/components/ThemeProvider';

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 85,
          paddingTop: 10,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins-Medium',
          marginTop: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Takvim',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Kamera',
          tabBarIcon: ({ size, color }) => (
            <Camera size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'Fotoğraflar',
          tabBarIcon: ({ size, color }) => (
            <Image size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="themes"
        options={{
          title: 'Temalar',
          tabBarIcon: ({ size, color }) => (
            <Palette size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}