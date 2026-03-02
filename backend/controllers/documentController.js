import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import getCloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";


/**
 * Upload a PDF buffer to Cloudinary using upload_stream.
 * Returns { secure_url, public_id }.
 */
const uploadToCloudinary = (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        const stream = getCloudinary().uploader.upload_stream(
            {
                resource_type: "image",              // deliver PDFs via image pipeline (browser-viewable)
                folder: "studyflow/documents",       // organized folder
                public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, "")}`,
                format: "pdf",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};


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
            return res.status(400).json({
                success: false,
                error: "Please provide a document title",
                statusCode: 400,
            });
        }

        // 1. Upload PDF buffer to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
            req.file.buffer,
            req.file.originalname
        );

        // 2. Create document record (status = Processing)
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id,
            fileSize: req.file.size,
            status: "Processing",
        });

        // 3. Process PDF text extraction in background (non-blocking)
        processPDF(document._id, req.file.buffer).catch((err) => {
            console.error("PDF processing failed:", err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully. Processing in background...",
        });
    } catch (error) {
        next(error);
    }
};


// Helper: process PDF text extraction in background
const processPDF = async (documentId, pdfBuffer) => {
    try {
        const { text } = await extractTextFromPDF(pdfBuffer);

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

        // Delete PDF from Cloudinary
        if (document.cloudinaryPublicId) {
            try {
                await getCloudinary().uploader.destroy(document.cloudinaryPublicId, {
                    resource_type: "image",
                });
            } catch (cloudErr) {
                console.warn("Could not delete Cloudinary file:", cloudErr.message);
            }
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





