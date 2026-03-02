import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Target, BookOpen } from 'lucide-react'

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizResults(quizId);
        setResults(response);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data || !results.data.quiz || !results.data.detailedResults) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className='text-center'>
          <p className="text-slate-600 text-lg">No results found</p>
        </div>
      </div>
    )
  }

  const { data: { quiz, detailedResults } } = results;
  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter((result) => result.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Outstanding Performance!';
    if (score >= 80) return 'Excellent Performance!';
    if (score >= 70) return 'Good Performance!';
    if (score >= 60) return 'Not bad !';
    return 'Keep practicing! Consistency is the key to success.';
  };

  return (
    <div className='max-w-5xl mx-auto'>
      {/* Back Button */}
      <div className='mb-6'>
        <Link
          to={`/documents/${quiz.document._id}`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
          Back to Document
        </Link>
      </div>

      <PageHeader
        title={`${quiz.title || 'Quiz'} Results`}
      />

      {/* Score Card */}
      <div className='bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8'>
        <div className='text-center space-y-6'>
          <div className='inline-flex items-center justify-center h-15 w-15 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-lg shadow-emerald-500/20'>
            <Trophy className="h-7 w-7 text-emerald-700" strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 uppercase tracking-tight mb-2">Your Score</p>
            <div className={`inline-block text-5xl font-bold bg-linear-to-br ${getScoreColor(score)} bg-clip-text text-transparent mb-2`}>
              {score}%
            </div>
            <p className="text-lg font-medium text-slate-800">
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Stats */}
          <div className='flex items-center justify-center gap-4 pt-4'>
            <div className='flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl'>
              <Target className='h-4 w-4 text-slate-700' strokeWidth={2} />
              <span className='text-md font-semibold text-slate-900'>
                {totalQuestions} Total
              </span>
            </div>

            <div className='flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl'>
              <CheckCircle2 className='h-4 w-4 text-emerald-600' strokeWidth={2} />
              <span className='text-sm font-semibold text-emerald-900'>
                {correctAnswers} Correct
              </span>
            </div>

            <div className='flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl'>
              <XCircle className='h-4 w-4 text-red-600' strokeWidth={2} />
              <span className='text-sm font-semibold text-red-800'>
                {incorrectAnswers} Incorrect
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className='space-y-6'>
        <div className='flex items-center gap-3 mb-2'>
          <BookOpen className='h-5 w-5 text-slate-600' strokeWidth={2} />
          <h3 className='text-lg font-semibold text-slate-900'>
            Detailed Review
          </h3>
        </div>

        {detailedResults.map((result, index) => {
          const userAnswerIndex = result.options.findIndex(option => option === result.selectedAnswer);
          const correctAnswerIndex = result.correctAnswer?.startsWith('O')
            ? parseInt(result.correctAnswer.substring(1))
            : result.options.findIndex(option => option === result.correctAnswer);

          const isCorrect = result.isCorrect;

          return (
            <div key={index}
              className='bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50'
            >
              <div className='flex items-start justify-between gap-4 mb-3'>
                <div className='flex-1'>
                  <div className='inline-flex items-start gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-3'>
                    <span className='text-xs font-semibold text-slate-700'>
                      Question {index + 1}
                    </span>
                  </div>
                  <h4 className='text-lg font-semibold text-slate-900 leading-relaxed'>
                    {result.question}
                  </h4>
                </div>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isCorrect ? 'bg-emerald-100 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'
                  }`}>
                  {isCorrect ? (
                    <CheckCircle2 className='h-5 w-5 text-emerald-600' strokeWidth={2.5} />
                  ) : (
                    <XCircle className='h-5 w-5 text-red-600' strokeWidth={2.5} />
                  )}
                </div>
              </div>

              <div className='space-y-3 mb-4'>
                {result.options.map((option, optionIndex) => {
                  const isCorrectOption = optionIndex === correctAnswerIndex;
                  const isUserAnswer = optionIndex === userAnswerIndex;
                  const isWrongAnswer = !isCorrect && isUserAnswer;

                  return (
                    <div
                      key={optionIndex}
                      className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${isCorrectOption ?
                        'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/20'
                        : isWrongAnswer ?
                          'bg-rose-50 border-rose-300'
                          : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <span
                          className={`text-sm font-medium ${isCorrectOption ? 'text-emerald-900' : isWrongAnswer ? 'text-rose-900' : 'text-slate-700'}`}
                        >
                          {option}
                        </span>

                        <div className='flex items-center gap-2'>
                          {isCorrectOption && (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700'>
                              <CheckCircle2 className='h-3 w-3 text-emerald-600' strokeWidth={2.5} />
                              <span className='text-xs font-semibold text-emerald-700'>
                                Correct
                              </span>
                            </span>
                          )}

                          {isWrongAnswer && (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-rose-100 border border-rose-300 rounded-lg text-xs font-semibold text-rose-700'>
                              <XCircle className='h-3 w-3 text-rose-600' strokeWidth={2.5} />
                              <span className='text-xs font-semibold text-rose-700'>
                                Your Answer
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className='p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl'>
                  <div className='flex items-start gap-3'>
                    <div className='shrink-0 h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center mt-0.5'>
                      <BookOpen className='h-4 w-4 text-slate-600' strokeWidth={2} />
                    </div>

                    <div className='flex-1'>
                      <p className='text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1'>Explanation</p>
                      <p className='text-sm text-slate-700 leading-relaxed'>
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className='mt-8 flex justify-center'>
        <Link
          to={`/documents/${quiz.document._id}`}
        >
          <button
            className="group relative px-8 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-xl shadow-emerald-500/20 active:scale-95 overflow-hidden"
          >
            <span className='relative z-10 flex items-center gap-2'>
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
              Return to Document
            </span>
            <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
          </button>
        </Link>
      </div>
    </div>
  )
}

export default QuizResultPage