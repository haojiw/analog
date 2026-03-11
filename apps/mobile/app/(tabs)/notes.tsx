import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bgBase: '#F4F2EB',
  bgReceipt: '#D1D3CA',
  inkDark: '#2C2B29',
  inkLight: '#8A8882',
  accentYellow: '#F4B925',
  accentRed: '#C95233',
};
const FONT_MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';
const FONT_SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const ENTRIES = [
  { num: '01', date: 'Oct 24', mood: 'heavy', time: '04:12' },
  { num: '02', date: 'Oct 22', mood: 'light', time: '12:05' },
  { num: '03', date: 'Oct 19', mood: 'warm', time: '01:30' },
  { num: '04', date: 'Oct 14', mood: 'heavy', time: '08:45' },
];

function moodColor(mood: string) {
  if (mood === 'heavy') return C.inkDark;
  if (mood === 'warm') return C.accentYellow;
  return 'transparent';
}
function moodBorderColor(mood: string) {
  if (mood === 'warm') return C.accentYellow;
  return C.inkDark;
}

export default function NotesScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.cardStack}>
          {/* Back layers */}
          <View style={s.layerBottom} />
          <View style={s.layerMid} />

          {/* Main receipt card */}
          <View style={s.receipt}>
            {/* Header */}
            <View style={s.receiptHeader}>
              <Text style={s.mono}>ARCHIVE</Text>
              <Text style={s.display}>Memories</Text>
              <View style={s.stamp}>
                <Text style={[s.mono, { fontSize: 8, textAlign: 'center', lineHeight: 13 }]}>
                  {'OFFICIAL\nRECORD\nNO. 992'}
                </Text>
              </View>
            </View>

            {/* Entry list */}
            <View style={s.list}>
              {ENTRIES.map((entry, i) => (
                <View key={i} style={[s.entryRow, i === ENTRIES.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={s.mono}>{entry.num}</Text>
                  <View style={s.entryDateWrap}>
                    <Text style={s.entryDate}>{entry.date}</Text>
                    <View style={[s.moodDot, {
                      backgroundColor: moodColor(entry.mood),
                      borderColor: moodBorderColor(entry.mood),
                    }]} />
                  </View>
                  <Text style={s.mono}>{entry.time}</Text>
                </View>
              ))}
            </View>

            {/* Footer */}
            <View style={s.receiptFooter}>
              <Text style={[s.mono, { color: C.inkLight }]}>TEAR HERE FOR RECEIPT</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgBase },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  cardStack: { position: 'relative', minHeight: 500, marginTop: 20 },
  layerBottom: {
    position: 'absolute',
    top: 20, left: 0, right: 20, bottom: -20,
    backgroundColor: C.accentRed,
    borderWidth: 1,
    borderColor: C.inkDark,
    transform: [{ rotate: '-2deg' }],
  },
  layerMid: {
    position: 'absolute',
    top: 10, left: 10, right: 10, bottom: -10,
    backgroundColor: C.accentYellow,
    borderWidth: 1,
    borderColor: C.inkDark,
    transform: [{ rotate: '1deg' }],
  },
  receipt: {
    backgroundColor: C.bgReceipt,
    borderWidth: 1,
    borderColor: C.inkDark,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  receiptHeader: {
    borderBottomWidth: 1,
    borderBottomColor: C.inkDark,
    padding: 24,
    paddingRight: 100,
    position: 'relative',
  },
  stamp: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.inkDark,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    transform: [{ rotate: '15deg' }],
  },
  mono: {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: C.inkDark,
    textTransform: 'uppercase',
  },
  display: {
    fontFamily: FONT_SERIF,
    fontSize: 36,
    fontWeight: '600',
    color: C.inkDark,
    letterSpacing: -0.5,
    marginTop: 8,
    lineHeight: 40,
  },
  list: {},
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,43,41,0.2)',
    gap: 16,
  },
  entryDateWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDate: {
    fontFamily: FONT_SERIF,
    fontSize: 24,
    fontWeight: '600',
    color: C.inkDark,
    letterSpacing: -0.3,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: 8,
  },
  receiptFooter: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: C.inkDark,
  },
});
