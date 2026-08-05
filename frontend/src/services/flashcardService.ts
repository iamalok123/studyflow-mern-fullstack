import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getAllFlashcardSets = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch flashcard sets' };
    }
};

const getFlashcardsForDocument = async (documentId: string) => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch flashcards' };
    }
};

const reviewFlashcard = async (cardId: string, cardIndex: number) => {
    try {
        const response = await axiosInstance.post(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId), { cardIndex });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to review flashcard' };
    }
};

const toggleStar = async (cardId: string) => {
    try {
        const response = await axiosInstance.put(API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId));
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to star flashcard' };
    }
};

const deleteFlashcardSet = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id));
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to delete flashcards' };
    }
};

const getFlashcardsForWorkspace = async (workspaceId: string) => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_WORKSPACE(workspaceId));
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch workspace flashcards' };
    }
};

const getFlashcardSetById = async (setId: string) => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARD_SET_BY_ID(setId));
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch flashcard set' };
    }
};

const flashcardService = {
    getAllFlashcardSets,
    getFlashcardSetById,
    getFlashcardsForDocument,
    getFlashcardsForWorkspace,
    reviewFlashcard,
    toggleStar,
    deleteFlashcardSet,
};

export default flashcardService;
