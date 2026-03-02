import React, { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, FileText, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../services/documentService'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import DocumentCard from '../../components/documents/DocumentCard'

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for upload model
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // State for delete confirmation model
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Fetch documents on component mount
  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle file changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error('Please select a file and enter a title');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success('Document uploaded successfully');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Handle document deletion
  const handleDeleteRequest = async (document) => {
    setSelectedDoc(document);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((doc) => doc._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center min-h-[400px]'>
          <Spinner size='lg' />
        </div>
      )
    }
    if (documents.length === 0) {
      return (
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center max-w-md'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6'>
              <FileText
                className='w-10 h-10 text-slate-400'
                strokeWidth={1.5}
              />
            </div>
            <h3 className='text-xl font-medium text-slate-900 tracking-tight mb-2'>
              No documents uploaded yet
            </h3>
            <p className='text-sm text-slate-500 mb-6'>
              Get started by uploading your first PDF document to begin learning.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)} className='inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98]'
            >
              <Plus className='w-4 h-4' strokeWidth={2.5} />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {documents?.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    )
  }
  return (
    <div className='max-h-screen'>
      {/* Subtle background pattern */}
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none' />

      <div className='relative max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>
              My Documents
            </h1>
            <p className='text-slate-500 text-sm'>
              Manage and organize your learning materials
            </p>
          </div>
          {documents.length > 0 && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className='w-4 h-4' strokeWidth={2.5} />
              Upload Document
            </Button>
          )}
        </div>
        {renderContent()}
      </div>

      {isUploadModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
          <div className='relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-6'>
            {/* Close Button */}
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className='absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 cursor-pointer'
            >
              <X className='w-5 h-5' strokeWidth={2} />
            </button>

            {/* Modal Header */}
            <div className='mb-6'>
              <h2 className='text-xl font-medium text-slate-900 tracking-tighter '>
                Upload New Document
              </h2>
              <p className='text-slate-500 text-sm mb-1'>
                Add PDF document to your library
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleUpload} className='space-y-5'>
              {/* Title Input */}
              <div className='space-y-2'>
                <label className='block text-sm font-semibold text-slate-700 uppercase tracking-wider'>
                  Document Title
                </label>
                <input
                  type='text'
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className='w-full px-4 py-2 border-2 border-slate-200 rounded-md bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/30 focus:outline-none focus:border-emerald-400 focus:bg-white'
                  placeholder='e.g., React interview prep'
                />
              </div>

              {/* File Upload */}
              <div className='space-y-2'>
                <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                  PDF File
                </label>
                <div className='relative border-2 border-dashed border-slate-300 shadow-xl bg-slate-50/50 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200'>
                  <input
                    type='file'
                    id='file-upload'
                    onChange={handleFileChange}
                    accept='.pdf'
                    required
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                  />
                  <div className='flex flex-col items-center justify-center py-10 px-6'>
                    <div className='p-2 bg-emerald-50 rounded-lg mb-2 border-slate-500 border'>
                      <Upload
                        className='w-4 h-4 text-emerald-700'
                        strokeWidth={2.5}
                      />
                    </div>
                    <p className='font-medium text-slate-700 text-sm mb-1'>
                      {uploadFile ? (
                        <span className='text-emerald-700'>
                          {uploadFile.name}
                        </span>
                      ) : (
                        <>
                          <span className='text-emerald-600'>
                            Click to upload
                          </span> {" "}
                          <span className='text-slate-700'>
                            Or drag and drop
                          </span>
                        </>
                      )}
                    </p>
                    <p className='text-slate-500 text-xs'>
                      PDF files only (max. 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className='flex-1 h-11 px-4 border-2 border-slate-300 rounded-xl bg-white text-slate-700 font-semibold text-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-100'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={uploading}
                  className='flex-1 h-11 px-4 border-2 border-slate-300 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm transition-all duration-200'
                >
                  {uploading ? (
                    <span className='flex items-center justify-center gap-2'>
                      <Loader className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' strokeWidth={2.5} />
                      Uploading...
                    </span>
                  ) : (
                    <span>Upload Document</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
          <div className='relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 shadow-slate-900/20 p-8'>
            {/* Close Button */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className='absolute top-8 right-6 h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 cursor-pointer'
            >
              <X className='w-5 h-5' strokeWidth={2} />
            </button>

            {/* Model Header */}
            <div className='mb-4'>
              <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 text-red-700 mb-4'>
                <Trash2 className='w-6 h-6 text-red-600' strokeWidth={2} />
              </div>
              <h2 className='text-xl font-medium text-slate-900 tracking-tight'>
                Confirm Deletion
              </h2>
            </div>

            {/* Content */}
            <p className='text-slate-700 text-sm leading-relaxed'>
              Are you sure you want to delete{" "}
              <span className='font-semibold text-slate-900'>
                "{selectedDoc?.title}"
              </span>
              ? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className='flex gap-3 mt-6'>
              <button
                type='button'
                disabled={deleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className='flex-1 h-11 px-4 border-2 border-slate-300 rounded-xl bg-white text-slate-700 font-semibold text-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-100'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className='flex-1 h-11 px-4 border-2 border-red-400 rounded-xl bg-linear-to-r from-red-500 to-rose-600 text-white font-semibold text-sm transition-all duration-200 hover:from-red-600 hover:to-rose-700'
              >
                {deleting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' strokeWidth={2.5} />
                    Deleting...
                  </span>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentListPage