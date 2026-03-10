import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { palette } from '../../src/shared/mockup-theme';

const compassLines = Array.from({ length: 12 }, (_, index) => index);

export default function RecordScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.paper }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <Text
            style={{
              color: palette.mutedInk,
              fontSize: 11,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Analog
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: palette.line,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: palette.mutedInk, fontSize: 10, letterSpacing: 2 }}>
              Private log
            </Text>
          </View>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: palette.line,
            borderRadius: 28,
            backgroundColor: palette.paperDeep,
            paddingHorizontal: 22,
            paddingTop: 24,
            paddingBottom: 28,
            shadowColor: palette.shadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.35,
            shadowRadius: 24,
          }}
        >
          <Text
            style={{
              color: palette.mutedInk,
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Field note 018
          </Text>
          <Text
            style={{
              color: palette.ink,
              fontSize: 38,
              lineHeight: 42,
              fontFamily: 'Georgia',
              marginBottom: 16,
            }}
          >
            Speak before the day goes dim.
          </Text>
          <Text
            style={{
              color: palette.mutedInk,
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 34,
            }}
          >
            No reply. No interruption. Just a place to leave what happened while it still
            feels alive.
          </Text>

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
              height: 260,
            }}
          >
            <View
              style={{
                position: 'absolute',
                width: 238,
                height: 238,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: palette.line,
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: 162,
                height: 162,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: palette.rust,
              }}
            />
            {compassLines.map((line) => (
              <View
                key={line}
                style={{
                  position: 'absolute',
                  width: 2,
                  height: line % 3 === 0 ? 220 : 170,
                  backgroundColor: line % 3 === 0 ? palette.ink : palette.line,
                  transform: [{ rotate: `${line * 30}deg` }],
                  opacity: line % 3 === 0 ? 0.55 : 0.4,
                }}
              />
            ))}
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 999,
                backgroundColor: palette.gold,
                borderWidth: 3,
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
          </View>

          <Text
            style={{
              textAlign: 'center',
              color: palette.mutedInk,
              fontSize: 12,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            Hold to record
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: palette.ink,
              fontSize: 17,
              lineHeight: 24,
              fontFamily: 'Georgia',
            }}
          >
            Today, what happened that you do not want to lose?
          </Text>
        </View>

        <View
          style={{
            marginTop: 'auto',
            paddingTop: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View>
            <Text
              style={{
                color: palette.mutedInk,
                fontSize: 11,
                letterSpacing: 2.4,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Ritual
            </Text>
            <Text style={{ color: palette.ink, fontSize: 15, fontFamily: 'Georgia' }}>
              Speak. Release. Archive.
            </Text>
          </View>
          <Text
            style={{
              color: palette.rust,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Silent AI
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
