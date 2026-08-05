import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to StudyFlow
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          StudyFlow stores account details, uploaded document metadata, extracted document text, generated study materials, quiz results, and chat history so the app can provide its learning features.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">Uploaded Documents</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          PDFs are uploaded to cloud storage and processed by the backend to extract text for study features. Avoid uploading highly sensitive personal, financial, medical, or confidential documents.
        </p>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">Third-party Services</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The app integrates with cloud storage, MongoDB, Google OAuth, and Gemini AI. Data needed for each feature may be sent to those services according to their respective policies.
        </p>
      </div>
    </main>
  );
};

export default PrivacyPage;

