import { Request, Response, NextFunction } from "express";
import Document from "../models/Document.js";
import Workspace from "../models/Workspace.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks, TextChunk } from "../utils/textChunker.js";
import { IDocument } from "../types/models.js";

const clampInt = (value: any, fallback: number, min: number, max: number): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

// @desc    Generate flashcards from document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId } = req.body;
    const count = clampInt(req.body.count, 5, 5, 20);

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "Ready",
    }).select("extractedText title");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready.",
        statusCode: 404,
      });
    }

    // Generate flashcards using Gemini
    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      count
    );

    if (!cards.length) {
      return res.status(422).json({
        success: false,
        error: "AI could not generate valid flashcards from this document. Please try a different document or count.",
        statusCode: 422,
      });
    }

    // Save flashcards to database
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate quiz from document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async ( req: Request, res: Response, next: NextFunction ): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId, title } = req.body;
    const numQuestions = clampInt(req.body.numQuestions, 5, 5, 20);

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "Ready",
    }).select("extractedText title");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready.",
        statusCode: 404,
      });
    }

    // Generate quiz using Gemini
    const questions = await geminiService.generateQuiz(
      document.extractedText,
      numQuestions
    );

    if (!questions.length) {
      return res.status(422).json({
        success: false,
        error: "AI could not generate a valid quiz from this document. Please try a different document or question count.",
        statusCode: 422,
      });
    }

    // Save quiz to database
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate mindmap from document
// @route   POST /api/ai/generate-mindmap
// @access  Private
export const generateMindmap = async ( req: Request, res: Response, next: NextFunction ): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "Ready",
    }).select("extractedText title mindmap");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready.",
        statusCode: 404,
      });
    }

    const mindmap = await geminiService.generateMindmap(document.extractedText);

    if (!mindmap?.title || !Array.isArray(mindmap.children)) {
      return res.status(422).json({
        success: false,
        error: "AI could not generate a valid mindmap from this document. Please try again.",
        statusCode: 422,
      });
    }

    const savedMindmap = {
      title: mindmap.title,
      children: mindmap.children,
      generatedAt: new Date(),
      schemaVersion: 1,
    };

    await Document.updateOne(
      { _id: document._id, userId: req.user._id },
      { $set: { mindmap: savedMindmap } },
      { runValidators: true }
    );

    res.status(201).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        mindmap: savedMindmap,
      },
      message: "Mindmap generated successfully",
    });
  } catch (error: any) {
    if (error?.message?.includes("valid mindmap")) {
      return res.status(422).json({
        success: false,
        error: error.message,
        statusCode: 422,
      });
    }
    next(error);
  }
};

// @desc    Get saved mindmap for a document
// @route   GET /api/ai/mindmap/:documentId
// @access  Private
export const getMindmap = async ( req: Request, res: Response, next: NextFunction ): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "Ready",
    }).select("title mindmap");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready.",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        mindmap: document.mindmap || null,
      },
      message: document.mindmap
        ? "Mindmap retrieved successfully"
        : "No mindmap found for this document",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate summary from document
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "Ready",
    }).select("extractedText title");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready.",
        statusCode: 404,
      });
    }

    // Generate summary using Gemini
    const summary = await geminiService.generateSummary(document.extractedText);

    res.status(201).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary,
      },
      message: "Summary generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream chat with document (SSE)
// @route   POST /api/ai/stream-chat
// @access  Private
export const streamChat = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID and question",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "Ready",
    }).select("chunks");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready.",
        statusCode: 404,
      });
    }

    // Setup SSE response headers for Vercel and browsers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const relevantChunks = findRelevantChunks(document.chunks, question, 5);
    const chunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);

    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: [],
      });
    }

    // Stream AI content chunks
    const answer = await geminiService.streamChatWithContext({
      question,
      chunks: relevantChunks,
      history: chatHistory.messages,
      onChunk: (chunkText: string) => {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      },
    });

    // Persist conversation to MongoDB history
    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      }
    );

    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100);
    }

    await chatHistory.save();

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("streamChat error:", error);
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Streaming failed" })}\n\n`);
      res.end();
    }
  }
};


// Alias for streamChat
export const chat = (req: Request, res: Response, next: NextFunction): Promise<void | Response> => 
  streamChat(req, res, next);


