import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

// @desc    Get user dashboard with progress statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
    try {
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
            recentQuizzes
        ] = await Promise.all([
            Document.countDocuments({ userId }),
            Flashcard.countDocuments({ userId }),
            Quiz.countDocuments({ userId }),
            Quiz.countDocuments({ userId, completedAt: { $ne: null } }),
            Flashcard.find({ userId }).select('cards.reviewCount cards.isStarred'),
            Quiz.find({ userId, completedAt: { $ne: null } }).select('score completedAt'),
            Document.find({ userId })
                .sort({ lastAccessed: -1 })
                .limit(5)
                .select('title fileName lastAccessed status'),
            Quiz.find({ userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('documentId', 'title')
                .select('title score totalQuestions completedAt createdAt'),
        ]);

        // Calculate flashcard statistics from already-fetched data
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(card => card.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(card => card.isStarred).length;
        });

        // Calculate average quiz score from already-fetched data
        const averageScore = completedQuizList.length > 0
            ? Math.round(completedQuizList.reduce((sum, quiz) => sum + quiz.score, 0) / completedQuizList.length)
            : 0;

        const activityDates = new Set();
        const addActivityDate = (date) => {
            if (!date) return;
            activityDates.add(new Date(date).toISOString().slice(0, 10));
        };

        recentDocuments.forEach((doc) => {
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

        let studyStreak = 0;
        const cursor = new Date();
        cursor.setUTCHours(0, 0, 0, 0);

        while (activityDates.has(cursor.toISOString().slice(0, 10))) {
            studyStreak += 1;
            cursor.setUTCDate(cursor.getUTCDate() - 1);
        }

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
                    studyStreak
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
