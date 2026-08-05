import { GoogleGenAI } from "@google/genai";
import { IMindmapNode, IChatMessage } from "../types/models.js";
import { TextChunk } from "./textChunker.js";

// Lazy-initialised Gemini client (avoids module-level crash in serverless).
let _ai: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!_ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not set in environment variables. " +
          "Add it to your .env file or Vercel project settings."
      );
    }
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
};

/**
 * Retry a function with exponential backoff for transient API errors.
 */
const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
  const RETRYABLE_STATUS_CODES = [429, 500, 503];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const statusCode = error?.status || error?.statusCode;
      const isRetryable = RETRYABLE_STATUS_CODES.includes(statusCode);

      // If it's the last attempt or not a retryable error, throw immediately
      if (attempt === maxRetries || !isRetryable) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s
      console.warn(
        `Gemini API returned ${statusCode}. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Retry attempts exhausted");
};

/**
 * Helper to generate content via Gemini with automatic retry.
 */
const generateWithRetry = async (prompt: string): Promise<string> => {
  const response = await retryWithBackoff(() =>
    getAI().models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    })
  );
  return response.text || "";
};

const stripJsonFence = (text: string): string => {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return stripped.slice(firstBrace, lastBrace + 1);
  }

  return stripped;
};

const normalizeMindmapNode = (node: any, depth = 0): IMindmapNode | null => {
  if (!node || typeof node !== "object" || typeof node.title !== "string" || !node.title.trim()) {
    return null;
  }

  const children: IMindmapNode[] = Array.isArray(node.children) && depth < 3
    ? node.children
        .map((child: any) => normalizeMindmapNode(child, depth + 1))
        .filter((c: IMindmapNode | null): c is IMindmapNode => c !== null)
    : [];

  return {
    title: node.title.trim(),
    children,
  };
};

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

/**
 * Generate flashcards from text
 */
export const generateFlashcards = async (text: string, count = 10): Promise<GeneratedFlashcard[]> => {
  const prompt = `You are an expert educator creating study flashcards. Generate exactly ${count} high-quality flashcards from the text below.

Rules:
- Cover diverse aspects: definitions, key facts, cause-effect, comparisons, applications, and examples.
- Questions must be self-contained — a reader should understand the question without seeing the source text.
- Answers must be precise, factual, and concise (1-3 sentences max).
- Vary question styles: "What is...", "How does...", "Why is...", "Compare...", "What happens when...", "Name the..."
- Assign difficulty fairly: Easy = recall/definition, Medium = understanding/application, Hard = analysis/synthesis.
- If the text is code/technical: include syntax, logic, and concept-based questions.
- If the text is non-technical (history, literature, law, etc.): focus on events, themes, arguments, and key figures.
- NEVER invent information not present in the text.

Strict output format (no extra text before or after):
Q: [question]
A: [answer]
D: [Easy|Medium|Hard]
---
Q: [question]
A: [answer]
D: [Easy|Medium|Hard]
---
...continue for all ${count} flashcards...

Text:
${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateWithRetry(prompt);

    const flashcards: GeneratedFlashcard[] = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "", answer = "", difficulty: "Easy" | "Medium" | "Hard" = "Medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim();
          const normalized = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
          if (["Easy", "Medium", "Hard"].includes(normalized)) {
            difficulty = normalized as "Easy" | "Medium" | "Hard";
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error: any) {
    console.error("Gemini API error:", error);
    const statusCode = error?.status || error?.statusCode;
    if ([429, 503].includes(statusCode)) {
      throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
    }
    throw new Error("Failed to generate flashcards");
  }
};

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

/**
 * Generate quiz questions
 */
export const generateQuiz = async (text: string, numQuestions = 5): Promise<GeneratedQuizQuestion[]> => {
  const prompt = `You are an expert quiz creator. Generate exactly ${numQuestions} multiple-choice questions from the text below.

Rules:
- Each question must have exactly 4 options. Only ONE is correct.
- Distractors (wrong options) must be plausible but clearly incorrect — no trick questions.
- Cover a mix of: factual recall, conceptual understanding, application, and analysis.
- Questions must be self-contained — a reader should understand them without the source text.
- The correct answer text in "A:" must exactly match one of the four options.
- Explanations should be educational — briefly state WHY the answer is correct.
- Assign difficulty: Easy = direct recall, Medium = requires understanding, Hard = requires reasoning/synthesis.
- If the text is code/technical: include output prediction, bug identification, and concept questions.
- If the text is non-technical: focus on comprehension, inference, and key details.
- NEVER invent facts not present in the text.

Strict output format (no extra text before or after):
Q: [question]
O1: [option 1]
O2: [option 2]
O3: [option 3]
O4: [option 4]
A: [correct option text — must exactly match one of O1-O4]
E: [explanation]
D: [Easy|Medium|Hard]
---
...continue for all ${numQuestions} questions...

Text:
${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateWithRetry(prompt);

    const questions: GeneratedQuizQuestion[] = [];
    const questionBlocks = generatedText.split("---").filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");
      let question = "", options: string[] = [], correctAnswer = "", explanation = "", difficulty: "Easy" | "Medium" | "Hard" = "Medium";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^O\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("A:")) {
          correctAnswer = trimmed.substring(2).trim();
          correctAnswer = correctAnswer.replace(/^O\d:\s*/, "");
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim();
          const normalized = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
          if (["Easy", "Medium", "Hard"].includes(normalized)) {
            difficulty = normalized as "Easy" | "Medium" | "Hard";
          }
        }
      }

      if (question && options.length === 4 && correctAnswer && options.includes(correctAnswer)) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error: any) {
    console.error("Gemini API error (generateQuiz):", error?.message || error);
    const statusCode = error?.status || error?.statusCode;
    if ([429, 503].includes(statusCode)) {
      throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
    }
    throw new Error(error?.message || "Failed to generate quiz");
  }
};

export interface GeneratedMindmap {
  title: string;
  children: IMindmapNode[];
}

/**
 * Generate a structured mindmap from document text
 */
export const generateMindmap = async (text: string): Promise<GeneratedMindmap> => {
  const prompt = `You are an expert study coach. Create a concise mindmap from the document text below.

Rules:
- Return ONLY valid JSON. Do not include markdown fences, prose, comments, or explanations.
- The JSON root must be an object with: "title" and "children".
- Keep labels concise: 2-7 words per node.
- Use a maximum depth of 3 levels below the root.
- Use 4-7 main branches when the document has enough material.
- Each child must follow the same shape: { "title": string, "children": array }.
- If a node has no children, use "children": [].
- Do not invent facts not present in the text.

Required JSON shape:
{
  "title": "Main Topic",
  "children": [
    {
      "title": "Major Concept",
      "children": [
        { "title": "Supporting Detail", "children": [] }
      ]
    }
  ]
}

Text:
${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateWithRetry(prompt);
    const parsed = JSON.parse(stripJsonFence(generatedText));
    const mindmap = normalizeMindmapNode(parsed);

    if (!mindmap || !Array.isArray(mindmap.children)) {
      throw new Error("Invalid mindmap JSON shape");
    }

    return mindmap;
  } catch (error: any) {
    console.error("Gemini API error (generateMindmap):", error?.message || error);
    const statusCode = error?.status || error?.statusCode;
    if ([429, 503].includes(statusCode)) {
      throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
    }
    throw new Error("AI could not generate a valid mindmap from this document. Please try again.");
  }
};

/**
 * Generate document summary
 */
export const generateSummary = async (text: string): Promise<string> => {
  const prompt = `You are an expert summarizer. Provide a clear, well-structured summary of the following text.

Instructions:
- Start with a one-line **Overview** sentence capturing the core topic.
- Then list **Key Points** as bullet points (use "•" prefix). Each point should be a concise, standalone insight.
- Group related points under short **bold headings** if the content covers multiple topics or sections.
- End with a **Takeaway** — a 1-2 sentence conclusion or main lesson.
- Adapt your tone to the content: technical docs → precise and factual; narratives → thematic and analytical; research → findings-focused.
- If the text contains code: summarize what the code does, key functions, and the overall architecture.
- If the text is very short: still provide structured points, do not pad with filler.
- NEVER add information not present in the text.
- Use markdown formatting (bold, bullet points, headings) for readability.

Text:
${text.substring(0, 20000)}`;

  try {
    const generatedText = await generateWithRetry(prompt);
    return generatedText;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    const statusCode = error?.status || error?.statusCode;
    if ([429, 503].includes(statusCode)) {
      throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
    }
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context
 */
export const chatWithContext = async (question: string, chunks: TextChunk[], history: IChatMessage[] = []): Promise<string> => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  let historyBlock = "";
  if (history.length > 0) {
    const recentMessages = history.slice(-14);
    historyBlock =
      "\nRecent Conversation History:\n" +
      recentMessages
        .map(
          (m) =>
            `${m.role === "user" ? "Student" : "Assistant"}: ${m.content.substring(0, 1000)}`
        )
        .join("\n") +
      "\n";
  }

  const prompt = `You are an expert study assistant helping a student learn from their uploaded document(s).

CRITICAL FORMATTING & VISUAL PRESENTATION RULES:
1. SOURCE TAGGING:
   - If the answer is found in or derived from the document context, begin your response on line 1 with: "**Based on the document:**" followed by two newlines.
   - If the question is completely unrelated to the context, begin line 1 with: "**Not covered in the document. Based on general knowledge:**" followed by two newlines.
   - NEVER use single asterisks like "*Based on the document:*" or insert spaces inside double asterisks.

2. CODE & SYNTAX EXAMPLES:
   - ALWAYS place code, SQL queries, formulas, command lines, or syntax examples inside proper triple-backtick fenced code blocks with language identifier on a NEW line (e.g. \`\`\`sql\nSELECT * FROM table;\n\`\`\` or \`\`\`python\ndef example(): pass\n\`\`\`).
   - NEVER write language names like "sql", "javascript", "python" inline right after "Syntax:" or "Example:" without code block fences.
   - NEVER put bullet points (like "- " or "• ") inside a code snippet or in front of SQL clauses (e.g. NEVER write "- FROM table").
   - NEVER put code on the same line as bullet text or prose headings. Always put fenced code blocks on new lines with blank lines around them.
   - NEVER split a single code example or SQL query into half fenced code and half plain text. Put the ENTIRE query inside one single fenced code block.

3. STRUCTURE & HEADINGS:
   - Use bold Markdown section headings (### Section Title) to cleanly divide topics, definitions, syntax, and practical examples.
   - Use blank lines between headings, list items, and code blocks for clear visual hierarchy.

4. LISTS & BULLETS:
   - Use standard Markdown hyphen bullet points ("- "). Put every bullet point on its own new line. Never squish multiple bullet points or sub-items onto a single line.

Document Context:
${context}
${historyBlock}
Student's current question: ${question}

Response:`;

  try {
    const generatedText = await generateWithRetry(prompt);
    return generatedText;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    const statusCode = error?.status || error?.statusCode;
    if ([429, 503].includes(statusCode)) {
      throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
    }
    throw new Error("Failed to process chat request");
  }
};

export interface StreamChatParams {
  question: string;
  chunks: TextChunk[];
  history?: IChatMessage[];
  onChunk?: (chunkText: string) => void;
}

/**
 * Stream chat with document/workspace context
 */
export const streamChatWithContext = async ({ question, chunks, history = [], onChunk }: StreamChatParams): Promise<string> => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  let historyBlock = "";
  if (history.length > 0) {
    const recentMessages = history.slice(-14);
    historyBlock =
      "\nRecent Conversation History (Last 5-7 questions & answers):\n" +
      recentMessages
        .map(
          (m) =>
            `${m.role === "user" ? "Student" : "Assistant"}: ${m.content.substring(0, 1000)}`
        )
        .join("\n") +
      "\n";
  }

  const prompt = `You are an expert study assistant helping a student learn from their uploaded document(s).

CRITICAL FORMATTING & VISUAL PRESENTATION RULES:
1. SOURCE TAGGING:
   - If the answer is found in or derived from the document context, begin your response on line 1 with: "**Based on the document:**" followed by two newlines.
   - If the question is completely unrelated to the context, begin line 1 with: "**Not covered in the document. Based on general knowledge:**" followed by two newlines.
   - NEVER use single asterisks like "*Based on the document:*" or insert spaces inside double asterisks.

2. CODE & SYNTAX EXAMPLES:
   - ALWAYS place code, SQL queries, formulas, command lines, or syntax examples inside proper triple-backtick fenced code blocks with language identifier on a NEW line (e.g. \`\`\`sql\nSELECT * FROM table;\n\`\`\` or \`\`\`python\ndef example(): pass\n\`\`\`).
   - NEVER write language names like "sql", "javascript", "python" inline right after "Syntax:" or "Example:" without code block fences.
   - NEVER put bullet points (like "- " or "• ") inside a code snippet or in front of SQL clauses (e.g. NEVER write "- FROM table").
   - NEVER put code on the same line as bullet text or prose headings. Always put fenced code blocks on new lines with blank lines around them.
   - NEVER split a single code example or SQL query into half fenced code and half plain text. Put the ENTIRE query inside one single fenced code block.

3. STRUCTURE & HEADINGS:
   - Use bold Markdown section headings (### Section Title) to cleanly divide topics, definitions, syntax, and practical examples.
   - Use blank lines between headings, list items, and code blocks for clear visual hierarchy.

4. LISTS & BULLETS:
   - Use standard Markdown hyphen bullet points ("- "). Put every bullet point on its own new line. Never squish multiple bullet points or sub-items onto a single line.

Document Context:
${context}
${historyBlock}
Student's current question: ${question}

Response:`;

  try {
    const responseStream = await getAI().models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        if (typeof onChunk === "function") {
          onChunk(chunk.text);
        }
      }
    }
    return fullText;
  } catch (error: any) {
    console.error("Gemini Streaming API error:", error);
    const statusCode = error?.status || error?.statusCode;
    if ([429, 503].includes(statusCode)) {
      throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
    }
    throw new Error("Failed to stream chat response");
  }
};

