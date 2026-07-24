import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import Workspace from "../models/Workspace.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import getCloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

const invalidateWorkspaceAiArtifacts = async (workspaceId, userId) => {
    await Promise.all([
        Workspace.updateOne(
            { _id: workspaceId, userId },
            {
                $set: {
                    summary: "",
                    summaryGeneratedAt: null,
                    mindmap: null
                }
            }
        ),
        Flashcard.deleteMany({ workspaceId, userId }),
        Quiz.deleteMany({ workspaceId, userId }),
        ChatHistory.deleteMany({ workspaceId, userId }),
    ]);
};

// @desc    Get Cloudinary signature for direct upload
// @route   GET /api/documents/upload-signature
// @access  Private
export const getUploadSignature = (req, res, next) => {
    try {
        const timestamp = Math.round((new Date).getTime() / 1000);
        const folder = "studyflow/documents";
        
        // Generate signature
        const signature = getCloudinary().utils.api_sign_request(
            {
                timestamp: timestamp,
                folder: folder,
            },
            process.env.CLOUDINARY_API_SECRET
        );

        res.status(200).json({
            success: true,
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload PDF document metadata (file is uploaded directly to Cloudinary by frontend)
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        const { 
            title, 
            cloudinaryUrl, 
            cloudinaryPublicId, 
            fileSize, 
            extractedText: clientExtractedText, 
            attemptServerExtraction, 
            fileName,
            workspaceId
        } = req.body;

        if (!title?.trim() || !cloudinaryUrl || !cloudinaryPublicId || !fileName) {
            return res.status(400).json({
                success: false,
                error: "Missing required document data",
                statusCode: 400,
            });
        }

        let extractedText = clientExtractedText || "";
        let chunks = [];
        let status = "Ready";
        let message = "Document uploaded and processed successfully.";

        // Server-side text chunking to keep frontend payload small
        if (extractedText && extractedText.trim().length > 100) {
            chunks = chunkText(extractedText, 500, 50);
        }

        // Tier 2 Fallback: If client says it might be a scanned PDF and requests server extraction
        if (attemptServerExtraction) {
            try {
                const response = await fetch(cloudinaryUrl);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    
                    const { text } = await extractTextFromPDF(buffer);
                    if (text && text.trim().length > 100) { 
                        extractedText = text;
                        chunks = chunkText(text, 500, 50);
                        message = "Document uploaded and processed with server fallback.";
                    }
                }
            } catch (processingError) {
                console.error("Server fallback PDF processing failed:", processingError.message);
            }
        }

        if (chunks.length === 0) {
            status = "no_text";
            message = "Document uploaded, but no readable text could be extracted. AI features may not work.";
        }

        const document = await Document.create({
            userId: req.user._id,
            title: title.trim(),
            fileName,
            filePath: cloudinaryUrl,
            cloudinaryPublicId,
            fileSize,
            extractedText,
            chunks,
            status,
        });

        if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
            const updatedWorkspace = await Workspace.findOneAndUpdate(
                { _id: workspaceId, userId: req.user._id },
                { $addToSet: { documents: document._id } },
                { new: false }
            );

            if (updatedWorkspace) {
                await invalidateWorkspaceAiArtifacts(workspaceId, req.user._id);
            }
        }

        res.status(201).json({
            success: true,
            data: document,
            message,
        });
    } catch (error) {
        next(error);
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
                const result = await getCloudinary().uploader.destroy(document.cloudinaryPublicId, {
                    resource_type: "image",
                });
                if (result.result !== "ok") {
                    await getCloudinary().uploader.destroy(document.cloudinaryPublicId, {
                        resource_type: "raw",
                    });
                }
            } catch (cloudErr) {
                console.warn("Could not delete Cloudinary file:", cloudErr.message);
            }
        }

        const affectedWorkspaces = await Workspace.find({
            userId: req.user._id,
            documents: document._id
        }).select("_id");
        const affectedWorkspaceIds = affectedWorkspaces.map(workspace => workspace._id);

        // Delete all associated DB records in parallel
        await Promise.all([
            Flashcard.deleteMany({ documentId: document._id, userId: req.user._id }),
            Quiz.deleteMany({ documentId: document._id, userId: req.user._id }),
            ChatHistory.deleteMany({ documentId: document._id, userId: req.user._id }),
            Workspace.updateMany(
                { userId: req.user._id, documents: document._id },
                { $pull: { documents: document._id } }
            ),
            affectedWorkspaceIds.length > 0
                ? Workspace.updateMany(
                    { _id: { $in: affectedWorkspaceIds }, userId: req.user._id },
                    {
                        $set: {
                            summary: "",
                            summaryGeneratedAt: null,
                            mindmap: null
                        }
                    }
                )
                : Promise.resolve(),
            affectedWorkspaceIds.length > 0
                ? Flashcard.deleteMany({ workspaceId: { $in: affectedWorkspaceIds }, userId: req.user._id })
                : Promise.resolve(),
            affectedWorkspaceIds.length > 0
                ? Quiz.deleteMany({ workspaceId: { $in: affectedWorkspaceIds }, userId: req.user._id })
                : Promise.resolve(),
            affectedWorkspaceIds.length > 0
                ? ChatHistory.deleteMany({ workspaceId: { $in: affectedWorkspaceIds }, userId: req.user._id })
                : Promise.resolve(),
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




