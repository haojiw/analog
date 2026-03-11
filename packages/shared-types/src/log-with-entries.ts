import type { Log } from './log';
import type { Entry } from './entry';

export interface LogWithEntries extends Log {
  entries: Entry[];
}
