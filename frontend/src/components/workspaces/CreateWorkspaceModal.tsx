import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Palette, Check } from 'lucide-react';
import documentService from '../../services/documentService';

const COLOR_OPTIONS = [
  { label: 'Emerald', hex: '#10B981' },
  { label: 'Indigo', hex: '#6366F1' },
  { label: 'Amber', hex: '#F59E0B' },
  { label: 'Rose', hex: '#F43F5E' },
  { label: 'Purple', hex: '#8B5CF6' },
  { label: 'Cyan', hex: '#06B6D4' },
];

const CreateWorkspaceModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10B981');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setColor(initialData.color || '#10B981');
        setSelectedDocs(initialData.documents ? initialData.documents.map(d => typeof d === 'object' ? d._id : d) : []);
      } else {
        setTitle('');
        setDescription('');
        setColor('#10B981');
        setSelectedDocs([]);
        fetchAvailableDocuments();
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const fetchAvailableDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await documentService.getDocuments();
      setAvailableDocs(docs || []);
    } catch (err) {
      console.error('Failed to load documents for modal:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const toggleDocSelection = (docId) => {
    setSelectedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a workspace title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        color,
        documentIds: selectedDocs
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
            >
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialData ? 'Edit Workspace' : 'Create New Workspace'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Workspace Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Biology Semester 1, Bar Exam Prep"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or goals for this study folder..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Accent Theme
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.hex && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {!initialData && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Add Documents to Workspace
              </label>
              {loadingDocs ? (
                <p className="text-xs text-slate-400">Loading existing documents...</p>
              ) : availableDocs.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  No uploaded documents found. You can add documents to this folder later!
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {availableDocs.map((doc) => {
                    const isSelected = selectedDocs.includes(doc._id);
                    return (
                      <div
                        key={doc._id}
                        onClick={() => toggleDocSelection(doc._id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-medium' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate max-w-75">{doc.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Workspace' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
