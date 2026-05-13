import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

const clampInt = (value, fallback, min, max) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

// @desc    Generate flashcards from document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        const count = clampInt(req.body.count, 10, 1, 30);

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentID",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "Ready"
        }).select('extractedText title');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready.",
                statusCode: 404
            });
        }

        // Generate flashcards using Gemini
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            count
        );

        if (!cards.length) {
            return res.status(422).json({
                success: false,
                error: "AI could not generate valid flashcards from this document. Please try a different document or count.",
                statusCode: 422,
            });
        }

        // Save flashcards to database
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false,
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: "Flashcards generated successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Generate quiz from document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, title } = req.body;
        const numQuestions = clampInt(req.body.numQuestions, 5, 1, 20);

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentID",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "Ready"
        }).select('extractedText title');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready.",
                statusCode: 404
            });
        }

        // Generate quiz using Gemini
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            numQuestions
        );

        if (!questions.length) {
            return res.status(422).json({
                success: false,
                error: "AI could not generate a valid quiz from this document. Please try a different document or question count.",
                statusCode: 422,
            });
        }

        // Save quiz to database
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: "Quiz generated successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Generate summary from document
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentID",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "Ready"
        }).select('extractedText title');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready.",
                statusCode: 404
            });
        }

        // Generate summary using Gemini
        const summary = await geminiService.generateSummary(
            document.extractedText
        );

        res.status(201).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary,
            },
            message: "Summary generated successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Chat with document
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentID and question",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "Ready"
        }).select('chunks');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready.",
                statusCode: 404
            });
        }

        // Find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(chunk => chunk.chunkIndex);

        // Get or create a chat history
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id,
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }

        // Generate response using Gemini
        const answer = await geminiService.chatWithContext(
            question, relevantChunks
        );

        // Save conversation to chat history
        chatHistory.messages.push(
            {
                role: "user",
                content: question,
                timestamp: new Date(),
                relevantChunks: []
            },
            {
                role: "assistant",
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        );

        if (chatHistory.messages.length > 100) {
            chatHistory.messages = chatHistory.messages.slice(-100);
        }

        await chatHistory.save();

        res.status(201).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: "Response generated successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Explain concept from a document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentID and concept",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "Ready"
        }).select('chunks');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready.",
                statusCode: 404
            });
        }

        // Find relevant chunks for the concept
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(chunk => chunk.content).join("\n\n");

        // Generate explanation using Gemini
        const explanation = await geminiService.explainConcept(
            concept,
            context
        );

        res.status(201).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(chunk => chunk.chunkIndex)
            },
            message: "Explanation generated successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Get chat history
// @route   GET /api/ai/chat-history/:documentId
// @access  Private
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentID",
                statusCode: 400
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select("messages"); // Only retrieve the message array

        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [], // Return an empty array if no data found
                message: "No chat history found for this document"
            });
        }

        res.status(200).json({
            success: true,
            data: chatHistory.messages,
            message: "Chat history retrieved successfully"
        });
    } catch (error) {
        next(error);
    }
};
 
