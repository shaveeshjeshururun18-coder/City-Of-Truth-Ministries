import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Search,
  Plus,
  GripVertical,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from './Button';

interface PageSection {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
  order: number;
}

interface PageSectionsManagerProps {
  sections: PageSection[];
  onUpdateSection: (section: PageSection) => Promise<void>;
  onDeleteSection: (sectionId: string) => Promise<void>;
}

const DEFAULT_SECTIONS: Record<string, { name: string; description: string }> = {
  hero: { name: 'Hero Welcome', description: 'Main entrance with video & primary CTA' },
  about: { name: 'About Ministry', description: 'Mission, vision and core values' },
  menorah: { name: 'Golden Menorah', description: 'Spiritual significance and flag' },
  highlights: { name: 'Ministry Moments', description: 'Global highlights and focus' },
  leader: { name: 'Leader Message', description: 'Direct word from ministry leadership' },
  hebrew: { name: 'Hebrew Sanctuary', description: 'Language and spiritual resources' },
  hebrewPages: { name: 'All Page Previews', description: 'Hebrew content, tools, and page preview cards' },
  pastorBaruch: { name: 'Pastor & Baruch', description: 'Pastor page and worship preview' },
  valparai: { name: 'Valparai Presence', description: 'Local impact and community' },
  testimonials: { name: 'Voices of Faith', description: 'Member stories and testimonies' },
  members: { name: 'Member Initials', description: 'Names with two-letter identity logos' },
  preview: { name: 'Entrust Preview', description: 'Quick overview of community card' },
  donations: { name: 'Donations', description: 'Support boxes and giving section' },
  verify: { name: 'Verify ID', description: 'Security and verification portal' }
};

export const PageSectionsManager: React.FC<PageSectionsManagerProps> = ({
  sections,
  onUpdateSection,
  onDeleteSection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter sections
  const filteredSections = useMemo(() => {
    let filtered = sections;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Visibility filter
    if (filterVisible !== 'all') {
      filtered = filtered.filter(s => 
        filterVisible === 'visible' ? s.isVisible : !s.isVisible
      );
    }

    return filtered.sort((a, b) => a.order - b.order);
  }, [sections, searchTerm, filterVisible]);

  const stats = useMemo(() => ({
    total: sections.length,
    visible: sections.filter(s => s.isVisible).length,
    hidden: sections.filter(s => !s.isVisible).length,
  }), [sections]);

  const handleEdit = (section: PageSection) => {
    setEditingSection(section);
    setEditName(section.name);
    setEditDescription(section.description);
  };

  const handleSave = async () => {
    if (!editingSection || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateSection({
        ...editingSection,
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Failed to update section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (section: PageSection) => {
    try {
      await onUpdateSection({
        ...section,
        isVisible: !section.isVisible
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return;
    }

    try {
      await onDeleteSection(sectionId);
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Layout size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Page Sections Manager</h2>
                <p className="text-purple-100 mt-1">
                  Edit names, descriptions, and manage home page sections
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-purple-100">Total Sections</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-300">{stats.visible}</div>
            <div className="text-sm text-purple-100">Visible</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-orange-300">{stats.hidden}</div>
            <div className="text-sm text-purple-100">Hidden</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search sections by name, description, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterVisible('all')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                filterVisible === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterVisible('visible')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                filterVisible === 'visible'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Eye size={16} />
              Visible
            </button>
            <button
              onClick={() => setFilterVisible('hidden')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                filterVisible === 'hidden'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <EyeOff size={16} />
              Hidden
            </button>
          </div>
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="mt-4 text-sm text-slate-600">
            Showing <span className="font-bold text-purple-600">{filteredSections.length}</span> of{' '}
            <span className="font-bold">{stats.total}</span> sections
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="grid gap-4">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
            <Layout size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {searchTerm ? 'No sections found' : 'No sections yet'}
            </h3>
            <p className="text-sm text-slate-500">
              {searchTerm
                ? 'Try a different search term'
                : 'Sections will appear here once configured'}
            </p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border-2 rounded-2xl p-6 shadow-sm transition-all ${
                section.isVisible
                  ? 'border-purple-200 hover:border-purple-300'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      section.isVisible ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Layout size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-lg text-slate-900">{section.name}</h3>
                        {!section.isVisible && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
                            Hidden
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-bold rounded-full">
                          ID: {section.id}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{section.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold text-slate-500">
                          Order: #{section.order + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(section)}
                    className={`p-2 rounded-lg transition-colors ${
                      section.isVisible
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                    title={section.isVisible ? 'Hide' : 'Show'}
                  >
                    {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingSection(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Edit2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Edit Section</h3>
                      <p className="text-sm text-purple-100 mt-1">
                        ID: {editingSection.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Section Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g., Hero Welcome"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief description of this section"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 resize-none"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">Note:</p>
                    <p>
                      Changes to section names and descriptions will be reflected immediately on your website.
                      The section ID cannot be changed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || !editName.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
