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

// Single ring — radius in SVG units (viewBox 400×400 over 340px stage)
const RING_IDLE_R   = 112;  // tight to button in idle
const RING_NEAR_R   = 130;  // breathe-in position while recording
const RING_FAR_R    = 180;  // breathe-out position while recording
const RING_OPACITY  = 0.30;

function formatDate() {
  const now  = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  return `${days[now.getDay()]}, ${mm}/${dd}`;
}

function formatDuration(seconds: number): string {
  const m   = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

const STATUS_DOT_COLOR = (status: string) => {
  if (status === 'listening') return C.accent;
  if (status === 'paused')    return C.gold;
  return C.inkFaint;
};

export default function HomeScreen() {
  const { status, isRecording, toggleRecord, togglePause, discard } = useVoiceManager();
  const [showDiscard, setShowDiscard] = useState(false);
  const dateStr = useRef(formatDate()).current;

  // ── Duration timer ─────────────────────────────────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (status === 'listening') {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    if (status === 'idle') setElapsedSeconds(0);
  }, [status]);

  // Reset timer whenever a new recording session begins
  useEffect(() => {
    if (isRecording) setElapsedSeconds(0);
  }, [isRecording]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

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
  const ringR           = useRef(new Animated.Value(RING_IDLE_R)).current;
  const ringOpacity     = useRef(new Animated.Value(RING_OPACITY)).current;
  const breathingActive = useRef(false);
  const savedAnim       = useRef(new Animated.Value(0)).current;

  // ── Saved badge animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'saving') {
      savedAnim.setValue(0);
      Animated.sequence([
        Animated.delay(200), // let timer row fade out first
        Animated.timing(savedAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.timing(savedAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

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
      breathingActive.current = true;

      const breathe = () => {
        if (!breathingActive.current) return;
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringR,       { toValue: RING_FAR_R,  duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(ringOpacity, { toValue: 0.08,        duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(ringR,       { toValue: RING_NEAR_R,  duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(ringOpacity, { toValue: RING_OPACITY, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          ]),
        ]).start(({ finished }) => { if (finished) breathe(); });
      };

      Animated.spring(ringR, { toValue: RING_NEAR_R, speed: 18, bounciness: 3, useNativeDriver: false })
        .start(() => breathe());
    } else {
      breathingActive.current = false;
      ringR.stopAnimation();
      ringOpacity.stopAnimation();
      Animated.parallel([
        Animated.timing(ringR,       { toValue: RING_IDLE_R,  duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false }),
        Animated.timing(ringOpacity, { toValue: RING_OPACITY, duration: 400,                                  useNativeDriver: false }),
      ]).start();
    }
  }, [isRecording]);

  // ── Interpolations ────────────────────────────────────────────────────────
  const ringColor    = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.ink,  C.border]     });
  const ringWidth    = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6,    1.4]           });
  const buttonBg     = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.ink,  'transparent']  });
  const buttonBorder = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.ink,  C.accent]      });
  // Animate actual width/height so the touch area shrinks with the visual
  const buttonSize   = stateAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [180, 68, 81]  });
  const buttonRadius = stateAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [90,  34, 40.5] });
  const dotColor     = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.gold, C.accent]      });
  const btnImgOpacity = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const dotSize      = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 30]                });
  const dotRadius    = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 6]                  });

  const statusDotColor = STATUS_DOT_COLOR(status);

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

        {/* Right: date always, status slot beneath */}
        <View style={s.headerRight}>
          <Text style={s.mono}>{dateStr}</Text>
          <View style={s.statusSlot}>
            {/* Timer row — visible while recording */}
            <Animated.View style={[s.statusRow, { opacity: statusOpacity }]} pointerEvents="none">
              <View style={[s.statusDot, { backgroundColor: statusDotColor }]} />
              <Text style={[s.timerText, { color: statusDotColor }]}>{formatDuration(elapsedSeconds)}</Text>
            </Animated.View>
            {/* SAVED row — overlaid, fades in after recording stops */}
            <Animated.View style={[s.statusRow, s.savedOverlay, { opacity: savedAnim }]} pointerEvents="none">
              <View style={[s.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[s.timerText, { color: '#4CAF50' }]}>SAVED</Text>
            </Animated.View>
          </View>
        </View>

      </View>

      {/* ── Center stage ── */}
      <View style={s.center}>
        <View style={s.stage}>

          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: ringOpacity }]}
            pointerEvents="none"
          >
            <Svg width="100%" height="100%" viewBox="0 0 400 400">
              <AnimatedCircle
                cx={200} cy={200} r={ringR}
                stroke={ringColor}
                strokeWidth={ringWidth}
                fill="none"
              />
            </Svg>
          </Animated.View>

          <View style={s.btnFloat}>
            <TouchableOpacity onPress={toggleRecord} activeOpacity={0.9}>
              <Animated.View style={[s.recordBtn, {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonRadius,
                backgroundColor: buttonBg,
                borderColor: buttonBorder,
                borderWidth: isRecording ? 1.5 : 0,
              }]}>
                <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: btnImgOpacity }]}>
                  <Image
                    source={textures.space}
                    style={s.btnImg}
                    resizeMode="contain"
                  />
                </Animated.View>
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
    paddingBottom: 16,
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    paddingHorizontal: 24,
  },
  idleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  hamburger: {
    width: 20,
    height: 15,
    justifyContent: 'space-between',
  },
  hLine: {
    width: 20,
    height: 2,
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
    paddingHorizontal: 24,
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusSlot: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  savedOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderColor: C.inkFaint,
  },

  // ── Typography ───────────────────────────────────────────────────────────
  mono: {
    fontFamily: F.mono,
    fontSize: 14,
    letterSpacing: 1.5,
    color: C.ink,
    textTransform: 'uppercase',
  },
  monoSmall: {
    fontFamily: F.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  timerText: {
    fontFamily: F.mono,
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Center stage ─────────────────────────────────────────────────────────
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnImg: {
    width: '100%',
    height: '100%',
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
