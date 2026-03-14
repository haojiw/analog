import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/tokens';
import { useLibraryLogs, LibraryLog } from '../../src/shared/hooks/useLibraryLogs';

const C = theme.colors;
const F = theme.fonts;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const min = m.toString().padStart(2, '0');
  return `${hour12}:${min} ${ampm}`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function totalAudioMs(log: LibraryLog): number {
  return log.entries.reduce(
    (sum, e) => (e.type === 'audio' ? sum + e.durationMs : sum),
    0,
  );
}

function barsFromId(id: string, count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    let hash = 0;
    for (let j = 0; j < id.length; j++) {
      hash = (hash * 31 + id.charCodeAt(j) + i * 7) & 0xffffffff;
    }
    bars.push(6 + (Math.abs(hash) % 27));
  }
  return bars;
}

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

type DayGroup = { date: Date; logs: LibraryLog[] };
type MonthGroup = { monthLabel: string; days: DayGroup[] };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function groupLogs(logs: LibraryLog[]): MonthGroup[] {
  const sorted = [...logs].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const monthMap = new Map<string, Map<string, { date: Date; logs: LibraryLog[] }>>();
  const monthOrder: string[] = [];

  for (const log of sorted) {
    const d = log.createdAt;
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, new Map());
      monthOrder.push(monthKey);
    }

    const dayMap = monthMap.get(monthKey)!;
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        logs: [],
      });
    }
    dayMap.get(dayKey)!.logs.push(log);
  }

  return monthOrder.map((monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const dayMap = monthMap.get(monthKey)!;
    const days = Array.from(dayMap.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
    return { monthLabel: `${MONTH_NAMES[month]} ${year}`, days };
  });
}

// ---------------------------------------------------------------------------
// Mock collections
// ---------------------------------------------------------------------------

type MockCollection = {
  id: string;
  name: string;
  color: string;
};

const MOCK_COLLECTIONS: MockCollection[] = [
  { id: 'work',     name: 'Work',           color: '#7B9E87' },
  { id: 'travel',   name: 'Travel',         color: '#9E8A7B' },
  { id: 'growth',   name: 'Personal Growth', color: '#7B8E9E' },
];

// ---------------------------------------------------------------------------
// LibraryHeader
// ---------------------------------------------------------------------------

