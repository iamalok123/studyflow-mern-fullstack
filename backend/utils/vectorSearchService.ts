import { Types } from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import Document from "../models/Document.js";
import { generateQueryEmbedding, cosineSimilarity } from "./embeddingService.js";

export interface VectorSearchResult {
  _id: string | Types.ObjectId;
  content: string;
  chunkIndex: number;
  pageNumber: number;
  documentId: Types.ObjectId | string;
  workspaceId?: Types.ObjectId | string | null;
  documentTitle?: string;
  score: number;
}

export interface SearchOptions {
  userId: Types.ObjectId | string;
  documentId?: Types.ObjectId | string;
  workspaceId?: Types.ObjectId | string;
  documentIds?: (Types.ObjectId | string)[];
  query: string;
  limit?: number;
  minScore?: number;
}

/**
 * Searches for most semantically relevant chunks using MongoDB Atlas Vector Search
 * with an automatic fallback to in-memory cosine similarity for local development.
 */
export const searchSimilarChunks = async ({
  userId,
  documentId,
  workspaceId,
  documentIds,
  query,
  limit = 6,
  minScore = 0.35,
}: SearchOptions): Promise<VectorSearchResult[]> => {
  if (!query || !query.trim()) {
    return [];
  }

  // 1. Generate query embedding vector (768-dim)
  const queryVector = await generateQueryEmbedding(query);

  const userObjectId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
  const docObjectId = documentId
    ? typeof documentId === "string"
      ? new Types.ObjectId(documentId)
      : documentId
    : null;
  const wsObjectId = workspaceId
    ? typeof workspaceId === "string"
      ? new Types.ObjectId(workspaceId)
      : workspaceId
    : null;
  const docObjectIds = Array.isArray(documentIds) && documentIds.length > 0
    ? documentIds.map((id) => (typeof id === "string" ? new Types.ObjectId(id) : id))
    : null;

  // Build filter condition for Atlas Vector Search
  const filter: Record<string, any> = {
    userId: { $eq: userObjectId },
  };

  if (docObjectId) {
    filter.documentId = { $eq: docObjectId };
  } else if (docObjectIds && docObjectIds.length > 0) {
    filter.documentId = { $in: docObjectIds };
  } else if (wsObjectId) {
    filter.workspaceId = { $eq: wsObjectId };
  }

  // 2. Try Atlas Vector Search Aggregation
  try {
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: Math.max(50, limit * 10),
          limit: limit,
          filter: filter,
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          chunkIndex: 1,
          pageNumber: 1,
          documentId: 1,
          workspaceId: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const results = await DocumentChunk.aggregate(pipeline);

    if (results && results.length > 0) {
      // Enrich with document titles
      const docIds = Array.from(new Set(results.map((r: any) => r.documentId.toString())));
      const docs = await Document.find({ _id: { $in: docIds } }).select("title");
      const titleMap = new Map(docs.map((d) => [d._id.toString(), d.title]));

      return results.map((r: any) => ({
        _id: r._id,
        content: r.content,
        chunkIndex: r.chunkIndex,
        pageNumber: r.pageNumber || 1,
        documentId: r.documentId,
        workspaceId: r.workspaceId || null,
        documentTitle: titleMap.get(r.documentId.toString()) || "",
        score: typeof r.score === "number" ? r.score : 1,
      }));
    }
  } catch (atlasError: any) {
    // Graceful fallback if Atlas Vector Search is not enabled / local MongoDB
    console.warn(
      "Atlas $vectorSearch unavailable or not yet indexed, running local vector similarity fallback:",
      atlasError?.message || atlasError
    );
  }

  // 3. Fallback: In-Memory Cosine Similarity Calculation
  const fallbackQuery: Record<string, any> = { userId: userObjectId };
  if (docObjectId) {
    fallbackQuery.documentId = docObjectId;
  } else if (docObjectIds && docObjectIds.length > 0) {
    fallbackQuery.documentId = { $in: docObjectIds };
  } else if (wsObjectId) {
    fallbackQuery.workspaceId = wsObjectId;
  }

  const candidateChunks = await DocumentChunk.find(fallbackQuery)
    .select("content chunkIndex pageNumber documentId workspaceId embedding")
    .lean();

  if (!candidateChunks || candidateChunks.length === 0) {
    return [];
  }

  // Score each candidate chunk using cosine similarity
  const scoredCandidates: VectorSearchResult[] = [];
  for (const chunk of candidateChunks) {
    if (!chunk.embedding || chunk.embedding.length === 0) continue;

    const score = cosineSimilarity(queryVector, chunk.embedding);
    if (score >= minScore) {
      scoredCandidates.push({
        _id: chunk._id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber || 1,
        documentId: chunk.documentId,
        workspaceId: chunk.workspaceId || null,
        score,
      });
    }
  }

  // Sort descending by similarity score
  scoredCandidates.sort((a, b) => b.score - a.score);
  const topChunks = scoredCandidates.slice(0, limit);

  // Enrich with document titles
  if (topChunks.length > 0) {
    const docIds = Array.from(new Set(topChunks.map((r) => r.documentId.toString())));
    const docs = await Document.find({ _id: { $in: docIds } }).select("title");
    const titleMap = new Map(docs.map((d) => [d._id.toString(), d.title]));

    for (const chunk of topChunks) {
      chunk.documentTitle = titleMap.get(chunk.documentId.toString()) || "";
    }
  }

  return topChunks;
};
