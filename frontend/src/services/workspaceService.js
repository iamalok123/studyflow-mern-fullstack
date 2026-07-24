import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getWorkspaces = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.WORKSPACES.GET_ALL);
        return response.data?.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch workspaces' };
    }
};

const createWorkspace = async (data) => {
    try {
        const response = await axiosInstance.post(API_PATHS.WORKSPACES.CREATE, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to create workspace' };
    }
};

const getWorkspaceById = async (id) => {
    try {
        const response = await axiosInstance.get(API_PATHS.WORKSPACES.GET_BY_ID(id));
        return response.data?.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch workspace details' };
    }
};

const updateWorkspace = async (id, data) => {
    try {
        const response = await axiosInstance.put(API_PATHS.WORKSPACES.UPDATE(id), data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update workspace' };
    }
};

const deleteWorkspace = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.WORKSPACES.DELETE(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete workspace' };
    }
};

const addDocumentsToWorkspace = async (id, documentIds) => {
    try {
        const response = await axiosInstance.post(API_PATHS.WORKSPACES.ADD_DOCUMENTS(id), { documentIds });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to add documents to workspace' };
    }
};

const removeDocumentFromWorkspace = async (id, documentId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.WORKSPACES.REMOVE_DOCUMENT(id, documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to remove document from workspace' };
    }
};

const workspaceService = {
    getWorkspaces,
    createWorkspace,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    addDocumentsToWorkspace,
    removeDocumentFromWorkspace,
};

export default workspaceService;
