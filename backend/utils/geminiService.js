import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not set in the environment variables.");
    process.exit(1);
}

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
        ai.models.generateContent({
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
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: Easy, Medium, or Hard]

    Separate each flashcard with "---"

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
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    A: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: Easy, Medium, or Hard]

    Separate questions with "---"

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
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important details.
    Keep the summary clear and structured.

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

    const prompt = `You are a helpful learning assistant. Answer the user's question based on the document context provided below.

    Instructions:
    - If the answer is found in the context, or the question is related/similar to the context, answer based on the context. Start your answer with: "Based on the document:"
    - If the question is completely unrelated to the context and not covered at all, answer using your general knowledge. Start your answer with: "This is not covered in the document. Based on general knowledge:"
    - Provide clear, well-structured, and educational answers.
    - Include examples where helpful.

    Context:
    ${context}

    Question: ${question}

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
    const prompt = `You are a helpful learning assistant. Explain the concept of "${concept}" in a clear, educational way.

    Instructions:
    - If the concept is found in the context below, or is related/similar to the context, explain it based on the context. Start your explanation with: "Based on the document:"
    - If the concept is completely unrelated to the context and not covered at all, explain it using your general knowledge. Start your explanation with: "This concept is not covered in the document. Based on general knowledge:"
    - Always provide a clear, easy-to-understand explanation with relevant examples.

    Context:
    ${context.substring(0, 10000)}`;

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
