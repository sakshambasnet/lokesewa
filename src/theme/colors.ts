export type ColorScheme = 'light' | 'dark';

export type Colors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  border: string;
  success: string;
  danger: string;
  skeleton: string;
};

export const palette: Record<ColorScheme, Colors> = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    primary: '#1D4ED8',
    onPrimary: '#FFFFFF',
    border: '#E2E8F0',
    success: '#15803D',
    danger: '#B91C1C',
    skeleton: '#E2E8F0',
  },
  dark: {
    background: '#0B1120',
    surface: '#111827',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    primary: '#60A5FA',
    onPrimary: '#0B1120',
    border: '#1F2937',
    success: '#4ADE80',
    danger: '#F87171',
    skeleton: '#1F2937',
  },
};
