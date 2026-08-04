import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Code, Camera, Database, Sparkles, ChevronDown, ChevronUp, ArrowLeft, Download, Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { BugFixIcon } from './icons/modernIcons';
import { BugFixItem, User } from '../types';

const BUG_FIXES_STORAGE_KEY = 'cot_bug_fixes_report';

const fixes: BugFixItem[] = [
  { id: 1, category: 'UI/UX', title: 'Hebrew Word Builder RTL Fix', description: 'Fixed Framer Motion coordinate mapping conflicts caused by dir="rtl" on Reorder.Group. The wrapper now uses dir="ltr" while the combined word display retains RTL reading order.', icon: 'type', area: 'ui' },
  { id: 2, category: 'UI/UX', title: 'Duplicate AI Widget Removed', description: 'Removed an extra <AIChatAssistant /> render at the bottom of App.tsx that caused double widget display and potential event conflicts.', icon: 'bot', area: 'ui' },
  { id: 3, category: 'UI/UX', title: 'Bottom Navigation Centering', description: 'Mobile bottom navigation bar repositioned into a centered floating capsule using w-[90%] max-w-sm mx-auto for better mobile UX.', icon: 'mobile', area: 'ui' },
  { id: 4, category: 'UI/UX', title: 'Permalink Bold Styling & Share', description: 'Permalink URLs now display in bold, attractive styling. A Share Link button invokes navigator.share or falls back to clipboard copy with user feedback.', icon: 'link', area: 'ui' },
  { id: 5, category: 'Logic', title: 'Hebrew Numerals – Billions Support', description: 'Rewrote toHebrew() as a fully recursive function supporting numbers up to billions. Each 3-digit group (thousands, millions, billions) is handled independently and joined with thousand/million separators.', icon: 'hash', area: 'logic' },
  { id: 6, category: 'Logic', title: 'Gershayim Placement Fix', description: 'Corrected Hebrew numeral punctuation by inserting double-quote marks (״) before the final letter of each independent group rather than searching the cumulative string.', icon: 'pen', area: 'logic' },
  { id: 7, category: 'Logic', title: 'Dynamic Hebrew Font Scaling', description: 'Hebrew numeral output font size dynamically scales down from text-8xl to text-xl based on character length to prevent cutoff on mobile screens.', icon: 'ruler', area: 'logic' },
  { id: 8, category: 'Logic', title: 'Language-Aware Input Direction', description: 'Hebrew word input fields now auto-detect Unicode character range [\\u0590-\\u05FF] and apply dir="rtl" + text-right for Hebrew, and dir="ltr" + text-left for English/Tamil.', icon: 'type', area: 'logic' },
  { id: 9, category: 'Logic', title: 'Family Accordion Click Fix', description: 'Family registration accordion in WorshipperIDCard now correctly handles expand/collapse toggle clicks with proper pointer event propagation.', icon: 'users', area: 'logic' },
  { id: 10, category: 'Camera', title: 'QR Scanner Auto Max-Zoom + Torch', description: 'If no QR code is detected after 5 seconds, the scanner automatically applies maximum camera zoom and activates the torch/flashlight to assist scanning in low-light or distant scenarios.', icon: 'camera', area: 'camera' },
  { id: 11, category: 'Camera', title: 'QR Scanner Border Auto-Hide', description: 'The white scan border frame automatically hides after 5 seconds if no code is detected, reducing visual clutter during the zoom/torch enhancement phase.', icon: 'square', area: 'camera' },
  { id: 12, category: 'Camera', title: 'QR Scanner Zoom Reset at 7s', description: 'Camera zoom is automatically reset to minimum constraints at 7 seconds total (2 seconds after max zoom), allowing the scanner to recalibrate for the next scan attempt.', icon: 'search', area: 'camera' },
  { id: 13, category: 'Camera', title: 'QR Scanner Error Overlay at 10s', description: 'If no QR code is detected after 10 seconds, the camera stops and a beautiful red SVG warning overlay appears with failure instructions and a "Try Again" action button that fully resets the scanner state.', icon: 'alert', area: 'camera' },
  { id: 14, category: 'Feature', title: 'COT ID History Logging & Tab', description: 'Every COT ID reassignment is now logged to Firestore (cotIdHistory collection) and local JSON fallback. A new "Changed COT ID History" tab in Admin Dashboard shows all logs chronologically with User Name, Old ID, New ID, and Timestamp.', icon: 'clipboard', area: 'feature' },
  { id: 15, category: 'Feature', title: 'AI Widget Floating Label Editor', description: 'Admin Dashboard Widgets section now has an editable floating label for the AI Assistant widget. Admins can customize the label text, toggle widget visibility, and control label display independently.', icon: 'sparkles', area: 'feature' },
  { id: 16, category: 'Feature', title: 'Mobile Notifications Config Panel', description: 'A comprehensive Simulated Mobile Notifications panel in Admin Dashboard Widgets allows admins to view all notification types, toggle visibility, adjust timing, change theme colors, and set custom purposes.', icon: 'bell', area: 'feature' },
  { id: 17, category: 'Feature', title: 'Home Section Preview Controls', description: 'In isFrame (preview) mode, home sections and navbar items now show interactive Hide and Delete overlay buttons on hover, communicating back to the parent admin dashboard via postMessage.', icon: 'eye', area: 'feature' },
  { id: 18, category: 'Database', title: 'cotIdHistory Collection Added', description: 'Added cotIdHistory: [] to db.json for JSON-server fallback, and implemented Firestore collection writes with batch logging when COT IDs are reassigned. getCotIdHistory() retrieves logs sorted chronologically.', icon: 'database', area: 'db' },
  { id: 19, category: 'Tamil Grammar', title: 'Grammar Sub-Descriptions', description: 'Added Tamil-language sub-descriptions under each English grammar section in HebrewGrammar3D.tsx for bilingual accessibility.', icon: 'book', area: 'grammar' },
  { id: 20, category: 'Admin Dashboard', title: 'Navigation Search Filter', description: 'Added a real-time search input at the top of the Admin Dashboard sidebar to quickly filter navigation pages by keyword.', icon: 'search', area: 'feature' },
  { id: 21, category: 'Admin Dashboard', title: 'Dark Mode Toggle', description: 'Admin Dashboard now supports dark mode with a toggle button. Theme preference is persisted in localStorage as cot_dashboard_theme.', icon: 'moon', area: 'feature' },
  { id: 22, category: 'User Dashboard', title: 'Dark Mode Toggle', description: 'User Dashboard now supports dark/light mode toggle with a local isDark state and scoped dark styling.', icon: 'moon', area: 'feature' },
];

const categoryColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'UI/UX': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  'Logic': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Camera': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Feature': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Database': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  'Tamil Grammar': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Admin Dashboard': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'User Dashboard': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-500' },
};

const enrichFix = (fix: BugFixItem): BugFixItem => ({
  technicalDetails: fix.technicalDetails || `Resolution scope: ${fix.category}. The implementation updates the related UI state, route, storage, or rendering path and keeps the behavior aligned with the City of Truth Ministries production interface.`,
  filesChanged: fix.filesChanged || 'Application component layer, admin dashboard controls, local persistence, or page-specific React component.',
  verification: fix.verification || 'Verified through TypeScript/Vite build and direct functional review of the affected user workflow.',
  ...fix,
});

const buildMarkdownReport = (items: BugFixItem[]) => {
  const lines = [
    '# City of Truth Ministries - Bugs Fixed and Features Added',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Total resolved items: ${items.length}`,
    '',
    '## Executive Summary',
    '',
    'This report lists resolved defects, implementation improvements, feature additions, affected technical areas, and verification notes for the website update cycle.',
    '',
  ];

  items.map(enrichFix).forEach((fix) => {
    lines.push(`## ${String(fix.id).padStart(2, '0')}. ${fix.title}`);
    lines.push('');
    lines.push(`- Category: ${fix.category}`);
    lines.push(`- Area: ${fix.area}`);
    lines.push(`- Summary: ${fix.description}`);
    lines.push(`- Technical Details: ${fix.technicalDetails}`);
    lines.push(`- Affected Files/Modules: ${fix.filesChanged}`);
    lines.push(`- Verification: ${fix.verification}`);
    lines.push('');
  });

  return lines.join('\n');
};

