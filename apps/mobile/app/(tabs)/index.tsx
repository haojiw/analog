import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const C = {
  bgBase: '#F4F2EB',
  inkDark: '#2C2B29',
  inkLight: '#8A8882',
  accentYellow: '#F4B925',
  accentRed: '#C95233',
};
const FONT_MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';
const FONT_SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const RINGS = [
  { r: 40, dashArray: '2 4', opacity: 0.8 },
  { r: 70, dashArray: '4 6', opacity: 0.6 },
  { r: 100, dashArray: '1 3', opacity: 0.4 },
  { r: 130, dashArray: '5 5', opacity: 0.3 },
  { r: 160, dashArray: '2 8', opacity: 0.15 },
];

export default function CaptureScreen() {
  const [recording, setRecording] = useState(false);
  const breathe = useRef(new Animated.Value(1)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (recording) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      anim.current.start();
    } else {
      anim.current?.stop();
      breathe.setValue(1);
    }
  }, [recording]);

  const ringColor = recording ? C.accentRed : C.inkDark;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Top grid */}
      <View style={s.topGrid}>
        <View style={s.topLeft}>
          <Text style={s.mono}>EST. MMXXIV</Text>
        </View>
        <View style={s.topRight}>
          <Text style={[s.mono, { color: recording ? C.accentRed : C.inkLight }]}>
            {recording ? 'LISTENING' : 'SILENT'}
          </Text>
        </View>
      </View>

      {/* Center */}
      <View style={s.center}>
        <Animated.View style={{ transform: [{ scale: breathe }] }}>
          <Svg width={320} height={320} viewBox="0 0 400 400" style={s.rings}>
            {RINGS.map((ring, i) => (
              <Circle
                key={i}
                cx={200}
                cy={200}
                r={ring.r}
                stroke={ringColor}
                strokeWidth={recording ? 1 : 0.5}
                strokeDasharray={ring.dashArray}
                fill="none"
                opacity={ring.opacity}
              />
            ))}
          </Svg>
        </Animated.View>

        <TouchableOpacity
          style={[s.recordBtn, recording && s.recordBtnActive]}
          onPressIn={() => setRecording(true)}
          onPressOut={() => setRecording(false)}
          activeOpacity={1}
        >
          {!recording && <View style={s.dot} />}
        </TouchableOpacity>
      </View>

      {/* Quote */}
      <View style={s.quoteWrap}>
        <Text style={s.quote}>i speak therefore i am</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgBase },
  topGrid: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: C.inkDark,
  },
  topLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: C.inkDark,
  },
  topRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  mono: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: C.inkDark,
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rings: {
    position: 'absolute',
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.inkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: {
    backgroundColor: C.accentRed,
    transform: [{ scale: 0.9 }],
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.accentYellow,
  },
  quoteWrap: {
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  quote: {
    fontFamily: FONT_SERIF,
    fontStyle: 'italic',
    fontSize: 22,
    color: C.inkDark,
    textAlign: 'center',
    lineHeight: 30,
  },
});
