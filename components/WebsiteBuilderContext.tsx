import React, { createContext, useContext, useState, useCallback } from 'react';

interface Action {
  type: 'TEXT' | 'SECTION' | 'THEME' | 'LAYOUT';
  id: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

interface AdvancedBuilderConfig {
  theme: 'light' | 'dark' | 'custom';
  layout: 'default' | 'minimal' | 'full-width' | 'sidebar';
  sectionOrder: string[];
  hiddenSections: string[];
  customCSS: string;
}

interface WebsiteBuilderContextType {
  isEditMode: boolean;
  pendingTextChanges: Record<string, string>;
  updateText: (id: string, text: string) => void;
  undoAction: () => void;
  redoAction: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  publishAllChanges?: () => Promise<void>;
  
  // Advanced Features
  advancedConfig: AdvancedBuilderConfig;
  updateTheme: (theme: 'light' | 'dark' | 'custom') => void;
  updateLayout: (layout: 'default' | 'minimal' | 'full-width' | 'sidebar') => void;
  reorderSections: (newOrder: string[]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateCustomCSS: (css: string) => void;
  exportConfig: () => string;
  importConfig: (config: string) => void;
  getActionHistory: () => Action[];
}

export const WebsiteBuilderContext = createContext<WebsiteBuilderContextType>({
  isEditMode: false,
  pendingTextChanges: {},
  updateText: () => {},
  undoAction: () => {},
  redoAction: () => {},
  canUndo: false,
  canRedo: false,
  clearHistory: () => {},
  advancedConfig: {
    theme: 'light',
    layout: 'default',
    sectionOrder: [],
    hiddenSections: [],
    customCSS: ''
  },
  updateTheme: () => {},
  updateLayout: () => {},
  reorderSections: () => {},
  toggleSectionVisibility: () => {},
  updateCustomCSS: () => {},
  exportConfig: () => '',
  importConfig: () => {},
  getActionHistory: () => []
});

export const useWebsiteBuilder = () => useContext(WebsiteBuilderContext);
