import React, { createContext, useContext, useState, useCallback } from 'react';

interface Action {
  type: 'TEXT';
  id: string;
  oldText: string;
  newText: string;
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
}

export const WebsiteBuilderContext = createContext<WebsiteBuilderContextType>({
  isEditMode: false,
  pendingTextChanges: {},
  updateText: () => {},
  undoAction: () => {},
  redoAction: () => {},
  canUndo: false,
  canRedo: false,
  clearHistory: () => {}
});

export const useWebsiteBuilder = () => useContext(WebsiteBuilderContext);
