import React, { useState, useEffect, useCallback } from 'react'
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../../services/quizService';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Modal from '../common/Modal';
import QuizCard from './QuizCard';
import EmptyState from '../common/EmptyState';


const QuizManager = ({ documentId }) => {
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
      setQuizzes(response.data);
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

  const handleGenerateQuizzes = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions });
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
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    )
  };

  return (
    <div className='app-panel p-5 sm:p-6'>
      <div className='relative flex justify-end gap-2 mb-4'>
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className='group app-primary-action h-11'
        >
          <Plus size={16} />
          Generate Quiz
        </button>

        {isGenerateModalOpen && (
          <div className='absolute right-0 top-14 z-20 w-full max-w-sm app-panel p-5'>
            <form onSubmit={handleGenerateQuizzes} className='space-y-5'>
              <div className='space-y-2'>
                <label className='pl-1 block text-sm font-bold text-slate-700'>
                  Number of Questions
                </label>
                <input
                  type='number'
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={20}
                  required
                  className='app-input rounded-xl px-4 py-3'
                />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => setIsGenerateModalOpen(false)}
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={generating}
                >
                  {generating ? "Generating..." : 'Generate'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {renderQuizContent()}

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
    </div>
  )
}

export default QuizManager
