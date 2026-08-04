import { ViewState } from '../types';

export const PAGE_PERMALINK_OVERRIDES_KEY = 'cot_page_permalink_overrides';

export const VIEW_PATHS: Record<ViewState, string> = {
  [ViewState.HOME]: '/',
  [ViewState.AUTH]: '/auth',
  [ViewState.ABOUT]: '/about',
  [ViewState.MINISTRIES]: '/ministries',
  [ViewState.CONTACT]: '/contact',
  [ViewState.ABOUT_VALPARAI]: '/valparai',
  [ViewState.HEBREW]: '/hebrew',
  [ViewState.HEBREW_TOOLS]: '/hebrew-tools',
  [ViewState.HEBREW_CALENDAR]: '/hebrew-calendar',
  [ViewState.HEBREW_CLOCK]: '/hebrew-clock',
  [ViewState.HEBREW_NUMBERS]: '/hebrew-numbers',
  [ViewState.HEBREW_WORDS]: '/hebrew-words',
  [ViewState.HEBREW_LETTERS_AUDIO]: '/hebrew-letters-audio',
  [ViewState.HEBREW_GEMATRIA]: '/hebrew-gematria',
  [ViewState.HEBREW_FESTIVALS]: '/hebrew-festivals',
  [ViewState.HEBREW_GRAMMAR]: '/hebrew-grammar',
  [ViewState.HEBREW_REFERENCE]: '/hebrew-reference',
  [ViewState.HEBREW_ISRAEL]: '/hebrew-israel',
  [ViewState.PDF_DOWNLOADS]: '/pdf-downloads',
  [ViewState.GOLDEN_MENORAH]: '/golden-menorah',
  [ViewState.MENORAH]: '/menorah',
  [ViewState.MENORAH_FLAG]: '/menorah-flag',
  [ViewState.BARUCH_HASHEM]: '/baruch-hashem',
  [ViewState.DEVELOPER]: '/developer',
  [ViewState.AI]: '/ai',
  [ViewState.ID_CARD]: '/entrust-card',
  [ViewState.USER_DASHBOARD]: '/dashboard',
  [ViewState.ADMIN_DASHBOARD]: '/admin',
  [ViewState.VERIFY_ID]: '/verify-id',
  [ViewState.PASTOR]: '/pastor',
  [ViewState.MEMBER_FORM]: '/member-form',
  [ViewState.BUGS_FIXED]: '/bugs-fixed',
};

export const normalizePagePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withSlash.replace(/\/{2,}/g, '/');
  }
};

export const getPagePermalinkOverrides = (): Partial<Record<ViewState, string>> => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(PAGE_PERMALINK_OVERRIDES_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getPagePath = (view: ViewState, overrides: Partial<Record<ViewState, string>> = getPagePermalinkOverrides()) => {
  return overrides[view] || VIEW_PATHS[view] || `/?view=${encodeURIComponent(view)}`;
};

export const getAbsolutePagePermalink = (view: ViewState, overrides: Partial<Record<ViewState, string>> = getPagePermalinkOverrides()) => {
  const path = getPagePath(view, overrides);
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
};
