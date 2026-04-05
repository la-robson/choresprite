import type { Theme } from '@react-navigation/native';

const NAV_FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  heavy: 'Inter_700Bold',
} as const;

export const NAV_THEME = {
  light: {
    background: 'hsl(120 20% 97%)', // background
    border: 'hsl(150 15% 85%)', // border
    card: 'hsl(120 25% 95%)', // card
    notification: 'hsl(0 72% 55%)', // destructive
    primary: 'hsl(152 55% 42%)', // primary
    text: 'hsl(150 20% 15%)', // foreground
  },
  dark: {
    background: 'hsl(150 15% 10%)', // background
    border: 'hsl(150 10% 20%)', // border
    card: 'hsl(150 12% 14%)', // card
    notification: 'hsl(0 65% 48%)', // destructive
    primary: 'hsl(152 50% 50%)', // primary
    text: 'hsl(120 15% 92%)', // foreground
  },
};

export const LIGHT_THEME: Theme = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.light,
};
export const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.dark,
};
