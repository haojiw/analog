import { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme/tokens';

const C = theme.colors;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Radius constants in SVG units (viewBox 400×400 over 340px stage)
const RING_IDLE_R  = 112;  // tight to button in idle
const RING_NEAR_R  = 130;  // breathe-in position while recording
const RING_FAR_R   = 180;  // breathe-out position while recording
const RING_OPACITY = 0.30;

interface Props {
  isRecording: boolean;
}

export function BreathingRing({ isRecording }: Props) {
  const stateAnim       = useRef(new Animated.Value(0)).current;
  const ringR           = useRef(new Animated.Value(RING_IDLE_R)).current;
  const ringOpacity     = useRef(new Animated.Value(RING_OPACITY)).current;
  const breathingActive = useRef(false);

  useEffect(() => {
    Animated.timing(stateAnim, {
      toValue: isRecording ? 1 : 0,
      duration: 400,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();

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

  const ringColor = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [C.ink, C.border] });
  const ringWidth = stateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: ringOpacity }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 400">
        <AnimatedCircle
          cx={200} cy={200} r={ringR}
          stroke={ringColor}
          strokeWidth={ringWidth}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}
