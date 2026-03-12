import { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useVoiceManager } from '../../src/hooks/useVoiceManager';
import { theme } from '../../src/theme/tokens';
import { textures } from '../../src/theme/textures';
import { Ionicons } from '@expo/vector-icons';


const C = theme.colors;
const F = theme.fonts;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RINGS = [
  { r: 95,  dashArray: null,   baseOpacity: 0.55 },
  { r: 140, dashArray: '2 5',  baseOpacity: 0.35 },
];
const STAGGER = 300;

function formatDate() {
  const now  = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  return `${days[now.getDay()]}, ${mm}/${dd}`;
}

const STATUS_LABEL: Record<string, string> = {
  listening: 'LISTENING',
  paused:    'PAUSED',
  saving:    'SAVING...',
  idle:      'SILENT',
};
const STATUS_COLOR = (status: string) => {
  if (status === 'listening') return C.accent;
  if (status === 'paused')    return C.gold;
  return C.inkFaint;
};

export default function HomeScreen() {
  const { status, isRecording, toggleRecord, togglePause, discard } = useVoiceManager();
  const [showDiscard, setShowDiscard] = useState(false);
  const dateStr = useRef(formatDate()).current;

  // ── Animation values ──────────────────────────────────────────────────────
  const stateAnim       = useRef(new Animated.Value(0)).current;
  const quoteOpacity    = useRef(new Animated.Value(1)).current;
  const quoteY          = useRef(new Animated.Value(0)).current;
  const idleOpacity     = useRef(new Animated.Value(1)).current;
  const idleY           = useRef(new Animated.Value(0)).current;
  const closeOpacity    = useRef(new Animated.Value(0)).current;
  const closeY          = useRef(new Animated.Value(10)).current;
  const statusOpacity   = useRef(new Animated.Value(0)).current;
  const pauseBtnOpacity = useRef(new Animated.Value(0)).current;
  const pauseBtnY       = useRef(new Animated.Value(10)).current;
  const ringScales      = useRef(RINGS.map(() => new Animated.Value(1))).current;
  const ringOpacities   = useRef(RINGS.map(r => new Animated.Value(r.baseOpacity))).current;
  const timeoutRefs     = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    Animated.timing(stateAnim, {
      toValue: isRecording ? 1 : 0,
      duration: 400,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(quoteOpacity,    { toValue: isRecording ? 0 : 1,  duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(quoteY,          { toValue: isRecording ? 10 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(idleOpacity,     { toValue: isRecording ? 0 : 1,  duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(idleY,           { toValue: isRecording ? -10 : 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(closeOpacity,    { toValue: isRecording ? 1 : 0,  duration: 300, delay: isRecording ? 180 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(closeY,          { toValue: isRecording ? 0 : 10, duration: 300, delay: isRecording ? 180 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(statusOpacity,   { toValue: isRecording ? 1 : 0,  duration: 300, delay: isRecording ? 100 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(pauseBtnOpacity, { toValue: isRecording ? 1 : 0,  duration: 300, delay: isRecording ? 200 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(pauseBtnY,       { toValue: isRecording ? 0 : 10, duration: 300, delay: isRecording ? 200 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    if (isRecording) {
      ringScales.forEach((scale, i) => {
        const t = setTimeout(() => {
          Animated.loop(
            Animated.sequence([
              Animated.parallel([
                Animated.timing(scale,            { toValue: 1.10,                 duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(ringOpacities[i], { toValue: 0.15,                 duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ]),
              Animated.parallel([
                Animated.timing(scale,            { toValue: 1.0,                  duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(ringOpacities[i], { toValue: RINGS[i].baseOpacity, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ]),
            ])
          ).start();
        }, i * STAGGER);
        timeoutRefs.current.push(t);
      });
    } else {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
      ringScales.forEach((scale, i) => {
        scale.stopAnimation();
        ringOpacities[i].stopAnimation();
        Animated.parallel([
          Animated.spring(scale,            { toValue: 1,                    useNativeDriver: true, speed: 20 }),
          Animated.timing(ringOpacities[i], { toValue: RINGS[i].baseOpacity, duration: 300,         useNativeDriver: true }),
        ]).start();
      });
    }

    return () => timeoutRefs.current.forEach(clearTimeout);
  }, [isRecording]);

  // ── Interpolations ────────────────────────────────────────────────────────
  const ringColor    = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.ink,  C.accent]     });
  const ringWidth    = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6,    1.4]           });
  const buttonBg     = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.ink,  C.background]  });
  const buttonBorder = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.ink,  C.accent]      });
  const buttonScale  = stateAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 0.92]   });
  const dotColor     = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.gold, C.accent]      });
  const dotSize      = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 24]                });
  const dotRadius    = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [7, 4]                  });

  const statusLabel = STATUS_LABEL[status] ?? 'SILENT';
  const statusColor = STATUS_COLOR(status);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ── Discard modal ── */}
      <Modal visible={showDiscard} transparent animationType="fade" onRequestClose={() => setShowDiscard(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Discard recording?</Text>
            <Text style={s.modalSub}>This recording will be lost.</Text>
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setShowDiscard(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[s.mono, { color: C.inkFaint }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowDiscard(false); discard(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[s.mono, { color: C.accent }]}>DISCARD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Header ── */}
      <View style={s.header}>

        {/* Left */}
        <View style={s.headerLeft}>
          {/* Idle: hamburger + username — wrapped in TouchableOpacity for future profile drawer */}
          <Animated.View
            style={{ opacity: idleOpacity, transform: [{ translateY: idleY }] }}
            pointerEvents={isRecording ? 'none' : 'auto'}
          >
            <TouchableOpacity
              onPress={() => { /* TODO: open profile drawer */ }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={s.idleRow}
            >
              <View style={s.hamburger}>
                <View style={s.hLine} />
                <View style={s.hLine} />
                <View style={s.hLine} />
              </View>
              <Text style={s.mono}>USERNAME</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Recording: discard (✕) */}
          <Animated.View
            style={[s.closeSlot, { opacity: closeOpacity, transform: [{ translateY: closeY }] }]}
            pointerEvents={isRecording ? 'auto' : 'none'}
          >
            <TouchableOpacity onPress={() => setShowDiscard(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={s.closeIcon}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Right: date always, status flows in beneath */}
        <View style={s.headerRight}>
          <Text style={s.mono}>{dateStr}</Text>
          <Animated.View style={[s.statusRow, { opacity: statusOpacity }]} pointerEvents="none">
            <View style={[s.statusDot, { backgroundColor: isRecording ? statusColor : 'transparent', borderWidth: isRecording ? 0 : 1 }]} />
            <Text style={[s.monoSmall, { color: statusColor }]}>{statusLabel}</Text>
          </Animated.View>
        </View>

      </View>

      {/* ── Center stage ── */}
      <View style={s.center}>
        <View style={s.stage}>

          {RINGS.map((ring, i) => (
            <Animated.View
              key={i}
              style={[StyleSheet.absoluteFill, { transform: [{ scale: ringScales[i] }], opacity: ringOpacities[i] }]}
              pointerEvents="none"
            >
              <Svg width="100%" height="100%" viewBox="0 0 400 400">
                <AnimatedCircle
                  cx={200} cy={200} r={ring.r}
                  stroke={ringColor}
                  strokeWidth={ringWidth}
                  strokeDasharray={ring.dashArray ?? undefined}
                  fill="none"
                />
              </Svg>
            </Animated.View>
          ))}

          <View style={s.btnFloat}>
            <TouchableOpacity onPress={toggleRecord} activeOpacity={0.9}>
              <Animated.View style={[s.recordBtn, {
                backgroundColor: buttonBg,
                borderColor: buttonBorder,
                borderWidth: isRecording ? 1 : 0,
                transform: [{ scale: buttonScale }],
              }]}>
                <Image source={textures.button} style={[StyleSheet.absoluteFillObject, s.btnTexture]} resizeMode="cover" />
                <Animated.View style={{ backgroundColor: dotColor, width: dotSize, height: dotSize, borderRadius: dotRadius }} />
              </Animated.View>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    
      {/* ── Pause / Resume ── */}
      <View style={s.pauseArea}>
        <Animated.View style={{ opacity: pauseBtnOpacity, transform: [{ translateY: pauseBtnY }] }}>
          <TouchableOpacity onPress={togglePause} activeOpacity={0.7} disabled={!isRecording}>
            <View style={s.pauseBtn}>
              {status === 'paused' ? (
                <Ionicons name="play" size={50} color={C.ink} />
              ) : (
                <Ionicons name="pause" size={50} color={C.ink} />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── Quote ── */}
      <Animated.View style={[s.quoteWrap, { opacity: quoteOpacity, transform: [{ translateY: quoteY }] }]}>
        <Text style={s.quote}>i speak therefore i am</Text>
      </Animated.View>
      
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    paddingHorizontal: 20,
  },
  idleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  hamburger: {
    width: 14,
    height: 11,
    justifyContent: 'space-between',
  },
  hLine: {
    width: 14,
    height: 1.5,
    backgroundColor: C.ink,
    borderRadius: 1,
  },
  closeSlot: {
    position: 'absolute',
    top: -6,
    left: 24,
  },
  closeIcon: {
    fontFamily: F.mono,
    fontSize: 40,
    color: C.ink,
    lineHeight: 48,
  },

  headerRight: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    borderColor: C.inkFaint,
  },

  // ── Typography ───────────────────────────────────────────────────────────
  mono: {
    fontFamily: F.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: C.ink,
    textTransform: 'uppercase',
  },
  monoSmall: {
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Center stage ─────────────────────────────────────────────────────────
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Anchors to the true middle
    top: 80,
  },
  stage: {
    width: 340,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFloat: {},
  recordBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnTexture: {
    borderRadius: 37,
    opacity: 0.2,
  },


  // ── Pause button ──────────────────────────────────────────────────────────
  pauseArea: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },

  // ── Quote ─────────────────────────────────────────────────────────────────
  quoteWrap: {
    paddingBottom: 120,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  quote: {
    fontFamily: F.serifItalic,
    fontSize: 19,
    color: C.ink,
    textAlign: 'center',
    lineHeight: 28,
  },

  // ── Discard modal ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.inkFaint,
    paddingHorizontal: 32,
    paddingVertical: 28,
    width: '78%',
    gap: 6,
  },
  modalTitle: {
    fontFamily: F.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: C.ink,
    textTransform: 'uppercase',
  },
  modalSub: {
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: C.inkFaint,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 4,
  },
});
