export interface Deck {
  id: number;
  name: string;
  created_at: string;
}

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  easiness_factor: number;
  interval: number;
  repetitions: number;
  due_date: string;
  created_at: string;
}

export interface ReviewResult {
  easiness_factor: number;
  interval: number;
  repetitions: number;
  due_date: string;
}
