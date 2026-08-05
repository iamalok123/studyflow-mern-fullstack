import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Trash2, Edit, ChevronRight } from 'lucide-react';
import moment from 'moment';

const WorkspaceCard = ({ workspace, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/workspaces/${workspace._id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(workspace);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(workspace);
  };

  const docCount = workspace.documents ? workspace.documents.length : 0;
  const accentColor = workspace.color || '#10B981';

  return (
    <div
      onClick={handleNavigate}
      className="relative group app-panel app-panel-hover p-6 flex flex-col justify-between cursor-pointer border-t-4 transition-all duration-300 hover:shadow-lg"
      style={{ borderTopColor: accentColor }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
            style={{ backgroundColor: accentColor }}
          >
            <Folder className="w-6 h-6" strokeWidth={2.2} />
          </div>

          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              title="Edit Folder"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Folder"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
          {workspace.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 min-h-10 mb-4">
          {workspace.description || 'No description added.'}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>{docCount} {docCount === 1 ? 'Document' : 'Documents'}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-600 transition-colors font-medium">
          <span>{moment(workspace.updatedAt).fromNow()}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
