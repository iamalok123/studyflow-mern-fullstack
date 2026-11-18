/**
 * BM25 & Lexical Keyword Relevance Scoring Utility
 * Provides fast, deterministic keyword matching and term-frequency scoring
 * to complement dense semantic embeddings in Hybrid RAG retrieval.
 */

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
  "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
  "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
  "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
  "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
  "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on",
  "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
  "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
  "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this",
  "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
  "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
  "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
  "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves"
]);

/**
 * Tokenizes text into lowercase normalized terms, stripping punctuation while preserving hyphens and dots in code/acronyms
 */
export const tokenizeQuery = (text: string): string[] => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\-._]/g, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !STOP_WORDS.has(term));
};

/**
 * Extracts potential acronyms or exact identifiers (e.g. "JWT", "RAG", "SM-2", "OAuth2", "DNA")
 */
export const extractExactKeywords = (text: string): string[] => {
  if (!text) return [];
  // Match hyphenated identifiers, uppercase acronyms, or alphanumeric versioned terms
  const matches = text.match(/\b([A-Za-z]+-[A-Za-z0-9]+|[A-Z]{2,}|[a-zA-Z]+[0-9]+)\b/g);
  return matches ? Array.from(new Set(matches)) : [];
};

/**
 * Computes BM25-inspired lexical relevance score between a query and a text chunk.
 * Output is normalized into range [0, 1].
 */
export const calculateBM25Score = (
  query: string,
  chunkContent: string,
  k1 = 1.2,
  b = 0.75,
  avgDocLength = 600
): number => {
  if (!query || !chunkContent) return 0;

  const queryTerms = tokenizeQuery(query);
  if (queryTerms.length === 0) return 0;

  const contentLower = chunkContent.toLowerCase();
  const chunkLength = chunkContent.length;

  let rawScore = 0;
  let matchesCount = 0;

  for (const term of queryTerms) {
    // Count occurrences of term in content
    let count = 0;
    let pos = 0;
    while ((pos = contentLower.indexOf(term, pos)) !== -1) {
      count++;
      pos += term.length;
    }

    if (count > 0) {
      matchesCount++;
      // BM25 term frequency saturation formula: (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgLen)))
      const lenNorm = 1 - b + b * (chunkLength / avgDocLength);
      const tfScore = (count * (k1 + 1)) / (count + k1 * lenNorm);
      rawScore += tfScore;
    }
  }

  if (matchesCount === 0) return 0;

  // Fraction of query terms matched (recall boost)
  const queryCoverage = matchesCount / queryTerms.length;

  // Exact full phrase bonus (e.g. "active learning", "docker volume create")
  const cleanQuery = query.trim().toLowerCase();
  let phraseBonus = 0;
  if (cleanQuery.length > 5 && contentLower.includes(cleanQuery)) {
    phraseBonus = 0.35;
  }

  // Exact acronym / identifier match bonus
  const exactKeywords = extractExactKeywords(query);
  let acronymBonus = 0;
  for (const keyword of exactKeywords) {
    if (chunkContent.includes(keyword)) {
      acronymBonus += 0.2;
    }
  }

  // Combine into normalized score [0, 1]
  const baseNormalized = (rawScore / (rawScore + 2.5)) * 0.65;
  const coverageWeight = queryCoverage * 0.35;
  const totalScore = baseNormalized + coverageWeight + phraseBonus + acronymBonus;

  return Math.min(1, Math.round(totalScore * 1000) / 1000);
};

/**
 * Combines dense vector similarity score with BM25 lexical score.
 * alpha: weight assigned to vector search (0.0 to 1.0). Default is 0.65.
 */
export const combineHybridScores = (
  vectorScore: number,
  lexicalScore: number,
  vectorWeight = 0.65
): number => {
  const vWeight = Math.max(0, Math.min(1, vectorWeight));
  const lWeight = 1 - vWeight;
  const combined = (vectorScore * vWeight) + (lexicalScore * lWeight);
  return Math.min(1, Math.max(0, Math.round(combined * 1000) / 1000));
};
