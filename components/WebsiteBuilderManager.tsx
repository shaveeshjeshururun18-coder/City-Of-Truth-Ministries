import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Undo, Redo, X } from 'lucide-react';
import { useWebsiteBuilder } from './WebsiteBuilderContext';

interface WebsiteBuilderManagerProps {
  onExit: () => void;
}

export const WebsiteBuilderManager: React.FC<WebsiteBuilderManagerProps> = ({ onExit }) => {
  const { isEditMode, pendingTextChanges, undoAction, redoAction, canUndo, canRedo, clearHistory, publishAllChanges } = useWebsiteBuilder();

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



  if (!isEditMode) return null;

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] builder-toolbar">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-b-2xl shadow-2xl border border-gray-200 flex items-center gap-4"
      >
        <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-4">
          Website Builder
        </span>

        <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
          <button
            onClick={undoAction}
            disabled={!canUndo}
            className={`p-2 rounded-lg ${canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={redoAction}
            disabled={!canRedo}
            className={`p-2 rounded-lg ${canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>

        <button
          onClick={handlePublish}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all"
        >
          <Save size={16} /> Publish Changes
        </button>

        <button
          onClick={onExit}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
          title="Exit Edit Mode"
        >
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};
