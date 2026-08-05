import { Types } from "mongoose";

export interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
  _id?: Types.ObjectId;
}

export interface ScoredChunk extends TextChunk {
  score: number;
  rawScore: number;
  matchedWords: number;
}

/**
 * Splits text file chunks for better AI processing
 * @param text - Full text to chunk
 * @param chunkSize - Target size per chunk (in words)
 * @param overlap - Number of words to overlap between chunks
 * @returns Array of chunks
 */
export const chunkText = (text: string, chunkSize = 500, overlap = 50): TextChunk[] => {
  // Ensure overlap is less than chunkSize to prevent infinite loops
  overlap = Math.min(overlap, chunkSize - 1);
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean text while preserving paragraph structure
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();

  // Try to split by paragraphs (single or more newlines)
  const paragraphs = cleanedText.split(/\n+/).filter((p) => p.trim().length > 0);

  const chunks: TextChunk[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // If a single paragraph is larger than chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }
      // Split large paragraph into word based chunks
      const step = Math.max(1, chunkSize - overlap);
      for (let i = 0; i < paragraphWords.length; i += step) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= paragraphWords.length) {
          break;
        }
      }
      continue;
    }

    // If adding this paragraph exceeds chunk size, save current chunk
    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      // Add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex,
      pageNumber: 0,
    });
  }

  // Fallback: If no chunks created split by words
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    const step = Math.max(1, chunkSize - overlap);
    for (let i = 0; i < allWords.length; i += step) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      if (i + chunkSize >= allWords.length) {
        break;
      }
    }
  }
  return chunks;
};

// Escape special regex characters in a string
const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Find relevant chunks based on keyword matching
 * @param chunks - Array of chunks
 * @param query - Search query
 * @param maxChunks - Maximum chunks to return
 */
export const findRelevantChunks = (chunks: TextChunk[], query: string, maxChunks = 3): ScoredChunk[] => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  // Common stop words to exclude
  const stopWords = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
    "in", "with", "to", "for", "of", "as", "by", "this", "that", "it"
  ]);

  // Extract and clean query words
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    // Return clean chunk objects without Mongoose metadata
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: 1,
      rawScore: 1,
      matchedWords: 0,
    }));
  }

  // Score chunks based on keyword matches
  const scoredChunks: ScoredChunk[] = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    // Score each query word
    for (const word of queryWords) {
      // Exact word match (high score)
      const escaped = escapeRegex(word);
      const exactMatches = (content.match(new RegExp(`\\b${escaped}\\b`, "g")) || []).length;
      score += exactMatches * 3;

      // Partial word match (Low score)
      const partialMatches = (content.match(new RegExp(escaped, "g")) || []).length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // Bonus: Multiply query word found
    const uniqueWordsFound = queryWords.filter((word) => content.includes(word)).length;
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    // Normalize by content length
    const normalizedScore = score / Math.sqrt(contentWords);

    // Small bonus for earlier chunks
    const positonBonus = 1 - (index / chunks.length) * 0.1;

    // Return clean object without Mongoose metadata
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positonBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound,
    };
  });

  // Sort by score (descending) and limit results
  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => {
      // Sort by score (descending)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Sort by matched words (descending)
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      // Sort by chunk index (ascending)
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};
