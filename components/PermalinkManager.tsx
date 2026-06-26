import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Share2,
  Save,
  X,
  Check,
  ExternalLink,
  Globe,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { Permalink, ViewState } from '../types';
import { PAGE_PERMALINK_OVERRIDES_KEY, VIEW_PATHS, getAbsolutePagePermalink, normalizePagePath } from '../services/routePaths';

interface PermalinkManagerProps {
  permalinks: Permalink[];
  onCreatePermalink: (permalink: Omit<Permalink, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdatePermalink: (permalink: Permalink) => Promise<void>;
  onDeletePermalink: (permalinkId: string) => Promise<void>;
}

const ALL_VIEW_STATES = Object.values(ViewState).sort();

const getPagePermalink = (page: ViewState, overrides: Record<string, string> = {}) => {
  return getAbsolutePagePermalink(page, overrides as Partial<Record<ViewState, string>>);
};

export const PermalinkManager: React.FC<PermalinkManagerProps> = ({
  permalinks,
  onCreatePermalink,
  onUpdatePermalink,
  onDeletePermalink,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPermalink, setEditingPermalink] = useState<Permalink | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    label: '',
    pages: [] as ViewState[],
    isVisible: true,
    allowShare: true,
    shareMessage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageSearchTerm, setPageSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');
  const [hiddenPages, setHiddenPages] = useState<Set<ViewState>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<ViewState>>(new Set());
  const [pagePathOverrides, setPagePathOverrides] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(PAGE_PERMALINK_OVERRIDES_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [editingPagePermalink, setEditingPagePermalink] = useState<ViewState | null>(null);
  const [pagePathDraft, setPagePathDraft] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(PAGE_PERMALINK_OVERRIDES_KEY, JSON.stringify(pagePathOverrides));
    } catch {
      // Ignore browser storage failures.
    }
  }, [pagePathOverrides]);

  const toggleSelectPage = (page: ViewState) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(page)) newSet.delete(page);
      else newSet.add(page);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPages.size === filteredPagesForView.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(filteredPagesForView));
    }
  };

  const handleBulkHidePages = () => {
    setHiddenPages(prev => {
      const newSet = new Set(prev);
      selectedPages.forEach(p => newSet.add(p));
      return newSet;
    });
    setSelectedPages(new Set());
  };

  const handleBulkDeletePages = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPages.size} selected page(s)? This will remove their permalinks.`)) return;
    try {
      for (const page of selectedPages) {
        const updatePromises = permalinks
          .filter(p => p.pages.includes(page))
          .map(p => onUpdatePermalink({ ...p, pages: p.pages.filter(pg => pg !== page) }));
        await Promise.all(updatePromises);
        setHiddenPages(prev => new Set([...prev, page]));
      }
      setSelectedPages(new Set());
    } catch (error) {
      console.error('Error bulk deleting pages:', error);
      alert('Failed to delete some pages. Please try again.');
    }
  };

  const handleOpenForm = (permalink?: Permalink) => {
    if (permalink) {
      setEditingPermalink(permalink);
      setFormData({
        url: permalink.url,
        label: permalink.label,
        pages: permalink.pages || [],
        isVisible: permalink.isVisible,
        allowShare: permalink.allowShare,
        shareMessage: permalink.shareMessage || '',
      });
    } else {
      setEditingPermalink(null);
      setFormData({
        url: '',
        label: '',
        pages: [],
        isVisible: true,
        allowShare: true,
        shareMessage: '',
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPermalink(null);
    setFormData({
      url: '',
      label: '',
      pages: [],
      isVisible: true,
      allowShare: true,
      shareMessage: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url.trim() || !formData.label.trim()) {
      alert('Please provide both URL and label');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPermalink) {
        await onUpdatePermalink({
          ...editingPermalink,
          ...formData,
        });
      } else {
        await onCreatePermalink(formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving permalink:', error);
      alert('Failed to save permalink. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (permalink: Permalink) => {
    try {
      await onUpdatePermalink({
        ...permalink,
        isVisible: !permalink.isVisible,
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleDelete = async (permalinkId: string) => {
    if (!confirm('Are you sure you want to delete this permalink?')) return;
    
    try {
      await onDeletePermalink(permalinkId);
    } catch (error) {
      console.error('Error deleting permalink:', error);
      alert('Failed to delete permalink. Please try again.');
    }
  };

  const togglePage = (page: ViewState) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.includes(page)
        ? prev.pages.filter(p => p !== page)
        : [...prev.pages, page]
    }));
  };



  // Filter pages in the form
  const filteredPages = useMemo(() => {
    if (!pageSearchTerm) return ALL_VIEW_STATES;
    return ALL_VIEW_STATES.filter(page =>
      page.toLowerCase().includes(pageSearchTerm.toLowerCase())
    );
  }, [pageSearchTerm]);

  const stats = useMemo(() => {
    const totalPages = ALL_VIEW_STATES.length;
    const visiblePages = totalPages - hiddenPages.size;
    const visibleCustomLinks = permalinks.filter(permalink => {
      if (!permalink.isVisible) return false;
      if (!permalink.pages || permalink.pages.length === 0) return visiblePages > 0;
      return permalink.pages.some(page => !hiddenPages.has(page));
    }).length;

    return {
      total: totalPages + permalinks.length,
      visible: visiblePages + visibleCustomLinks,
      hidden: hiddenPages.size + permalinks.filter(p => !p.isVisible).length,
      withShare: permalinks.filter(p => p.allowShare).length,
      totalPages,
      visiblePages,
      hiddenPagesCount: hiddenPages.size,
      customLinks: permalinks.length,
      visibleCustomLinks,
    };
  }, [permalinks, hiddenPages]);

  const getPermalinksForPage = (page: ViewState) => {
    return permalinks.filter(p => 
      !p.pages || p.pages.length === 0 || p.pages.includes(page)
    );
  };

  const handleCopyPagePermalink = async (page: ViewState) => {
    const url = getPagePermalink(page, pagePathOverrides);
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Failed to copy page permalink:', error);
      window.prompt('Copy page permalink:', url);
    }
  };

  const handleShare = async (url: string, title: string = 'City of Truth Ministries') => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        // Show a brief toast or alert
        alert('Link copied to clipboard!');
      } catch (_) {
        alert(`Link: ${url}`);
      }
    }
  };

  const handleOpenPagePermalinkEditor = (page: ViewState) => {
    setEditingPagePermalink(page);
    setPagePathDraft(pagePathOverrides[page] || VIEW_PATHS[page] || `/?view=${encodeURIComponent(page)}`);
  };

  const handleSavePagePermalink = () => {
    if (!editingPagePermalink) return;
    const normalized = normalizePagePath(pagePathDraft);
    if (!normalized) {
      alert('Enter a valid permalink path.');
      return;
    }

    const defaultPath = VIEW_PATHS[editingPagePermalink] || `/?view=${encodeURIComponent(editingPagePermalink)}`;
    setPagePathOverrides(prev => {
      const next = { ...prev };
      if (normalized === defaultPath) {
        delete next[editingPagePermalink];
      } else {
        next[editingPagePermalink] = normalized;
      }
      return next;
    });
    setEditingPagePermalink(null);
    setPagePathDraft('');
  };

  // Filter pages for the main view
  const filteredPagesForView = useMemo(() => {
    let pages = ALL_VIEW_STATES;
    
    // Filter by search term
    if (pageSearchTerm) {
      pages = pages.filter(page =>
        page.toLowerCase().includes(pageSearchTerm.toLowerCase())
      );
    }
    
    // Filter by visibility filter
    if (filterVisible === 'hidden') {
      pages = pages.filter(page => hiddenPages.has(page));
    } else if (filterVisible === 'visible') {
      pages = pages.filter(page => !hiddenPages.has(page));
    }
    
    return pages;
  }, [pageSearchTerm, filterVisible, hiddenPages]);

  const handleTogglePageVisibility = (page: ViewState) => {
    setHiddenPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(page)) {
        newSet.delete(page);
      } else {
        newSet.add(page);
      }
      return newSet;
    });
  };

  const handleDeletePage = async (page: ViewState) => {
    if (!confirm(`Are you sure you want to delete the ${page} page? This will remove all permalinks assigned to this page only.`)) {
      return;
    }
    
    try {
      // Remove this page from all permalinks that have it
      const updatePromises = permalinks
        .filter(p => p.pages.includes(page))
        .map(p => onUpdatePermalink({
          ...p,
          pages: p.pages.filter(pg => pg !== page)
        }));
      
      await Promise.all(updatePromises);
      
      // Also hide the page
      setHiddenPages(prev => new Set([...prev, page]));
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-2xl">
                <LinkIcon size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Permalink Manager</h2>
                <p className="text-brand-100 mt-1">
                  Page permalinks are created automatically as new pages are added
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Always show pages stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.totalPages}</div>
            <div className="text-sm text-brand-100">Total Pages</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-300">{stats.visiblePages}</div>
            <div className="text-sm text-brand-100">Visible Pages</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-orange-300">{stats.hiddenPagesCount}</div>
            <div className="text-sm text-brand-100">Hidden Pages</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-brand-300">{stats.total}</div>
            <div className="text-sm text-brand-100">Total Links</div>
            <div className="text-[10px] text-brand-100/75 mt-1">{stats.totalPages} page + {stats.customLinks} custom</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-blue-300">{stats.visible}</div>
            <div className="text-sm text-brand-100">Visible Links</div>
            <div className="text-[10px] text-brand-100/75 mt-1">{stats.visiblePages} page + {stats.visibleCustomLinks} custom</div>
          </div>
        </div>
      </div>

        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCloseForm}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleSubmit}>
                  <div className="p-6 border-b border-slate-100 bg-brand-500 text-white rounded-t-2xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                        <LinkIcon size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {editingPermalink ? 'Edit Permalink' : 'Create Permalink'}
                        </h3>
                        <p className="text-sm text-brand-100 mt-1">
                          Manage permanent links for your website
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                  {/* URL */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                    />
                  </div>

                  {/* Label */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Important Link"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Visible on Website
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        Show this permalink on the selected pages
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        formData.isVisible ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                          formData.isVisible ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Share Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Allow Sharing
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        Enable share button for this permalink
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, allowShare: !formData.allowShare })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        formData.allowShare ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                          formData.allowShare ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Share Message */}
                  {formData.allowShare && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Share Message (Optional)
                      </label>
                      <textarea
                        value={formData.shareMessage}
                        onChange={(e) => setFormData({ ...formData, shareMessage: e.target.value })}
                        placeholder="Custom message when sharing this link..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 resize-none"
                      />
                    </div>
                  )}

                  {/* Page Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Show on Pages
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Leave empty to show on all pages, or select specific pages
                    </p>

                    {/* Page Search Bar */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search pages..."
                        value={pageSearchTerm}
                        onChange={(e) => setPageSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                      {filteredPages.length > 0 ? (
                        filteredPages.map((page) => (
                          <label
                            key={page}
                            className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.pages.includes(page)}
                              onChange={() => togglePage(page)}
                              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                            />
                            <span className="text-sm text-slate-700 font-medium">{page}</span>
                            <span className="ml-auto text-xs text-slate-400">
                              {formData.pages.includes(page) ? '✓' : ''}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Filter size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No pages match "{pageSearchTerm}"</p>
                        </div>
                      )}
                    </div>

                    {/* Selected count */}
                    {formData.pages.length > 0 && (
                      <div className="mt-2 text-xs text-brand-600 font-semibold">
                        {formData.pages.length} page{formData.pages.length !== 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>

                  {/* Info Notice */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold mb-1">Tip:</p>
                      <p>
                        Permalinks will appear in a top bar on the selected pages. If no pages are selected,
                        the permalink will be visible across the entire website.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save size={18} />
                        {editingPermalink ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page permalink controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Page Permalinks</h3>
            <p className="text-sm text-slate-500 mt-1">Manage automatic page links, visibility, and custom paths.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              {selectedPages.size === filteredPagesForView.length && filteredPagesForView.length > 0 ? 'Clear Selection' : 'Select All'}
            </button>
            <button
              type="button"
              onClick={handleBulkHidePages}
              disabled={selectedPages.size === 0}
              className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hide Selected
            </button>
            <button
              type="button"
              onClick={handleBulkDeletePages}
              disabled={selectedPages.size === 0}
              className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Delete Selected
            </button>
          </div>
        </div>

        <div className="p-5 grid md:grid-cols-[1fr_auto] gap-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search pages..."
              value={pageSearchTerm}
              onChange={(e) => setPageSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-900"
            />
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(['all', 'visible', 'hidden'] as const).map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setFilterVisible(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  filterVisible === filter ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredPagesForView.length > 0 ? (
            filteredPagesForView.map(page => {
              const pageUrl = getPagePermalink(page, pagePathOverrides);
              const assignedPermalinks = getPermalinksForPage(page);
              const hidden = hiddenPages.has(page);
              const isEditingPath = editingPagePermalink === page;

              return (
                <div key={page} className={`p-4 transition-colors ${hidden ? 'bg-slate-50 opacity-70' : 'bg-white hover:bg-slate-50/70'}`}>
                  <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedPages.has(page)}
                        onChange={() => toggleSelectPage(page)}
                        className="mt-1 w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm tracking-wide">{page}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            hidden ? 'bg-slate-200 text-slate-500' : 'bg-green-100 text-green-700'
                          }`}>
                            {hidden ? 'Hidden' : 'Visible'}
                          </span>
                          {assignedPermalinks.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase">
                              {assignedPermalinks.length} link{assignedPermalinks.length === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>

                        {isEditingPath ? (
                          <div className="mt-2 flex flex-col sm:flex-row gap-2">
                            <input
                              value={pagePathDraft}
                              onChange={(event) => setPagePathDraft(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') handleSavePagePermalink();
                                if (event.key === 'Escape') {
                                  setEditingPagePermalink(null);
                                  setPagePathDraft('');
                                }
                              }}
                              className="flex-1 px-3 py-2 rounded-lg border border-brand-300 bg-white text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                              autoFocus
                            />
                            <button type="button" onClick={handleSavePagePermalink} className="px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-bold">
                              Save
                            </button>
                            <button type="button" onClick={() => { setEditingPagePermalink(null); setPagePathDraft(''); }} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500 font-mono truncate">{pageUrl}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <button type="button" onClick={() => handleCopyPagePermalink(page)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" title="Copy link">
                        <Copy size={15} />
                      </button>
                      <button type="button" onClick={() => handleShare(pageUrl, page)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600" title="Share link">
                        <Share2 size={15} />
                      </button>
                      <button type="button" onClick={() => handleOpenPagePermalinkEditor(page)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700" title="Edit path">
                        <Edit2 size={15} />
                      </button>
                      <button type="button" onClick={() => handleTogglePageVisibility(page)} className={`p-2 rounded-lg ${hidden ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-700'}`} title={hidden ? 'Show page' : 'Hide page'}>
                        {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button type="button" onClick={() => handleDeletePage(page)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600" title="Delete page link">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-slate-400">
              <Filter size={36} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold">No pages match your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom external permalinks */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Custom Links</h3>
            <p className="text-sm text-slate-500 mt-1">Add extra links shown on selected pages.</p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenForm()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LinkIcon size={16} />
            Create Link
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {permalinks.length > 0 ? (
            permalinks.map(permalink => (
              <div key={permalink.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-black text-slate-900">{permalink.label}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      permalink.isVisible ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {permalink.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                    {permalink.allowShare && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase">Share</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-mono truncate">{permalink.url}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {permalink.pages?.length ? `Shown on ${permalink.pages.length} selected page(s)` : 'Shown on all pages'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <button type="button" onClick={() => navigator.clipboard?.writeText(permalink.url)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" title="Copy URL">
                    <Copy size={15} />
                  </button>
                  <a href={permalink.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600" title="Open URL">
                    <ExternalLink size={15} />
                  </a>
                  <button type="button" onClick={() => handleToggleVisibility(permalink)} className={`p-2 rounded-lg ${permalink.isVisible ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`} title="Toggle visibility">
                    {permalink.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button type="button" onClick={() => handleOpenForm(permalink)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700" title="Edit link">
                    <Edit2 size={15} />
                  </button>
                  <button type="button" onClick={() => handleDelete(permalink.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600" title="Delete link">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400">
              <LinkIcon size={36} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold">No custom links yet.</p>
              <button type="button" onClick={() => handleOpenForm()} className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold">
                Create your first link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
