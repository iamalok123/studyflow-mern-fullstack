import React, { useState, useEffect } from 'react'
import Spinner from '../../components/common/Spinner'
import progressService from '../../services/progressService'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock, Sparkles, FileUp, FolderPlus, GraduationCap, ArrowRight, Lightbulb } from 'lucide-react'

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-[60vh] app-bg flex items-center justify-center rounded-3xl">
        <div className="text-center">
          <div className='mx-auto flex items-center justify-center w-16 h-16 app-icon-tile mb-4'>
            <TrendingUp className='w-8 h-8 text-white' />
          </div>
          <p className='text-slate-600 text-sm'>No dashboard data available</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      color: 'bg-slate-950',
      shadow: 'shadow-slate-950/15'
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      color: 'bg-slate-950',
      shadow: 'shadow-slate-950/15'
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      color: 'bg-slate-950',
      shadow: 'shadow-slate-950/15'
    }
  ]

  return (
    <div className='min-h-full'>
      <div className='app-page pb-16'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-black text-slate-950 tracking-tight mb-2'>
            Dashboard
          </h1>
          <p className='text-slate-600 text-sm'>
            Track your learning progress and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-5'>
          {stats.map((stat, index) => (
            <div
              key={index}
            className='group relative app-panel app-panel-hover p-6'
            >
              <div className='flex items-center justify-between'>
                <span className='text-slate-500 text-xs font-semibold uppercase tracking-wider'>
                  {stat.label}
                </span>
                <div
                  className={`w-11 h-11 rounded-xl ${stat.color} shadow-lg ${stat.shadow} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon
                    className='w-7 h-5 text-white'
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              <div className='text-3xl font-black text-slate-950 tracking-tight'>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className='app-panel p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 app-icon-tile'>
                <Clock className='w-5 h-5 text-white' strokeWidth={2} />
              </div>
              <h3 className='text-xl font-medium text-slate-900 tracking-tight'>Recent Activity</h3>
            </div>
            {(!dashboardData.recentActivity || (dashboardData.recentActivity.documents.length === 0 && dashboardData.recentActivity.quizzes.length === 0)) && (
              <span className='app-pill text-xs font-semibold text-slate-500 bg-slate-100/90 border-slate-200'>
                0 Recorded
              </span>
            )}
          </div>

          {dashboardData.recentActivity && (dashboardData.recentActivity.documents.length > 0 || dashboardData.recentActivity.quizzes.length > 0) ? (
            <div className='space-y-3'>
              {[
                ...(dashboardData.recentActivity.documents || []).map((doc) => ({
                  id: doc._id,
                  description: doc.title,
                  timestamp: doc.lastAccessed,
                  link: `/documents/${doc._id}`,
                  type: 'document'
                })),
                ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
                  id: quiz._id,
                  description: quiz.title,
                  timestamp: quiz.completedAt || quiz.createdAt,
                  link: `/quizzes/${quiz._id}`,
                  type: 'quiz'
                }))
              ]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((activity, index) => (
                  <div
                    key={activity.id || index}
                  className='group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-[#EEF6F2]/55 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300'
                  >
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <div className='w-2 h-2 rounded-full bg-slate-950' />
                        <p className='text-slate-900 text-sm font-medium truncate'>
                          {activity.type === 'document' ? 'Accessed Document :  ' : 'Attempted Quiz :  '}
                          <span className='text-slate-800'>{activity.description}</span>
                        </p>
                      </div>

                      <p className='text-slate-500 text-xs pl-4'>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {activity.link && (
                      <Link
                        to={activity.link}
                        className='ml-4 px-4 py-2 text-xs font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all duration-200 whitespace-nowrap'
                      >
                        View
                      </Link>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className='relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200/90 bg-linear-to-b from-[#F7FAF8] via-white to-[#F7FAF8] p-8 md:p-10 text-center transition-all duration-300'>
              {/* Soft decorative background glow */}
              <div className='absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-36 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none' />

              {/* Centered Floating Badge */}
              <div className='relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-slate-950 to-slate-850 text-white shadow-xl shadow-slate-950/20 ring-4 ring-emerald-500/15'>
                <Sparkles className='w-6 h-6 text-emerald-400' strokeWidth={2.2} />
              </div>

              {/* Headline & Description */}
              <h4 className='text-lg md:text-xl font-bold text-slate-900 tracking-tight mb-2'>
                Your Learning Journey Starts Here
              </h4>
              <p className='text-sm text-slate-500 max-w-lg mx-auto leading-relaxed mb-7'>
                You don't have any recent activity recorded yet. Upload study materials, organize a workspace, or test your memory to start building your streak.
              </p>

              {/* 3 Quick Action Starter Cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left mb-7'>
                {/* Action 1: Upload Notes */}
                <Link
                  to='/documents'
                  className='group/card relative flex flex-col justify-between p-5 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300'
                >
                  <div>
                    <div className='w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover/card:scale-110 transition-transform duration-300'>
                      <FileUp className='w-5 h-5' strokeWidth={2.2} />
                    </div>
                    <h5 className='text-sm font-bold text-slate-900 mb-1 group-hover/card:text-emerald-700 transition-colors'>
                      Upload Study Notes
                    </h5>
                    <p className='text-xs text-slate-500 leading-normal'>
                      Upload textbook PDFs or lecture slides for instant AI vector chat and citations.
                    </p>
                  </div>
                  <div className='mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover/card:translate-x-1 transition-transform duration-200'>
                    <span>Upload Document</span>
                    <ArrowRight className='w-3.5 h-3.5' />
                  </div>
                </Link>

                {/* Action 2: Workspaces */}
                <Link
                  to='/workspaces'
                  className='group/card relative flex flex-col justify-between p-5 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300'
                >
                  <div>
                    <div className='w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover/card:scale-110 transition-transform duration-300'>
                      <FolderPlus className='w-5 h-5' strokeWidth={2.2} />
                    </div>
                    <h5 className='text-sm font-bold text-slate-900 mb-1 group-hover/card:text-indigo-700 transition-colors'>
                      Create a Workspace
                    </h5>
                    <p className='text-xs text-slate-500 leading-normal'>
                      Group multiple documents by course or subject to cross-reference concepts.
                    </p>
                  </div>
                  <div className='mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover/card:translate-x-1 transition-transform duration-200'>
                    <span>New Workspace</span>
                    <ArrowRight className='w-3.5 h-3.5' />
                  </div>
                </Link>

                {/* Action 3: Flashcards & Quizzes */}
                <Link
                  to='/flashcards'
                  className='group/card relative flex flex-col justify-between p-5 rounded-xl border border-slate-200/90 bg-white hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300'
                >
                  <div>
                    <div className='w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3 group-hover/card:scale-110 transition-transform duration-300'>
                      <GraduationCap className='w-5 h-5' strokeWidth={2.2} />
                    </div>
                    <h5 className='text-sm font-bold text-slate-900 mb-1 group-hover/card:text-amber-700 transition-colors'>
                      Review Flashcards
                    </h5>
                    <p className='text-xs text-slate-500 leading-normal'>
                      Reinforce key terms and formulas with AI flashcards and active recall quizzes.
                    </p>
                  </div>
                  <div className='mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover/card:translate-x-1 transition-transform duration-200'>
                    <span>Explore Decks</span>
                    <ArrowRight className='w-3.5 h-3.5' />
                  </div>
                </Link>
              </div>

              {/* Bottom Pro Tip */}
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/80 bg-white/90 text-xs font-medium text-slate-600 shadow-sm'>
                <Lightbulb className='w-3.5 h-3.5 text-amber-500 shrink-0' />
                <span>StudyFlow logs your activity automatically whenever you review notes or take a practice quiz.</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default DashboardPage
