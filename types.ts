export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  MINISTRIES = 'MINISTRIES', GOLDEN_MENORAH = 'GOLDEN_MENORAH',
  ID_CARD = 'ID_CARD',

  CONTACT = 'CONTACT',
  ABOUT_VALPARAI = 'ABOUT_VALPARAI',
  HEBREW = 'HEBREW',
  HEBREW_CALENDAR = 'HEBREW_CALENDAR',
  HEBREW_NUMBERS = 'HEBREW_NUMBERS',
  HEBREW_FESTIVALS = 'HEBREW_FESTIVALS',
  HEBREW_REFERENCE = 'HEBREW_REFERENCE',
  BARUCH_HASHEM = 'BARUCH_HASHEM',
  DEVELOPER = 'DEVELOPER',
  AI = 'AI',
  MENORAH = 'MENORAH',
  MENORAH_FLAG = 'MENORAH_FLAG',
  USER_DASHBOARD = 'USER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  VERIFY_ID = 'VERIFY_ID'
}

export interface NavItem {
  label: string;
  view: ViewState;
  submenu?: NavItem[];
}

export type UserStatus = 'Pending Verification' | 'Active' | 'Rejected';
export type UserRole = 'Member' | 'Admin';

export interface User {
  id: string; // COT-xxxx
  phone: string;
  password?: string;
  name: string;
  email: string;
  location: string;
  memberSince: string;
  emergency: string;
  role: UserRole;
  status: UserStatus;
  photo?: string;
  joinedDate: string;
  linkedProfiles?: SubProfile[];
  verificationDoc?: { name: string; uploadedAt: string };
  communityProfile?: {
    denomination?: string;
    churchName?: string;
    role?: string;
    bio?: string;
  };
}

export interface SubProfile {
  id: string;
  name: string;
  role: string;
  photo?: string;
  dob?: string;
  bloodGroup?: string;
}

export interface MemberData {
  name: string;
  email: string;
  location: string;
  memberSince: string;
  emergency: string;
}

export interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rating: number; // 1-5 stars
  userPhoto?: string;
  location?: string;
  role?: string;
}
export interface Ministry {
  id: string;
  name?: string;
  description?: string;
  image: string;
  date: string;
  order?: number;
}
