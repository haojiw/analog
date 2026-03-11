import * as SQLite from 'expo-sqlite';
import { runMigrations } from '../db';
import { insertLog, deleteLog } from '../LogRepository';
import {
  insertEntry,
  getEntryById,
  getEntriesByLogId,
  updateEntryStep,
  updateEntryError,
  deleteEntry,
} from '../EntryRepository';

async function setupDb() {
  const db = await SQLite.openDatabaseAsync(':memory:');
  await runMigrations(db);
  return db;
}

describe('EntryRepository', () => {
  it('insert → getById roundtrip', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'text', text_content: 'hello' });
    const fetched = await getEntryById(db, entry.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(entry.id);
    expect(fetched!.text_content).toBe('hello');
    expect(fetched!.step).toBe('local');
    expect(fetched!.error).toBeNull();
    expect(fetched!.synced).toBe(false);
  });

  it('waveform JSON serialize/deserialize', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const waveform = [0.1, 0.5, 0.9, 0.3];
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'audio', waveform });
    const fetched = await getEntryById(db, entry.id);
    expect(fetched!.waveform).toEqual(waveform);
  });

  it('embedding JSON serialize/deserialize', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'text' });
    // embedding is not set at insert time; simulate a direct UPDATE for this test
    await db.runAsync('UPDATE entries SET embedding = ? WHERE id = ?', [JSON.stringify([0.1, 0.2]), entry.id]);
    const fetched = await getEntryById(db, entry.id);
    expect(fetched!.embedding).toEqual([0.1, 0.2]);
  });

  it('synced INTEGER ↔ boolean', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'text' });
    expect(entry.synced).toBe(false);
    // simulate sync
    await db.runAsync('UPDATE entries SET synced = 1 WHERE id = ?', [entry.id]);
    const fetched = await getEntryById(db, entry.id);
    expect(fetched!.synced).toBe(true);
  });

  it('getEntriesByLogId ordered by position ASC', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    await insertEntry(db, { log_id: log.id, position: 1, type: 'text' });
    await insertEntry(db, { log_id: log.id, position: 0, type: 'text' });
    const entries = await getEntriesByLogId(db, log.id);
    expect(entries[0].position).toBe(0);
    expect(entries[1].position).toBe(1);
  });

  it('updateEntryStep sets step and clears error when not passed', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'audio' });
    await updateEntryStep(db, entry.id, 'uploading');
    const fetched = await getEntryById(db, entry.id);
    expect(fetched!.step).toBe('uploading');
    expect(fetched!.error).toBeNull();
  });

  it('updateEntryStep with error sets both fields', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'audio' });
    await updateEntryStep(db, entry.id, 'done', 'upload_failed');
    const fetched = await getEntryById(db, entry.id);
    expect(fetched!.step).toBe('done');
    expect(fetched!.error).toBe('upload_failed');
  });

  it('updateEntryError sets error field', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'audio' });
    await updateEntryError(db, entry.id, 'transcription_failed');
    const fetched = await getEntryById(db, entry.id);
    expect(fetched!.error).toBe('transcription_failed');
  });

  it('deleting parent log cascades to entries', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'text' });
    await deleteLog(db, log.id);
    const fetched = await getEntryById(db, entry.id);
    expect(fetched).toBeNull();
  });

  it('deleteEntry removes only the entry', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const entry = await insertEntry(db, { log_id: log.id, position: 0, type: 'text' });
    await deleteEntry(db, entry.id);
    const fetched = await getEntryById(db, entry.id);
    expect(fetched).toBeNull();
  });
});
