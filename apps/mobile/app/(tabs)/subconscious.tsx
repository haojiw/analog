import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '../../src/shared/mockup-theme';

const orbitWords = ['Memory', 'Pattern', 'Echo', 'Drift', 'Becoming', 'Return'];

export default function SubconsciousScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.paper }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24 }}>
        <Text
          style={{
            color: palette.mutedInk,
            fontSize: 11,
            letterSpacing: 2.8,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Subconscious
        </Text>
        <Text
          style={{
            color: palette.ink,
            fontSize: 34,
            lineHeight: 38,
            fontFamily: 'Georgia',
            marginBottom: 12,
          }}
        >
          The patterns you did not stop to name.
        </Text>
        <Text style={{ color: palette.mutedInk, fontSize: 16, lineHeight: 24, marginBottom: 30 }}>
          This surface should feel symbolic and reflective, closer to a reading than an analytics page.
        </Text>

        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 34, height: 320 }}>
          <View
            style={{
              position: 'absolute',
              width: 246,
              height: 246,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: palette.line,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: palette.rust,
            }}
          />
          <View
            style={{
              width: 112,
              height: 48,
              borderRadius: 999,
              backgroundColor: palette.gold,
              borderWidth: 2,
              borderColor: palette.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                backgroundColor: palette.ink,
              }}
            />
          </View>

          {orbitWords.map((word, index) => {
            const positions = [
              { top: 10, left: 120 },
              { top: 70, right: 18 },
              { bottom: 84, right: 28 },
              { bottom: 18, left: 112 },
              { bottom: 88, left: 18 },
              { top: 74, left: 24 },
            ][index];

            return (
              <Text
                key={word}
                style={{
                  position: 'absolute',
                  color: palette.mutedInk,
                  fontSize: 11,
                  letterSpacing: 2.1,
                  textTransform: 'uppercase',
                  ...positions,
                }}
              >
                {word}
              </Text>
            );
          })}
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: palette.line,
            borderRadius: 24,
            backgroundColor: palette.paperDeep,
            padding: 20,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: palette.rust,
              fontSize: 11,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Portrait
          </Text>
          <Text style={{ color: palette.ink, fontSize: 24, lineHeight: 30, fontFamily: 'Georgia', marginBottom: 8 }}>
            You return often to distance, duty, and whether tenderness can survive ambition.
          </Text>
          <Text style={{ color: palette.mutedInk, fontSize: 15, lineHeight: 23 }}>
            The content can be generated later. What matters in the mockup is the framing: interpretive, not mechanical.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
