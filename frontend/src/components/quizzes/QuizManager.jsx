import React, { useState, useEffect } from 'react'
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


  const fetchQuizzes = async () => {
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
  };

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId]);

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
    <div className='bg-white border border-neutral-200 rounded-lg p-6'>
      <div className='flex justify-end gap-2 mb-4'>
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className='group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300'
        >
          <Plus size={16} />
          Generate Quiz
        </button>
      </div>

      {renderQuizContent()}

      {/* Generate Quiz */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Quiz"
      >
        <form onSubmit={handleGenerateQuizzes} className='space-y-4'>
          <div className='space-y-2'>
            <label className='pl-1 block text-sm font-medium text-slate-700'>
              Number of Questions
            </label>
            <input
              type='number'
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={20}
              required
              className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='secondary'
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
              className='bg-slate-200 hover:bg-slate-300 hover:text-slate-900 text-slate-900 text-sm font-semibold'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={generating}
              className='bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
            >
              {generating ? "Generating..." : 'Generate'}
            </Button>
          </div>
        </form>
      </Modal>

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