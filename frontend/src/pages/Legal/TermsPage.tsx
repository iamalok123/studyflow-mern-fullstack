import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to StudyFlow
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">Terms of Service</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          StudyFlow is provided as a learning assistant. Users are responsible for the documents they upload and for verifying AI-generated study material before relying on it.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">Acceptable Use</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Do not upload content you do not have permission to use. Do not attempt to abuse, overload, reverse engineer, or bypass access controls for the service.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">AI Content</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          AI responses may be incomplete or incorrect. Treat generated flashcards, quizzes, summaries, and chat answers as study aids, not as authoritative professional advice.
        </p>
      </div>
    </main>
  );
};

export default TermsPage;

