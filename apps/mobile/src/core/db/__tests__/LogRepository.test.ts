import * as SQLite from 'expo-sqlite';
import { runMigrations } from '../db';
import { insertLog, getLogById, getAllLogs, deleteLog } from '../LogRepository';

async function setupDb() {
  const db = await SQLite.openDatabaseAsync(':memory:');
  await runMigrations(db);
  return db;
}

describe('LogRepository', () => {
  it('insert → getById roundtrip', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    const fetched = await getLogById(db, log.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(log.id);
    expect(fetched!.user_id).toBeNull();
    expect(fetched!.created_at).toBe(log.created_at);
  });

  it('getById returns null for missing id', async () => {
    const db = await setupDb();
    const result = await getLogById(db, 'nonexistent');
    expect(result).toBeNull();
  });

  it('getAll returns results ordered by created_at DESC', async () => {
    const db = await setupDb();
    const a = await insertLog(db, { user_id: null });
    // ensure different timestamps
    await new Promise((r) => setTimeout(r, 2));
    const b = await insertLog(db, { user_id: null });

    const all = await getAllLogs(db, 10, 0);
    expect(all[0].id).toBe(b.id);
    expect(all[1].id).toBe(a.id);
  });

  it('getAll pagination (limit/offset)', async () => {
    const db = await setupDb();
    await insertLog(db, { user_id: null });
    await insertLog(db, { user_id: null });
    await insertLog(db, { user_id: null });

    const page1 = await getAllLogs(db, 2, 0);
    const page2 = await getAllLogs(db, 2, 2);
    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(1);
  });

  it('delete removes the log', async () => {
    const db = await setupDb();
    const log = await insertLog(db, { user_id: null });
    await deleteLog(db, log.id);
    const fetched = await getLogById(db, log.id);
    expect(fetched).toBeNull();
  });
});
