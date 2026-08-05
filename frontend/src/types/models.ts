export interface IUser {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
  googleId?: string;
  authProvider?: "local" | "google";
  createdAt?: string;
  updatedAt?: string;
}

export interface IMindmapNode {
  title: string;
  children: IMindmapNode[];
}

export interface IMindmap {
  title: string;
  children: IMindmapNode[];
  generatedAt?: string;
  schemaVersion?: number;
}

export interface IChunk {
  _id?: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
}

export interface IDocumentItem {
  _id: string;
  userId: string;
  title: string;
  fileName: string;
  filePath: string;
  cloudinaryPublicId?: string | null;
  fileSize: number;
  extractedText?: string;
  chunks?: IChunk[];
  uploadDate: string;
  lastAccessed: string;
  status: "Processing" | "Ready" | "Failed";
  mindmap?: IMindmap | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IWorkspaceItem {
  _id: string;
  userId: string;
  title: string;
  description: string;
  color: string;
  documents: (string | IDocumentItem)[];
  summary?: string;
  summaryGeneratedAt?: string | null;
  mindmap?: IMindmap | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFlashcardCard {
  _id?: string;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
  lastReviewed?: string | null;
  reviewCount: number;
  isStarred: boolean;
}

export interface IFlashcardItem {
  _id: string;
  userId: string;
  documentId?: string | null;
  workspaceId?: string | null;
  title: string;
  cards: IFlashcardCard[];
  createdAt?: string;
  updatedAt?: string;
}

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
  answeredAt?: string;
}

export interface IQuizItem {
  _id: string;
  userId: string;
  documentId?: string | null;
  workspaceId?: string | null;
  title: string;
  questions: IQuizQuestion[];
  userAnswers: IUserAnswer[];
  score: number;
  totalQuestions: number;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  relevantChunks?: number[];
  sources?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
