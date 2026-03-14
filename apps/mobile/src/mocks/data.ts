export type MockEntry = {
  id: string;
  type: 'audio' | 'text';
  durationMs: number;
  transcript: string | null;
};

export type MockLog = {
  id: string;
  title: string;
  createdAt: Date;
  entries: MockEntry[];
};

// Base reference: 2026-03-12 (today per project context)
// Using hardcoded Date constructors so times are stable across renders
const TODAY = new Date(2026, 2, 12); // month is 0-indexed

function d(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export const mockLogs: MockLog[] = [
  // Today — 3 logs
  {
    id: 'log-001',
    title: 'Called mom',
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
    title: 'Q2 roadmap',
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
    title: 'Untitled',
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
    title: 'Long walk',
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
    title: 'Untitled',
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
    title: 'Dinner with Sarah & Marcus',
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
    title: 'Next six months',
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
    title: 'Anxiety isn\'t about failure',
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
    title: 'That album',
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
    title: 'Untitled',
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
    title: 'Team retro',
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
    title: 'Thinking about travel',
    createdAt: d(2026, 3, 6, 21, 9),
    entries: [{
      id: 'entry-012',
      type: 'audio',
      durationMs: 57000,
      transcript: 'Thinking about travel again. Somewhere without good wifi. A week of being unreachable feels like a fantasy at this point.',
    }],
  },

  // February 28 — 2 logs
  {
    id: 'log-013',
    title: 'Last day of the month',
    createdAt: d(2026, 2, 28, 8, 14),
    entries: [{
      id: 'entry-013',
      type: 'audio',
      durationMs: 66000,
      transcript: 'Last day of February. Strange how months feel like chapters even when nothing actually changes at the boundary.',
    }],
  },
  {
    id: 'log-014',
    title: 'Conversation with David',
    createdAt: d(2026, 2, 28, 20, 45),
    entries: [{
      id: 'entry-014',
      type: 'audio',
      durationMs: 134000,
      transcript: 'Long call with David tonight. He\'s leaving his job in April. Made me think about my own restlessness — whether I\'m staying because I want to or because leaving feels too abstract.',
    }],
  },

  // February 24 — 3 logs
  {
    id: 'log-015',
    title: 'Morning run thoughts',
    createdAt: d(2026, 2, 24, 7, 31),
    entries: [{
      id: 'entry-015',
      type: 'audio',
      durationMs: 44000,
      transcript: 'Back to running after two weeks off. The first ten minutes were punishment. Then something unlocked and I couldn\'t stop thinking about the project again.',
    }],
  },
  {
    id: 'log-016',
    title: 'Reading notes',
    createdAt: d(2026, 2, 24, 13, 22),
    entries: [{
      id: 'entry-016',
      type: 'text',
      durationMs: 0,
      transcript: 'The author argues that boredom is the precondition for original thought. I want to disagree but I can\'t.',
    }],
  },
  {
    id: 'log-017',
    title: 'Untitled',
    createdAt: d(2026, 2, 24, 23, 5),
    entries: [{
      id: 'entry-017',
      type: 'audio',
      durationMs: 18000,
      transcript: null,
    }],
  },

  // February 18 — 2 logs
  {
    id: 'log-018',
    title: 'Clarity about the product',
    createdAt: d(2026, 2, 18, 10, 7),
    entries: [{
      id: 'entry-018',
      type: 'audio',
      durationMs: 91000,
      transcript: 'Suddenly clear on what the product needs to be. It\'s not a productivity tool. It\'s a memory tool. The whole framing has been slightly off and I didn\'t see it until today.',
    }],
  },
  {
    id: 'log-019',
    title: 'Weather and mood',
    createdAt: d(2026, 2, 18, 17, 50),
    entries: [{
      id: 'entry-019',
      type: 'audio',
      durationMs: 33000,
      transcript: 'It\'s been overcast for nine days straight. I notice it in my mood even when I don\'t notice it consciously.',
    }],
  },

  // February 12 — 2 logs
  {
    id: 'log-020',
    title: 'Dream about the old apartment',
    createdAt: d(2026, 2, 12, 6, 48),
    entries: [{
      id: 'entry-020',
      type: 'audio',
      durationMs: 52000,
      transcript: 'Dreamed about the old apartment on Clement Street. Everything was the same except the light was wrong — too yellow, too late in the day. Woke up homesick for something I can\'t name.',
    }],
  },
  {
    id: 'log-021',
    title: 'What I actually want',
    createdAt: d(2026, 2, 12, 21, 19),
    entries: [{
      id: 'entry-021',
      type: 'text',
      durationMs: 0,
      transcript: 'To build something that lasts. To be present. To stop performing productivity and actually do the work.',
    }],
  },

  // February 3 — 1 log
  {
    id: 'log-022',
    title: 'New month intentions',
    createdAt: d(2026, 2, 3, 9, 0),
    entries: [{
      id: 'entry-022',
      type: 'audio',
      durationMs: 77000,
      transcript: 'Starting February with some intention. Not resolutions — just a direction. I want to be more honest in my recordings. Less performed, more raw.',
    }],
  },
];

// Exported for reference — today is 2026-03-11
export const MOCK_TODAY = TODAY;
