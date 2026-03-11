import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme/tokens';

const C = theme.colors;
const F = theme.fonts;

export default function MindScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.center}>
        <Text style={s.label}>MIND</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: C.inkFaint,
  },
});
