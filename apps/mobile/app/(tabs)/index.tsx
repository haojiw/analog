import { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoiceManager } from '../../src/shared/hooks/useVoiceManager';
import { theme } from '../../src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { BreathingRing } from '../../src/shared/components/BreathingRing';
import { RecordButton } from '../../src/shared/components/RecordButton';

const C = theme.colors;
const F = theme.fonts;

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

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── Animation values ───────────────────────────────────────────────────────
  const quoteOpacity    = useRef(new Animated.Value(1)).current;
  const quoteY          = useRef(new Animated.Value(0)).current;
  const idleOpacity     = useRef(new Animated.Value(1)).current;
  const idleY           = useRef(new Animated.Value(0)).current;
  const closeOpacity    = useRef(new Animated.Value(0)).current;
  const closeY          = useRef(new Animated.Value(10)).current;
  const statusOpacity   = useRef(new Animated.Value(0)).current;
  const pauseBtnOpacity = useRef(new Animated.Value(0)).current;
  const pauseBtnY       = useRef(new Animated.Value(10)).current;
  const savedAnim       = useRef(new Animated.Value(0)).current;

  // ── Saved badge animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'saving') {
      savedAnim.setValue(0);
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(savedAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.timing(savedAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

  // Reset timer and cancel saved badge when a new recording session begins
  useEffect(() => {
    if (isRecording) {
      setElapsedSeconds(0);
      savedAnim.stopAnimation();
      savedAnim.setValue(0);
    }
  }, [isRecording]);

  // ── Header + chrome animations ─────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(quoteOpacity,    { toValue: isRecording ? 0 : 1,   duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(quoteY,          { toValue: isRecording ? 10 : 0,  duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(idleOpacity,     { toValue: isRecording ? 0 : 1,   duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(idleY,           { toValue: isRecording ? -10 : 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(closeOpacity,    { toValue: isRecording ? 1 : 0,   duration: 300, delay: isRecording ? 180 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(closeY,          { toValue: isRecording ? 0 : 10,  duration: 300, delay: isRecording ? 180 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(statusOpacity,   { toValue: isRecording ? 1 : 0,   duration: 300, delay: isRecording ? 100 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(pauseBtnOpacity, { toValue: isRecording ? 1 : 0,   duration: 300, delay: isRecording ? 200 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(pauseBtnY,       { toValue: isRecording ? 0 : 10,  duration: 300, delay: isRecording ? 200 : 0, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [isRecording]);

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
          {/* Idle: hamburger + username */}
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
            {/* SAVED badge — overlaid, fades in after recording stops */}
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
          <BreathingRing isRecording={isRecording} />
          <RecordButton isRecording={isRecording} onPress={toggleRecord} />
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

  // ── Header ────────────────────────────────────────────────────────────────
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
  statusSlot: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

  // ── Typography ─────────────────────────────────────────────────────────────
  mono: {
    fontFamily: F.mono,
    fontSize: 14,
    letterSpacing: 1.5,
    color: C.ink,
    textTransform: 'uppercase',
  },
  timerText: {
    fontFamily: F.mono,
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Center stage ───────────────────────────────────────────────────────────
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

  // ── Pause button ───────────────────────────────────────────────────────────
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

  // ── Quote ──────────────────────────────────────────────────────────────────
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

  // ── Discard modal ──────────────────────────────────────────────────────────
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
