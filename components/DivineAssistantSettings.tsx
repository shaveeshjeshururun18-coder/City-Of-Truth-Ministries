import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';

interface AssistantConfig {
    size: number;
    label: string;
    showAnimation: boolean;
    position: { x: number; y: number };
}

export const DivineAssistantSettings: React.FC = () => {
    const [config, setConfig] = useState<AssistantConfig>({
        size: 80,
        label: 'Divine Help',
        showAnimation: true,
        position: { x: 0, y: 0 }
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load current config from window
        const loadConfig = () => {
            if ((window as any).divineAssistantConfig) {
                const currentConfig = (window as any).divineAssistantConfig.get();
                setConfig(currentConfig);
            }
        };
        loadConfig();
        const interval = setInterval(loadConfig, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSave = () => {
        if ((window as any).divineAssistantConfig) {
            (window as any).divineAssistantConfig.set(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const handleReset = () => {
        const defaultConfig = {
            size: 80,
            label: 'Divine Help',
            showAnimation: true,
            position: { x: 0, y: 0 }
        };
        setConfig(defaultConfig);
        if ((window as any).divineAssistantConfig) {
            (window as any).divineAssistantConfig.set(defaultConfig);
        }
    };

    const handleResetPosition = () => {
        const newConfig = { ...config, position: { x: 0, y: 0 } };
        setConfig(newConfig);
        if ((window as any).divineAssistantConfig) {
            (window as any).divineAssistantConfig.set(newConfig);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Divine Assistant Settings</h2>
                        <p className="text-amber-100 text-sm">Customize the floating assistant button</p>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Size Control */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Button Size
                    </label>
                    <div className="space-y-4">
                        <input
                            type="range"
                            min="50"
                            max="120"
                            value={config.size}
                            onChange={(e) => setConfig({ ...config, size: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Small (50px)</span>
                            <span className="text-lg font-bold text-amber-600">{config.size}px</span>
                            <span className="text-xs text-slate-500">Large (120px)</span>
                        </div>
                        {/* Preview */}
                        <div className="flex items-center justify-center py-6 bg-slate-50 rounded-xl">
                            <div 
                                className="rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center overflow-hidden ring-2 ring-black/20 relative"
                                style={{ width: `${config.size}px`, height: `${config.size}px` }}
                            >
                                <div className="absolute inset-0 bg-[url('/menorah-flag.png')] bg-cover bg-center"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent"></div>
                                <Sparkles 
                                    className="text-amber-200 relative z-10" 
                                    style={{ width: `${config.size * 0.4}px`, height: `${config.size * 0.4}px` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Label Control */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Tooltip Label
                    </label>
                    <input
                        type="text"
                        value={config.label}
                        onChange={(e) => setConfig({ ...config, label: e.target.value })}
                        placeholder="Enter tooltip text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        This text appears when hovering over the button
                    </p>
                </div>

                {/* Animation Toggle */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Glow Animation
                    </label>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                            {config.showAnimation ? 'Animation enabled' : 'Animation disabled'}
                        </span>
                        <button
                            onClick={() => setConfig({ ...config, showAnimation: !config.showAnimation })}
                            className={`relative w-16 h-8 rounded-full transition-colors ${
                                config.showAnimation ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                        >
                            <motion.div
                                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                                animate={{ left: config.showAnimation ? '36px' : '4px' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                                {config.showAnimation ? (
                                    <Eye size={12} className="text-amber-600" />
                                ) : (
                                    <EyeOff size={12} className="text-slate-400" />
                                )}
                            </motion.div>
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Pulsing glow effect around the button
                    </p>
                </div>

                {/* Position Control */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Button Position
                    </label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">X: {config.position.x}px</span>
                            <span className="text-slate-600">Y: {config.position.y}px</span>
                        </div>
                        <button
                            onClick={handleResetPosition}
                            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={16} />
                            Reset to Default Position
                        </button>
                        <p className="text-xs text-slate-500">
                            Drag the button on the page to reposition it
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 justify-end bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                >
                    <RotateCcw size={16} />
                    Reset All
                </button>
                <button
                    onClick={handleSave}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        saved
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg'
                    }`}
                >
                    {saved ? (
                        <>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center"
                            >
                                ✓
                            </motion.div>
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-900">
                        <p className="font-bold mb-1">How to use:</p>
                        <ul className="space-y-1 text-amber-800">
                            <li>• Adjust the size slider to change button dimensions</li>
                            <li>• Edit the label text for custom tooltip messages</li>
                            <li>• Toggle animation on/off for different effects</li>
                            <li>• Drag the button anywhere on the page to reposition</li>
                            <li>• All changes are saved automatically to localStorage</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation Guide Settings */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-violet-900">Interactive Navigation Guide</h3>
                        <p className="text-xs text-violet-600">Help users navigate the website with voice guidance</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 border border-violet-200">
                        <p className="text-sm text-slate-700 mb-3">
                            Users can ask the Divine Assistant for navigation help. The assistant will display live arrows 
                            pointing to menu items with voice instructions.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                                ✓ Voice guidance enabled
                            </span>
                            <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                                ✓ Live highlighting
                            </span>
                            <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                                ✓ Step-by-step arrows
                            </span>
                        </div>
                    </div>
                    <div className="bg-violet-100 rounded-xl p-4">
                        <p className="text-xs font-bold text-violet-900 mb-2">Example user questions:</p>
                        <ul className="space-y-1 text-xs text-violet-700">
                            <li>• "How do I navigate to the Hebrew page?"</li>
                            <li>• "Show me where the menu is"</li>
                            <li>• "Guide me through the website"</li>
                            <li>• "Need navigation help"</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
