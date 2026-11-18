import { Request, Response, NextFunction } from "express";
import Flashcard from "../models/Flashcard.js";
import { calculateSM2, ratingToQuality, isCardDue } from "../utils/sm2.js";

// @desc    Get all flashcards for a document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    // Get all flashcards for this document
    const flashcards = await Flashcard.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    const setsWithStats = flashcards.map((set) => {
      const setObj = set.toObject();
      const dueCount = (setObj.cards || []).filter((c: any) => isCardDue(c.nextReviewDate)).length;
      return {
        ...setObj,
        dueCount,
      };
    });

    res.status(200).json({
      success: true,
      count: setsWithStats.length,
      data: setsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flashcard sets for a user
// @route   GET /api/flashcards
// @access  Private
export const getAllFlashcardSets = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const flashcards = await Flashcard.find({
      userId: req.user._id,
    })
      .populate("documentId", "title")
      .populate("workspaceId", "title")
      .sort({ createdAt: -1 });

    const setsWithStats = flashcards.map((set) => {
      const setObj = set.toObject();
      const dueCount = (setObj.cards || []).filter((c: any) => isCardDue(c.nextReviewDate)).length;
      return {
        ...setObj,
        dueCount,
      };
    });

    res.status(200).json({
      success: true,
      count: setsWithStats.length,
      data: setsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark flashcards as reviewed
// @route   POST /api/flashcards/:cardId/review
// @access  Private
export const reviewFlashcard = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card: any) => card._id.toString() === req.params.cardId
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Card not found in set",
        statusCode: 404,
      });
    }

    const card = flashcardSet.cards[cardIndex];
    const { rating, quality } = req.body || {};

    let sm2Data;
    if (rating !== undefined || quality !== undefined) {
      const q = quality !== undefined ? Number(quality) : ratingToQuality(rating);
      sm2Data = calculateSM2(
        q,
        card.repetition || 0,
        card.interval || 0,
        card.easeFactor || 2.5
      );

      card.repetition = sm2Data.repetition;
      card.interval = sm2Data.interval;
      card.easeFactor = sm2Data.easeFactor;
      card.nextReviewDate = sm2Data.nextReviewDate;
    } else {
      // Default/simple review mode (legacy compatibility - treat as standard successful recall)
      sm2Data = calculateSM2(
        4,
        card.repetition || 0,
        card.interval || 0,
        card.easeFactor || 2.5
      );
      card.repetition = sm2Data.repetition;
      card.interval = sm2Data.interval;
      card.easeFactor = sm2Data.easeFactor;
      card.nextReviewDate = sm2Data.nextReviewDate;
    }

    // Update review timestamp and review count
    card.lastReviewed = new Date();
    card.reviewCount = (card.reviewCount || 0) + 1;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      card,
      sm2: sm2Data,
      message: "Flashcard reviewed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle star/favourite on a flashcard
// @route   PUT /api/flashcards/:cardId/star
// @access  Private
export const toggleStarFlashcard = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set or card not found",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card: any) => card._id.toString() === req.params.cardId
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Card not found",
        statusCode: 404,
      });
    }

    // Toggle star
    flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? "starred" : "unstarred"} successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a flashcard set
// @route   DELETE /api/flashcards/:cardId
// @access  Private
export const deleteFlashcardSet = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const flashcardSet = await Flashcard.findOne({
      _id: req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    await flashcardSet.deleteOne();

    res.status(200).json({
      success: true,
      message: "Flashcard set deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flashcards for a workspace
// @route   GET /api/flashcards/workspace/:workspaceId
// @access  Private
export const getWorkspaceFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const flashcards = await Flashcard.find({
      userId: req.user._id,
      workspaceId: req.params.workspaceId,
    })
      .populate("workspaceId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single flashcard set by set ID
// @route   GET /api/flashcards/set/:setId
// @access  Private
export const getFlashcardSetById = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const flashcardSet = await Flashcard.findOne({
      _id: req.params.setId,
      userId: req.user._id,
    })
      .populate("documentId", "title fileName")
      .populate("workspaceId", "title");

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    const setObj = flashcardSet.toObject();
    const dueCount = (setObj.cards || []).filter((c: any) => isCardDue(c.nextReviewDate)).length;

    res.status(200).json({
      success: true,
      data: {
        ...setObj,
        dueCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
