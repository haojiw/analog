import { useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  SectionListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme/tokens';
import { mockLogs, MockLog, MOCK_TODAY } from '../../src/mocks/data';
import { useSectionedLogs, LogSection } from '../../src/hooks/useSectionedLogs';

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
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

// Deterministic bar heights from a string id — no randomness on re-render
function barsFromId(id: string, count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    let hash = 0;
    for (let j = 0; j < id.length; j++) {
      hash = (hash * 31 + id.charCodeAt(j) + i * 7) & 0xffffffff;
    }
    // Height between 6 and 32
    const h = 6 + (Math.abs(hash) % 27);
    bars.push(h);
  }
  return bars;
}

// ---------------------------------------------------------------------------
// EntryRow
// ---------------------------------------------------------------------------

type EntryRowProps = {
  log: MockLog;
  onPress: (log: MockLog) => void;
};

function EntryRow({ log, onPress }: EntryRowProps) {
  const entry = log.entries[0];
  const timeStr = formatTime(log.createdAt);
  const metaStr =
    entry.type === 'audio' ? formatDuration(entry.durationMs) : 'text';

  return (
    <TouchableOpacity
      onPress={() => onPress(log)}
      activeOpacity={0.6}
      style={s.row}
    >
      <Text style={s.rowMeta}>
        {timeStr}
        {' · '}
        {metaStr}
      </Text>
      <View style={s.rowRight}>
        {entry.transcript != null ? (
          <Text style={s.rowTranscript} numberOfLines={1}>
            {entry.transcript}
          </Text>
        ) : (
          <Text style={s.rowPlaceholder}>...</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// LibrarySectionHeader
// ---------------------------------------------------------------------------

function LibrarySectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// DetailOverlay
// ---------------------------------------------------------------------------

type DetailOverlayProps = {
  log: MockLog | null;
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
        {/* Close button */}
        <TouchableOpacity
          style={s.overlayClose}
          onPress={onClose}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        >
          <Text style={s.overlayCloseText}>×</Text>
        </TouchableOpacity>

        {/* Drag handle */}
        <View style={s.dragHandle} />

        <ScrollView
          style={s.overlayScroll}
          contentContainerStyle={s.overlayContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Time + duration header */}
          <Text style={s.overlayMeta}>
            {timeStr}
            {entry ? `  ·  ${metaStr}` : ''}
          </Text>

          {/* Waveform placeholder */}
          <View style={s.waveform}>
            {bars.map((h, i) => (
              <View
                key={i}
                style={[s.waveBar, { height: h }]}
              />
            ))}
          </View>

          <View style={s.divider} />

          {/* Transcript */}
          {entry?.transcript != null ? (
            <Text style={s.overlayTranscript}>{entry.transcript}</Text>
          ) : (
            <Text style={s.overlayTranscriptPending}>
              Transcription pending...
            </Text>
          )}

          <View style={s.divider} />

          {/* AI section */}
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
  const [selectedLog, setSelectedLog] = useState<MockLog | null>(null);
  const sections = useSectionedLogs(mockLogs, MOCK_TODAY);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <SectionList<MockLog, LogSection>
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: SectionListRenderItemInfo<MockLog, LogSection>) => (
          <EntryRow log={item} onPress={setSelectedLog} />
        )}
        renderSectionHeader={({ section }) => (
          <LibrarySectionHeader title={section.title} />
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={s.listContent}
      />

      <DetailOverlay
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent', 
  },
  listContent: {
    paddingBottom: 100,
  },

  // EntryRow
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  rowMeta: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkFaint,
    letterSpacing: 0.3,
  },
  rowRight: {
    flex: 1,
    marginLeft: 12,
  },
  rowTranscript: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.ink,
    lineHeight: 18,
  },
  rowPlaceholder: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.inkFaint,
  },

  // LibrarySectionHeader
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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

  // Waveform
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
