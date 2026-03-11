export const migration001 = {
  version: 1,
  up: [
    `CREATE TABLE IF NOT EXISTS logs (
      id          TEXT PRIMARY KEY,
      user_id     TEXT,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS entries (
      id              TEXT PRIMARY KEY,
      log_id          TEXT NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
      position        INTEGER NOT NULL,
      type            TEXT NOT NULL,
      audio_url       TEXT,
      duration_ms     INTEGER,
      waveform        TEXT,
      raw_transcript  TEXT,
      formatted_text  TEXT,
      summary         TEXT,
      embedding       TEXT,
      step            TEXT NOT NULL DEFAULT 'local',
      error           TEXT,
      text_content    TEXT,
      synced          INTEGER NOT NULL DEFAULT 0,
      created_at      INTEGER NOT NULL,
      updated_at      INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_entries_log_id ON entries(log_id)`,
    `CREATE INDEX IF NOT EXISTS idx_entries_step ON entries(step)`,
    `CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC)`,
  ],
};
