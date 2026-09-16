import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Link2,
  Plus,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  Video,
  Globe,
  FileText,
  FileCode,
  Code2,
  Bot,
  BookOpen,
  StickyNote,
  Tag,
} from 'lucide-react';
import ResourceModal from '../components/modals/ResourceModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

export default function ResourceManagementView() {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    resources,
    addResource,
    updateResource,
    deleteResource,
    toggleResourceComplete,
  } = useStudy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  const [filterType, setFilterType] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const filteredResources = resources.filter(r => {
    if (activeCourseId && r.courseId !== activeCourseId) return false;
    if (filterType !== 'All' && r.type !== filterType) return false;
    return true;
  });

  const getResourceIcon = (type) => {
    switch (type) {
      case 'YouTube':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'Documentation':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'GitHub':
        return <Code2 className="w-5 h-5 text-slate-800 dark:text-slate-200" />;
      case 'ChatGPT':
        return <Bot className="w-5 h-5 text-emerald-500" />;
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'Article':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      case 'Notes':
        return <StickyNote className="w-5 h-5 text-yellow-500" />;
      default:
        return <Globe className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleCopyLink = (res) => {
    if (res.url) {
      navigator.clipboard.writeText(res.url);
      setCopiedId(res.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <Link2 className="w-4 h-4" />
            Knowledge Repository
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Resources
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Attach YouTube tutorials, official docs, GitHub repos, and ChatGPT prompts to subjects and topics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            <option value="All">All Types ({resources.length})</option>
            <option value="YouTube">YouTube</option>
            <option value="Documentation">Documentation</option>
            <option value="GitHub">GitHub</option>
            <option value="ChatGPT">ChatGPT Notes</option>
            <option value="Article">Article</option>
            <option value="PDF">PDF</option>
            <option value="Notes">Notes</option>
            <option value="Website">Website</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setResourceToEdit(null);
              setIsModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Add Resource
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Link2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No resources saved yet.
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
            Save documentation URLs, video courses, GitHub repos, and study materials linked to your topics.
          </p>
          <button
            type="button"
            onClick={() => {
              setResourceToEdit(null);
              setIsModalOpen(true);
            }}
            className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/25"
          >
            + Add Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const course = courses.find(c => c.id === res.courseId);
            const subj = subjects.find(s => s.id === res.subjectId);
            const topic = topics.find(t => t.id === res.topicId);
            const isCompleted = res.status === 'Completed';

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        {getResourceIcon(res.type)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {res.type}
                        </span>
                        <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                          {course ? course.name : 'Course'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setResourceToEdit(res);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setResourceToDelete(res)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {res.name}
                  </h3>
                  {res.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {res.description}
                    </p>
                  )}

                  {/* Context Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[10px]">
                    {subj && (
                      <span className="px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-medium">
                        {subj.name}
                      </span>
                    )}
                    {topic && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-medium">
                        {topic.name}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] text-slate-400">
                      <Tag className="w-3 h-3 inline mr-0.5" />
                      {res.tags.map((tag, i) => (
                        <span key={i} className="text-slate-500 dark:text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {res.url && (
                      <>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Link
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(res)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedId === res.id && (
                          <span className="text-[10px] text-emerald-500 font-semibold">Copied!</span>
                        )}
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleResourceComplete(res.id)}
                    className={`py-1 px-2.5 rounded-xl font-semibold text-[11px] transition-colors flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {isCompleted ? 'Done' : 'Mark Done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ResourceModal
        isOpen={isModalOpen}
        resourceToEdit={resourceToEdit}
        courseId={activeCourseId}
        onSave={(data) => {
          if (resourceToEdit) {
            updateResource(resourceToEdit.id, data);
          } else {
            addResource(data);
          }
        }}
        onClose={() => {
          setIsModalOpen(false);
          setResourceToEdit(null);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!resourceToDelete}
        title={`Delete "${resourceToDelete?.name}"?`}
        message="Are you sure you want to delete this resource link?"
        onConfirm={() => {
          if (resourceToDelete) deleteResource(resourceToDelete.id);
        }}
        onClose={() => setResourceToDelete(null)}
      />
    </div>
  );
}
