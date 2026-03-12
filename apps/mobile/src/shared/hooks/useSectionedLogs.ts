import { useMemo } from 'react';

// Minimal shape required for sectioning — matches the real Log type from the DB layer
export type SectionableLog = {
  id: string;
  createdAt: Date;
  [key: string]: unknown;
};

export type LogSection = {
  title: string;
  data: SectionableLog[];
};

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / msPerDay);
}

function bucketTitle(log: SectionableLog, now: Date): string {
  const diff = diffDays(now, log.createdAt);

  if (diff === 0) return 'TODAY';
  if (diff === 1) return 'YESTERDAY';

  if (diff <= 6) {
    const dayName = DAY_NAMES[log.createdAt.getDay()];
    const month = MONTHS[log.createdAt.getMonth()];
    const date = log.createdAt.getDate();
    return `${dayName} ${month} ${date}`;
  }

  const month = MONTHS[log.createdAt.getMonth()];
  return `${month} ${log.createdAt.getDate()}`;
}

export function useSectionedLogs(logs: SectionableLog[], now: Date): LogSection[] {
  return useMemo(() => {
    const bucketMap = new Map<string, SectionableLog[]>();
    const bucketOrder: string[] = [];

    for (const log of logs) {
      const title = bucketTitle(log, now);
      if (!bucketMap.has(title)) {
        bucketMap.set(title, []);
        bucketOrder.push(title);
      }
      bucketMap.get(title)!.push(log);
    }

    return bucketOrder.map((title) => ({
      title,
      data: bucketMap.get(title)!,
    }));
  }, [logs, now]);
}