// @desc    Stream workspace multi-document chat (SSE)
// @route   POST /api/ai/workspace-stream-chat
// @access  Private
export const workspaceStreamChat = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { workspaceId, question } = req.body;

    if (!workspaceId || !question) {
      return res.status(400).json({
        success: false,
        error: "Please provide workspaceId and question",
        statusCode: 400,
      });
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
    }).populate({
      path: "documents",
      select: "title chunks status",
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found.",
        statusCode: 404,
      });
    }

    const readyDocs = ((workspace.documents as unknown as IDocument[]) || []).filter(
      (doc) => doc && doc.status === "Ready" && Array.isArray(doc.chunks) && doc.chunks.length > 0
    );

    if (readyDocs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No ready documents found in this workspace to answer your question.",
        statusCode: 400,
      });
    }

    // Setup SSE response headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const allChunks: TextChunk[] = [];
    let globalChunkIndex = 0;

    for (const doc of readyDocs) {
      for (const chunk of doc.chunks) {
        allChunks.push({
          content: `[Source Document: "${doc.title}"]\n${chunk.content}`,
          pageNumber: chunk.pageNumber || 0,
          chunkIndex: globalChunkIndex++,
        });
      }
    }

    const relevantChunks = findRelevantChunks(allChunks, question, 5);

    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      workspaceId: workspace._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        workspaceId: workspace._id,
        messages: [],
      });
    }

    const answer = await geminiService.streamChatWithContext({
      question,
      chunks: relevantChunks,
      history: chatHistory.messages,
      onChunk: (chunkText: string) => {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      },
    });

    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      }
    );

    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100);
    }

    await chatHistory.save();

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("workspaceStreamChat error:", error);
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Streaming failed" })}\n\n`);
      res.end();
    }
  }
};


// Alias for workspaceStreamChat
export const workspaceChat = (req: Request, res: Response, next: NextFunction): Promise<void | Response> => 
  workspaceStreamChat(req, res, next);


// @desc    Explain concept from a document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID and concept",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "Ready",
    }).select("chunks");

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready.",
        statusCode: 404,
      });
    }

    // Find relevant chunks for the concept
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    const context = relevantChunks.map((chunk) => chunk.content).join("\n\n");

    // Generate explanation using Gemini
    const explanation = await geminiService.explainConcept(concept, context);

    res.status(201).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((chunk) => chunk.chunkIndex),
      },
      message: "Explanation generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/ai/chat-history/:documentId
// @access  Private
export const getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentID",
        statusCode: 400,
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: documentId,
    }).select("messages");

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No chat history found for this document",
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: "Chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workspace chat history
// @route   GET /api/ai/workspace-chat-history/:workspaceId
// @access  Private
export const getWorkspaceChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { workspaceId } = req.params;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: "Please provide workspaceId",
        statusCode: 400,
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      workspaceId: workspaceId,
    }).select("messages");

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No chat history found for this workspace",
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: "Workspace chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Fetch combined workspace text
const getWorkspaceCombinedText = async (workspaceId: string, userId: any) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    userId: userId,
  }).populate({
    path: "documents",
    select: "title extractedText status",
  });

  if (!workspace) return { workspace: null, combinedText: "", readyDocs: [] };

  const readyDocs = ((workspace.documents as unknown as IDocument[]) || []).filter(
    (doc) => doc && doc.status === "Ready" && doc.extractedText && doc.extractedText.trim()
  );

  const combinedText = readyDocs
    .map((doc) => `=== DOCUMENT: "${doc.title}" ===\n${doc.extractedText}`)
    .join("\n\n");

  return { workspace, combinedText, readyDocs };
};

