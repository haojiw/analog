/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FFF6E9',
        surface:    '#EAE6DD',
        ink:        '#342b22',
        'ink-faint': '#7A756D',
        border:     '#C2BBB0',
        accent:     '#C95A3A',
        gold:       '#E2A746',
      },
      fontFamily: {
        serif: ['CormorantGaramond_400Regular'],
        'serif-italic': ['CormorantGaramond_400Regular_Italic'],
        'serif-semi': ['CormorantGaramond_600SemiBold'],
        mono:  ['SpaceMono_400Regular'],
        body:  ['Inter_400Regular'],
      },
    },
  },
  plugins: [],
};
