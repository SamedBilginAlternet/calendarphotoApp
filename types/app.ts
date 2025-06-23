export interface PhotoData {
  date: string;
  uri: string;
  timestamp: number;
}

export interface CalendarDay {
  day: number | null;
  date: string;
  isToday: boolean;
  isPast: boolean;
  hasPhoto: boolean;
  photoUri?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface AppTheme {
  name: string;
  description: string;
  colors: ThemeColors;
}