import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getQuizzesForDocument = async (documentId: string) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quizzes' };
  }
};

const getQuizById = async (quizId: string) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quiz' };
  }
};

const submitQuiz = async (quizId: string, answers: any) => {
  try {
    const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId), { answers });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to submit quiz' };
  }
};

const getQuizResults = async (quizId: string) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quiz results' };
  }
};

const deleteQuiz = async (quizId: string) => {
  try {
    const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to delete quiz' };
  }
};

const getQuizzesForWorkspace = async (workspaceId: string) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_WORKSPACE(workspaceId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch workspace quizzes' };
  }
};

const getAllQuizzes = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_ALL_QUIZZES);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quizzes' };
  }
};

const quizService = {
  getAllQuizzes,
  getQuizzesForDocument,
  getQuizzesForWorkspace,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};

export default quizService;
