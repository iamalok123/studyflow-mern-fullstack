import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';

const ChatInterface = lazy(() => import('../../components/chat/ChatInterface'));
const AiActions = lazy(() => import('../../components/ai/AIActions'));
const MindmapViewer = lazy(() => import('../../components/mindmap/MindmapViewer'));
const FlashcardManager = lazy(() => import('../../components/flashcards/FlashcardManager'));
const QuizManager = lazy(() => import('../../components/quizzes/QuizManager'));
const PdfViewer = lazy(() => import('../../components/documents/PdfViewer'));

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
        toast.error(error?.error || error?.message || 'Failed to fetch document details.');
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
      <div className='app-panel overflow-hidden flex flex-col h-full min-h-[600px]'>
        {/* Document info header */}
        <div className='p-6 border-b border-slate-200'>
          <div className='flex items-center gap-4'>
            <div className='shrink-0 w-14 h-14 app-muted-icon-tile'>
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
        {/* PDF Viewer */}
        <div className='flex-1 p-4 bg-slate-50 min-h-0'>
          <Suspense fallback={<Spinner />}>
            <PdfViewer url={pdfUrl} />
          </Suspense>
        </div>
      </div>
    );
  };


  const renderChat = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <ChatInterface />
      </Suspense>
    );
  };

  const renderAIActions = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <AiActions />
      </Suspense>
    );
  };

  const renderMindmapTab = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <MindmapViewer documentId={id} initialMindmap={document?.data?.mindmap} />
      </Suspense>
    );
  };

  const renderFlashcardsTab = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <FlashcardManager documentId={id} />
      </Suspense>
    );
  };

  const renderQuizzesTab = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <QuizManager documentId={id} />
      </Suspense>
    );
  };

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Mindmap', label: 'Mindmap', content: renderMindmapTab() },
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
    <div className='app-page'>
      <div className='mb-4'>
        <Link
          to="/documents"
          className='inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 transition-colors'
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.data.title} />
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className='overflow-x-hidden' />
    </div>
  )
}

export default DocumentDetailPage;
