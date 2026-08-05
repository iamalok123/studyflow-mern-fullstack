export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GOOGLE_LOGIN: "/api/auth/google",
        GET_PROFILE: "/api/auth/profile",
        UPDATE_PROFILE: "/api/auth/profile",
        CHANGE_PASSWORD: "/api/auth/change-password",
    },

    DOCUMENTS: {
        UPLOAD: "/api/documents/upload",
        GET_UPLOAD_SIGNATURE: "/api/documents/upload-signature",
        GET_DOCUMENTS: "/api/documents",
        GET_DOCUMENT_BY_ID: (id: string) => `/api/documents/${id}`,
        DELETE_DOCUMENT: (id: string) => `/api/documents/${id}`,
    },

    AI: {
        GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
        GENERATE_QUIZ: "/api/ai/generate-quiz",
        GENERATE_MINDMAP: "/api/ai/generate-mindmap",
        GET_MINDMAP: (documentId: string) => `/api/ai/mindmap/${documentId}`,
        GENERATE_SUMMARY: "/api/ai/generate-summary",
        STREAM_CHAT: "/api/ai/stream-chat",
        EXPLAIN_CONCEPT: "/api/ai/explain-concept",
        GET_CHAT_HISTORY: (documentId: string) => `/api/ai/chat-history/${documentId}`,
        WORKSPACE_STREAM_CHAT: "/api/ai/workspace-stream-chat",
        GET_WORKSPACE_CHAT_HISTORY: (workspaceId: string) => `/api/ai/workspace-chat-history/${workspaceId}`,
        WORKSPACE_GENERATE_SUMMARY: "/api/ai/workspace-summary",
        WORKSPACE_GENERATE_MINDMAP: "/api/ai/workspace-mindmap",
        GET_WORKSPACE_MINDMAP: (workspaceId: string) => `/api/ai/workspace-mindmap/${workspaceId}`,
        WORKSPACE_GENERATE_FLASHCARDS: "/api/ai/workspace-flashcards",
        WORKSPACE_GENERATE_QUIZ: "/api/ai/workspace-quiz",
    },

    WORKSPACES: {
        GET_ALL: "/api/workspaces",
        CREATE: "/api/workspaces",
        GET_BY_ID: (id: string) => `/api/workspaces/${id}`,
        UPDATE: (id: string) => `/api/workspaces/${id}`,
        DELETE: (id: string) => `/api/workspaces/${id}`,
        ADD_DOCUMENTS: (id: string) => `/api/workspaces/${id}/documents`,
        REMOVE_DOCUMENT: (id: string, docId: string) => `/api/workspaces/${id}/documents/${docId}`,
    },

    FLASHCARDS: {
        GET_ALL_FLASHCARD_SETS: "/api/flashcards",
        GET_FLASHCARD_SET_BY_ID: (setId: string) => `/api/flashcards/set/${setId}`,
        GET_FLASHCARDS_FOR_DOC: (documentId: string) => `/api/flashcards/${documentId}`,
        GET_FLASHCARDS_FOR_WORKSPACE: (workspaceId: string) => `/api/flashcards/workspace/${workspaceId}`,
        REVIEW_FLASHCARD: (cardId: string) => `/api/flashcards/${cardId}/review`,
        TOGGLE_STAR: (cardId: string) => `/api/flashcards/${cardId}/star`,
        DELETE_FLASHCARD_SET: (id: string) => `/api/flashcards/${id}`,
    },

    QUIZZES: {
        GET_ALL_QUIZZES: "/api/quizzes",
        GET_QUIZZES_FOR_DOC: (documentId: string) => `/api/quizzes/${documentId}`,
        GET_QUIZZES_FOR_WORKSPACE: (workspaceId: string) => `/api/quizzes/workspace/${workspaceId}`,
        GET_QUIZ_BY_ID: (id: string) => `/api/quizzes/quiz/${id}`,
        SUBMIT_QUIZ: (id: string) => `/api/quizzes/${id}/submit`,
        GET_QUIZ_RESULTS: (id: string) => `/api/quizzes/${id}/results`,
        DELETE_QUIZ: (id: string) => `/api/quizzes/${id}`,
    },

    PROGRESS: {
        GET_DASHBOARD: "/api/progress/dashboard",
    },
};
