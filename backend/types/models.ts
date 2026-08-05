import { Types, Document } from "mongoose";

// ── Mindmap Interfaces ──
export interface IMindmapNode {
  title: string;
  children: IMindmapNode[];
}

export interface IMindmap {
  title: string;
  children: IMindmapNode[];
  generatedAt: Date;
  schemaVersion: number;
}

// ── Chunk Interface ──
export interface IChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  _id?: Types.ObjectId;
}

// ── User Interface ──
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  profileImage: string;
  googleId?: string;
  authProvider: "local" | "google";
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// ── Document Interface ──
export interface IDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  fileName: string;
  filePath: string;
  cloudinaryPublicId: string | null;
  fileSize: number;
  extractedText: string;
  chunks: IChunk[];
  uploadDate: Date;
  lastAccessed: Date;
  status: "Processing" | "Ready" | "Failed";
  mindmap: IMindmap | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Workspace Interface ──
export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  color: string;
  documents: Types.ObjectId[];
  summary: string;
  summaryGeneratedAt: Date | null;
  mindmap: IMindmap | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Flashcard Interface ──
export interface IFlashcardCard {
  _id?: Types.ObjectId;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
  lastReviewed: Date | null;
  reviewCount: number;
  isStarred: boolean;
}

export interface IFlashcard extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  documentId: Types.ObjectId | null;
  workspaceId: Types.ObjectId | null;
  title: string;
  cards: IFlashcardCard[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Quiz Interface ──
export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface IUserAnswer {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: Date;
}

export interface IQuiz extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  documentId: Types.ObjectId | null;
  workspaceId: Types.ObjectId | null;
  title: string;
  questions: IQuizQuestion[];
  userAnswers: IUserAnswer[];
  score: number;
  totalQuestions: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Chat History Interface ──
export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  relevantChunks: number[];
}

export interface IChatHistory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  documentId: Types.ObjectId | null;
  workspaceId: Types.ObjectId | null;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
