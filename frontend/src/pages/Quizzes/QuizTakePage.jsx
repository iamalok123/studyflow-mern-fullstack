import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

const QuizTakePage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizById(quizId);
      setQuiz(response.data);
    } catch (error) {
      toast.error('Failed to fetch quiz');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(selectedAnswers).map(questionId => {
        const question = quiz.questions.find(q => q._id === questionId);
        const questionIndex = quiz.questions.findIndex(q => q._id === questionId);
        const optionIndex = selectedAnswers[questionId];
        const selectedAnswer = question.options[optionIndex];
        return { questionIndex, selectedAnswer }
      });
      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success('Quiz submitted successfully');
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      const errMsg = error?.error || error?.message || 'Failed to submit quiz';
      toast.error(errMsg);
      console.error('Quiz submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className='text-center'>
          <p className="text-slate-600 text-lg">Quiz not found or has no questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers.hasOwnProperty(currentQuestion._id);
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6'>
      <PageHeader title={quiz?.title || "Take Quiz"} />

      {/* Progress Bar */}
      <div className="mb-6">
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-semibold text-slate-700'>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className='text-sm font-semibold text-slate-500'>
            {answeredCount} answered
          </span>
        </div>

        {/* Progress Track */}
        <div className='relative h-2 bg-slate-100 rounded-full overflow-hidden'>
          <div
            className='absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out'
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className='bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-8'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl mb-6'>
          <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
          <span className='text-sm font-semibold text-emerald-700'>
            Question {currentQuestionIndex + 1}
          </span>
        </div>

        <h3 className='text-lg font-semibold text-slate-900 mb-6 leading-relaxed'>
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className='space-y-3'>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion._id] === index;
            return (
              <label
                key={index}
                className={`group relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                  ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-md hover:shadow-slate-200/50'
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={index}
                  checked={isSelected}
                  onChange={() => handleOptionChange(currentQuestion._id, index)}
                  className='sr-only'
                />

                {/* Custom Radio Button */}
                <div className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${isSelected
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-slate-300 bg-white group-hover:border-emerald-400'
                  }`}>
                  {isSelected && (
                    <div className='h-full w-full flex items-center justify-center'>
                      <div className='w-2 h-2 bg-white rounded-full' />
                    </div>
                  )}
                </div>

                {/* Option Text */}
                <span className={`ml-4 text-sm font-medium transition-colors duration-200 ${isSelected
                  ? 'text-emerald-900'
                  : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                  {option}
                </span>

                {/* Selected Checkmark */}
                {isSelected && (
                  <CheckCircle2
                    className='ml-auto h-5 w-5 text-emerald-500'
                    strokeWidth={2.5}
                  />
                )}
              </label>
            )
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className='flex items-center justify-between gap-4 '>
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || submitting}
          className='flex items-center gap-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium text-slate-700'
        >
          <ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5' strokeWidth={2.5} />
          <span>Previous</span>
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className='flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium'
          >
            {submitting ? (
              <>
                <div className='h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className='w-4 h-4 sm:w-5 sm:h-5' strokeWidth={2.5} />
                <span>Submit Quiz</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            disabled={submitting}
            className='flex items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium'
          >
            <span>Next</span>
            <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5' strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Submit Navigation Dots */}
      <div className='flex items-center justify-center flex-wrap gap-2 mt-8 pb-4'>
        {quiz.questions.map((_, index) => {
          const isAnsweredQuestion = selectedAnswers.hasOwnProperty(quiz.questions[index]._id);
          const isCurrentQuestion = currentQuestionIndex === index;
          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              disabled={submitting}
              className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200 ${isCurrentQuestion
                ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-110'
                : isAnsweredQuestion
                  ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-400 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-2 border-transparent hover:bg-slate-200 hover:text-slate-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default QuizTakePage