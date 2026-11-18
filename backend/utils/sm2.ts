/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation
 * Based on Piotr Wozniak's SM-2 algorithm:
 * - quality: 0 (blackout) to 5 (perfect recall)
 * - repetition: consecutive successful recall count
 * - interval: interval in days until next review
 * - easeFactor: multiplier for interval growth (default 2.5, min 1.3)
 */

export interface SM2Result {
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

export type ReviewRating = "again" | "hard" | "good" | "easy";

/**
 * Maps standard 4-button study rating to SM-2 quality (0..5)
 */
export const ratingToQuality = (rating: string | number): number => {
  if (typeof rating === "number") {
    return Math.max(0, Math.min(5, Math.round(rating)));
  }

  switch (rating.toLowerCase()) {
    case "again":
      return 1; // Complete blackout / failed recall
    case "hard":
      return 3; // Recalled with significant effort
    case "good":
      return 4; // Recalled after a brief hesitation
    case "easy":
      return 5; // Instant, effortless recall
    default:
      return 4;
  }
};

/**
 * Calculates interval preview text for UI display (e.g. "< 1d", "1d", "6d", "15d")
 */
export const calculateIntervalPreview = (
  rating: ReviewRating | number,
  repetition = 0,
  interval = 0,
  easeFactor = 2.5
): string => {
  const quality = ratingToQuality(rating);
  const result = calculateSM2(quality, repetition, interval, easeFactor);
  if (result.interval <= 1) {
    return quality < 3 ? "< 1d" : "1d";
  }
  return `${result.interval}d`;
};

/**
 * Core SM-2 Calculation
 */
export const calculateSM2 = (
  quality: number,
  prevRepetition = 0,
  prevInterval = 0,
  prevEaseFactor = 2.5
): SM2Result => {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let repetition = Math.max(0, prevRepetition || 0);
  let interval = Math.max(0, prevInterval || 0);
  let easeFactor = prevEaseFactor && prevEaseFactor >= 1.3 ? prevEaseFactor : 2.5;

  if (q < 3) {
    // Incorrect recall: reset streak back to 0, review again tomorrow (or later today)
    repetition = 0;
    interval = 1;
  } else {
    // Successful recall: advance interval progression
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
      if (interval < 1) interval = 1;
    }
    repetition += 1;
  }

  // Calculate ease factor adjustment:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = easeFactor + delta;

  // Ease factor minimum bound is 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Round easeFactor to 2 decimal places
  easeFactor = Math.round(easeFactor * 100) / 100;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    repetition,
    interval,
    easeFactor,
    nextReviewDate,
  };
};

/**
 * Checks whether a card is currently due for review
 */
export const isCardDue = (nextReviewDate?: Date | string | null): boolean => {
  if (!nextReviewDate) {
    // New cards that haven't been scheduled are due by default
    return true;
  }
  return new Date(nextReviewDate).getTime() <= Date.now();
};
