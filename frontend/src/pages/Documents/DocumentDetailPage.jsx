import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AiActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';

const DocumentDetailPage = () => {

  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('Failed to fetch document details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // The filePath is a Cloudinary raw URL (opens in new tab)
  const pdfUrl = document?.data?.filePath || null;


  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (!document || !document.data || !pdfUrl) {
      return (
        <div className='text-center p-8'>
          <span>PDF not available</span>
        </div>
      );
    }

    const docData = document.data;
    const fileSizeMB = docData.fileSize ? (docData.fileSize / (1024 * 1024)).toFixed(2) : null;

    return (
      <div className='bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm'>
        {/* Document info header */}
        <div className='p-6 border-b border-slate-200'>
          <div className='flex items-center gap-4'>
            <div className='shrink-0 w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center'>
              <FileText size={28} className='text-emerald-600' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-semibold text-slate-800 truncate'>{docData.fileName}</h3>
              <div className='flex items-center gap-3 mt-1 text-sm text-slate-500'>
                {fileSizeMB && <span>{fileSizeMB} MB</span>}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  docData.status === 'Ready'
                    ? 'bg-emerald-50 text-emerald-700'
                    : docData.status === 'Processing'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {docData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View PDF button */}
        <div className='p-6 flex flex-col items-center gap-4 bg-slate-50'>
          <p className='text-sm text-slate-600 text-center'>
            Your PDF is securely stored in the cloud. Click below to view it.
          </p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className='inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm'
          >
            <ExternalLink size={18} />
            View PDF
          </a>
        </div>
      </div>
    );
  };


  const renderChat = () => {
    return (
      <ChatInterface />
    );
  };

  const renderAIActions = () => {
    return (
      <AiActions />
    );
  };

  const renderFlashcardsTab = () => {
    return (
      <FlashcardManager documentId={id} />
    );
  };

  const renderQuizzesTab = () => {
    return (
      <QuizManager documentId={id} />
    );
  };

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() }
  ];

  if (loading) {
    return <Spinner />
  }

  if (!document) {
    return (
      <div className='text-center p-8'>
        <span>Document not found.</span>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-4'>
        <Link
          to="/documents"
          className='inline-flex items-center gap-2 text-sm font-medium text-slate-800 hover:text-slate-900 transition-colors'
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.data.title} />
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default DocumentDetailPage;