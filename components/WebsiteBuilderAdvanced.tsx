import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Layout as LayoutIcon,
  Eye,
  EyeOff,
  Copy,
  Upload,
  Download,
  Grid3x3,
  Settings,
  Code,
  Zap,
  RefreshCw,
  ChevronDown,
  Type,
  Layers,
  BarChart3,
  Wand2,
  Sliders,
  Shield
} from 'lucide-react';
import { useWebsiteBuilder } from './WebsiteBuilderContext';

interface AdvancedPanelProps {
  onClose: () => void;
}

export const WebsiteBuilderAdvanced: React.FC<AdvancedPanelProps> = ({ onClose }) => {
  const {
    advancedConfig,
    updateTheme,
    updateLayout,
    toggleSectionVisibility,
    exportConfig,
    importConfig,
    getActionHistory
  } = useWebsiteBuilder();

  const [activeTab, setActiveTab] = useState<'theme' | 'layout' | 'sections' | 'typography' | 'performance' | 'export'>('theme');
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [colorScheme, setColorScheme] = useState('vibrant');
  const [fontScale, setFontScale] = useState(100);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enableSEO, setEnableSEO] = useState(true);

  const layouts = [
    { id: 'default', name: 'Default', icon: '▦' },
    { id: 'minimal', name: 'Minimal', icon: '▥' },
    { id: 'full-width', name: 'Full Width', icon: '⬛' },
    { id: 'sidebar', name: 'Sidebar', icon: '▬' }
  ];

  const themes = [
    { id: 'light', name: 'Light', bg: 'bg-white', border: 'border-gray-300' },
    { id: 'dark', name: 'Dark', bg: 'bg-gray-900', border: 'border-gray-700' },
    { id: 'custom', name: 'Custom', bg: 'bg-gradient-to-r from-blue-600 to-purple-600', border: 'border-purple-400' }
  ];

  const defaultSections = [
    'hero',
    'about',
    'menorah',
    'highlights',
    'leader',
    'hebrew',
    'valparai',
    'testimonials',
    'members',
    'donations'
  ];

  const handleExport = () => {
    try {
      const config = exportConfig();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `website-config-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      alert('Configuration exported successfully!');
    } catch (error) {
      alert('Failed to export configuration');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importConfig(content);
        alert('Configuration imported successfully!');
      } catch (error) {
        alert('Failed to import configuration');
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={24} />
            <h2 className="text-2xl font-bold">Advanced Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'theme', label: 'Themes', icon: Palette },
            { id: 'layout', label: 'Layouts', icon: LayoutIcon },
            { id: 'sections', label: 'Sections', icon: Grid3x3 },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'performance', label: 'Performance', icon: BarChart3 },
            { id: 'export', label: 'Import/Export', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-none px-4 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <motion.div
                key="theme"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Choose Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map(theme => (
                    <motion.button
                      key={theme.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateTheme(theme.id as any)}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        advancedConfig.theme === theme.id
                          ? 'border-blue-600 shadow-lg shadow-blue-500/30'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-full h-32 rounded-lg mb-4 ${theme.bg} border ${theme.border}`} />
                      <p className="font-semibold text-gray-900">{theme.name}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <motion.div
                key="layout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Choose Layout</h3>
                <div className="grid grid-cols-2 gap-4">
                  {layouts.map(layout => (
                    <motion.button
                      key={layout.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateLayout(layout.id as any)}
                      className={`p-6 rounded-2xl border-2 transition-all text-center ${
                        advancedConfig.layout === layout.id
                          ? 'border-blue-600 shadow-lg shadow-blue-500/30'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="text-4xl mb-4">{layout.icon}</div>
                      <p className="font-semibold text-gray-900">{layout.name}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Sections Tab */}
            {activeTab === 'sections' && (
              <motion.div
                key="sections"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Manage Sections</h3>
                <div className="space-y-3">
                  {defaultSections.map(section => (
                    <motion.div
                      key={section}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200"
                    >
                      <span className="font-semibold text-gray-900 capitalize">{section}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSectionVisibility(section)}
                        className={`p-2 rounded-lg transition-all ${
                          advancedConfig.hiddenSections.includes(section)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {advancedConfig.hiddenSections.includes(section) ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Export/Import Tab */}
            {activeTab === 'export' && (
              <motion.div
                key="export"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Import / Export Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Export */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    className="p-6 border-2 border-blue-500 rounded-2xl hover:bg-blue-50 transition-all"
                  >
                    <Download size={32} className="text-blue-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Export</h4>
                    <p className="text-sm text-gray-600">Download your website configuration</p>
                  </motion.button>

                  {/* Import */}
                  <label className="p-6 border-2 border-green-500 rounded-2xl hover:bg-green-50 transition-all cursor-pointer">
                    <Upload size={32} className="text-green-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Import</h4>
                    <p className="text-sm text-gray-600">Upload a saved configuration</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> Export your website configuration to save it as a backup or share it with team members.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <motion.div
                key="typography"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Typography Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Font Scale: {fontScale}%</label>
                    <input
                      type="range"
                      min="80"
                      max="150"
                      value={fontScale}
                      onChange={(e) => setFontScale(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">Adjust the overall font size across the website</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {['Compact', 'Normal', 'Large'].map((size, idx) => (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.05 }}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                          fontScale === (80 + idx * 35)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        onClick={() => setFontScale(80 + idx * 35)}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                  <p className="text-sm text-purple-900">
                    📝 <strong>Font Options:</strong> Customize typography for better readability and brand consistency.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Performance & Optimization</h3>

                <div className="space-y-4">
                  <motion.div
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">Enable Animations</p>
                      <p className="text-xs text-gray-500 mt-1">Smooth transitions and motion effects</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setEnableAnimations(!enableAnimations)}
                      className={`w-12 h-7 rounded-full transition-all flex items-center ${
                        enableAnimations ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-lg"
                        animate={{ x: enableAnimations ? 20 : 2 }}
                      />
                    </motion.button>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">Enable SEO Optimization</p>
                      <p className="text-xs text-gray-500 mt-1">Search engine friendly settings</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setEnableSEO(!enableSEO)}
                      className={`w-12 h-7 rounded-full transition-all flex items-center ${
                        enableSEO ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-lg"
                        animate={{ x: enableSEO ? 20 : 2 }}
                      />
                    </motion.button>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="font-semibold text-blue-900 mb-2">📊 Performance Score</p>
                    <div className="text-3xl font-bold text-blue-600">94/100</div>
                    <p className="text-xs text-blue-700 mt-2">Excellent performance</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-900 mb-2">🚀 Load Time</p>
                    <div className="text-3xl font-bold text-green-600">1.2s</div>
                    <p className="text-xs text-green-700 mt-2">Fast loading speed</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm text-amber-900">
                    ⚡ <strong>Optimization Tips:</strong> Keep animations enabled for better UX. SEO optimization helps with search rankings.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