function LibraryHeader() {
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={s.usernameRow}
          onPress={() => { /* TODO: open profile drawer */ }}
        >
          <View style={s.hamburger}>
            <View style={s.hLine} />
            <View style={s.hLine} />
            <View style={s.hLine} />
          </View>
          <Text style={s.usernameText}>USERNAME</Text>
        </TouchableOpacity>
      </View>
      <View style={s.headerRight}>
        <TouchableOpacity hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="search-outline" size={24} color={C.inkFaint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Collection chips
// ---------------------------------------------------------------------------

const CHIP_SIZE = 36;
const CHIP_LABEL_WIDTH = 60;

function FavoritesChip() {
  return (
    <TouchableOpacity style={s.chip} activeOpacity={0.7}>
      <Ionicons name="star" size={CHIP_SIZE} color={C.ink} />
      <Text style={s.chipLabel} numberOfLines={1}>Favorites</Text>
    </TouchableOpacity>
  );
}

function CollectionChip({ collection }: { collection: MockCollection }) {
  return (
    <TouchableOpacity style={s.chip} activeOpacity={0.7}>
      <View style={[s.chipCircle, { backgroundColor: collection.color }]} />
      <Text style={s.chipLabel} numberOfLines={1}>{collection.name}</Text>
    </TouchableOpacity>
  );
}

function AddChip() {
  return (
    <TouchableOpacity style={s.chip} activeOpacity={0.7}>
      <View style={[s.chipCircle, s.chipCircleAdd]}>
        <Text style={s.chipAddPlus}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// CollectionScroll
// ---------------------------------------------------------------------------

function CollectionScroll() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.collectionScrollContent}
    >
      <FavoritesChip />
      {MOCK_COLLECTIONS.map((c) => (
        <CollectionChip key={c.id} collection={c} />
      ))}
      <AddChip />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// DateSquare
// ---------------------------------------------------------------------------

function DateSquare({ day }: { day: number }) {
  return (
    <View style={s.dateSquare}>
      <Text style={s.dateSquareDay}>{day}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// LogRow
// ---------------------------------------------------------------------------

type LogRowProps = {
  log: LibraryLog;
  onPress: (log: LibraryLog) => void;
};

function LogRow({ log, onPress }: LogRowProps) {
  const ms = totalAudioMs(log);
  let durationStr: string | null = null;

  if (ms > 0) {
    durationStr = formatDuration(ms);
  } else if (log.entries.length > 0 && log.entries.every((e) => e.type === 'text')) {
    durationStr = 'txt';
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(log)}
      activeOpacity={0.6}
      style={s.logRow}
    >
      <Text style={s.logTitle} numberOfLines={1}>{log.title}</Text>
      {durationStr != null && (
        <Text style={s.durationText}>{durationStr}</Text>
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// DayGroupView
// ---------------------------------------------------------------------------

type DayGroupViewProps = {
  dayGroup: DayGroup;
  onPress: (log: LibraryLog) => void;
};

function DayGroupView({ dayGroup, onPress }: DayGroupViewProps) {
  const day = dayGroup.date.getDate();

  return (
    <View style={s.dayGroup}>
      {dayGroup.logs.map((log, index) => (
        <View key={log.id} style={s.dayRow}>
          {index === 0 ? (
            <DateSquare day={day} />
          ) : (
            <View style={s.dateSquareSpacer} />
          )}
          <LogRow log={log} onPress={onPress} />
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// DetailOverlay
// ---------------------------------------------------------------------------

type DetailOverlayProps = {
  log: LibraryLog | null;
  onClose: () => void;
};

function DetailOverlay({ log, onClose }: DetailOverlayProps) {
  const bars = useMemo(
    () => (log ? barsFromId(log.id, 40) : []),
    [log?.id],
  );

  const entry = log?.entries[0];
  const timeStr = log ? formatTime(log.createdAt) : '';
  const metaStr =
    entry?.type === 'audio' ? formatDuration(entry.durationMs) : 'text';

  return (
    <Modal
      visible={log != null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={s.overlayRoot}>
        <TouchableOpacity
          style={s.overlayClose}
          onPress={onClose}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        >
          <Text style={s.overlayCloseText}>×</Text>
        </TouchableOpacity>

        <View style={s.dragHandle} />

        <ScrollView
          style={s.overlayScroll}
          contentContainerStyle={s.overlayContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.overlayMeta}>
            {timeStr}
            {entry ? `  ·  ${metaStr}` : ''}
          </Text>

          <View style={s.waveform}>
            {bars.map((h, i) => (
              <View key={i} style={[s.waveBar, { height: h }]} />
            ))}
          </View>

          <View style={s.divider} />

          {entry?.transcript != null ? (
            <Text style={s.overlayTranscript}>{entry.transcript}</Text>
          ) : (
            <Text style={s.overlayTranscriptPending}>
              Transcription pending...
            </Text>
          )}

          <View style={s.divider} />

          <Text style={s.insightLabel}>INSIGHT</Text>
          <Text style={s.insightBody}>Available after transcription.</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// LibraryScreen
// ---------------------------------------------------------------------------

export default function LibraryScreen() {
  const { logs } = useLibraryLogs();
  const [selectedLog, setSelectedLog] = useState<LibraryLog | null>(null);
  const monthGroups = useMemo(() => groupLogs(logs), [logs]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <LibraryHeader />
      <ScrollView style={s.logScroll} contentContainerStyle={s.scrollContent}>
        <CollectionScroll />
        {monthGroups.map((mg) => (
          <View key={mg.monthLabel}>
            <View style={s.monthHeader}>
              <Text style={s.monthHeaderText}>{mg.monthLabel.toUpperCase()}</Text>
            </View>
            {mg.days.map((dg) => (
              <DayGroupView
                key={dg.date.toISOString()}
                dayGroup={dg}
                onPress={setSelectedLog}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <DetailOverlay log={selectedLog} onClose={() => setSelectedLog(null)} />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const DATE_SQUARE_SIZE = 32;
const DATE_SQUARE_GAP = 16;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Header
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
  headerRight: {
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  usernameRow: {
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
  usernameText: {
    fontFamily: F.mono,
    fontSize: 14,
    letterSpacing: 1.5,
    color: C.ink,
    textTransform: 'uppercase',
  },

  // Collection scroll
  collectionScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 16,
  },

  // Chip
  chip: {
    alignItems: 'center',
    width: CHIP_LABEL_WIDTH,
  },
  chipCircle: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
  },
  chipCircleAdd: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAddPlus: {
    fontFamily: F.body,
    fontSize: 22,
    color: C.inkFaint,
    lineHeight: 26,
  },
  chipLabel: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.inkFaint,
    marginTop: 6,
    maxWidth: CHIP_LABEL_WIDTH,
    textAlign: 'center',
  },

  // Log list scroll
  logScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },

  // Month header
  monthHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  monthHeaderText: {
    fontFamily: F.mono,
    fontSize: 14,
    color: C.inkFaint,
    letterSpacing: 1.5,
  },

  // Day group
  dayGroup: {
    marginBottom: 6,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    gap: DATE_SQUARE_GAP,
    marginBottom: 0,
  },

  // Date square
  dateSquare: {
    width: DATE_SQUARE_SIZE,
    height: DATE_SQUARE_SIZE,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 6,
  },
  dateSquareDay: {
    fontFamily: F.mono,
    fontSize: 14,
    color: C.ink,
    lineHeight: 18,
  },
  dateSquareSpacer: {
    width: DATE_SQUARE_SIZE,
    height: DATE_SQUARE_SIZE,
    flexShrink: 0,
  },

  // Log row
  logRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 10,
    gap: 8,
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

  // DetailOverlay
  overlayRoot: {
    flex: 1,
    backgroundColor: C.background,
  },
  overlayClose: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
  },
  overlayCloseText: {
    fontFamily: F.mono,
    fontSize: 22,
    color: C.inkFaint,
    lineHeight: 26,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  overlayScroll: {
    flex: 1,
  },
  overlayContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  overlayMeta: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    gap: 2,
    marginBottom: 20,
  },
  waveBar: {
    flex: 1,
    backgroundColor: C.border,
    borderRadius: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginVertical: 20,
  },
  overlayTranscript: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.ink,
    lineHeight: 24,
  },
  overlayTranscriptPending: {
    fontFamily: F.serifItalic,
    fontSize: 15,
    color: C.inkFaint,
    lineHeight: 24,
  },
  insightLabel: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  insightBody: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.inkFaint,
    lineHeight: 20,
  },
});
