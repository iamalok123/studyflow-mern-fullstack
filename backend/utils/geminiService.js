import { GoogleGenAI } from "@google/genai";

// Lazy-initialised Gemini client (avoids module-level crash in serverless).
let _ai = null;
const getAI = () => {
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
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise<*>} - Result of the function
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    const RETRYABLE_STATUS_CODES = [429, 500, 503];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
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
};


/**
 * Helper to generate content via Gemini with automatic retry.
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The generated text
 */
const generateWithRetry = async (prompt) => {
    const response = await retryWithBackoff(() =>
        getAI().models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        })
    );
    return response.text;
};


/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
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

        // Parse the response
        const flashcards = [];
        const cards = generatedText.split("---").filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split("\n");
            let question = "", answer = "", difficulty = "Medium";

            for (const line of lines) {
                if (line.startsWith("Q:")) {
                    question = line.substring(2).trim();
                } else if (line.startsWith("A:")) {
                    answer = line.substring(2).trim();
                } else if (line.startsWith("D:")) {
                    const diff = line.substring(2).trim();
                    const normalized = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
                    if (["Easy", "Medium", "Hard"].includes(normalized)) {
                        difficulty = normalized;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards.slice(0, count);

    } catch (error) {
        console.error("Gemini API error:", error);
        const statusCode = error?.status || error?.statusCode;
        if ([429, 503].includes(statusCode)) {
            throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
        }
        throw new Error("Failed to generate flashcards");
    }
};



/**
 * Generate quiz questions
 * @param {string} text - Document
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
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

        const questions = [];
        const questionBlocks = generatedText.split("---").filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split("\n");
            let question = "", options = [], correctAnswer = "", explanation = "", difficulty = "Medium";

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith("Q:")) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.match(/^O\d:/)) {
                    options.push(trimmed.substring(3).trim());
                } else if (trimmed.startsWith("A:")) {
                    correctAnswer = trimmed.substring(2).trim();
                    // Strip "O1:", "O2:", etc. prefix if present so it matches the options array
                    correctAnswer = correctAnswer.replace(/^O\d:\s*/, "");
                } else if (trimmed.startsWith("E:")) {
                    explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith("D:")) {
                    const diff = trimmed.substring(2).trim();
                    const normalized = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
                    if (["Easy", "Medium", "Hard"].includes(normalized)) {
                        difficulty = normalized;
                    }
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                questions.push({
                    question,
                    options,
                    correctAnswer,
                    explanation,
                    difficulty
                });
            }
        }

        return questions.slice(0, numQuestions);

    } catch (error) {
        console.error("Gemini API error (generateQuiz):", error?.message || error);
        const statusCode = error?.status || error?.statusCode;
        if ([429, 503].includes(statusCode)) {
            throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
        }
        throw new Error(error?.message || "Failed to generate quiz");
    }
};



/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
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
    } catch (error) {
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
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
    const context = chunks
        .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
        .join("\n\n");

    const prompt = `You are an expert study assistant helping a student learn from their uploaded document.

Context from the document:
${context}

Student's question: ${question}

Instructions:
- If the answer is found in or related to the context, answer based on the document. Start with: "**Based on the document:**"
- If the question is completely unrelated to the context, answer from general knowledge. Start with: "**Not covered in the document. Based on general knowledge:**"
- Structure your answer in clear **bullet points** (use "•" prefix) for readability.
- For complex answers, use short **bold headings** to organize sections.
- Include practical **examples** where they aid understanding.
- If the question is about code: explain logic step-by-step, mention inputs/outputs, and highlight edge cases.
- If the question is vague (e.g., "explain this", "tell me more"): cover the most important aspects of the document context.
- Keep answers educational but concise — no unnecessary repetition.
- Use markdown formatting (bold, bullets, code blocks) for clarity.

Answer:`;

    try {
        const generatedText = await generateWithRetry(prompt);
        return generatedText;
    } catch (error) {
        console.error("Gemini API error:", error);
        const statusCode = error?.status || error?.statusCode;
        if ([429, 503].includes(statusCode)) {
            throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
        }
        throw new Error("Failed to process chat request");
    }
};




/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
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
    } catch (error) {
        console.error("Gemini API error:", error);
        const statusCode = error?.status || error?.statusCode;
        if ([429, 503].includes(statusCode)) {
            throw new Error("Gemini API is temporarily unavailable due to high demand. Please try again in a moment.");
        }
        throw new Error("Failed to explain concept");
    }
};
