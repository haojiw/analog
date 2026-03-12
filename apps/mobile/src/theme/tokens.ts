const palette = {
  parchment:  '#FFF6E9',
  linen:      '#EAE6DD',
  bark:       '#342b22',
  stone:      '#7A756D',
  ash:        '#C2BBB0',
  terracotta: '#C95A3A',
  gold:       '#E2A746',
} as const;

export type Theme = {
  colors: {
    background: string;
    surface:    string;
    ink:        string;
    inkFaint:   string;
    border:     string;
    accent:     string;
    gold:       string;
  };
  fonts: {
    serif:      string;
    serifItalic: string;
    serifSemi:  string;
    mono:       string;
    body:       string;
  };
};

export const lightTheme: Theme = {
  colors: {
    background: palette.parchment,
    surface:    palette.linen,
    ink:        palette.bark,
    inkFaint:   palette.stone,
    border:     palette.ash,
    accent:     palette.terracotta,
    gold:       palette.gold,
  },
  fonts: {
    serif:      'CormorantGaramond_400Regular',
    serifItalic: 'CormorantGaramond_400Regular_Italic',
    serifSemi:  'CormorantGaramond_600SemiBold',
    mono:       'SpaceMono_400Regular',
    body:       'Inter_400Regular',
  },
};

export const theme = lightTheme;
