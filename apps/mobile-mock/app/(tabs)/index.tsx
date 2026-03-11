import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useRecording } from '../../src/context/RecordingContext';
import { theme } from '../../src/theme/tokens';

const C = theme.colors;
const F = theme.fonts;

const RINGS = [
  { r: 44,  dashArray: '2 5',  opacity: 0.80 },
  { r: 76,  dashArray: '3 7',  opacity: 0.55 },
  { r: 108, dashArray: '1 4',  opacity: 0.35 },
  { r: 140, dashArray: '4 6',  opacity: 0.20 },
  { r: 172, dashArray: '2 9',  opacity: 0.10 },
];

export default function HomeScreen() {
  const { isRecording, setIsRecording } = useRecording();
  const breathe = useRef(new Animated.Value(1)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRecording) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1.06,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 1.0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      anim.current.start();
    } else {
      anim.current?.stop();
      breathe.setValue(1);
    }
  }, [isRecording]);

  const ringColor = isRecording ? C.accent : C.ink;
  const ringWidth = isRecording ? 1.2 : 0.6;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.mono}>EST. MMXXIV</Text>
        </View>
        <View style={s.headerRight}>
          <Text style={[s.mono, { color: isRecording ? C.accent : C.inkFaint }]}>
            {isRecording ? 'LISTENING' : 'SILENT'}
          </Text>
        </View>
      </View>

      {/* Center stage */}
      <View style={s.center}>
        <Animated.View style={{ transform: [{ scale: breathe }] }}>
          <Svg width={340} height={340} viewBox="0 0 400 400" style={s.rings}>
            {RINGS.map((ring, i) => (
              <Circle
                key={i}
                cx={200}
                cy={200}
                r={ring.r}
                stroke={ringColor}
                strokeWidth={ringWidth}
                strokeDasharray={ring.dashArray}
                fill="none"
                opacity={ring.opacity}
              />
            ))}
          </Svg>
        </Animated.View>

        <TouchableOpacity
          style={[s.recordBtn, isRecording && s.recordBtnActive]}
          onPressIn={() => setIsRecording(true)}
          onPressOut={() => setIsRecording(false)}
          activeOpacity={1}
        >
          {!isRecording && <View style={s.goldDot} />}
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
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: C.ink,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: C.ink,
  },
  headerRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  mono: {
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: C.ink,
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
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: {
    backgroundColor: C.accent,
    transform: [{ scale: 0.92 }],
  },
  goldDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.gold,
  },
  quoteWrap: {
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  quote: {
    fontFamily: F.serifItalic,
    fontSize: 22,
    color: C.ink,
    textAlign: 'center',
    lineHeight: 30,
  },
});
