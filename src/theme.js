// DHAANT Material 3 theme — white surfaces, blue + teal accents.
export const colors = {
  primary: '#0058BC',
  primaryDark: '#003C82',
  primaryLight: '#D8E6FF',
  primarySoft: '#EAF1FB',
  teal: '#00897B',
  tealLight: '#B2DFDB',
  tealBg: '#E0F7F4',

  surface: '#FFFFFF',
  surface2: '#F5F8FC',
  surface3: '#EEF2F8',

  ink: '#0F172A',
  ink2: '#475569',
  ink3: '#94A3B8',

  line: '#E5EAF2',

  success: '#16A34A',
  successBg: '#DCFCE7',
  warn: '#F59E0B',
  warnBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.55)',
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadows = {
  soft: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  float: {
    shadowColor: '#0058BC',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const typography = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, color: colors.ink },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.3, color: colors.ink },
  h2: { fontSize: 22, fontWeight: '700', color: colors.ink },
  h3: { fontSize: 18, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, fontWeight: '400', color: colors.ink, lineHeight: 22 },
  bodyMd: { fontSize: 14, fontWeight: '500', color: colors.ink2, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink2, letterSpacing: 0.1 },
  caption: { fontSize: 11, fontWeight: '600', color: colors.ink3, letterSpacing: 0.4 },
};
