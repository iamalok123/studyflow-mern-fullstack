import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!_ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
};

/**
 * Exponential backoff retry helper
 */
const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
  const RETRYABLE_STATUS_CODES = [429, 500, 503];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const statusCode = error?.status || error?.statusCode;
      const isRetryable = RETRYABLE_STATUS_CODES.includes(statusCode) || error?.message?.includes("fetch");

      if (attempt === maxRetries || !isRetryable) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Embedding API returned ${statusCode || error?.message}. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Embedding retry attempts exhausted");
};

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

/**
 * Generate embedding for a single text (e.g. document chunk or query)
 */
export const generateSingleEmbedding = async (
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[]> => {
  const ai = getAI();
  const trimmed = text.trim();
  if (!trimmed) {
    return new Array(768).fill(0);
  }

  const response = await retryWithBackoff(() =>
    ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: trimmed,
      config: {
        outputDimensionality: 768,
        taskType,
      },
    })
  );

  // Extract vector values from response
  if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
    return response.embeddings[0].values;
  }

  // Single embedding response structure
  const rawValues = (response as any)?.embedding?.values;
  if (Array.isArray(rawValues)) {
    return rawValues;
  }

  throw new Error("Failed to extract embedding vector from Gemini response");
};

/**
 * Generate embeddings for a batch of document chunks
 * Batches calls into chunks of up to 20 to avoid payload limits
 */
export const generateDocumentEmbeddings = async (texts: string[]): Promise<number[][]> => {
  if (!texts || texts.length === 0) {
    return [];
  }

  const ai = getAI();
  const BATCH_SIZE = 20;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map((t) => t.trim() || " ");

    try {
      const response = await retryWithBackoff(() =>
        ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: batch,
          config: {
            outputDimensionality: 768,
            taskType: "RETRIEVAL_DOCUMENT",
          },
        })
      );

      if (response.embeddings && response.embeddings.length === batch.length) {
        for (const item of response.embeddings) {
          results.push(item.values || new Array(768).fill(0));
        }
      } else {
        // Fallback: Embed individually if batch response length mismatches
        for (const singleText of batch) {
          const vec = await generateSingleEmbedding(singleText, "RETRIEVAL_DOCUMENT");
          results.push(vec);
        }
      }
    } catch (batchErr) {
      console.warn(`Batch embedding failed at index ${i}. Falling back to sequential embedding:`, batchErr);
      for (const singleText of batch) {
        const vec = await generateSingleEmbedding(singleText, "RETRIEVAL_DOCUMENT");
        results.push(vec);
      }
    }
  }

  return results;
};

/**
 * Generate embedding for a search query
 */
export const generateQueryEmbedding = async (query: string): Promise<number[]> => {
  return generateSingleEmbedding(query, "RETRIEVAL_QUERY");
};

/**
 * Compute Cosine Similarity between two vectors
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;
  return dotProduct / magnitude;
};
