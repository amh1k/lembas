import type { Card, ReviewResult } from "../types.js";
export function calculateNextReview(card: Card, quality: number): ReviewResult {
  let { easiness_factor, interval, repetitions } = card;

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easiness_factor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easiness_factor =
    easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easiness_factor < 1.3) easiness_factor = 1.3;

  const nextDueDate = new Date();
  nextDueDate.setUTCDate(nextDueDate.getUTCDate() + interval);

  return {
    easiness_factor,
    interval,
    repetitions,
    due_date: nextDueDate.toISOString(),
  };
}
