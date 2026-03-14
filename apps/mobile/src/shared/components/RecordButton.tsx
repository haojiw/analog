import { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { theme } from '../../theme/tokens';
import { textures } from '../../theme/textures';

const C = theme.colors;

interface Props {
  isRecording: boolean;
  onPress: () => void;
}

export function RecordButton({ isRecording, onPress }: Props) {
  const stateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(stateAnim, {
      toValue: isRecording ? 1 : 0,
      duration: 400,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isRecording]);

  // Animate actual width/height so the touch area shrinks with the visual
  const buttonBg      = stateAnim.interpolate({ inputRange: [0, 1],       outputRange: [C.ink,  'transparent'] });
  const buttonBorder  = stateAnim.interpolate({ inputRange: [0, 1],       outputRange: [C.ink,  C.accent]      });
  const buttonSize    = stateAnim.interpolate({ inputRange: [0, 0.5, 1],  outputRange: [180,   68,   81]        });
  const buttonRadius  = stateAnim.interpolate({ inputRange: [0, 0.5, 1],  outputRange: [90,    34,   40.5]      });
  const dotColor      = stateAnim.interpolate({ inputRange: [0, 1],       outputRange: [C.gold, C.accent]       });
  const btnImgOpacity = stateAnim.interpolate({ inputRange: [0, 1],       outputRange: [1,     0]               });
  const dotSize       = stateAnim.interpolate({ inputRange: [0, 1],       outputRange: [12,    30]              });
  const dotRadius     = stateAnim.interpolate({ inputRange: [0, 1],       outputRange: [6,     6]               });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
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
  );
}

const s = StyleSheet.create({
  recordBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnImg: {
    width: '100%',
    height: '100%',
  },
});
