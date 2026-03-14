import '../global.css';
import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useAssets } from 'expo-asset';
import { textures } from '../src/theme/textures';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import { Inter_400Regular } from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
    SpaceMono_400Regular,
    Inter_400Regular,
  });

  const [assets] = useAssets([
    textures.background,
    textures.space,
    require('../assets/space/universe.jpg'),
  ]);

  const ready = fontsLoaded && !!assets;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
