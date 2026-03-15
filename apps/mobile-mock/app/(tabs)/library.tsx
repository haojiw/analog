import { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActionSheetIOS,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/tokens';
import { mockLogs, MockLog } from '../../src/mocks/data';
import { Swipeable } from 'react-native-gesture-handler';
import { SwipeableLogRow } from '../../src/components/SwipeableLogRow';

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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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

type DayGroup = { date: Date; logs: MockLog[] };
type MonthGroup = { monthLabel: string; days: DayGroup[] };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function groupLogs(logs: MockLog[]): MonthGroup[] {
  const sorted = [...logs].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const monthMap = new Map<string, Map<string, { date: Date; logs: MockLog[] }>>();
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
// DayGroupView
// ---------------------------------------------------------------------------

type DayGroupViewProps = {
  dayGroup: DayGroup;
  onPress: (log: MockLog) => void;
  logCollections: Record<string, string>;
  onAddToCollection: (logId: string) => void;
  onDeleteRequest: (log: MockLog) => void;
  openSwipeableRef: React.MutableRefObject<Swipeable | null>;
};

function DayGroupView({
  dayGroup,
  onPress,
  logCollections,
  onAddToCollection,
  onDeleteRequest,
  openSwipeableRef,
}: DayGroupViewProps) {
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
          <SwipeableLogRow
            log={log}
            onPress={onPress}
            onAddToCollection={onAddToCollection}
            onDeleteRequest={onDeleteRequest}
            openSwipeableRef={openSwipeableRef}
          />
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// CollectionPickerModal
// ---------------------------------------------------------------------------

type CollectionPickerModalProps = {
  visible: boolean;
  onSelect: (collectionId: string) => void;
  onClose: () => void;
};

function CollectionPickerModal({ visible, onSelect, onClose }: CollectionPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Pressable backdrop — tap outside to dismiss */}
      <Pressable style={s.pickerBackdrop} onPress={onClose}>
        {/* Stop event propagation so tapping inside sheet doesn't close it */}
        <Pressable style={s.pickerSheet} onPress={() => {}}>
          <View style={s.pickerHandle} />
          <Text style={s.pickerTitle}>Add to Collection</Text>
          <TouchableOpacity
            style={s.pickerRow}
            activeOpacity={0.7}
            onPress={() => { onSelect('favorites'); onClose(); }}
          >
            <Ionicons name="star" size={20} color={C.gold} />
            <Text style={s.pickerRowText}>Favorites</Text>
          </TouchableOpacity>
          {MOCK_COLLECTIONS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={s.pickerRow}
              activeOpacity={0.7}
              onPress={() => { onSelect(c.id); onClose(); }}
            >
              <View style={[s.pickerDot, { backgroundColor: c.color }]} />
              <Text style={s.pickerRowText}>{c.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.pickerCancel} activeOpacity={0.7} onPress={onClose}>
            <Text style={s.pickerCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirmModal
// ---------------------------------------------------------------------------

type DeleteConfirmModalProps = {
  log: MockLog | null;
  onConfirm: () => void;
  onCancel: () => void;
};

function DeleteConfirmModal({ log, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={log != null}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <Pressable style={s.deleteBackdrop} onPress={onCancel}>
        <Pressable style={s.deleteCard} onPress={() => {}}>
          <Text style={s.deleteTitle} numberOfLines={1}>{log?.title ?? ''}</Text>
          <Text style={s.deleteMessage}>Delete this entry?</Text>
          <View style={s.deleteActions}>
            <TouchableOpacity style={s.deleteCancelBtn} activeOpacity={0.7} onPress={onCancel}>
              <Text style={s.deleteCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.deleteConfirmBtn} activeOpacity={0.7} onPress={onConfirm}>
              <Text style={s.deleteConfirmText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);

  const bars = useMemo(
    () => (log ? barsFromId(log.id, 40) : []),
    [log?.id],
  );

  const entry = log?.entries[0];
  const dateTimeStr = log ? `${formatDate(log.createdAt)} · ${formatTime(log.createdAt)}` : '';
  const totalDuration = entry?.type === 'audio' ? formatDuration(entry.durationMs) : '0:00';
  const positionStr = '0:00';

  function handleOptions() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Delete'], destructiveButtonIndex: 1, cancelButtonIndex: 0 },
        () => {},
      );
    }
  }

  return (
    <Modal
      visible={log != null}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={s.overlayRoot}>
        {/* Header */}
        <View style={[s.overlayHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={s.overlayHeaderBtn}
            onPress={onClose}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="chevron-down" size={26} color={C.inkFaint} />
          </TouchableOpacity>

          <Text style={s.overlayHeaderTitle} numberOfLines={1}>
            {log?.title ?? ''}
          </Text>

          <TouchableOpacity
            style={s.overlayHeaderBtn}
            onPress={handleOptions}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={C.inkFaint} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.overlayScroll}
          contentContainerStyle={s.overlayContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Audio player info row */}
          <View style={s.playerInfoRow}>
            <Text style={s.playerInfoText}>{dateTimeStr}</Text>
            <Text style={s.playerInfoText}>{`${positionStr} / ${totalDuration}`}</Text>
          </View>

          {/* Audio player controls row */}
          <View style={s.playerControls}>
            <TouchableOpacity
              style={s.playBtn}
              onPress={() => setIsPlaying(p => !p)}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={C.ink} />
            </TouchableOpacity>

            <View style={s.waveform}>
              {bars.map((h, i) => (
                <View key={i} style={[s.waveBar, { height: h }]} />
              ))}
            </View>
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
  const [selectedLog, setSelectedLog] = useState<MockLog | null>(null);
  const [deletedLogIds, setDeletedLogIds] = useState<Set<string>>(new Set());
  const [logCollections, setLogCollections] = useState<Record<string, string>>({});
  const [collectionPickerTarget, setCollectionPickerTarget] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<MockLog | null>(null);
  const openSwipeableRef = useRef<Swipeable | null>(null);

  const visibleLogs = useMemo(
    () => mockLogs.filter((l) => !deletedLogIds.has(l.id)),
    [deletedLogIds],
  );
  const monthGroups = useMemo(() => groupLogs(visibleLogs), [visibleLogs]);

  function handleAddToCollection(logId: string) {
    setCollectionPickerTarget(logId);
  }

  function handleCollectionSelect(collectionId: string) {
    if (collectionPickerTarget) {
      setLogCollections((prev) => ({ ...prev, [collectionPickerTarget]: collectionId }));
    }
    setCollectionPickerTarget(null);
  }

  function handleDeleteRequest(log: MockLog) {
    setDeleteConfirmTarget(log);
  }

  function handleDeleteConfirm() {
    if (deleteConfirmTarget) {
      setDeletedLogIds((prev) => new Set([...prev, deleteConfirmTarget.id]));
    }
    setDeleteConfirmTarget(null);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <LibraryHeader />
      <ScrollView
        style={s.logScroll}
        contentContainerStyle={s.scrollContent}
        onScrollBeginDrag={() => {
          openSwipeableRef.current?.close();
          openSwipeableRef.current = null;
        }}
      >
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
                logCollections={logCollections}
                onAddToCollection={handleAddToCollection}
                onDeleteRequest={handleDeleteRequest}
                openSwipeableRef={openSwipeableRef}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <DetailOverlay log={selectedLog} onClose={() => setSelectedLog(null)} />

      <CollectionPickerModal
        visible={collectionPickerTarget != null}
        onSelect={handleCollectionSelect}
        onClose={() => setCollectionPickerTarget(null)}
      />

      <DeleteConfirmModal
        log={deleteConfirmTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
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

  // Collection picker modal
  pickerBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(52,43,34,0.3)',
  },
  pickerSheet: {
    backgroundColor: C.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontFamily: F.mono,
    fontSize: 13,
    color: C.inkFaint,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  pickerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  pickerRowText: {
    fontFamily: F.body,
    fontSize: 16,
    color: C.ink,
  },
  pickerCancel: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 14,
  },
  pickerCancelText: {
    fontFamily: F.mono,
    fontSize: 13,
    color: C.inkFaint,
    letterSpacing: 0.5,
  },

  // Delete confirm modal
  deleteBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(52,43,34,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  deleteCard: {
    backgroundColor: C.background,
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  deleteTitle: {
    fontFamily: F.body,
    fontSize: 16,
    fontWeight: '600',
    color: C.ink,
    marginBottom: 8,
  },
  deleteMessage: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.inkFaint,
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  deleteCancelText: {
    fontFamily: F.mono,
    fontSize: 13,
    color: C.inkFaint,
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontFamily: F.mono,
    fontSize: 13,
    color: '#fff',
  },

  // DetailOverlay
  overlayRoot: {
    flex: 1,
    backgroundColor: C.background,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  overlayHeaderBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayHeaderTitle: {
    flex: 1,
    fontFamily: F.body,
    fontSize: 16,
    fontWeight: '600',
    color: C.ink,
    textAlign: 'center',
  },
  overlayScroll: {
    flex: 1,
  },
  overlayContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  playerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  playerInfoText: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkFaint,
    letterSpacing: 0.5,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  playBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    gap: 2,
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
