import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId, ...options });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate flashcards' };
  }
};

const generateQuiz = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, { documentId, ...options });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate quiz' };
  }
};

const generateMindmap = async (documentId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_MINDMAP, { documentId });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate mindmap' };
  }
};

const getMindmap = async (documentId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.AI.GET_MINDMAP(documentId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch mindmap' };
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, { documentId });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate summary' };
  }
};

const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, { documentId, question: message }); // Removed history from payload
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Chat request failed' };
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, { documentId, concept });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to explain concept' };
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch chat history' };
  }
};

const workspaceChat = async (workspaceId, question) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.WORKSPACE_CHAT, { workspaceId, question });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Workspace chat request failed' };
  }
};

const getWorkspaceChatHistory = async (workspaceId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.AI.GET_WORKSPACE_CHAT_HISTORY(workspaceId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch workspace chat history' };
  }
};

const workspaceGenerateSummary = async (workspaceId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.WORKSPACE_GENERATE_SUMMARY, { workspaceId });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate workspace summary' };
  }
};

const workspaceGenerateMindmap = async (workspaceId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.WORKSPACE_GENERATE_MINDMAP, { workspaceId });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate workspace mindmap' };
  }
};

const getWorkspaceMindmap = async (workspaceId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.AI.GET_WORKSPACE_MINDMAP(workspaceId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch workspace mindmap' };
  }
};

const workspaceGenerateFlashcards = async (workspaceId, count) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.WORKSPACE_GENERATE_FLASHCARDS, { workspaceId, count });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate workspace flashcards' };
  }
};

const workspaceGenerateQuiz = async (workspaceId, numQuestions) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.WORKSPACE_GENERATE_QUIZ, { workspaceId, numQuestions });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate workspace quiz' };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateMindmap,
  getMindmap,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  workspaceChat,
  getWorkspaceChatHistory,
  workspaceGenerateSummary,
  workspaceGenerateMindmap,
  getWorkspaceMindmap,
  workspaceGenerateFlashcards,
  workspaceGenerateQuiz,
};

export default aiService;
