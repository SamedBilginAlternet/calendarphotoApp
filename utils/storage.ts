import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTOS_KEY = 'love_calendar_photos';

export interface PhotoItem {
  id: string;
  uri: string;
  timestamp: number;
}

export class PhotoService {
  static async savePhoto(date: string, uri: string): Promise<void> {
    try {
      const existingPhotos = await this.getAllPhotos();
      if (!existingPhotos[date]) {
        existingPhotos[date] = [];
      }
      
      const newPhoto: PhotoItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        uri,
        timestamp: Date.now(),
      };
      
      existingPhotos[date].push(newPhoto);
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(existingPhotos));
    } catch (error) {
      console.error('Failed to save photo:', error);
      throw error;
    }
  }

  static async getAllPhotos(): Promise<{[key: string]: PhotoItem[]}> {
    try {
      const photosJson = await AsyncStorage.getItem(PHOTOS_KEY);
      return photosJson ? JSON.parse(photosJson) : {};
    } catch (error) {
      console.error('Failed to load photos:', error);
      return {};
    }
  }

  static async getPhotosForDate(date: string): Promise<PhotoItem[]> {
    try {
      const photos = await this.getAllPhotos();
      return photos[date] || [];
    } catch (error) {
      console.error('Failed to get photos for date:', error);
      return [];
    }
  }

  static async deletePhoto(date: string, photoId: string): Promise<void> {
    try {
      const photos = await this.getAllPhotos();
      if (photos[date]) {
        photos[date] = photos[date].filter(photo => photo.id !== photoId);
        if (photos[date].length === 0) {
          delete photos[date];
        }
        await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
      throw error;
    }
  }

  static async hasPhotos(date: string): Promise<boolean> {
    try {
      const photos = await this.getPhotosForDate(date);
      return photos.length > 0;
    } catch (error) {
      console.error('Failed to check photos:', error);
      return false;
    }
  }

  static async getTotalPhotoCount(): Promise<number> {
    try {
      const allPhotos = await this.getAllPhotos();
      return Object.values(allPhotos).reduce((total, dayPhotos) => total + dayPhotos.length, 0);
    } catch (error) {
      console.error('Failed to get photo count:', error);
      return 0;
    }
  }

  static async getLatestPhotoForDate(date: string): Promise<string | null> {
    try {
      const photos = await this.getPhotosForDate(date);
      if (photos.length === 0) return null;
      
      const latestPhoto = photos.sort((a, b) => b.timestamp - a.timestamp)[0];
      return latestPhoto.uri;
    } catch (error) {
      console.error('Failed to get latest photo:', error);
      return null;
    }
  }
}