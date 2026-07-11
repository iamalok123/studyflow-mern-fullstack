import React, { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, FileText, X, Loader, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../services/documentService'
import { extractPdfText } from '../../utils/pdfExtractor'
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
  const [uploadStep, setUploadStep] = useState(null); // 'reading', 'signing', 'uploading', 'saving'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState('');

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
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        e.target.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF file must be 10MB or smaller');
        e.target.value = '';
        return;
      }

      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      setUploadStep(null);
      setUploadProgress(0);
      setExtractionProgress('');
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
    
    try {
      // Step 1: Extract Text
      setUploadStep('reading');
      setUploadProgress(0);
      const { text, numPages, isLikelyScanned, chunks } = await extractPdfText(uploadFile, (current, total) => {
        setExtractionProgress(`Page ${current} of ${total}`);
        setUploadProgress(Math.round((current / total) * 100));
      });
      
      const fileSize = uploadFile.size;
      let attemptServerExtraction = false;
      
      if (isLikelyScanned) {
        if (fileSize <= 15 * 1024 * 1024) {
           attemptServerExtraction = true;
           toast('Scanned PDF detected. Server will attempt extraction.', { icon: 'ℹ️' });
        } else {
           toast.error('Scanned PDFs over 15MB will be saved without AI features.', { duration: 5000 });
        }
      }

      // Step 2: Get Signature
      setUploadStep('signing');
      const signatureData = await documentService.getUploadSignature();

      // Step 3: Upload to Cloudinary
      setUploadStep('uploading');
      setUploadProgress(0);
      const cloudinaryResult = await documentService.uploadToCloudinary(uploadFile, signatureData, (progress) => {
        setUploadProgress(progress);
      });

      // Step 4: Save metadata to backend
      setUploadStep('saving');
      const documentData = await documentService.uploadDocument({
        title: uploadTitle,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        fileSize,
        extractedText: text,
        attemptServerExtraction,
        fileName: uploadFile.name
      });

      toast.success('Document uploaded successfully');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadStep(null);
      setUploadProgress(0);
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
      setUploadStep(null);
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
        <div className='flex items-center justify-center min-h-100'>
          <Spinner size='lg' />
        </div>
      )
    }
    if (documents.length === 0) {
      return (
        <div className='flex items-center justify-center min-h-100'>
          <div className='text-center max-w-md'>
            <div className='inline-flex items-center justify-center w-20 h-20 app-muted-icon-tile mb-6'>
              <FileText
                className='w-10 h-10'
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
              onClick={() => setIsUploadModalOpen(true)} className='app-primary-action h-12'
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
    <div>
      <div className='app-page'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10'>
          <div>
            <h1 className='text-2xl font-black text-slate-950 tracking-tight mb-2'>
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
          <div className='relative w-full max-w-lg app-panel p-6'>
            {/* Close Button */}
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className='absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 cursor-pointer'
            >
              <X className='w-5 h-5' strokeWidth={2} />
            </button>

            {/* Modal Header */}
            <div className='mb-6'>
              <h2 className='text-xl font-black text-slate-950 tracking-tighter '>
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
                  className='app-input rounded-xl px-4 py-2'
                  placeholder='e.g., React interview prep'
                />
              </div>

              {/* File Upload */}
              <div className='space-y-2'>
                <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                  PDF File
                </label>
                <div className='relative border-2 border-dashed border-emerald-200 shadow-sm bg-[#EEF6F2]/70 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/70 transition-all duration-200'>
                  <input
                    type='file'
                    id='file-upload'
                    onChange={handleFileChange}
                    accept='.pdf'
                    required
                    disabled={uploading}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed'
                  />
                  <div className='flex flex-col items-center justify-center py-10 px-6'>
                    <div className='p-2 bg-white rounded-lg mb-2 border border-emerald-100'>
                      <Upload
                        className='w-4 h-4 text-emerald-700'
                        strokeWidth={2.5}
                      />
                    </div>
                    <p className='font-medium text-slate-700 text-sm mb-1'>
                      {uploadFile ? (
                        <span className='text-emerald-700'>
                          {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
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

              {/* Progress UI */}
              {uploading && uploadStep && (
                <div className='bg-slate-50 rounded-xl p-4 border border-slate-100'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-slate-700'>
                      {uploadStep === 'reading' && `Reading PDF... ${extractionProgress}`}
                      {uploadStep === 'signing' && 'Preparing upload...'}
                      {uploadStep === 'uploading' && `Storing PDF... ${uploadProgress}%`}
                      {uploadStep === 'saving' && 'Saving to database...'}
                    </span>
                    {uploadStep === 'uploading' && (
                      <span className='text-xs font-semibold text-emerald-600'>{uploadProgress}%</span>
                    )}
                    {uploadStep === 'reading' && (
                      <span className='text-xs font-semibold text-emerald-600'>{uploadProgress}%</span>
                    )}
                  </div>
                  <div className='w-full bg-slate-200 rounded-full h-2 overflow-hidden'>
                    <div 
                      className='bg-emerald-500 h-2 rounded-full transition-all duration-300' 
                      style={{ 
                        width: (uploadStep === 'uploading' || uploadStep === 'reading') ? `${uploadProgress}%` : 
                              (uploadStep === 'saving' ? '100%' : '10%') 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className='app-secondary-action flex-1 h-11'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={uploading}
                  className='app-primary-action flex-1 h-11'
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
          <div className='relative w-full max-w-md app-panel p-8'>
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
              <h2 className='text-xl font-black text-slate-950 tracking-tight'>
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
                className='app-secondary-action flex-1 h-11'
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
