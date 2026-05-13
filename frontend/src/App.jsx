import React, { lazy, Suspense } from 'react'
import { Routes,Route } from 'react-router-dom'
import { useAuth } from './context/useAuth'

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const DocumentListPage = lazy(() => import('./pages/Documents/DocumentListPage'));
const DocumentDetailPage = lazy(() => import('./pages/Documents/DocumentDetailPage'));
const FlashcardListPage = lazy(() => import('./pages/Flashcards/FlashcardListPage'));
const FlashcardPage = lazy(() => import('./pages/Flashcards/FlashcardPage'));
const QuizTakePage = lazy(() => import('./pages/Quizzes/QuizTakePage'));
const QuizResultPage = lazy(() => import('./pages/Quizzes/QuizResultPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const ProtectedRoute = lazy(() => import('./pages/Auth/ProtectedRoute'));
const Home = lazy(() => import('./pages/Home/Home'));
const TermsPage = lazy(() => import('./pages/Legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/Legal/PrivacyPage'));


const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p>Loading...</p></div>}>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/flashcards" element={<FlashcardListPage />} />
          <Route path="/documents/:id/flashcards" element={<FlashcardPage />} />
          <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResultPage />} />
           <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
