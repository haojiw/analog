/**
 * Jest mock for expo-sqlite using better-sqlite3.
 * Wraps the synchronous better-sqlite3 API in async methods matching
 * the expo-sqlite v16 interface used by our repositories.
 */
import Database from 'better-sqlite3';

class MockSQLiteDatabase {
  private db: Database.Database;

  constructor() {
    this.db = new Database(':memory:');
    this.db.pragma('foreign_keys = ON');
  }

  async getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null> {
    if (/^\s*PRAGMA\s+\w+\s*$/i.test(sql)) {
      const key = sql.trim().replace(/^\s*PRAGMA\s+/i, '');
      const result = this.db.pragma(key) as unknown[];
      return (result?.[0] as T) ?? null;
    }
    const stmt = this.db.prepare(sql);
    const result = params && params.length > 0 ? stmt.get(...(params as [])) : stmt.get();
    return (result as T) ?? null;
  }

  async getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    const result = params && params.length > 0 ? stmt.all(...(params as [])) : stmt.all();
    return result as T[];
  }

  async runAsync(sql: string, params?: unknown[]): Promise<void> {
    if (/^\s*PRAGMA\s+/i.test(sql)) {
      const pragma = sql.trim().replace(/^\s*PRAGMA\s+/i, '');
      this.db.pragma(pragma);
      return;
    }
    const stmt = this.db.prepare(sql);
    if (params && params.length > 0) {
      stmt.run(...(params as []));
    } else {
      stmt.run();
    }
  }

  async withExclusiveTransactionAsync(callback: () => Promise<void>): Promise<void> {
    await callback();
  }
}

export async function openDatabaseAsync(_name: string): Promise<MockSQLiteDatabase> {
  return new MockSQLiteDatabase();
}
