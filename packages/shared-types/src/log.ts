export interface Log {
  id: string;
  user_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface NewLog {
  user_id: string | null;
}
