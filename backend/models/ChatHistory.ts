import mongoose from "mongoose";
import { IChatHistory } from "../types/models.js";

const chatHistorySchema = new mongoose.Schema<IChatHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [12000, "Chat message is too long."],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        relevantChunks: {
          type: [Number],
          default: [],
        },
        citations: [
          {
            pageNumber: { type: Number, default: 1 },
            documentTitle: { type: String, default: "" },
            chunkIndex: { type: Number },
            documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries
chatHistorySchema.index({ userId: 1, documentId: 1 });
chatHistorySchema.index({ userId: 1, workspaceId: 1 });

const ChatHistory = mongoose.model<IChatHistory>("ChatHistory", chatHistorySchema);

export default ChatHistory;
