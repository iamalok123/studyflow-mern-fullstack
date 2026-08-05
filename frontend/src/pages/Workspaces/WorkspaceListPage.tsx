import React, { useState, useEffect } from 'react';
import { Plus, Folder, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import workspaceService from '../../services/workspaceService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import WorkspaceCard from '../../components/workspaces/WorkspaceCard';
import CreateWorkspaceModal from '../../components/workspaces/CreateWorkspaceModal';

const WorkspaceListPage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingWorkspace) {
        await workspaceService.updateWorkspace(editingWorkspace._id, formData);
        toast.success('Workspace updated successfully');
      } else {
        await workspaceService.createWorkspace(formData);
        toast.success('Workspace created successfully');
      }
      setIsCreateModalOpen(false);
      setEditingWorkspace(null);
      fetchWorkspaces();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleEditRequest = (ws) => {
    setEditingWorkspace(ws);
    setIsCreateModalOpen(true);
  };

  const handleDeleteRequest = (ws) => {
    setDeletingWorkspace(ws);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingWorkspace) return;
    try {
      setDeleting(true);
      await workspaceService.deleteWorkspace(deletingWorkspace._id);
      toast.success(`Workspace "${deletingWorkspace.title}" deleted`);
      setIsDeleteModalOpen(false);
      setDeletingWorkspace(null);
      fetchWorkspaces();
    } catch (err) {
      toast.error(err.message || 'Failed to delete workspace');
    } finally {
      setDeleting(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="app-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mb-1">
            Workspaces & Folders
          </h1>
          <p className="text-slate-500 text-sm">
            Group related documents to perform multi-pdf AI chat and study synthesis
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingWorkspace(null);
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New Workspace
        </Button>
      </div>

      {/* Search & Filter Bar */}
      {workspaces.length > 0 && (
        <div className="mb-6 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspaces by title or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-75">
          <Spinner size="lg" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex items-center justify-center min-h-87.5">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 app-muted-icon-tile mb-6 mx-auto">
              <Folder className="w-10 h-10 text-emerald-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              No Workspaces Created Yet
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Create a workspace to group your course materials, exam notes, or research papers together.
            </p>
            <Button
              onClick={() => {
                setEditingWorkspace(null);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Create First Workspace
            </Button>
          </div>
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No workspaces match "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkspaces.map((ws) => (
            <WorkspaceCard
              key={ws._id}
              workspace={ws}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* Modal: Create/Edit Workspace */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingWorkspace(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingWorkspace}
      />

      {/* Modal: Confirm Delete */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 text-red-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Workspace</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deletingWorkspace?.title}"</span>?
              Your documents will remain intact in StudyFlow, but this folder and its workspace AI history will be deleted.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceListPage;
