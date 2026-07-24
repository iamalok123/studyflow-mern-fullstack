import mongoose from "mongoose";

const mindmapNodeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [160, "Mindmap node title cannot exceed 160 characters."]
    },
}, { _id: false });

mindmapNodeSchema.add({
    children: {
        type: [mindmapNodeSchema],
        default: []
    }
});

const mindmapSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [160, "Mindmap title cannot exceed 160 characters."]
    },
    children: {
        type: [mindmapNodeSchema],
        default: []
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    schemaVersion: {
        type: Number,
        default: 1
    }
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, "Please provide a workspace title."],
        trim: true,
        maxlength: [120, "Workspace title cannot exceed 120 characters."]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters."],
        default: ""
    },
    color: {
        type: String,
        default: "#10B981", // Default Emerald color
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document"
    }],
    summary: {
        type: String,
        default: ""
    },
    summaryGeneratedAt: {
        type: Date,
        default: null
    },
    mindmap: {
        type: mindmapSchema,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("Workspace", workspaceSchema);
