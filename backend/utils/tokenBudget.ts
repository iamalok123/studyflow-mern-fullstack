/**
 * Token estimation and context packing utility for Gemini RAG pipelines.
 * Enforces dynamic token budgeting across system instructions, conversation history,
 * and retrieved document chunks to eliminate 429 rate limits, context overflow,
 * and model instruction degradation.
 */

// Safe token allocations for Gemini 2.5 Flash Lite / 1.5 Flash
export const DEFAULT_BUDGETS = {
  MAX_TOTAL_PROMPT_TOKENS: 14000,
  MAX_CHUNKS_TOKENS: 8000,
  MAX_HISTORY_TOKENS: 2500,
  MAX_QUESTION_TOKENS: 800,
  MAX_SYSTEM_TOKENS: 2000,
};

/**
 * Fast, accurate token estimator for LLM context windows.
 * Based on empirical token-to-character ratio (~3.8 chars per token for mixed prose, code, and markdown).
 */
export const estimateTokenCount = (text: string | null | undefined): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 3.8);
};

export interface PackedChunk {
  content: string;
  pageNumber?: number;
  chunkIndex?: number;
  documentTitle?: string;
  isTruncated?: boolean;
  estimatedTokens: number;
}

export interface BudgetPackingResult<T> {
  items: T[];
  totalTokens: number;
  itemsDropped: number;
  isTruncated: boolean;
}

/**
 * Dynamically packs retrieved document chunks into the allocated token budget in relevance order.
 */
export const packChunksWithinBudget = <T extends { content: string; pageNumber?: number; chunkIndex?: number; documentTitle?: string }>(
  chunks: T[],
  maxTokens: number = DEFAULT_BUDGETS.MAX_CHUNKS_TOKENS
): BudgetPackingResult<T> => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return { items: [], totalTokens: 0, itemsDropped: 0, isTruncated: false };
  }

  const packed: T[] = [];
  let remainingBudget = maxTokens;
  let itemsDropped = 0;
  let isTruncated = false;

  for (const chunk of chunks) {
    if (!chunk.content) continue;
    const chunkTokens = estimateTokenCount(chunk.content);

    if (chunkTokens <= remainingBudget) {
      // Chunk fits fully
      packed.push(chunk);
      remainingBudget -= chunkTokens;
    } else if (remainingBudget >= 180) {
      // Partially pack chunk by cutting at sentence/newline boundary
      const maxChars = Math.floor(remainingBudget * 3.6);
      let cutIndex = chunk.content.lastIndexOf("\n", maxChars);
      if (cutIndex === -1 || cutIndex < maxChars * 0.6) {
        cutIndex = chunk.content.lastIndexOf(". ", maxChars);
      }
      if (cutIndex === -1 || cutIndex < maxChars * 0.5) {
        cutIndex = maxChars;
      }

      const truncatedContent = chunk.content.slice(0, cutIndex).trim() + "\n... [Remaining content truncated for token budget]";
      packed.push({
        ...chunk,
        content: truncatedContent,
      });
      remainingBudget = 0;
      isTruncated = true;
      break;
    } else {
      // Budget exhausted
      itemsDropped++;
      isTruncated = true;
    }
  }

  const totalTokens = maxTokens - remainingBudget;
  return {
    items: packed,
    totalTokens,
    itemsDropped,
    isTruncated,
  };
};

/**
 * Dynamically trims conversation history from most recent to oldest to fit within history budget.
 */
export const packHistoryWithinBudget = <T extends { content: string; role?: string }>(
  history: T[],
  maxTokens: number = DEFAULT_BUDGETS.MAX_HISTORY_TOKENS
): BudgetPackingResult<T> => {
  if (!Array.isArray(history) || history.length === 0) {
    return { items: [], totalTokens: 0, itemsDropped: 0, isTruncated: false };
  }

  const packedReversed: T[] = [];
  let remainingBudget = maxTokens;
  let itemsDropped = 0;

  // Walk backwards from most recent message
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (!msg.content) continue;

    // Cap single historical messages to 800 tokens to prevent runaway inputs
    const cappedContent = msg.content.length > 3200 ? msg.content.slice(0, 3200) + "..." : msg.content;
    const msgTokens = estimateTokenCount(cappedContent);

    if (msgTokens <= remainingBudget) {
      packedReversed.push({
        ...msg,
        content: cappedContent,
      });
      remainingBudget -= msgTokens;
    } else {
      itemsDropped++;
    }
  }

  // Restore chronological order (oldest to newest)
  const items = packedReversed.reverse();
  const totalTokens = maxTokens - remainingBudget;

  return {
    items,
    totalTokens,
    itemsDropped,
    isTruncated: itemsDropped > 0,
  };
};
