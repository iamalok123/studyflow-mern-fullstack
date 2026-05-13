import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [120, "Document title cannot exceed 120 characters."]
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    cloudinaryPublicId: {
        type: String,
        default: null,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    extractedText: {
        type: String,
        maxlength: [4000000, "Extracted text is too large to store."],
        default: ""
    },
    chunks: [{
        content: {
            type: String,
            required: true
        },
        pageNumber: {
            type: Number,
            default: 0
        },
        chunkIndex: {
            type: Number,
            required: true
        }
    }],
    uploadDate: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Processing", "Ready", "Failed"],
        default: "Processing"
    }
}, { timestamps: true });

// Index for faster queries
documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
