import { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/tokens';
import { MockLog } from '../mocks/data';

const C = theme.colors;
const F = theme.fonts;

type SwipeableLogRowProps = {
  log: MockLog;
  onPress: (log: MockLog) => void;
  onAddToCollection: (logId: string) => void;
  onDeleteRequest: (log: MockLog) => void;
  openSwipeableRef: React.MutableRefObject<Swipeable | null>;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function totalAudioMs(log: MockLog): number {
  return log.entries.reduce(
    (sum, e) => (e.type === 'audio' ? sum + e.durationMs : sum),
    0,
  );
}

export function SwipeableLogRow({
  log,
  onPress,
  onAddToCollection,
  onDeleteRequest,
  openSwipeableRef,
}: SwipeableLogRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const ms = totalAudioMs(log);
  let durationStr: string | null = null;
  if (ms > 0) {
    durationStr = formatDuration(ms);
  } else if (log.entries.length > 0 && log.entries.every((e) => e.type === 'text')) {
    durationStr = 'txt';
  }

  function renderLeftActions(progress: Animated.AnimatedInterpolation<number>) {
    const scale = progress.interpolate({
      inputRange: [0.35, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0.35, 0.65],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const translateX = progress.interpolate({
      inputRange: [0.35, 1],
      outputRange: [-BTN_SIZE / 2, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={s.actionSlot}>
        <Animated.View style={{ transform: [{ translateX }, { scale }], opacity }}>
          <TouchableOpacity
            style={s.addBtn}
            activeOpacity={0.75}
            onPress={() => {
              swipeableRef.current?.close();
              onAddToCollection(log.id);
            }}
          >
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  function renderRightActions(progress: Animated.AnimatedInterpolation<number>) {
    const scale = progress.interpolate({
      inputRange: [0.35, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0.35, 0.65],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const translateX = progress.interpolate({
      inputRange: [0.35, 1],
      outputRange: [BTN_SIZE / 2, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={s.actionSlot}>
        <Animated.View style={{ transform: [{ translateX },{ scale }], opacity }}>
          <TouchableOpacity
            style={s.deleteBtn}
            activeOpacity={0.75}
            onPress={() => {
              swipeableRef.current?.close();
              onDeleteRequest(log);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  function handleRowPress() {
    if (openSwipeableRef.current === swipeableRef.current) {
      swipeableRef.current?.close();
    } else if (openSwipeableRef.current != null) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    } else {
      onPress(log);
    }
  }

  return (
    <Swipeable
      ref={swipeableRef}
      containerStyle={s.swipeableContainer}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      friction={2}
      onSwipeableWillOpen={() => {
        openSwipeableRef.current?.close();
        openSwipeableRef.current = swipeableRef.current;
      }}
      onSwipeableClose={() => {
        if (openSwipeableRef.current === swipeableRef.current) {
          openSwipeableRef.current = null;
        }
      }}
    >
      <TouchableOpacity
        onPress={handleRowPress}
        activeOpacity={0.6}
        style={s.logRow}
      >
        <Text style={s.logTitle} numberOfLines={1}>{log.title}</Text>
        {durationStr != null && (
          <Text style={s.durationText}>{durationStr}</Text>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}

const ACTION_SLOT_WIDTH = 64;
const BTN_SIZE = 40;

const s = StyleSheet.create({
  swipeableContainer: {
    flex: 1,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: 'transparent',
  },
  logTitle: {
    flex: 1,
    fontFamily: F.body,
    fontWeight: '500',
    fontSize: 16,
    color: C.ink,
    lineHeight: 20,
  },
  durationText: {
    fontFamily: F.mono,
    fontSize: 12,
    color: C.inkFaint,
    letterSpacing: 0.2,
    flexShrink: 0,
    marginTop: 2,
  },
  actionSlot: {
    width: ACTION_SLOT_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: C.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
