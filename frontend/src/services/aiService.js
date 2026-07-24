import axiosInstance from '../utils/axiosInstance';
import { BASE_URL, API_PATHS } from '../utils/apiPaths';

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

const streamFetch = async (url, body, onChunk) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errMessage = 'Streaming request failed';
    try {
      const errJson = await response.json();
      errMessage = errJson.error || errJson.message || errMessage;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete trailing line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const dataStr = trimmed.replace('data: ', '').trim();
        if (dataStr === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.text && typeof onChunk === 'function') {
            onChunk(parsed.text);
          }
          if (parsed.error) {
            throw new Error(parsed.error);
          }
        } catch (e) {
          if (e.message && !e.message.includes('JSON')) {
            throw e;
          }
        }
      }
    }
  }
};

const streamChat = async (documentId, question, onChunk) => {
  const fullUrl = `${BASE_URL}${API_PATHS.AI.STREAM_CHAT}`;
  await streamFetch(fullUrl, { documentId, question }, onChunk);
};

const streamWorkspaceChat = async (workspaceId, question, onChunk) => {
  const fullUrl = `${BASE_URL}${API_PATHS.AI.WORKSPACE_STREAM_CHAT}`;
  await streamFetch(fullUrl, { workspaceId, question }, onChunk);
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateMindmap,
  getMindmap,
  generateSummary,
  streamChat,
  explainConcept,
  getChatHistory,
  streamWorkspaceChat,
  getWorkspaceChatHistory,
  workspaceGenerateSummary,
  workspaceGenerateMindmap,
  getWorkspaceMindmap,
  workspaceGenerateFlashcards,
  workspaceGenerateQuiz,
};

export default aiService;
