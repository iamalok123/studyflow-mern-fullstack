import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getWorkspaces = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.WORKSPACES.GET_ALL);
        return response.data?.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch workspaces' };
    }
};

const createWorkspace = async (data: { title: string; description?: string; color?: string; documents?: string[] }) => {
    try {
        const response = await axiosInstance.post(API_PATHS.WORKSPACES.CREATE, data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to create workspace' };
    }
};

const getWorkspaceById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API_PATHS.WORKSPACES.GET_BY_ID(id));
        return response.data?.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch workspace details' };
    }
};

const updateWorkspace = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API_PATHS.WORKSPACES.UPDATE(id), data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to update workspace' };
    }
};

const deleteWorkspace = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.WORKSPACES.DELETE(id));
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to delete workspace' };
    }
};

const addDocumentsToWorkspace = async (id: string, documentIds: string[]) => {
    try {
        const response = await axiosInstance.post(API_PATHS.WORKSPACES.ADD_DOCUMENTS(id), { documentIds });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to add documents to workspace' };
    }
};

const removeDocumentFromWorkspace = async (id: string, documentId: string) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.WORKSPACES.REMOVE_DOCUMENT(id, documentId));
        return response.data;
    } catch (error: any) {
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
