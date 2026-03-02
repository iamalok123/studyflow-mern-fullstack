import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";


// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Please upload a PDF file",
                statusCode: 400,
            });
        }

        const { title } = req.body;

        if (!title) {
            await fs.unlink(req.file.path).catch(() => { });
            return res.status(400).json({
                success: false,
                error: "Please provide a document title",
                statusCode: 400,
            });
        }

        const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fileURL = `${baseURL}/uploads/documents/${req.file.filename}`;

        // Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileURL,
            fileSize: req.file.size,
            status: "Processing",
        });

        // Process PDF in background (non-blocking)
        processPDF(document._id, req.file.path).catch(err => {
            console.error("PDF processing failed:", err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully. Processing in background...",
        });

    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        next(error);
    }
};


// Helper: process PDF text extraction in background
const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);

        const chunks = chunkText(text, 500, 50);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks,
            status: "Ready",
        });

        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing PDF ${documentId}:`, error);
        await Document.findByIdAndUpdate(documentId, { status: "Failed" });
    }
};


// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id),
                },
            },
            {
                $lookup: {
                    from: "flashcards",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "flashcardSets",
                },
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "quizzes",
                },
            },
            {
                $addFields: {
                    flashcardCount: { $size: "$flashcardSets" },
                    quizCount: { $size: "$quizzes" },
                },
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0,
                },
            },
            {
                $sort: { uploadDate: -1 },
            },
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Get single document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404,
            });
        }

        const [flashcards, quizzes] = await Promise.all([
            Flashcard.countDocuments({ documentId: document._id, userId: req.user._id }),
            Quiz.countDocuments({ documentId: document._id, userId: req.user._id }),
        ]);

        document.lastAccessed = Date.now();
        await document.save();

        const documentData = document.toObject();
        documentData.flashcardCount = flashcards;
        documentData.quizCount = quizzes;

        res.status(200).json({
            success: true,
            data: documentData,
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Delete document and all associated data
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404,
            });
        }

        // Delete local file from disk
        try {
            // Extract the filename from the stored URL and build the local path
            const filename = path.basename(document.filePath);
            const localFilePath = path.join(process.cwd(), "uploads", "documents", filename);
            await fs.unlink(localFilePath);
        } catch (fileErr) {
            // Don't fail the request if file is already missing
            console.warn("Could not delete local file:", fileErr.message);
        }

        // Delete all associated DB records in parallel
        await Promise.all([
            Flashcard.deleteMany({ documentId: document._id, userId: req.user._id }),
            Quiz.deleteMany({ documentId: document._id, userId: req.user._id }),
            ChatHistory.deleteMany({ documentId: document._id, userId: req.user._id }),
        ]);

        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: "Document deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};





