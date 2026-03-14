import * as SQLite from 'expo-sqlite';
import type { Entry, NewEntry, EntryStep, EntryError } from '@analog/shared-types';
import { generateUUID } from '../../shared/utils/uuid';

type EntryRow = {
  id: string;
  log_id: string;
  position: number;
  type: string;
  audio_url: string | null;
  duration_ms: number | null;
  waveform: string | null;
  raw_transcript: string | null;
  formatted_text: string | null;
  summary: string | null;
  embedding: string | null;
  step: string;
  error: string | null;
  text_content: string | null;
  synced: number;
  created_at: number;
  updated_at: number;
};

function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    log_id: row.log_id,
    position: row.position,
    type: row.type as Entry['type'],
    step: row.step as EntryStep,
    error: row.error as EntryError | null,
    audio_url: row.audio_url,
    duration_ms: row.duration_ms,
    waveform: row.waveform ? JSON.parse(row.waveform) : null,
    raw_transcript: row.raw_transcript,
    formatted_text: row.formatted_text,
    summary: row.summary,
    text_content: row.text_content,
    embedding: row.embedding ? JSON.parse(row.embedding) : null,
    synced: row.synced === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function insertEntry(
  db: SQLite.SQLiteDatabase,
  newEntry: NewEntry
): Promise<Entry> {
  const id = generateUUID();
  const now = Date.now();
  const step: EntryStep = 'local';
  await db.runAsync(
    `INSERT INTO entries (
      id, log_id, position, type,
      audio_url, duration_ms, waveform, text_content,
      step, error, synced, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      newEntry.log_id,
      newEntry.position,
      newEntry.type,
      newEntry.audio_url ?? null,
      newEntry.duration_ms ?? null,
      newEntry.waveform ? JSON.stringify(newEntry.waveform) : null,
      newEntry.text_content ?? null,
      step,
      null,
      0,
      now,
      now,
    ]
  );
  return {
    id,
    log_id: newEntry.log_id,
    position: newEntry.position,
    type: newEntry.type,
    step,
    error: null,
    audio_url: newEntry.audio_url ?? null,
    duration_ms: newEntry.duration_ms ?? null,
    waveform: newEntry.waveform ?? null,
    raw_transcript: null,
    formatted_text: null,
    summary: null,
    text_content: newEntry.text_content ?? null,
    embedding: null,
    synced: false,
    created_at: now,
    updated_at: now,
  };
}

export async function getEntryById(
  db: SQLite.SQLiteDatabase,
  id: string
): Promise<Entry | null> {
  const row = await db.getFirstAsync<EntryRow>('SELECT * FROM entries WHERE id = ?', [id]);
  return row ? rowToEntry(row) : null;
}

export async function getEntriesByLogId(
  db: SQLite.SQLiteDatabase,
  logId: string
): Promise<Entry[]> {
  const rows = await db.getAllAsync<EntryRow>(
    'SELECT * FROM entries WHERE log_id = ? ORDER BY position ASC',
    [logId]
  );
  return rows.map(rowToEntry);
}

export async function updateEntryStep(
  db: SQLite.SQLiteDatabase,
  id: string,
  step: EntryStep,
  error?: EntryError
): Promise<void> {
  await db.runAsync(
    'UPDATE entries SET step = ?, error = ?, updated_at = ? WHERE id = ?',
    [step, error ?? null, Date.now(), id]
  );
}

export async function updateEntryError(
  db: SQLite.SQLiteDatabase,
  id: string,
  error: EntryError
): Promise<void> {
  await db.runAsync(
    'UPDATE entries SET error = ?, updated_at = ? WHERE id = ?',
    [error, Date.now(), id]
  );
}

export async function deleteEntry(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
}
