import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/tokens';
import { textures } from '../../src/theme/textures';
const C = theme.colors;
const F = theme.fonts;


// ---------------------------------------------------------------------------
// MindHeader
// ---------------------------------------------------------------------------

function MindHeader() {
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
          <Ionicons name="sparkles-outline" size={24} color={C.inkFaint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MindScreen
// ---------------------------------------------------------------------------

export default function MindScreen() {
  const { width } = useWindowDimensions();
  const heroHeight = width * 0.85;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MindHeader />
      <ScrollView
        style={s.cardsScroll}
        contentContainerStyle={s.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={s.heroCard}>
          <Image
            source={textures.universe}
            style={s.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Wrapped + Portrait side by side */}
        <View style={s.row}>
          {/* Monthly Wrapped */}
          <View style={s.squareCard}>
            <Text style={s.cardLabel}>MARCH 2026</Text>
            <View style={s.wrappedBadge}>
              <Text style={s.wrappedBadgeText}>WRAPPED</Text>
            </View>
            <Text style={s.insightLine}>23 entries this month.</Text>
            <Text style={s.insightLine}>Most active Tuesday mornings.</Text>
          </View>

          {/* Portrait */}
          <View style={s.squareCard}>
            <Text style={s.cardLabel}>PORTRAIT</Text>
            <Text style={s.portraitDimension}>analytical thinker</Text>
            <Text style={s.portraitDescription}>
              Mapping structure before acting.
            </Text>
          </View>
        </View>
      </ScrollView>
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

  // Cards scroll
  cardsScroll: {
    flex: 1,
  },
  cardsContent: {
    paddingTop: 5,
    paddingBottom: 100,
  },

  // Hero card
  heroCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    overflow: 'hidden',
    height: 350,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Side-by-side row
  row: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  squareCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },

  cardLabel: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  wrappedBadge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 10,
  },
  wrappedBadgeText: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.inkFaint,
    letterSpacing: 1,
  },
  insightLine: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.ink,
    lineHeight: 20,
    marginBottom: 4,
  },

  // Portrait
  portraitDimension: {
    fontFamily: F.serifSemi,
    fontSize: 20,
    color: C.ink,
    marginBottom: 6,
  },
  portraitDescription: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.inkFaint,
    lineHeight: 20,
  },
});
