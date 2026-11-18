import { Types } from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import Document from "../models/Document.js";
import { generateQueryEmbedding, cosineSimilarity } from "./embeddingService.js";
import { calculateBM25Score, combineHybridScores } from "./bm25.js";

export interface VectorSearchResult {
  _id: string | Types.ObjectId;
  content: string;
  chunkIndex: number;
  pageNumber: number;
  documentId: Types.ObjectId | string;
  workspaceId?: Types.ObjectId | string | null;
  documentTitle?: string;
  score: number;
  vectorScore?: number;
  lexicalScore?: number;
}

export interface SearchOptions {
  userId: Types.ObjectId | string;
  documentId?: Types.ObjectId | string;
  workspaceId?: Types.ObjectId | string;
  documentIds?: (Types.ObjectId | string)[];
  query: string;
  limit?: number;
  minScore?: number;
  searchMode?: "hybrid" | "vector" | "keyword";
  vectorWeight?: number;
}

/**
 * Searches for relevant document chunks using Hybrid RAG Search:
 * Combines dense semantic vector similarity with BM25 lexical keyword matching
 * for superior precision on technical terms, acronyms, code identifiers, and formulas.
 */
export const searchSimilarChunks = async ({
  userId,
  documentId,
  workspaceId,
  documentIds,
  query,
  limit = 6,
  minScore = 0.30,
  searchMode = "hybrid",
  vectorWeight = 0.65,
}: SearchOptions): Promise<VectorSearchResult[]> => {
  if (!query || !query.trim()) {
    return [];
  }

  // 1. Generate query embedding vector (768-dim) for semantic search
  const queryVector = searchMode !== "keyword" ? await generateQueryEmbedding(query) : [];

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

  // 2. Attempt Atlas Vector Search (if semantic vector search is active)
  if (searchMode !== "keyword" && queryVector.length > 0) {
    try {
      const candidatesToFetch = Math.max(30, limit * 4);
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: Math.max(80, candidatesToFetch * 3),
            limit: candidatesToFetch,
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
        // Compute BM25 lexical scores & hybrid re-ranking
        const hybridResults: VectorSearchResult[] = results.map((r: any) => {
          const vectorScore = typeof r.score === "number" ? r.score : 0.5;
          const lexicalScore = calculateBM25Score(query, r.content);
          const finalScore =
            searchMode === "vector"
              ? vectorScore
              : combineHybridScores(vectorScore, lexicalScore, vectorWeight);

          return {
            _id: r._id,
            content: r.content,
            chunkIndex: r.chunkIndex,
            pageNumber: r.pageNumber || 1,
            documentId: r.documentId,
            workspaceId: r.workspaceId || null,
            score: finalScore,
            vectorScore,
            lexicalScore,
          };
        });

        // Filter by minScore and sort descending
        const rankedResults = hybridResults
          .filter((item) => item.score >= minScore)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        if (rankedResults.length > 0) {
          const docIds = Array.from(new Set(rankedResults.map((r) => r.documentId.toString())));
          const docs = await Document.find({ _id: { $in: docIds } }).select("title");
          const titleMap = new Map(docs.map((d) => [d._id.toString(), d.title]));

          return rankedResults.map((r) => ({
            ...r,
            documentTitle: titleMap.get(r.documentId.toString()) || "",
          }));
        }
      }
    } catch {
      // Graceful fallback to in-memory similarity & BM25
    }
  }

  // 3. Fallback: In-Memory Hybrid Search (Vector Cosine + BM25 Lexical)
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

  const scoredCandidates: VectorSearchResult[] = [];

  for (const chunk of candidateChunks) {
    const lexicalScore = calculateBM25Score(query, chunk.content);

    let vectorScore = 0;
    if (searchMode !== "keyword" && queryVector.length > 0 && chunk.embedding && chunk.embedding.length > 0) {
      vectorScore = cosineSimilarity(queryVector, chunk.embedding);
    }

    let finalScore = 0;
    if (searchMode === "keyword") {
      finalScore = lexicalScore;
    } else if (searchMode === "vector") {
      finalScore = vectorScore;
    } else {
      finalScore = combineHybridScores(vectorScore, lexicalScore, vectorWeight);
    }

    if (finalScore >= minScore) {
      scoredCandidates.push({
        _id: chunk._id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber || 1,
        documentId: chunk.documentId,
        workspaceId: chunk.workspaceId || null,
        score: finalScore,
        vectorScore,
        lexicalScore,
      });
    }
  }

  // Sort descending by hybrid score
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
