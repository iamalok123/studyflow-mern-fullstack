import mongoose from "mongoose";
import { IDocumentChunk } from "../types/models.js";

const documentChunkSchema = new mongoose.Schema<IDocumentChunk>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    content: {
      type: String,
      required: true,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast lookups & cascades
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });
documentChunkSchema.index({ userId: 1, documentId: 1 });
documentChunkSchema.index({ userId: 1, workspaceId: 1 });

const DocumentChunk = mongoose.model<IDocumentChunk>("DocumentChunk", documentChunkSchema);

export default DocumentChunk;
