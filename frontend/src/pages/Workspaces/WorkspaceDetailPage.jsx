import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Folder,
  FilePlus,
  FileText,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles,
  BrainCircuit,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Plus,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import workspaceService from '../../services/workspaceService';
import aiService from '../../services/aiService';
import flashcardService from '../../services/flashcardService';
import quizService from '../../services/quizService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import CreateWorkspaceModal from '../../components/workspaces/CreateWorkspaceModal';
import AddDocumentsModal from '../../components/workspaces/AddDocumentsModal';
import WorkspaceChatInterface from '../../components/workspaces/WorkspaceChatInterface';
import MindmapCanvas from '../../components/mindmap/MindmapCanvas';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import QuizCard from '../../components/quizzes/QuizCard';

const WorkspaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'chat' | 'summary' | 'flashcards' | 'quizzes'

  // AI Generation States
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingMindmap, setGeneratingMindmap] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Workspace Study Materials
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddDocsModalOpen, setIsAddDocsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workspaceService.getWorkspaceById(id);
      setWorkspace(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch workspace');
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchWorkspaceStudyMaterials = useCallback(async () => {
    try {
      setLoadingFlashcards(true);
      setLoadingQuizzes(true);
      const [fcData, qzData] = await Promise.all([
        flashcardService.getFlashcardsForWorkspace(id).catch(() => ({ data: [] })),
        quizService.getQuizzesForWorkspace(id).catch(() => ({ data: [] })),
      ]);
      setFlashcardSets(fcData.data || []);
      setQuizzes(qzData.data || []);
    } catch (err) {
      console.error('Failed to fetch study materials:', err);
    } finally {
      setLoadingFlashcards(false);
      setLoadingQuizzes(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkspace();
    fetchWorkspaceStudyMaterials();
  }, [fetchWorkspace, fetchWorkspaceStudyMaterials]);

  // AI Feature Handlers
  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const data = await aiService.workspaceGenerateSummary(id);
      setWorkspace(prev => ({ ...prev, summary: data.summary, summaryGeneratedAt: data.summaryGeneratedAt }));
      toast.success('Workspace summary generated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate workspace summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateMindmap = async () => {
    try {
      setGeneratingMindmap(true);
      const data = await aiService.workspaceGenerateMindmap(id);
      setWorkspace(prev => ({ ...prev, mindmap: data.mindmap }));
      toast.success('Workspace mindmap generated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate workspace mindmap');
    } finally {
      setGeneratingMindmap(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setGeneratingFlashcards(true);
      await aiService.workspaceGenerateFlashcards(id, 10);
      toast.success('Workspace flashcards generated successfully!');
      fetchWorkspaceStudyMaterials();
    } catch (err) {
      toast.error(err.message || 'Failed to generate flashcards');
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setGeneratingQuiz(true);
      await aiService.workspaceGenerateQuiz(id, 5);
      toast.success('Workspace quiz generated successfully!');
      fetchWorkspaceStudyMaterials();
    } catch (err) {
      toast.error(err.message || 'Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Workspace CRUD Handlers
  const handleUpdateWorkspace = async (formData) => {
    try {
      await workspaceService.updateWorkspace(id, formData);
      toast.success('Workspace updated');
      setIsEditModalOpen(false);
      fetchWorkspace();
    } catch (err) {
      toast.error(err.message || 'Failed to update workspace');
    }
  };

  const handleAddDocuments = async (documentIds) => {
    try {
      await workspaceService.addDocumentsToWorkspace(id, documentIds);
      toast.success('Documents added to workspace');
      setIsAddDocsModalOpen(false);
      fetchWorkspace();
    } catch (err) {
      toast.error(err.message || 'Failed to add documents');
    }
  };

  const handleRemoveDocument = async (docId, docTitle) => {
    try {
      await workspaceService.removeDocumentFromWorkspace(id, docId);
      toast.success(`Removed "${docTitle}" from workspace`);
      fetchWorkspace();
    } catch (err) {
      toast.error(err.message || 'Failed to remove document');
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      setDeleting(true);
      await workspaceService.deleteWorkspace(id);
      toast.success('Workspace deleted');
      navigate('/workspaces');
    } catch (err) {
      toast.error(err.message || 'Failed to delete workspace');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteQuizRequest = (quiz) => {
    setQuizToDelete(quiz);
  };

  const handleConfirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      setDeletingQuiz(true);
      await quizService.deleteQuiz(quizToDelete._id);
      toast.success(`${quizToDelete.title || 'Quiz'} deleted successfully`);
      setQuizzes(prev => prev.filter(quiz => quiz._id !== quizToDelete._id));
      setQuizToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz');
    } finally {
      setDeletingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!workspace) return null;

  const accentColor = workspace.color || '#10B981';
  const docs = workspace.documents || [];
  const docIds = docs.map(d => d._id);

  const renderDocumentsTab = () => (
    <div>
      {docs.length === 0 ? (
        <div className="app-panel p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <FilePlus className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Documents in this Workspace
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Add uploaded PDFs to this folder to start asking cross-document questions and generating study materials.
          </p>
          <Button onClick={() => setIsAddDocsModalOpen(true)}>
            <FilePlus className="w-4 h-4" /> Add Documents Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {docs.map((doc) => (
            <div
              key={doc._id}
              className="app-panel p-5 flex flex-col justify-between group hover:border-emerald-300 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => handleRemoveDocument(doc._id, doc.title)}
                    title="Remove from Workspace"
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                  {doc.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                  {doc.fileName}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    doc.status === 'Ready'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {doc.status}
                </span>

                <button
                  onClick={() => navigate(`/documents/${doc._id}`)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                >
                  View PDF <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSummaryTab = () => (
    <div className="app-panel p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Executive Workspace Summary</h3>
            <p className="text-xs text-slate-500">
              AI synthesis drawn from all PDFs in this folder
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerateSummary}
          disabled={generatingSummary || docs.length === 0}
          className="text-xs py-2 px-4"
        >
          {generatingSummary ? (
            <>
              <Spinner size="sm" />
              <span>Generating Summary...</span>
            </>
          ) : workspace.summary ? (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Summary</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Summary</span>
            </>
          )}
        </Button>
      </div>

      {generatingSummary ? (
        <div className="py-12 text-center text-xs text-slate-500 space-y-2">
          <Spinner size="lg" />
          <p>Analyzing and synthesizing all PDFs in "{workspace.title}"...</p>
        </div>
      ) : workspace.summary ? (
        <div className="prose prose-sm max-w-none text-xs leading-relaxed text-slate-700">
          <MarkdownRenderer content={workspace.summary} />
        </div>
      ) : (
        <div className="py-10 text-center text-xs text-slate-400">
          Click "Generate Summary" to synthesize key takeaways across all PDFs in this folder!
        </div>
      )}
    </div>
  );

  const renderMindmapTab = () => (
    <div className="app-panel p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cross-Document Concept Mindmap</h3>
            <p className="text-xs text-slate-500">
              Interactive visualization connecting themes across workspace files
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerateMindmap}
          disabled={generatingMindmap || docs.length === 0}
          className="text-xs py-2 px-4"
        >
          {generatingMindmap ? (
            <>
              <Spinner size="sm" />
              <span>Generating Mindmap...</span>
            </>
          ) : workspace.mindmap ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Regenerate Mindmap</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Mindmap</span>
            </>
          )}
        </Button>
      </div>

      {generatingMindmap ? (
        <div className="py-16 text-center text-xs text-slate-500 space-y-2">
          <Spinner size="lg" />
          <p>Generating cross-document concept map...</p>
        </div>
      ) : workspace.mindmap ? (
        <div className="h-125 rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50">
          <MindmapCanvas mindmap={workspace.mindmap} />
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-slate-400">
          Click "Generate Mindmap" to build an interactive concept diagram connecting all files in this workspace!
        </div>
      )}
    </div>
  );

  const renderFlashcardsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Workspace Flashcard Decks</h3>
          <p className="text-xs text-slate-500">
            Study sets covering all documents in "{workspace.title}"
          </p>
        </div>

        <Button
          onClick={handleGenerateFlashcards}
          disabled={generatingFlashcards || docs.length === 0}
          className="text-xs py-2 px-4"
        >
          {generatingFlashcards ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />}
          Generate Workspace Flashcards
        </Button>
      </div>

      {loadingFlashcards ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : flashcardSets.length === 0 ? (
        <div className="app-panel p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            No Workspace Flashcard Decks
          </h4>
          <p className="text-xs text-slate-500 mb-6">
            Generate flashcards drawing questions across all PDFs in this folder!
          </p>
          <Button onClick={handleGenerateFlashcards} disabled={generatingFlashcards || docs.length === 0}>
            Generate Flashcards
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {flashcardSets.map(set => (
            <FlashcardSetCard
              key={set._id}
              flashcardSet={set}
              onDelete={() => fetchWorkspaceStudyMaterials()}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderQuizzesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Workspace Quizzes</h3>
          <p className="text-xs text-slate-500">
            Practice exams encompassing all documents in "{workspace.title}"
          </p>
        </div>

        <Button
          onClick={handleGenerateQuiz}
          disabled={generatingQuiz || docs.length === 0}
          className="text-xs py-2 px-4"
        >
          {generatingQuiz ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />}
          Generate Workspace Quiz
        </Button>
      </div>

      {loadingQuizzes ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="app-panel p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            No Workspace Quizzes Generated
          </h4>
          <p className="text-xs text-slate-500 mb-6">
            Create a quiz testing your understanding across all workspace documents!
          </p>
          <Button onClick={handleGenerateQuiz} disabled={generatingQuiz || docs.length === 0}>
            Generate Workspace Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map(quiz => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onDelete={handleDeleteQuizRequest}
            />
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { name: 'documents', label: `Documents (${docs.length})`, content: renderDocumentsTab() },
    { name: 'chat', label: 'Multi-Doc AI Chat', content: <WorkspaceChatInterface workspaceId={workspace._id} workspaceTitle={workspace.title} /> },
    { name: 'summary', label: 'Summary', content: renderSummaryTab() },
    { name: 'mindmap', label: 'Mindmap', content: renderMindmapTab() },
    { name: 'flashcards', label: `Flashcards (${flashcardSets.length})`, content: renderFlashcardsTab() },
    { name: 'quizzes', label: `Quizzes (${quizzes.length})`, content: renderQuizzesTab() }
  ];

  return (
    <div className="app-page space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/workspaces')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspaces
        </button>
      </div>

      {/* Workspace Header Panel */}
      <div className="app-panel p-6 sm:p-8 border-l-4" style={{ borderLeftColor: accentColor }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <Folder className="w-7 h-7" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight mb-1">
                {workspace.title}
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                {workspace.description || 'No workspace description.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddDocsModalOpen(true)}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 active:bg-black text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" /> Add Documents
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              title="Edit Folder"
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete Folder"
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation (Sleek Pill Styling matching Document Detail Page) */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateWorkspace}
        initialData={workspace}
      />

      <AddDocumentsModal
        isOpen={isAddDocsModalOpen}
        onClose={() => setIsAddDocsModalOpen(false)}
        onAdd={handleAddDocuments}
        workspaceId={workspace._id}
        existingDocIds={docIds}
      />

      <Modal
        isOpen={!!quizToDelete}
        onClose={() => setQuizToDelete(null)}
        title="Confirm Delete Quiz"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{quizToDelete?.title || 'this quiz'}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setQuizToDelete(null)}
              disabled={deletingQuiz}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDeleteQuiz}
              disabled={deletingQuiz}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500"
            >
              {deletingQuiz ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Workspace</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{workspace.title}"</span>?
              Your documents will remain in StudyFlow, but this folder and workspace AI materials will be deleted.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorkspace}
                disabled={deleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDetailPage;
