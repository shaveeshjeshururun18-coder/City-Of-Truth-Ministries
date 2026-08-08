import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Undo, Redo, X, Settings, Eye, EyeOff, Palette, Layout, Copy, Trash2, Code, Zap } from 'lucide-react';
import { useWebsiteBuilder } from './WebsiteBuilderContext';

interface WebsiteBuilderManagerProps {
  isEditMode?: boolean;
  onExit: () => void;
}

export const WebsiteBuilderManager: React.FC<WebsiteBuilderManagerProps> = ({ onExit }) => {
  const { isEditMode, pendingTextChanges, undoAction, redoAction, canUndo, canRedo, clearHistory, publishAllChanges } = useWebsiteBuilder();
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  const handlePublish = () => {
    const stored = JSON.parse(localStorage.getItem('cot_website_builder_texts') || '{}');
    const merged = { ...stored, ...pendingTextChanges };
    localStorage.setItem('cot_website_builder_texts', JSON.stringify(merged));

    // Dispatch event to update components
    if (publishAllChanges) {
      publishAllChanges().then(() => {
        window.dispatchEvent(new Event('websiteBuilderUpdate'));
        alert('Changes published successfully!');
      });
    } else {
      window.dispatchEvent(new Event('websiteBuilderUpdate'));
      alert('Changes published successfully!');
    }
    clearHistory();
  };

  const handleExportConfig = () => {
    const config = {
      textContent: pendingTextChanges,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-config-${Date.now()}.json`;
    link.click();
  };

  if (!isEditMode) return null;

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] builder-toolbar w-full px-4">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`${colorMode === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md px-4 md:px-6 py-3 rounded-b-2xl shadow-2xl border ${colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2 md:gap-4 flex-wrap md:flex-nowrap`}
      >
        <span className="font-bold text-xs md:text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-2 md:mr-4 whitespace-nowrap">
          🎨 Advanced Builder
        </span>

        {/* Main Controls */}
        <div className="flex items-center gap-1 md:gap-2 border-r border-gray-300 pr-2 md:pr-4">
          <button
            onClick={undoAction}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all text-xs md:text-sm ${canUndo ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'text-gray-300 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} className="hidden md:inline" />
            <Undo size={14} className="md:hidden" />
          </button>
          <button
            onClick={redoAction}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all text-xs md:text-sm ${canRedo ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'text-gray-300 cursor-not-allowed'}`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo size={16} className="hidden md:inline" />
            <Redo size={14} className="md:hidden" />
          </button>
        </div>

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          <Save size={14} className="hidden md:inline" />
          <Save size={12} className="md:hidden" />
          <span className="hidden md:inline">Publish</span>
          <span className="md:hidden">Save</span>
        </button>

        {/* Advanced Menu Toggle */}
        <button
          onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-xs md:text-sm"
          title="Advanced Features"
        >
          <Zap size={14} className="hidden md:inline" />
          <Zap size={12} className="md:hidden" />
          <span className="hidden md:inline">Advanced</span>
        </button>

        {/* Preview Toggle */}
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-2 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all text-xs md:text-sm"
          title="Toggle Preview Mode"
        >
          {previewMode ? <EyeOff size={14} className="hidden md:inline" /> : <Eye size={14} className="hidden md:inline" />}
          {previewMode ? <EyeOff size={12} className="md:hidden" /> : <Eye size={12} className="md:hidden" />}
          <span className="hidden md:inline">{previewMode ? 'Editing' : 'Preview'}</span>
        </button>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto md:ml-2"
          title="Exit Edit Mode (ESC)"
        >
          <X size={16} className="hidden md:inline" />
          <X size={14} className="md:hidden" />
        </button>

        {/* Advanced Menu Dropdown */}
        <AnimatePresence>
          {showAdvancedMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full left-4 right-4 md:left-auto md:right-6 mt-2 ${colorMode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-xl z-50 p-3 grid grid-cols-2 md:grid-cols-4 gap-2`}
            >
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs text-center">
                <Palette size={18} className="text-purple-600" />
                <span>Themes</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs text-center">
                <Layout size={18} className="text-blue-600" />
                <span>Sections</span>
              </button>
              <button onClick={handleExportConfig} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs text-center">
                <Code size={18} className="text-green-600" />
                <span>Export</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs text-center">
                <Settings size={18} className="text-orange-600" />
                <span>Settings</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
