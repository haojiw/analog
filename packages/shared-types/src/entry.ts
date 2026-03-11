export type EntryType = 'audio' | 'text';

export type EntryStep =
  | 'local'
  | 'uploading'
  | 'uploaded'
  | 'transcribing'
  | 'refining'
  | 'done';

export type EntryError =
  | 'upload_failed'
  | 'transcription_failed'
  | 'refining_failed';

export interface Entry {
  id: string;
  log_id: string;
  position: number;

  type: EntryType;
  step: EntryStep;
  error: EntryError | null;

  // audio only
  audio_url: string | null;
  duration_ms: number | null;
  waveform: number[] | null;

  // transcription (audio only)
  raw_transcript: string | null;
  formatted_text: string | null;
  summary: string | null;

  // text only
  text_content: string | null;

  // Phase 2
  embedding: number[] | null;

  synced: boolean;
  created_at: number;
  updated_at: number;
}

export interface NewEntry {
  log_id: string;
  position: number;
  type: EntryType;
  audio_url?: string;
  duration_ms?: number;
  waveform?: number[];
  text_content?: string;
}
