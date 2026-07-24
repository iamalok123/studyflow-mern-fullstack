import Workspace from "../models/Workspace.js";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
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

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
export const createWorkspace = async (req, res, next) => {
    try {
        const { title, description, color, documentIds } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Workspace title is required."
            });
        }

        // Validate documents if provided
        let validDocIds = [];
        if (Array.isArray(documentIds) && documentIds.length > 0) {
            const userDocs = await Document.find({
                _id: { $in: documentIds },
                userId: req.user._id
            }).select("_id");

            validDocIds = userDocs.map(d => d._id);
        }

        const workspace = await Workspace.create({
            userId: req.user._id,
            title: title.trim(),
            description: description ? description.trim() : "",
            color: color || "#10B981",
            documents: validDocIds
        });

        const populatedWorkspace = await Workspace.findById(workspace._id).populate({
            path: "documents",
            select: "title fileName fileSize status uploadDate"
        });

        res.status(201).json({
            success: true,
            data: populatedWorkspace,
            message: "Workspace created successfully."
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all workspaces for logged-in user
// @route   GET /api/workspaces
// @access  Private
export const getWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Workspace.find({ userId: req.user._id })
            .populate({
                path: "documents",
                select: "title fileName fileSize status uploadDate"
            })
            .sort({ updatedAt: -1 });

        // Clean up any null references in populated documents
        const cleanedWorkspaces = workspaces.map(ws => {
            const wsObj = ws.toObject();
            wsObj.documents = (wsObj.documents || []).filter(doc => doc !== null);
            return wsObj;
        });

        res.status(200).json({
            success: true,
            count: cleanedWorkspaces.length,
            data: cleanedWorkspaces
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
export const getWorkspaceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace ID."
            });
        }

        const workspace = await Workspace.findOne({
            _id: id,
            userId: req.user._id
        }).populate({
            path: "documents",
            select: "title fileName filePath fileSize status uploadDate"
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found."
            });
        }

        const wsObj = workspace.toObject();
        wsObj.documents = (wsObj.documents || []).filter(doc => doc !== null);

        res.status(200).json({
            success: true,
            data: wsObj
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update workspace (title, description, color)
// @route   PUT /api/workspaces/:id
// @access  Private
export const updateWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, color } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace ID."
            });
        }

        const workspace = await Workspace.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found."
            });
        }

        if (title !== undefined) workspace.title = title.trim();
        if (description !== undefined) workspace.description = description.trim();
        if (color !== undefined) workspace.color = color;

        await workspace.save();

        const updatedWorkspace = await Workspace.findById(workspace._id).populate({
            path: "documents",
            select: "title fileName fileSize status uploadDate"
        });

        res.status(200).json({
            success: true,
            data: updatedWorkspace,
            message: "Workspace updated successfully."
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
export const deleteWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace ID."
            });
        }

        const workspace = await Workspace.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found."
            });
        }

        // Clean up associated workspace study materials in parallel
        await Promise.all([
            Flashcard.deleteMany({ workspaceId: id, userId: req.user._id }),
            Quiz.deleteMany({ workspaceId: id, userId: req.user._id }),
            ChatHistory.deleteMany({ workspaceId: id, userId: req.user._id }),
        ]);

        res.status(200).json({
            success: true,
            message: "Workspace deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add documents to workspace
// @route   POST /api/workspaces/:id/documents
// @access  Private
export const addDocumentsToWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { documentIds } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace ID."
            });
        }

        if (!Array.isArray(documentIds) || documentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of document IDs to add."
            });
        }

        // Verify workspace belongs to user
        const workspace = await Workspace.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found."
            });
        }

        // Validate document ownership
        const userDocs = await Document.find({
            _id: { $in: documentIds },
            userId: req.user._id
        }).select("_id");

        const validIds = userDocs.map(d => d._id);
        const existingDocIds = new Set(workspace.documents.map(docId => docId.toString()));
        const newIds = validIds.filter(docId => !existingDocIds.has(docId.toString()));

        if (validIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid documents found to add."
            });
        }

        await Workspace.findByIdAndUpdate(id, {
            $addToSet: { documents: { $each: validIds } }
        });

        if (newIds.length > 0) {
            await invalidateWorkspaceAiArtifacts(id, req.user._id);
        }

        const updatedWorkspace = await Workspace.findById(id).populate({
            path: "documents",
            select: "title fileName fileSize status uploadDate"
        });

        res.status(200).json({
            success: true,
            data: updatedWorkspace,
            message: "Documents added to workspace successfully."
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove a document from workspace
// @route   DELETE /api/workspaces/:id/documents/:documentId
// @access  Private
export const removeDocumentFromWorkspace = async (req, res, next) => {
    try {
        const { id, documentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID parameters."
            });
        }

        const workspaceBeforeUpdate = await Workspace.findOne({
            _id: id,
            userId: req.user._id
        }).select("documents");

        if (!workspaceBeforeUpdate) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found."
            });
        }

        const hadDocument = workspaceBeforeUpdate.documents.some(
            docId => docId.toString() === documentId
        );

        const workspace = await Workspace.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { $pull: { documents: documentId } },
            { new: true }
        ).populate({
            path: "documents",
            select: "title fileName fileSize status uploadDate"
        });

        if (hadDocument) {
            await invalidateWorkspaceAiArtifacts(id, req.user._id);
        }

        res.status(200).json({
            success: true,
            data: workspace,
            message: "Document removed from workspace."
        });
    } catch (error) {
        next(error);
    }
};
