import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '../../src/theme/tokens';

const C = theme.colors;
const F = theme.fonts;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const GRAPH_HEIGHT = SCREEN_HEIGHT * 0.48;

// ---------------------------------------------------------------------------
// Graph data
// ---------------------------------------------------------------------------

type GraphNode = {
  id: string;
  label: string;
  x: number; // 0–1 relative to graph width
  y: number; // 0–1 relative to graph height
  weight: number; // 0–1
};

type GraphEdge = {
  from: string;
  to: string;
};

const NODES: GraphNode[] = [
  { id: 'work',          label: 'work',          x: 0.50, y: 0.25, weight: 1.0  },
  { id: 'family',        label: 'family',        x: 0.25, y: 0.55, weight: 0.8  },
  { id: 'creativity',    label: 'creativity',    x: 0.72, y: 0.55, weight: 0.6  },
  { id: 'anxiety',       label: 'anxiety',       x: 0.38, y: 0.78, weight: 0.5  },
  { id: 'travel',        label: 'travel',        x: 0.65, y: 0.80, weight: 0.4  },
  { id: 'identity',      label: 'identity',      x: 0.15, y: 0.35, weight: 0.45 },
  { id: 'relationships', label: 'relationships', x: 0.82, y: 0.32, weight: 0.55 },
  { id: 'health',        label: 'health',        x: 0.20, y: 0.72, weight: 0.35 },
  { id: 'growth',        label: 'growth',        x: 0.60, y: 0.42, weight: 0.65 },
];

const EDGES: GraphEdge[] = [
  { from: 'work',          to: 'growth'        },
  { from: 'work',          to: 'anxiety'       },
  { from: 'family',        to: 'relationships' },
  { from: 'family',        to: 'health'        },
  { from: 'creativity',    to: 'growth'        },
  { from: 'identity',      to: 'anxiety'       },
  { from: 'identity',      to: 'family'        },
  { from: 'travel',        to: 'creativity'    },
  { from: 'relationships', to: 'growth'        },
];

// ---------------------------------------------------------------------------
// KnowledgeGraph
// ---------------------------------------------------------------------------

type KnowledgeGraphProps = {
  width: number;
  height: number;
};

function KnowledgeGraph({ width, height }: KnowledgeGraphProps) {
  const nodeMap = new Map<string, GraphNode>(NODES.map((n) => [n.id, n]));

  return (
    <Svg width={width} height={height}>
      {/* Edges */}
      {EDGES.map((edge) => {
        const a = nodeMap.get(edge.from);
        const b = nodeMap.get(edge.to);
        if (!a || !b) return null;
        return (
          <Line
            key={`${edge.from}-${edge.to}`}
            x1={a.x * width}
            y1={a.y * height}
            x2={b.x * width}
            y2={b.y * height}
            stroke={C.border}
            strokeWidth={1}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map((node) => {
        const cx = node.x * width;
        const cy = node.y * height;
        const r = 8 + node.weight * 14;
        // Opacity range: weight * 0.7 + 0.2 → [0.445, 0.9]
        const opacity = node.weight * 0.7 + 0.2;

        return (
          <React.Fragment key={node.id}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill={C.accent}
              opacity={opacity}
            />
            <SvgText
              x={cx}
              y={cy + r + 12}
              textAnchor="middle"
              fontFamily={F.body}
              fontSize={10}
              fill={C.inkFaint}
            >
              {node.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// InsightCard
// ---------------------------------------------------------------------------

type InsightCardProps = {
  children: React.ReactNode;
};

function InsightCard({ children }: InsightCardProps) {
  return <View style={s.card}>{children}</View>;
}

// ---------------------------------------------------------------------------
// MindScreen
// ---------------------------------------------------------------------------

export default function MindScreen() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Fixed knowledge graph */}
      <View style={[s.graphContainer, { height: GRAPH_HEIGHT }]}>
        <KnowledgeGraph width={width} height={GRAPH_HEIGHT} />
      </View>

      {/* Scrollable cards */}
      <ScrollView
        style={s.cardsScroll}
        contentContainerStyle={s.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Wrapped */}
        <InsightCard>
          <View style={s.cardHeader}>
            <Text style={s.cardLabel}>MARCH 2026</Text>
            <View style={s.wrappedBadge}>
              <Text style={s.wrappedBadgeText}>WRAPPED</Text>
            </View>
          </View>
          <Text style={s.insightLine}>You recorded 23 entries this month.</Text>
          <Text style={s.insightLine}>Most active on Tuesday mornings.</Text>
          <Text style={s.insightLine}>
            Recurring theme: navigating uncertainty at work.
          </Text>
        </InsightCard>

        {/* Portrait */}
        <InsightCard>
          <Text style={s.cardLabel}>PORTRAIT</Text>
          <Text style={s.portraitDimension}>analytical thinker</Text>
          <Text style={s.portraitDescription}>
            You tend to approach problems by mapping the structure before acting.
          </Text>
        </InsightCard>
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

  // Graph
  graphContainer: {
    overflow: 'hidden',
  },

  // Cards scroll
  cardsScroll: {
    flex: 1,
  },
  cardsContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
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
