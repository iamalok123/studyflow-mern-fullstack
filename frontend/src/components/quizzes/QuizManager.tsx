import React, { useState, useEffect, useCallback } from 'react'
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../../services/quizService';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Modal from '../common/Modal';
import GenerateQuantityModal from '../common/GenerateQuantityModal';
import QuizCard from './QuizCard';
import EmptyState from '../common/EmptyState';


const QuizManager = ({ documentId, onCountUpdate }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);


  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(response.data || []);
      if (onCountUpdate) onCountUpdate(response.data?.length || 0);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId, fetchQuizzes]);

  const handleGenerateQuizzes = async (count) => {
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions: count });
      await fetchQuizzes();
      toast.success('Quizzes generated successfully');
      setIsGenerateModalOpen(false);
    } catch (error) {
      const errMsg = error?.response?.data?.error || error?.message || 'Failed to generate quizzes';
      toast.error(errMsg);
      console.error('Quiz generation error:', error?.response?.data || error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) {
      return;
    }
    try {
      setDeleting(true);
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`${selectedQuiz.title || 'Quiz'} deleted successfully`);
      setSelectedQuiz(null);
      setIsDeleteModalOpen(false);
      setQuizzes(quizzes.filter((quiz) => quiz._id !== selectedQuiz._id));
    } catch (error) {
      toast.error('Failed to delete quiz');
      console.error(error);
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return <div className='flex justify-center py-12'>
        <Spinner />
      </div>
    }

    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Generated Yet"
          description="Generate a quiz from your document to test your knowledge."
        />
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} context="document" />
        ))}
      </div>
    )
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Document Quizzes</h3>
            <p className="text-xs text-slate-500">
              Practice exams generated from this document
            </p>
          </div>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={generating}
            className='group app-primary-action h-11 px-4 text-sm'
          >
            {generating ? <Spinner size="sm" /> : <Plus size={16} />}
            Generate Quiz
          </button>
        </div>

        {renderQuizContent()}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Quiz"
      >
        <div className='space-y-4'>
          <p className='text-slate-600'>
            Are you sure you want to delete this quiz: <span className='font-semibold'>{selectedQuiz?.title || 'this Quiz'}</span> ? This action cannot be undone.
          </p>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className='outline outline-slate-300 hover:bg-slate-300 hover:text-slate-900 text-slate-900 text-sm font-semibold'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleConfirmDelete}
              disabled={deleting}
              className='bg-red-500 hover:bg-red-600 text-white'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      <GenerateQuantityModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onConfirm={handleGenerateQuizzes}
        title="Generate Document Quiz"
        description="Select how many quiz questions to generate from this document."
        type="quiz"
        defaultCount={5}
        generating={generating}
      />
    </>
  )
}

export default QuizManager
