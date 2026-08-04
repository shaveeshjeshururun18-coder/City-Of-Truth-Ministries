export type COTPageId =
  | 'home'
  | 'worshipper-card'
  | 'hebrew-alphabet'
  | 'hebrew-tools'
  | 'hebrew-calendar'
  | 'hebrew-clock'
  | 'hebrew-numbers'
  | 'hebrew-words'
  | 'hebrew-letters-audio'
  | 'hebrew-gematria'
  | 'hebrew-festivals'
  | 'hebrew-grammar'
  | 'hebrew-reference'
  | 'hebrew-israel'
  | 'pdf-downloads'
  | 'ministries'
  | 'contact'
  | 'valparai'
  | 'pastor'
  | 'baruch-hashem'
  | 'golden-menorah'
  | 'ai'
  | 'member-form'
  | 'verify-id'
  | 'user-dashboard'
  | 'admin'
  | 'bible'
  | 'feast-calendar'
  | 'prayer-requests'
  | 'giving';

export interface COTNavigationStep {
  stepNumber: number;
  title: string;
  instruction: string;
  targetPage: COTPageId;
  targetElementId: string;
  actionType: 'click' | 'input' | 'view' | 'scan';
  elementLabel?: string;
  tip?: string;
}

export interface COTCustomGuideResponse {
  userQuestion: string;
  directAnswer: string;
  relevantPage: COTPageId;
  steps: COTNavigationStep[];
}

export interface COTPageInfo {
  id: COTPageId;
  title: string;
  simplePurpose: string;
  primaryGoal: string;
  keyFeatures: string[];
  howToUseSteps: {
    title: string;
    description: string;
    targetElementId?: string;
  }[];
}

export interface UserAccessibilitySettings {
  autoSpeakAudio: boolean;
  highContrastMode: boolean;
  largeTextMode: boolean;
}
