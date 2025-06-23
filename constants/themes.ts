export interface Theme {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export const themes: { [key: string]: Theme } = {
  pinkLove: {
    name: 'Pink Love',
    description: 'Romantic pink theme with warm, loving vibes',
    colors: {
      primary: '#FF6B9D',
      secondary: '#FFB3D1',
      accent: '#FF8FB3',
      background: '#FFF5F8',
      surface: '#FFFFFF',
      text: '#2D2D2D',
      textSecondary: '#6B6B6B',
      border: '#F0F0F0',
    },
  },
  roseGold: {
    name: 'Rose Gold',
    description: 'Elegant rose gold with sophisticated charm',
    colors: {
      primary: '#E8B4B8',
      secondary: '#F4D7D7',
      accent: '#D4A5A5',
      background: '#FAF6F6',
      surface: '#FFFFFF',
      text: '#2D2D2D',
      textSecondary: '#6B6B6B',
      border: '#F0F0F0',
    },
  },
  lavenderDreams: {
    name: 'Lavender Dreams',
    description: 'Soft lavender for dreamy, peaceful moments',
    colors: {
      primary: '#B19CD9',
      secondary: '#D8CCEB',
      accent: '#C8B5E6',
      background: '#F8F6FB',
      surface: '#FFFFFF',
      text: '#2D2D2D',
      textSecondary: '#6B6B6B',
      border: '#F0F0F0',
    },
  },
  peachBlush: {
    name: 'Peach Blush',
    description: 'Warm peach tones for a gentle, caring feel',
    colors: {
      primary: '#FFB19D',
      secondary: '#FFD1C1',
      accent: '#FFC4B0',
      background: '#FFF8F6',
      surface: '#FFFFFF',
      text: '#2D2D2D',
      textSecondary: '#6B6B6B',
      border: '#F0F0F0',
    },
  },
  mintChocolate: {
    name: 'Mint Chocolate',
    description: 'Fresh mint with chocolate accents for a unique twist',
    colors: {
      primary: '#8BD3C7',
      secondary: '#B8E4DA',
      accent: '#A3DDD1',
      background: '#F6FFFE',
      surface: '#FFFFFF',
      text: '#2D2D2D',
      textSecondary: '#6B6B6B',
      border: '#F0F0F0',
    },
  },
};