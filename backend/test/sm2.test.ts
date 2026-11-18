import { describe, it, expect } from "vitest";
import { calculateSM2, ratingToQuality, calculateIntervalPreview, isCardDue } from "../utils/sm2.js";

describe("SM-2 Spaced Repetition Algorithm Unit Tests", () => {
  describe("ratingToQuality mapping", () => {
    it("should correctly map textual ratings to SM-2 quality grades", () => {
      expect(ratingToQuality("again")).toBe(1);
      expect(ratingToQuality("hard")).toBe(3);
      expect(ratingToQuality("good")).toBe(4);
      expect(ratingToQuality("easy")).toBe(5);
      expect(ratingToQuality("AGAIN")).toBe(1);
    });

    it("should clamp numeric ratings to 0-5", () => {
      expect(ratingToQuality(5)).toBe(5);
      expect(ratingToQuality(0)).toBe(0);
      expect(ratingToQuality(10)).toBe(5);
      expect(ratingToQuality(-2)).toBe(0);
    });
  });

  describe("calculateSM2 math", () => {
    it("should reset interval to 1 and repetition to 0 on failed recall ('again')", () => {
      const result = calculateSM2(1, 4, 15, 2.5);
      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.nextReviewDate).toBeInstanceOf(Date);
    });

    it("should advance first successful review (repetition 0 -> 1) with interval 1", () => {
      const result = calculateSM2(4, 0, 0, 2.5);
      expect(result.repetition).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should advance second successful review (repetition 1 -> 2) with interval 6", () => {
      const result = calculateSM2(4, 1, 1, 2.5);
      expect(result.repetition).toBe(2);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should multiply interval by ease factor on third review (repetition 2 -> 3)", () => {
      const result = calculateSM2(4, 2, 6, 2.5);
      expect(result.repetition).toBe(3);
      expect(result.interval).toBe(15); // Math.round(6 * 2.5) = 15
      expect(result.easeFactor).toBe(2.5);
    });

    it("should increase ease factor on effortless recall ('easy')", () => {
      const result = calculateSM2(5, 2, 6, 2.5);
      expect(result.repetition).toBe(3);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it("should decrease ease factor on difficult recall ('hard') without dropping below 1.3", () => {
      let ef = 2.5;
      for (let i = 0; i < 15; i++) {
        const result = calculateSM2(3, 1, 1, ef);
        ef = result.easeFactor;
      }
      expect(ef).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("calculateIntervalPreview", () => {
    it("should format preview text accurately", () => {
      expect(calculateIntervalPreview("again", 2, 6, 2.5)).toBe("< 1d");
      expect(calculateIntervalPreview("hard", 0, 0, 2.5)).toBe("1d");
      expect(calculateIntervalPreview("good", 1, 1, 2.5)).toBe("6d");
      expect(calculateIntervalPreview("good", 2, 6, 2.5)).toBe("15d");
    });
  });

  describe("isCardDue", () => {
    it("should consider unreviewed/unscheduled cards as due", () => {
      expect(isCardDue(null)).toBe(true);
      expect(isCardDue(undefined)).toBe(true);
    });

    it("should consider past nextReviewDate as due", () => {
      const past = new Date(Date.now() - 3600 * 1000);
      expect(isCardDue(past)).toBe(true);
    });

    it("should consider future nextReviewDate as not due", () => {
      const future = new Date(Date.now() + 24 * 3600 * 1000);
      expect(isCardDue(future)).toBe(false);
    });
  });
});
