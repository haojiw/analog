import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Path } from 'react-native-svg';

const C = {
  bgBase: '#F4F2EB',
  inkDark: '#2C2B29',
  inkLight: '#8A8882',
  accentYellow: '#F4B925',
  accentRed: '#C95233',
};
const FONT_MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';
const FONT_SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

export default function MindScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.frame}>
        <View style={s.inner}>
          {/* Geometric background */}
          <Svg style={StyleSheet.absoluteFillObject} viewBox="0 0 300 600" preserveAspectRatio="xMidYMid slice">
            <Circle cx={150} cy={300} r={80} stroke={C.inkDark} strokeWidth={1} fill="none" />
            <Circle cx={150} cy={300} r={120} stroke={C.inkDark} strokeWidth={1} fill="none" />
            <Line x1={150} y1={0} x2={150} y2={600} stroke={C.inkDark} strokeWidth={1} />
            <Line x1={0} y1={300} x2={300} y2={300} stroke={C.inkDark} strokeWidth={1} />
            <Line x1={0} y1={150} x2={300} y2={450} stroke={C.inkDark} strokeWidth={1} />
            <Line x1={300} y1={150} x2={0} y2={450} stroke={C.inkDark} strokeWidth={1} />
            <Line x1={0} y1={0} x2={300} y2={600} stroke={C.inkDark} strokeWidth={1} />
            <Line x1={300} y1={0} x2={0} y2={600} stroke={C.inkDark} strokeWidth={1} />
            <Polygon points="150,180 270,300 150,420 30,300" stroke={C.accentRed} strokeWidth={1} fill="none" />
          </Svg>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.mono}>THE ARCHITECT</Text>
          </View>

          {/* Mystic Eye */}
          <View style={s.eyeWrap}>
            <Svg width={100} height={50} viewBox="0 0 100 50">
              <Path d="M0,25 Q50,-10 100,25 Q50,60 0,25 Z" fill={C.accentYellow} stroke={C.inkDark} strokeWidth={1.5} />
              <Circle cx={50} cy={25} r={8} fill={C.inkDark} />
            </Svg>
          </View>

          {/* Content */}
          <View style={s.content}>
            <Text style={[s.mono, { marginBottom: 16 }]}>PATTERN DETECTED</Text>
            <Text style={s.insight}>
              You speak of the ocean whenever the silence grows too long.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgBase },
  frame: {
    flex: 1,
    margin: 20,
    borderWidth: 2,
    borderColor: C.inkDark,
    padding: 8,
  },
  inner: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.inkDark,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: C.bgBase,
    zIndex: 3,
  },
  eyeWrap: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -25,
    zIndex: 2,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: C.bgBase,
    zIndex: 3,
  },
  mono: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: C.inkDark,
    textTransform: 'uppercase',
  },
  insight: {
    fontFamily: FONT_SERIF,
    fontStyle: 'italic',
    fontSize: 20,
    color: C.inkDark,
    textAlign: 'center',
    lineHeight: 28,
  },
});
