import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '../../src/shared/mockup-theme';

const entries = [
  {
    date: 'March 10',
    title: 'After dinner with mother',
    body:
      'I kept circling the same question: am I growing, or just getting better at explaining myself.',
  },
  {
    date: 'March 7',
    title: 'Walking home in the fog',
    body:
      'The city felt like a blank margin. I spoke because I wanted one honest sentence to survive the night.',
  },
  {
    date: 'March 2',
    title: 'A good conversation, still unfinished',
    body:
      'I do not think I needed advice. I think I needed somewhere to place the feeling before it blurred.',
  },
];

export default function JournalScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.paper }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 32 }}>
        <Text
          style={{
            color: palette.mutedInk,
            fontSize: 11,
            letterSpacing: 2.8,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Journal
        </Text>
        <Text
          style={{
            color: palette.ink,
            fontSize: 36,
            lineHeight: 40,
            fontFamily: 'Georgia',
            marginBottom: 12,
          }}
        >
          Your recent pages
        </Text>
        <Text style={{ color: palette.mutedInk, fontSize: 16, lineHeight: 24, marginBottom: 26 }}>
          A chronological reading room. No metrics, no feed pressure, just the trail you have left.
        </Text>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: palette.line,
            marginBottom: 10,
          }}
        />

        {entries.map((entry) => (
          <View
            key={entry.title}
            style={{
              paddingVertical: 22,
              borderBottomWidth: 1,
              borderBottomColor: palette.line,
              gap: 10,
            }}
          >
            <Text
              style={{
                color: palette.rust,
                fontSize: 11,
                letterSpacing: 2.2,
                textTransform: 'uppercase',
              }}
            >
              {entry.date}
            </Text>
            <Text style={{ color: palette.ink, fontSize: 24, lineHeight: 30, fontFamily: 'Georgia' }}>
              {entry.title}
            </Text>
            <Text style={{ color: palette.mutedInk, fontSize: 16, lineHeight: 25 }}>{entry.body}</Text>
          </View>
        ))}

        <View
          style={{
            marginTop: 28,
            borderWidth: 1,
            borderColor: palette.line,
            borderRadius: 24,
            backgroundColor: palette.paperDeep,
            padding: 20,
          }}
        >
          <Text
            style={{
              color: palette.mutedInk,
              fontSize: 11,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Echo
          </Text>
          <Text style={{ color: palette.ink, fontSize: 24, lineHeight: 30, fontFamily: 'Georgia', marginBottom: 10 }}>
            Three months ago you asked whether distance would make the truth clearer.
          </Text>
          <Text style={{ color: palette.mutedInk, fontSize: 16, lineHeight: 24 }}>
            This is where the product can feel alive later: not by interrupting, but by remembering on your behalf.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
