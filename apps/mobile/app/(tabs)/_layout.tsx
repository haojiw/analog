import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const C = {
  bgBase: '#F4F2EB',
  inkDark: '#2C2B29',
  inkLight: '#8A8882',
  accentRed: '#C95233',
};

const FONT_MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

function TabBar({ state, navigation }: any) {
  const TAB_LABELS = ['CAPTURE', 'LOG', 'MIND'];
  return (
    <View style={s.tabBar}>
      {state.routes.map((route: any, i: number) => {
        const focused = state.index === i;
        return (
          <TouchableOpacity
            key={route.key}
            style={[s.tab, i < 2 && s.tabBorder]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <View style={[s.dot, focused && s.dotActive]} />
            <Text style={[s.label, focused ? s.labelActive : s.labelInactive]}>
              {TAB_LABELS[i]}
            </Text>
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
    backgroundColor: C.bgBase,
    borderTopWidth: 1,
    borderTopColor: C.inkDark,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBorder: {
    borderRightWidth: 1,
    borderRightColor: C.inkDark,
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
    backgroundColor: C.accentRed,
    borderColor: C.inkDark,
  },
  label: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  labelActive: { color: C.inkDark },
  labelInactive: { color: C.inkLight },
});

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="notes" />
      <Tabs.Screen name="mind" />
    </Tabs>
  );
}
