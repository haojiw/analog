export type ProcessingStatus = 'uploaded' | 'processing' | 'done' | 'failed';

export interface Entry {
  id: string;
  user_id: string;
  created_at: string;
  audio_url: string | null;
  transcript_raw: string | null;
  transcript_polished: string | null;
  duration_seconds: number | null;
  status: ProcessingStatus;
}
