import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '../../src/shared/mockup-theme';

const prompts = [
  'What have I been avoiding lately?',
  'What keeps repeating in my entries?',
  'When did this feeling first appear?',
];

export default function ConsciousScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ink }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24 }}>
        <Text
          style={{
            color: '#BCAEA0',
            fontSize: 11,
            letterSpacing: 2.8,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Conscious
        </Text>
        <Text
          style={{
            color: palette.paper,
            fontSize: 34,
            lineHeight: 39,
            fontFamily: 'Georgia',
            marginBottom: 12,
          }}
        >
          Ask only when you are ready to be answered.
        </Text>
        <Text style={{ color: '#BCAEA0', fontSize: 16, lineHeight: 24, marginBottom: 28 }}>
          The AI should feel like a separate chamber: invited, deliberate, and quieter than a normal chat app.
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: '#55483B',
            borderRadius: 28,
            padding: 20,
            backgroundColor: '#2A241F',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: '#BCAEA0',
              fontSize: 11,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Opening question
          </Text>
          <Text style={{ color: palette.paper, fontSize: 26, lineHeight: 32, fontFamily: 'Georgia' }}>
            What have I been wrestling with, beneath the surface?
          </Text>
        </View>

        {prompts.map((prompt) => (
          <View
            key={prompt}
            style={{
              borderWidth: 1,
              borderColor: '#55483B',
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#DCCFBE', fontSize: 15, lineHeight: 22 }}>{prompt}</Text>
          </View>
        ))}

        <View style={{ marginTop: 'auto', alignItems: 'center', paddingTop: 28 }}>
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: palette.gold,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <View style={{ width: 58, height: 2, backgroundColor: palette.gold, position: 'absolute' }} />
            <View
              style={{
                width: 58,
                height: 2,
                backgroundColor: palette.gold,
                position: 'absolute',
                transform: [{ rotate: '90deg' }],
              }}
            />
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                backgroundColor: palette.gold,
              }}
            />
          </View>
          <Text
            style={{
              color: '#BCAEA0',
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
            }}
          >
            Enter the chamber
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
