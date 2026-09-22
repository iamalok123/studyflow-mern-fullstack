import { Request, Response, NextFunction } from "express";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

/**
 * Calculates continuous study streak in days.
 * If the user has studied today, the streak counts today and consecutive past days.
 * If the user has NOT studied yet today, but studied yesterday, the streak is kept active
 * and counts yesterday and consecutive past days (preserving the streak before today's first session).
 * If the user did not study today or yesterday, streak is 0.
 */
export const calculateStudyStreak = (
  activityDates: Set<string>,
  referenceDate: Date = new Date()
): number => {
  const today = new Date(referenceDate);
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let cursor: Date;
  if (activityDates.has(todayStr)) {
    cursor = new Date(today);
  } else if (activityDates.has(yesterdayStr)) {
    cursor = new Date(yesterday);
  } else {
    return 0;
  }

  let streak = 0;
  while (activityDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
};

// @desc    Get user dashboard with progress statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async ( req: Request, res: Response, next: NextFunction ): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const userId = req.user._id;

    // Run all independent queries in parallel for faster response
    const [
      totalDocuments,
      totalFlashcardSets,
      totalQuizzes,
      completedQuizzes,
      flashcardSets,
      completedQuizList,
      recentDocuments,
      allDocumentDates,
      recentQuizzes,
    ] = await Promise.all([
      Document.countDocuments({ userId }),
      Flashcard.countDocuments({ userId }),
      Quiz.countDocuments({ userId }),
      Quiz.countDocuments({ userId, completedAt: { $ne: null } }),
      Flashcard.find({ userId }).select("cards.reviewCount cards.isStarred cards.lastReviewed"),
      Quiz.find({ userId, completedAt: { $ne: null } }).select("score completedAt"),
      Document.find({ userId })
        .sort({ lastAccessed: -1 })
        .limit(5)
        .select("title fileName lastAccessed status"),
      Document.find({ userId, lastAccessed: { $ne: null } }).select("lastAccessed"),
      Quiz.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("documentId", "title")
        .select("title score totalQuestions completedAt createdAt"),
    ]);

    // Calculate flashcard statistics from already-fetched data
    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter((card) => card.reviewCount > 0).length;
      starredFlashcards += set.cards.filter((card) => card.isStarred).length;
    });

    // Calculate average quiz score from already-fetched data
    const averageScore =
      completedQuizList.length > 0
        ? Math.round(
            completedQuizList.reduce((sum, quiz) => sum + quiz.score, 0) /
              completedQuizList.length
          )
        : 0;

    const activityDates = new Set<string>();
    const addActivityDate = (date: Date | string | null | undefined) => {
      if (!date) return;
      activityDates.add(new Date(date).toISOString().slice(0, 10));
    };

    allDocumentDates.forEach((doc) => {
      addActivityDate(doc.lastAccessed);
    });
    completedQuizList.forEach((quiz) => {
      addActivityDate(quiz.completedAt);
    });
    flashcardSets.forEach((set) => {
      set.cards.forEach((card) => {
        addActivityDate(card.lastReviewed);
      });
    });

    const studyStreak = calculateStudyStreak(activityDates);

    res.json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
