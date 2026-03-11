import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RecordingProvider, useRecording } from '../../src/context/RecordingContext';
import { theme } from '../../src/theme/tokens';

const C = theme.colors;

function TabBar({ state, navigation }: any) {
  const { isRecording } = useRecording();

  if (isRecording) return null;

  return (
    <View style={s.tabBar}>
      {state.routes.map((route: any, i: number) => {
        const focused = state.index === i;
        const isCenter = i === 1;

        return (
          <TouchableOpacity
            key={route.key}
            style={[s.tab, i < state.routes.length - 1 && s.tabBorderRight]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {isCenter ? (
              <View style={[s.centerDot, focused && s.centerDotActive]} />
            ) : (
              <>
                <View style={[s.dot, focused && s.dotActive]} />
                <Text style={[s.label, focused ? s.labelActive : s.labelInactive]}>
                  {i === 0 ? 'LIBRARY' : 'MIND'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.ink,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBorderRight: {
    borderRightWidth: 1,
    borderRightColor: C.ink,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  dotActive: {
    backgroundColor: C.accent,
    borderColor: C.ink,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.inkFaint,
    backgroundColor: 'transparent',
  },
  centerDotActive: {
    backgroundColor: C.gold,
    borderColor: C.ink,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  labelActive: { color: C.ink },
  labelInactive: { color: C.inkFaint },
});

export default function TabsLayout() {
  return (
    <RecordingProvider>
      <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="library" />
        <Tabs.Screen name="index" />
        <Tabs.Screen name="mind" />
      </Tabs>
    </RecordingProvider>
  );
}
