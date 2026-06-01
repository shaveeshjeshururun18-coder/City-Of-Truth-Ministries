import { ViewState } from './types';

export interface HebrewPage {
  id: string;
  label: string;
  shortLabel?: string; // Optional compact label for mobile bottom nav
  view: ViewState;
  type: 'content' | 'tools';
  description: string;
  iconName: string;
  isStandalone?: boolean; // If true, this page is rendered outside the standard tabbed HebrewResources component
}

export const HEBREW_PAGES: HebrewPage[] = [
  // --- Hebrew Content / Resources ---
  {
    id: 'alphabet',
    label: 'Hebrew Alphabet',
    shortLabel: 'Alphabet',
    view: ViewState.HEBREW,
    type: 'content',
    description: 'Letters, characters, and learning building blocks',
    iconName: 'alphabet',
    isStandalone: true
  },
  {
    id: 'israel',
    label: 'Eretz Israel',
    shortLabel: 'Israel',
    view: ViewState.HEBREW_ISRAEL,
    type: 'content',
    description: 'Eretz Israel history, maps, and content',
    iconName: 'israel'
  },
  {
    id: 'festivals',
    label: 'Festivals & Holy Days',
    shortLabel: 'Festivals',
    view: ViewState.HEBREW_FESTIVALS,
    type: 'content',
    description: 'Feasts and appointed times of Yahweh',
    iconName: 'festivals'
  },
  {
    id: 'calendar',
    label: 'Biblical Calendar',
    shortLabel: 'Calendar',
    view: ViewState.HEBREW_CALENDAR,
    type: 'content',
    description: 'Holy dates, Torah portions, and month flow',
    iconName: 'calendar'
  },
  {
    id: 'clock',
    label: 'Hebrew Clock',
    shortLabel: 'Clock',
    view: ViewState.HEBREW_CLOCK,
    type: 'content',
    description: 'Sacred time calculations and watch cycles',
    iconName: 'clock'
  },
  {
    id: 'reference',
    label: 'Month/Year Reference',
    shortLabel: 'Guide',
    view: ViewState.HEBREW_REFERENCE,
    type: 'content',
    description: 'Months, years, and reference mappings',
    iconName: 'reference'
  },
  {
    id: 'grammar',
    label: 'Hebrew Grammar',
    shortLabel: 'Grammar',
    view: ViewState.HEBREW_GRAMMAR,
    type: 'content',
    description: 'Study core patterns, verbs, and sentence structures',
    iconName: 'grammar'
  },

  // --- Hebrew Tools ---

  {
    id: 'words',
    label: 'Hebrew Words',
    shortLabel: 'Words',
    view: ViewState.HEBREW_WORDS,
    type: 'tools',
    description: 'Search meaningful Biblical words and roots',
    iconName: 'words'
  },
  {
    id: 'lettersaudio',
    label: 'Letters Audio Lab',
    shortLabel: 'Audio',
    view: ViewState.HEBREW_LETTERS_AUDIO,
    type: 'tools',
    description: 'Hear letter sounds clearly and build words',
    iconName: 'lettersaudio'
  },
  {
    id: 'numbers',
    label: 'Hebrew Numbers',
    shortLabel: 'Numbers',
    view: ViewState.HEBREW_NUMBERS,
    type: 'tools',
    description: 'Number forms, sacred math, and values',
    iconName: 'numbers'
  },
  {
    id: 'gematria',
    label: 'Gematria Value',
    shortLabel: 'Gematria',
    view: ViewState.HEBREW_GEMATRIA,
    type: 'tools',
    description: 'Calculate sacred numerical values of words',
    iconName: 'gematria'
  }
];
