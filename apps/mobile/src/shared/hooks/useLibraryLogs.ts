import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getDb } from '../../core/db/db';
import { getAllLogs } from '../../core/db/LogRepository';
import { getEntriesByLogId } from '../../core/db/EntryRepository';

export type LibraryEntry = {
  id: string;
  type: 'audio' | 'text';
  durationMs: number;
  transcript: string | null;
};

export type LibraryLog = {
  id: string;
  title: string;
  createdAt: Date;
  entries: LibraryEntry[];
};

export function useLibraryLogs() {
  const [logs, setLogs] = useState<LibraryLog[]>([]);

  const load = useCallback(async () => {
    const db = await getDb();
    const rawLogs = await getAllLogs(db, 100, 0);
    const result: LibraryLog[] = [];

    for (const log of rawLogs) {
      const entries = await getEntriesByLogId(db, log.id);
      result.push({
        id: log.id,
        title: entries[0]?.formatted_text?.slice(0, 50) ?? 'Untitled',
        createdAt: new Date(log.created_at),
        entries: entries.map(e => ({
          id: e.id,
          type: e.type,
          durationMs: e.duration_ms ?? 0,
          transcript: e.raw_transcript,
        })),
      });
    }

    setLogs(result);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return { logs };
}
