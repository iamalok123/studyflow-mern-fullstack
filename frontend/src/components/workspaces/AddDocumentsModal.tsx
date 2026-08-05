import React, { useState, useEffect } from 'react';
import { X, Check, Search, Upload, FileText, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import documentService from '../../services/documentService';
import { extractPdfText } from '../../utils/pdfExtractor';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

const AddDocumentsModal = ({ isOpen, onClose, onAdd, workspaceId, existingDocIds = [] }) => {
  const [activeTab, setActiveTab] = useState('select'); // 'select' | 'upload'

  // Selection tab state
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Upload tab state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState(null); // 'reading' | 'signing' | 'uploading' | 'saving'
  const [extractionProgress, setExtractionProgress] = useState('');

  const fetchDocuments = React.useCallback(async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments();
      const available = (docs || []).filter(doc => !existingDocIds.includes(doc._id));
      setAvailableDocs(available);
    } catch (err) {
      console.error('Failed to fetch available documents:', err);
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [existingDocIds]);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      setSelectedDocIds([]);
      setSearchQuery('');
      setError('');
      setUploadFile(null);
      setUploadTitle('');
      setUploading(false);
      setUploadProgress(0);
      setUploadStep(null);
      setActiveTab('select');
    }
  }, [isOpen, fetchDocuments]);

  const toggleSelection = (id) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddSelected = async (e) => {
    e.preventDefault();
    if (selectedDocIds.length === 0) {
      setError('Please select at least one document to add.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onAdd(selectedDocIds);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadNewFile = async (e) => {
    e.preventDefault();
    if (uploading) return;

    if (!uploadFile || !uploadTitle.trim()) {
      setError('Please select a PDF file and enter a document title.');
      return;
    }

    if (uploadFile.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    if (uploadFile.size > MAX_PDF_SIZE_BYTES) {
      setError('PDF file must be 10MB or smaller.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Step 1: Extract Text
      setUploadStep('reading');
      setUploadProgress(0);
      const { text, isLikelyScanned } = await extractPdfText(uploadFile, (current, total) => {
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

      // Step 4: Save metadata to backend & link to workspace
      setUploadStep('saving');
      const newDoc = await documentService.uploadDocument({
        title: uploadTitle.trim(),
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        fileSize,
        extractedText: text,
        attemptServerExtraction,
        fileName: uploadFile.name,
        workspaceId
      });

      toast.success('New document uploaded & added to workspace!');
      if (newDoc?.data?._id && onAdd) {
        await onAdd([newDoc.data._id]);
      }
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload document.');
      setUploadStep(null);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredDocs = availableDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={uploading || isSubmitting}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-1">
            {activeTab === 'upload' ? 'Upload New Document' : 'Add Documents to Workspace'}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {activeTab === 'upload' ? 'Add PDF document to your workspace library' : 'Select uploaded documents from your collection'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('select')}
            disabled={uploading || isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'select'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Select Existing ({availableDocs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            disabled={uploading || isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload New PDF
          </button>
        </div>

        {/* Tab 1: Select Existing Documents */}
        {activeTab === 'select' && (
          <form onSubmit={handleAddSelected} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search available documents..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="py-10 flex justify-center items-center gap-2 text-xs font-semibold text-slate-500">
                  <Loader className="w-4 h-4 animate-spin text-emerald-600" /> Loading documents...
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  {availableDocs.length === 0
                    ? 'All your uploaded documents are already in this workspace!'
                    : 'No documents match your search.'}
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc._id);
                  return (
                    <div
                      key={doc._id}
                      onClick={() => toggleSelection(doc._id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold truncate mb-0.5">{doc.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{doc.fileName}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                {selectedDocIds.length} {selectedDocIds.length === 1 ? 'document' : 'documents'} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedDocIds.length === 0}
                  className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Selected</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Upload New Document */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadNewFile} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                DOCUMENT TITLE
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., React interview prep"
                disabled={uploading}
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                PDF FILE
              </label>
              <div className="relative border-2 border-dashed border-emerald-200/90 rounded-2xl p-6 text-center hover:border-emerald-400 transition-all bg-[#EEF6F2]/60">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        setError('Please select a PDF file.');
                        e.target.value = '';
                        return;
                      }

                      if (file.size > MAX_PDF_SIZE_BYTES) {
                        setError('PDF file must be 10MB or smaller.');
                        e.target.value = '';
                        return;
                      }

                      setError('');
                      setUploadFile(file);
                      if (!uploadTitle) {
                        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                    <Upload className="w-5 h-5" strokeWidth={2.2} />
                  </div>

                  {uploadFile ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <FileText className="w-4 h-4" />
                      <span>{uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-slate-700 mb-1">
                        <span className="text-emerald-600 font-bold hover:underline">Click to upload</span> Or drag and drop
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        PDF files only (max. 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress UI */}
            {uploading && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-emerald-600" />
                    {uploadStep === 'reading' && `Reading PDF... (${extractionProgress})`}
                    {uploadStep === 'signing' && 'Preparing secure upload...'}
                    {uploadStep === 'uploading' && `Uploading PDF... ${uploadProgress}%`}
                    {uploadStep === 'saving' && 'Saving & indexing document...'}
                  </span>
                  <span className="text-emerald-700 font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: (uploadStep === 'uploading' || uploadStep === 'reading')
                        ? `${uploadProgress}%`
                        : (uploadStep === 'saving' ? '100%' : '15%')
                    }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 py-3 px-5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !uploadFile || !uploadTitle.trim()}
                className="flex-1 py-3 px-5 rounded-full bg-slate-950 hover:bg-slate-900 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin text-white" strokeWidth={2.5} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Document</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddDocumentsModal;
