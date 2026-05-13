// Dark and Darker themed design tokens

export const colors = {
  bg: '#0A0A0A',
  surfaceDark: '#151515',
  surfaceParchment: '#1C1712',
  surfacePanel: '#111111',
  surfaceSlot: '#1A1612',

  borderGold: '#8B6914',
  borderBrass: '#5C4D32',
  borderLeather: '#2D1F16',
  borderSubtle: '#2A2A2A',

  textPrimary: '#E5DAC8',
  textSecondary: '#A09582',
  textMuted: '#6B6055',
  textHighlight: '#D4AF37',
  textDanger: '#B33A3A',

  rarity: {
    poor: '#808080',
    common: '#FFFFFF',
    uncommon: '#32CD32',
    rare: '#00BFFF',
    epic: '#A445E0',
    legendary: '#FFA500',
    unique: '#DC143C',
  } as const,
};

export const rarityOrder = [
  'poor',
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'unique',
] as const;

export type Rarity = (typeof rarityOrder)[number];

export const rarityColor = (r: Rarity) => colors.rarity[r];

export const fonts = {
  heading: 'Cormorant Garamond, Garamond, Georgia, serif',
  body: 'EB Garamond, Garamond, Georgia, serif',
  ui: 'System',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
