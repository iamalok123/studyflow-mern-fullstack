import { Types } from "mongoose";

export interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
  characterCount?: number;
  _id?: Types.ObjectId;
}

export interface ScoredChunk extends TextChunk {
  score: number;
  rawScore: number;
  matchedWords?: number;
}

const SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", "; ", " ", ""];

/**
 * Split text recursively until all pieces are under target chunkSize
 */
const splitRecursively = (text: string, maxChunkSize: number, separators: string[]): string[] => {
  if (text.length <= maxChunkSize || separators.length === 0) {
    return [text];
  }

  const [currentSep, ...remainingSeps] = separators;
  const parts = currentSep === "" ? text.split("") : text.split(currentSep);

  const result: string[] = [];
  let currentGroup = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Re-attach separator when joining (unless empty separator)
    const addition = currentGroup.length === 0 ? part : currentSep + part;

    if (currentGroup.length + addition.length <= maxChunkSize) {
      currentGroup += addition;
    } else {
      if (currentGroup.trim().length > 0) {
        result.push(currentGroup.trim());
      }
      // If single part is larger than maxChunkSize, split with remaining separators
      if (part.length > maxChunkSize) {
        const subParts = splitRecursively(part, maxChunkSize, remainingSeps);
        result.push(...subParts.map((p) => p.trim()).filter((p) => p.length > 0));
        currentGroup = "";
      } else {
        currentGroup = part;
      }
    }
  }

  if (currentGroup.trim().length > 0) {
    result.push(currentGroup.trim());
  }

  return result;
};

/**
 * Splits text into semantic chunks with overlap and page tracking
 * @param text - Full extracted text
 * @param maxChunkSize - Target max characters per chunk (~1500 chars / ~350-400 words)
 * @param overlap - Character overlap between consecutive chunks (~200 chars)
 */
export const recursiveChunkText = (
  text: string,
  maxChunkSize = 1500,
  overlap = 200
): TextChunk[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  overlap = Math.min(overlap, Math.floor(maxChunkSize * 0.3));

  // Detect explicit page markers: e.g. [--- Page 3 ---] or form-feed \f
  // We divide text by pages first if markers are found
  const pageRegex = /\[--- Page (\d+) ---\]|\f/g;
  const hasPageMarkers = pageRegex.test(text);

  interface PageSegment {
    pageNumber: number;
    text: string;
  }

  const segments: PageSegment[] = [];

  if (hasPageMarkers) {
    pageRegex.lastIndex = 0;
    let lastIndex = 0;
    let currentPage = 1;
    let match: RegExpExecArray | null;

    while ((match = pageRegex.exec(text)) !== null) {
      const segmentText = text.substring(lastIndex, match.index).trim();
      if (segmentText.length > 0) {
        segments.push({ pageNumber: currentPage, text: segmentText });
      }
      if (match[1]) {
        currentPage = Number.parseInt(match[1], 10);
      } else {
        // Form feed \f increments page
        currentPage++;
      }
      lastIndex = match.index + match[0].length;
    }

    const trailingText = text.substring(lastIndex).trim();
    if (trailingText.length > 0) {
      segments.push({ pageNumber: currentPage, text: trailingText });
    }
  } else {
    segments.push({ pageNumber: 1, text: text.trim() });
  }

  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  for (const segment of segments) {
    const cleaned = segment.text
      .replace(/\r\n/g, "\n")
      .replace(/[^\S\n]+/g, " ")
      .replace(/\n\s*\n\s*\n+/g, "\n\n")
      .trim();

    if (!cleaned) continue;

    const rawSplits = splitRecursively(cleaned, maxChunkSize, SEPARATORS);

    let previousOverlapText = "";

    for (let i = 0; i < rawSplits.length; i++) {
      const split = rawSplits[i];
      if (!split || split.trim().length < 10) continue;

      let chunkContent = split.trim();
      if (previousOverlapText && !chunkContent.startsWith(previousOverlapText)) {
        chunkContent = `${previousOverlapText} ${chunkContent}`.trim();
      }

      chunks.push({
        content: chunkContent,
        chunkIndex: chunkIndex++,
        pageNumber: segment.pageNumber,
        characterCount: chunkContent.length,
      });

      // Extract tail text for overlap with next chunk
      if (split.length > overlap) {
        previousOverlapText = split.substring(split.length - overlap).trim();
      } else {
        previousOverlapText = split.trim();
      }
    }
  }

  // Fallback: If no chunks produced, create single chunk
  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push({
      content: text.trim().substring(0, maxChunkSize),
      chunkIndex: 0,
      pageNumber: 1,
      characterCount: Math.min(text.trim().length, maxChunkSize),
    });
  }

  return chunks;
};

// Backward-compatible alias
export const chunkText = (text: string, chunkSize = 500, overlap = 50): TextChunk[] => {
  // Approximate words to characters: 1 word ~ 5 characters
  const maxChars = Math.max(500, chunkSize * 4);
  const overlapChars = Math.max(50, overlap * 4);
  return recursiveChunkText(text, maxChars, overlapChars);
};

// Escape special regex characters in a string
const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Find relevant chunks based on keyword matching (fallback utility)
 */
export const findRelevantChunks = (chunks: TextChunk[], query: string, maxChunks = 5): ScoredChunk[] => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  const stopWords = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
    "in", "with", "to", "for", "of", "as", "by", "this", "that", "it"
  ]);

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks).map((chunk) => ({
      ...chunk,
      score: 1,
      rawScore: 1,
      matchedWords: 0,
    }));
  }

  const scoredChunks: ScoredChunk[] = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    for (const word of queryWords) {
      const escaped = escapeRegex(word);
      const exactMatches = (content.match(new RegExp(`\\b${escaped}\\b`, "g")) || []).length;
      score += exactMatches * 3;

      const partialMatches = (content.match(new RegExp(escaped, "g")) || []).length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    const uniqueWordsFound = queryWords.filter((word) => content.includes(word)).length;
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    const normalizedScore = score / Math.sqrt(contentWords || 1);
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      characterCount: chunk.characterCount || chunk.content.length,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound,
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);
};