/**
 * Explain a specific concept
 */
export const explainConcept = async (concept: string, context: string): Promise<string> => {
  const prompt = `You are an expert educator. Explain the concept of "${concept}" clearly and thoroughly.

Document context:
${context.substring(0, 10000)}

Instructions:
- If the concept appears in or relates to the context, explain it grounded in the document. Start with: "**Based on the document:**"
- If the concept is unrelated to the context, explain from general knowledge. Start with: "**Not covered in the document. Based on general knowledge:**"
- Structure your explanation with these sections (use **bold headings** and bullet points):
  • **What it is** — A clear 1-2 sentence definition.
  • **How it works** — Step-by-step breakdown or mechanism.
  • **Why it matters** — Real-world relevance or importance.
  • **Example** — A concrete, easy-to-understand example.
  • **Common Misconceptions** (optional) — Only if there are frequent misunderstandings.
- Adapt complexity to the content: beginner-friendly for general topics, precise for technical/code concepts.
- For code concepts: include a small illustrative code snippet if helpful.
- Use markdown formatting (bold, bullets, code blocks) for readability.

Explanation:`;

  try {
    const generatedText = await generateWithRetry(prompt);
    return generatedText;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    const statusCode = error?.status || error?.statusCode;
    if ([429, 503].includes(statusCode)) {
      throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
    }
    throw new Error("Failed to explain concept");
  }
};
