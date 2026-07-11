import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getDocuments = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch documents' };
  }
};

const getUploadSignature = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_UPLOAD_SIGNATURE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get upload signature' };
  }
};

const uploadToCloudinary = (file, signatureData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`;
    
    xhr.open('POST', url, true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      } else {
        console.error("CLOUDINARY ERROR RESPONSE:", xhr.responseText);
        reject(new Error(`Cloudinary error: ${xhr.responseText}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error during upload'));
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);
    // Note: resource_type is kept as 'image' automatically by the endpoint /image/upload
    
    xhr.send(formData);
  });
};

const uploadDocument = async (data) => {
  try {
    // Send JSON metadata to backend instead of FormData
    const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload document' };
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete document' };
  }
};

const getDocumentById = async (id) => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch document details' };
  }
};


const documentService = {
  getDocuments,
  getUploadSignature,
  uploadToCloudinary,
  uploadDocument,
  deleteDocument,
  getDocumentById,
};

export default documentService;