import mongoose from "mongoose";
import { IFlashcard } from "../types/models.js";

const flashcardSchema = new mongoose.Schema<IFlashcard>(
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
    title: {
      type: String,
      default: "",
    },
    cards: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
          default: "Medium",
        },
        lastReviewed: {
          type: Date,
          default: null,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries
flashcardSchema.index({ userId: 1, documentId: 1 });
flashcardSchema.index({ userId: 1, workspaceId: 1 });

const Flashcard = mongoose.model<IFlashcard>("Flashcard", flashcardSchema);

export default Flashcard;
