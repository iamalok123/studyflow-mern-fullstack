import React, { useState, useEffect } from 'react'
import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import QuizCard from '../../components/quizzes/QuizCard'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getAllQuizzes();
      setQuizzes(response.data);
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    try {
      setDeleting(true);
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`${selectedQuiz.title || 'Quiz'} deleted successfully`);
      setQuizzes(quizzes.filter((quiz) => quiz._id !== selectedQuiz._id));
      setSelectedQuiz(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error?.error || error?.message || 'Failed to delete quiz');
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Found"
          description="You haven't generated any quizzes yet. Generate your first quiz from a document or workspace to get started."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz._id}
            quiz={quiz}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="app-page flex flex-col w-full h-full pb-16">
      <PageHeader title="Quizzes" />
      {renderContent()}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Quiz"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this quiz: <span className="font-semibold">{selectedQuiz?.title || 'this Quiz'}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="outline outline-slate-300 hover:bg-slate-300 hover:text-slate-900 text-slate-900 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizListPage;
