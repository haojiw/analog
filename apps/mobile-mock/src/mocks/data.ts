export type MockEntry = {
  id: string;
  type: 'audio' | 'text';
  durationMs: number;
  transcript: string | null;
};

export type MockLog = {
  id: string;
  createdAt: Date;
  entries: MockEntry[];
};

// Base reference: 2026-03-11 (today per project context)
// Using hardcoded Date constructors so times are stable across renders
const TODAY = new Date(2026, 2, 11); // month is 0-indexed

function d(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export const mockLogs: MockLog[] = [
  // Today — 3 logs
  {
    id: 'log-001',
    createdAt: d(2026, 3, 11, 9, 41),
    entries: [{
      id: 'entry-001',
      type: 'audio',
      durationMs: 83000,
      transcript: 'Called mom this morning. She mentioned the garden is coming in early this year — apparently the tulips are already up. Made me realize I haven\'t been home since November.',
    }],
  },
  {
    id: 'log-002',
    createdAt: d(2026, 3, 11, 11, 15),
    entries: [{
      id: 'entry-002',
      type: 'audio',
      durationMs: 47000,
      transcript: 'Feeling stuck on the Q2 roadmap. Every path forward seems to require a decision we\'re not ready to make yet.',
    }],
  },
  {
    id: 'log-003',
    createdAt: d(2026, 3, 11, 14, 58),
    entries: [{
      id: 'entry-003',
      type: 'text',
      durationMs: 0,
      transcript: null,
    }],
  },

  // Yesterday — 3 logs
  {
    id: 'log-004',
    createdAt: d(2026, 3, 10, 8, 22),
    entries: [{
      id: 'entry-004',
      type: 'audio',
      durationMs: 112000,
      transcript: 'Had a long walk along the river. Kept thinking about the concept of drift — how most of life isn\'t chosen, just accumulated. Not sure if that\'s depressing or freeing.',
    }],
  },
  {
    id: 'log-005',
    createdAt: d(2026, 3, 10, 19, 33),
    entries: [{
      id: 'entry-005',
      type: 'audio',
      durationMs: 29000,
      transcript: null,
    }],
  },
  {
    id: 'log-006',
    createdAt: d(2026, 3, 10, 22, 7),
    entries: [{
      id: 'entry-006',
      type: 'audio',
      durationMs: 64000,
      transcript: 'The dinner with Sarah and Marcus went better than expected. Marcus is clearly going through something — quieter than usual, kept checking his phone.',
    }],
  },

  // 2 days ago — 2 logs
  {
    id: 'log-007',
    createdAt: d(2026, 3, 9, 7, 5),
    entries: [{
      id: 'entry-007',
      type: 'audio',
      durationMs: 38000,
      transcript: 'Woke up with a clear sense of what I actually want from the next six months. Three things: finish the side project, get back to running, call people more.',
    }],
  },
  {
    id: 'log-008',
    createdAt: d(2026, 3, 9, 16, 44),
    entries: [{
      id: 'entry-008',
      type: 'text',
      durationMs: 0,
      transcript: 'The anxiety isn\'t about failure. It\'s about being seen trying and still not getting there.',
    }],
  },

  // ~5 days ago — 4 logs
  {
    id: 'log-009',
    createdAt: d(2026, 3, 6, 9, 18),
    entries: [{
      id: 'entry-009',
      type: 'audio',
      durationMs: 95000,
      transcript: 'Listened to that album again on the commute. Some records just belong to a specific version of yourself. I\'m not that person anymore but it doesn\'t feel like loss.',
    }],
  },
  {
    id: 'log-010',
    createdAt: d(2026, 3, 6, 12, 51),
    entries: [{
      id: 'entry-010',
      type: 'audio',
      durationMs: 21000,
      transcript: null,
    }],
  },
  {
    id: 'log-011',
    createdAt: d(2026, 3, 6, 15, 30),
    entries: [{
      id: 'entry-011',
      type: 'audio',
      durationMs: 73000,
      transcript: 'Team retro went sideways. People are saying the right things but nobody is saying the real thing. I need to figure out how to open that up without it becoming an ambush.',
    }],
  },
  {
    id: 'log-012',
    createdAt: d(2026, 3, 6, 21, 9),
    entries: [{
      id: 'entry-012',
      type: 'audio',
      durationMs: 57000,
      transcript: 'Thinking about travel again. Somewhere without good wifi. A week of being unreachable feels like a fantasy at this point.',
    }],
  },
];

// Exported for reference — today is 2026-03-11
export const MOCK_TODAY = TODAY;
