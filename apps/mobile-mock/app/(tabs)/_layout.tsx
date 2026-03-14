import { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, type ViewStyle } from 'react-native';
import { RecordingProvider, useRecording } from '../../src/context/RecordingContext';
import { theme } from '../../src/theme/tokens';
import { textures } from '../../src/theme/textures';

const C = theme.colors;
const F = theme.fonts;

// ---------------------------------------------------------------------------
// Tab icons
// ---------------------------------------------------------------------------

// Square outline with a horizontal divider through the middle
function LibraryIcon({ color }: { color: string }) {
  return (
    <View style={[s.libSquare, { borderColor: color }]}>
      <View style={[s.libLine, { backgroundColor: color }]} />
    </View>
  );
}

// Outer ring + tiny center dot — orbital / universe
function MindIcon({ color }: { color: string }) {
  return (
    <View style={[s.mindRing, { borderColor: color }]}>
      <View style={[s.mindDot, { backgroundColor: color }]} />
    </View>
  );
}

// Two concentric rings — iPhone home button
function HomeIcon() {
  const color = C.inkFaint;
  return (
    <View style={[s.homeOuter, { borderColor: color }]}>
      <View style={[s.homeInner, { borderColor: color }]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// TabBar
// ---------------------------------------------------------------------------

const TAB_LABELS = ['LIBRARY', 'HOME', 'MIND'];

function TabBar({ state, navigation }: any) {
  const { isRecording } = useRecording();
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: isRecording ? 0 : 1,  duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: isRecording ? 10 : 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [isRecording]);

  return (
    <Animated.View
      style={[s.tabBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      pointerEvents={isRecording ? 'none' : 'auto'}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={textures.background}
          style={{ opacity: 0.2, width: '100%', height: '100%' }}
          resizeMode="repeat"
        />
      </View>

      {state.routes.map((route: any, i: number) => {
        const focused = state.index === i;
        const isCenter = i === 1;
        const color = focused ? C.ink : C.inkFaint;

        return (
          <TouchableOpacity
            key={route.key}
            style={s.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {isCenter ? (
              <HomeIcon />
            ) : i === 0 ? (
              <>
                <LibraryIcon color={color} />
                <Text style={[s.label, { color }]}>{TAB_LABELS[i]}</Text>
              </>
            ) : (
              <>
                <MindIcon color={color} />
                <Text style={[s.label, { color }]}>{TAB_LABELS[i]}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 85,
    paddingBottom: 10,
    paddingHorizontal: 25,
    backgroundColor: C.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.ink,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
    gap: 4,
  },

  // Library: square outline + horizontal divider
  libSquare: {
    marginVertical: 2,
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 1,
    justifyContent: 'center',
  },
  libLine: {
    height: 2,
  },

  // Mind: outer ring + center dot
  mindRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mindDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Home: two concentric rings (iPhone home button)
  homeOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0.8,
    backgroundColor: 'transparent',
  },

  label: {
    fontFamily: F.mono,
    fontSize: 8,
    letterSpacing: 1,
  },
});

const transparentFill: ViewStyle = { flex: 1, backgroundColor: 'transparent' };

export default function TabsLayout() {
  return (
    <RecordingProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenLayout={({ children }) => (
          <View style={{ flex: 1, backgroundColor: C.background }}>
            <Image
              source={textures.background}
              style={[StyleSheet.absoluteFill, { opacity: 0.2, width: '100%', height: '100%' }]}
              resizeMode="repeat"
            />
            {children}
          </View>
        )}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Tabs.Screen name="library" />
        <Tabs.Screen name="index" />
        <Tabs.Screen name="mind" />
      </Tabs>
    </RecordingProvider>
  );
}
