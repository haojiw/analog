import { Tabs } from 'expo-router';

import { palette } from '../../src/shared/mockup-theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.mutedInk,
        tabBarStyle: {
          backgroundColor: palette.paperDeep,
          borderTopColor: palette.line,
          height: 82,
          paddingTop: 10,
          paddingBottom: 16,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Record' }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
      <Tabs.Screen name="subconscious" options={{ title: 'Subconscious' }} />
      <Tabs.Screen name="conscious" options={{ title: 'Conscious' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