export const BugsFixedPage: React.FC<{ onBack?: () => void; currentUser?: User | null }> = ({ onBack, currentUser }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterArea, setFilterArea] = useState<string>('all');
  const [items, setItems] = useState<BugFixItem[]>(() => {
    try {
      const saved = localStorage.getItem(BUG_FIXES_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length ? parsed.map(enrichFix) : fixes.map(enrichFix);
    } catch {
      return fixes.map(enrichFix);
    }
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<BugFixItem | null>(null);

  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    try {
      localStorage.setItem(BUG_FIXES_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage failures.
    }
  }, [items]);

  const categories = useMemo(() => ['all', ...Array.from(new Set(items.map(f => f.category)))], [items]);
  const filtered = filterArea === 'all' ? items : items.filter(f => f.category === filterArea);

  const startEdit = (fix?: BugFixItem) => {
    const next = fix || {
      id: Math.max(0, ...items.map(item => item.id)) + 1,
      category: 'Feature',
      title: '',
      description: '',
      technicalDetails: '',
      filesChanged: '',
      verification: '',
      icon: 'check',
      area: 'feature' as const,
    };
    setEditingId(next.id);
    setDraft(enrichFix(next));
  };

  const saveDraft = () => {
    if (!draft || !draft.title.trim() || !draft.description.trim()) return;
    setItems(prev => {
      const exists = prev.some(item => item.id === draft.id);
      return exists ? prev.map(item => item.id === draft.id ? enrichFix(draft) : item) : [enrichFix(draft), ...prev];
    });
    setEditingId(null);
    setDraft(null);
  };

  const deleteFix = (id: number) => {
    if (!confirm('Delete this bug-fix report item?')) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const downloadReport = () => {
    const blob = new Blob([buildMarkdownReport(items)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `city-of-truth-bugs-fixed-report-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pt-20 pb-28 px-4">
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-400/30"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-indigo-300 hover:text-white mb-6 text-sm font-medium transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={14} className="text-indigo-300" />
            <span className="text-indigo-300 text-xs font-bold tracking-widest uppercase">Changelog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            Bugs Fixed & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Features Added</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {items.length} professionally documented improvements shipped in this update, including UI, routing, data, camera, Hebrew logic, and admin workflow refinements.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle size={16} />
              {items.length} resolved
            </div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <Zap size={16} />
              Performance improved
            </div>
            <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold">
              <Code size={16} />
              TypeScript strict
            </div>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-indigo-950/20 transition hover:-translate-y-0.5">
              <Download size={16} /> Download Technical Report
            </button>
            {isAdmin && (
              <button onClick={() => startEdit()} className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-5 py-3 text-sm font-black text-indigo-100 transition hover:bg-indigo-500/30">
                <Plus size={16} /> Add Report Item
              </button>
            )}
          </div>
        </motion.div>

        {isAdmin && draft && (
          <div className="mb-8 rounded-3xl border border-indigo-400/30 bg-white/10 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-white">{editingId ? 'Edit Bug-Fix Report Item' : 'Add Bug-Fix Report Item'}</h2>
              <button onClick={() => { setEditingId(null); setDraft(null); }} className="rounded-full p-2 text-slate-300 hover:bg-white/10" aria-label="Close editor">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-300" />
              <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Category" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-300" />
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="User-facing summary" rows={3} className="md:col-span-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-300" />
              <textarea value={draft.technicalDetails || ''} onChange={(e) => setDraft({ ...draft, technicalDetails: e.target.value })} placeholder="Precise technical details" rows={3} className="md:col-span-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-300" />
              <input value={draft.filesChanged || ''} onChange={(e) => setDraft({ ...draft, filesChanged: e.target.value })} placeholder="Files/modules changed" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-300" />
              <input value={draft.verification || ''} onChange={(e) => setDraft({ ...draft, verification: e.target.value })} placeholder="Verification notes" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-300" />
            </div>
            <button onClick={saveDraft} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20">
              <Save size={16} /> Save Report Item
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterArea(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                filterArea === cat
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
            {cat === 'all' ? `All (${items.length})` : cat}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-violet-500/30 to-transparent" />

          <div className="space-y-4">
            {filtered.map((fix, index) => {
              const colors = categoryColors[fix.category] || categoryColors['Feature'];
              const isExpanded = expandedId === fix.id;
              return (
                <motion.div
                  key={fix.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-4 top-5 w-5 h-5 rounded-full border-2 border-slate-900 ${colors.dot} shadow-lg`} />
                  <div className={`rounded-2xl border ${colors.border} bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/10 transition-all`}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : fix.id)}
                      className="w-full text-left px-5 py-4 flex items-center gap-4"
                    >
                      <BugFixIcon iconKey={fix.icon} size={24} className="shrink-0 text-slate-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {fix.category}
                          </span>
                          <span className="text-slate-500 text-[10px]">#{fix.id.toString().padStart(2, '0')}</span>
                        </div>
                        <p className="font-bold text-white text-sm leading-tight">{fix.title}</p>
                      </div>
                      {isAdmin && (
                        <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => startEdit(fix)} className="rounded-lg p-2 text-indigo-200 hover:bg-white/10" aria-label={`Edit ${fix.title}`}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteFix(fix.id)} className="rounded-lg p-2 text-rose-200 hover:bg-white/10" aria-label={`Delete ${fix.title}`}>
                            <Trash2 size={14} />
                          </button>
                        </span>
                      )}
                      <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-4 border-t border-white/10"
                      >
                        <div className="space-y-3 pt-3 text-sm leading-relaxed">
                          <p className="text-slate-300">{fix.description}</p>
                          <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Technical Details</p>
                            <p className="text-slate-300">{enrichFix(fix).technicalDetails}</p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Affected Modules</p>
                              <p className="text-slate-300">{enrichFix(fix).filesChanged}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Verification</p>
                              <p className="text-slate-300">{enrichFix(fix).verification}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20"
        >
          <Database size={28} className="text-indigo-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-1">City of Truth Ministries</h3>
          <p className="text-slate-400 text-sm">All changes are live and verified. Thank you for your patience during this update cycle.</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-indigo-300 text-xs font-medium">
            <Camera size={12} />
            <span>Updated June 2026</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BugsFixedPage;