// @desc    Generate executive summary for an entire workspace
// @route   POST /api/ai/workspace-summary
// @access  Private
export const workspaceGenerateSummary = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { workspaceId } = req.body;
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Please provide workspaceId" });
    }

    const { workspace, combinedText, readyDocs } = await getWorkspaceCombinedText(
      workspaceId,
      req.user._id
    );

    if (!workspace) {
      return res.status(404).json({ success: false, error: "Workspace not found" });
    }

    if (readyDocs.length === 0) {
      return res.status(400).json({ success: false, error: "No ready documents in workspace to summarize" });
    }

    const summary = await geminiService.generateSummary(combinedText);

    workspace.summary = summary;
    workspace.summaryGeneratedAt = new Date();
    await workspace.save();

    res.status(201).json({
      success: true,
      data: {
        workspaceId: workspace._id,
        title: workspace.title,
        summary,
        summaryGeneratedAt: workspace.summaryGeneratedAt,
      },
      message: "Workspace summary generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate cross-document mindmap for a workspace
// @route   POST /api/ai/workspace-mindmap
// @access  Private
export const workspaceGenerateMindmap = async (req: Request, res: Response,next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { workspaceId } = req.body;
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Please provide workspaceId" });
    }

    const { workspace, combinedText, readyDocs } = await getWorkspaceCombinedText(
      workspaceId,
      req.user._id
    );

    if (!workspace) {
      return res.status(404).json({ success: false, error: "Workspace not found" });
    }

    if (readyDocs.length === 0) {
      return res.status(400).json({ success: false, error: "No ready documents in workspace to generate mindmap" });
    }

    const mindmap = await geminiService.generateMindmap(combinedText);

    if (!mindmap?.title || !Array.isArray(mindmap.children)) {
      return res.status(422).json({ success: false, error: "AI could not generate a valid mindmap for this workspace." });
    }

    const savedMindmap = {
      title: mindmap.title || workspace.title,
      children: mindmap.children,
      generatedAt: new Date(),
      schemaVersion: 1,
    };

    workspace.mindmap = savedMindmap;
    await workspace.save();

    res.status(201).json({
      success: true,
      data: {
        workspaceId: workspace._id,
        title: workspace.title,
        mindmap: savedMindmap,
      },
      message: "Workspace mindmap generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved workspace mindmap
// @route   GET /api/ai/workspace-mindmap/:workspaceId
// @access  Private
export const getWorkspaceMindmap = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id }).select(
      "title mindmap summary summaryGeneratedAt"
    );

    if (!workspace) {
      return res.status(404).json({ success: false, error: "Workspace not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        workspaceId: workspace._id,
        title: workspace.title,
        mindmap: workspace.mindmap || null,
        summary: workspace.summary || "",
        summaryGeneratedAt: workspace.summaryGeneratedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate workspace flashcards drawing from all files
// @route   POST /api/ai/workspace-flashcards
// @access  Private
export const workspaceGenerateFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { workspaceId } = req.body;
    const count = clampInt(req.body.count, 5, 5, 20);
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Please provide workspaceId" });
    }

    const { workspace, combinedText, readyDocs } = await getWorkspaceCombinedText(
      workspaceId,
      req.user._id
    );

    if (!workspace || readyDocs.length === 0) {
      return res.status(400).json({ success: false, error: "No ready documents in workspace to generate flashcards" });
    }

    const cards = await geminiService.generateFlashcards(combinedText, count);

    if (!cards.length) {
      return res.status(422).json({ success: false, error: "AI could not generate valid flashcards for this workspace." });
    }

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      workspaceId: workspace._id,
      title: `${workspace.title} - Workspace Set`,
      cards: cards.map((c) => ({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Workspace flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate workspace quiz drawing from all files
// @route   POST /api/ai/workspace-quiz
// @access  Private
export const workspaceGenerateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized", statusCode: 401 });
    }

    const { workspaceId, title } = req.body;
    const numQuestions = clampInt(req.body.numQuestions, 5, 5, 20);
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Please provide workspaceId" });
    }

    const { workspace, combinedText, readyDocs } = await getWorkspaceCombinedText(
      workspaceId,
      req.user._id
    );

    if (!workspace || readyDocs.length === 0) {
      return res.status(400).json({ success: false, error: "No ready documents in workspace to generate quiz" });
    }

    const questions = await geminiService.generateQuiz(combinedText, numQuestions);

    if (!questions.length) {
      return res.status(422).json({ success: false, error: "AI could not generate a valid quiz for this workspace." });
    }

    const quiz = await Quiz.create({
      userId: req.user._id,
      workspaceId: workspace._id,
      title: title || `${workspace.title} - Workspace Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Workspace quiz generated successfully",
    });
  } catch (error) {
    next(error);
  }
};
