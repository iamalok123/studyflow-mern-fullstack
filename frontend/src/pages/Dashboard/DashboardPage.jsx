import React, { useState, useEffect } from 'react'
import Spinner from '../../components/common/Spinner'
import progressService from '../../services/progressService'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock } from 'lucide-react'

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
          <div className='inline-flex items-center justify-center w-16 h-16 app-icon-tile mb-4'>
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
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-10 w-10 app-icon-tile'>
              <Clock className='w-5 h-5 text-white' strokeWidth={2} />
            </div>
            <h3 className='text-xl font-medium text-slate-900 tracking-tight'>Recent Activity</h3>
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
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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
            <div className='text-center'>
              <div className='inline-flex items-center justify-center h-16 w-16 app-icon-tile mb-4'>
                <Clock className='w-5 h-5 text-white' strokeWidth={2} />
              </div>
              <p className='text-sm font-medium text-slate-600'>No recent activity</p>
              <p className='text-xs text-slate-500 mt-1'>Start learning to see your progress here</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default DashboardPage
