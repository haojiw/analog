import * as SQLite from 'expo-sqlite';
import type { Log, NewLog } from '@analog/shared-types';
import { generateUUID } from '../../shared/utils/uuid';

type LogRow = {
  id: string;
  user_id: string | null;
  created_at: number;
  updated_at: number;
};

function rowToLog(row: LogRow): Log {
  return {
    id: row.id,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function insertLog(db: SQLite.SQLiteDatabase, newLog: NewLog): Promise<Log> {
  const id = generateUUID();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO logs (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
    [id, newLog.user_id, now, now]
  );
  return { id, user_id: newLog.user_id, created_at: now, updated_at: now };
}

export async function getLogById(db: SQLite.SQLiteDatabase, id: string): Promise<Log | null> {
  const row = await db.getFirstAsync<LogRow>('SELECT * FROM logs WHERE id = ?', [id]);
  return row ? rowToLog(row) : null;
}

export async function getAllLogs(
  db: SQLite.SQLiteDatabase,
  limit: number,
  offset: number
): Promise<Log[]> {
  const rows = await db.getAllAsync<LogRow>(
    'SELECT * FROM logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows.map(rowToLog);
}

export async function deleteLog(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM logs WHERE id = ?', [id]);
}
