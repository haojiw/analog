import * as SQLite from 'expo-sqlite';
import { runMigrations } from '../db';

async function openMemoryDb() {
  return SQLite.openDatabaseAsync(':memory:');
}

describe('runMigrations', () => {
  it('applies migration on fresh db (version 0 → 1)', async () => {
    const db = await openMemoryDb();
    await runMigrations(db);

    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(version?.user_version).toBe(1);

    // both tables exist
    const logsTable = await db.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='logs'"
    );
    expect(logsTable).not.toBeNull();

    const entriesTable = await db.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='entries'"
    );
    expect(entriesTable).not.toBeNull();
  });

  it('is a no-op on second run (version stays 1)', async () => {
    const db = await openMemoryDb();
    await runMigrations(db);
    await runMigrations(db); // second call

    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(version?.user_version).toBe(1);
  });
});
