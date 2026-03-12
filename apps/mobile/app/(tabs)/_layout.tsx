import { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, type ViewStyle } from 'react-native';
import { RecordingProvider, useRecording } from '../../src/core/providers/RecordingContext';
import { theme } from '../../src/theme/tokens';
import { textures } from '../../src/theme/textures';

const C = theme.colors;
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
      {/* WRAP THE IMAGE IN A VIEW TO HANDLE POINTER EVENTS */}
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
                  {i === 0 ? 'NOTES' : 'MIND'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 85,
    paddingBottom: 20,
    backgroundColor: C.background, // Remains solid so it covers the grain when scrolling
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.ink,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBorderRight: {
    borderRightWidth: StyleSheet.hairlineWidth,
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

const transparentFill: ViewStyle = { flex: 1, backgroundColor: 'transparent' };
export default function TabsLayout() {
  return (
    <RecordingProvider>
      <Tabs 
        tabBar={(props) => <TabBar {...props} />}
        
        /* This wrapper guarantees EVERY screen gets the correct bg color and grain, 
          overriding the default React Navigation gray wall. 
        */
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
          // We can optionally explicitly tell the scene to be transparent too
          sceneStyle: { backgroundColor: 'transparent' } 
        }}
      >
        <Tabs.Screen name="notes" />
        <Tabs.Screen name="index" />
        <Tabs.Screen name="mind" />
      </Tabs>
    </RecordingProvider>
  );
}