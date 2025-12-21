export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  MINISTRIES = 'MINISTRIES',
  ID_CARD = 'ID_CARD',
  MENORAH = 'MENORAH',
  CONTACT = 'CONTACT',
  ABOUT_VALPARAI = 'ABOUT_VALPARAI',
  HEBREW = 'HEBREW',
  BARUCH_HASHEM = 'BARUCH_HASHEM',
  DEVELOPER = 'DEVELOPER',
  AI = 'AI',
  USER_DASHBOARD = 'USER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export interface NavItem {
  label: string;
  view: ViewState;
}

export type UserStatus = 'Pending Verification' | 'Active' | 'Rejected';
export type UserRole = 'Member' | 'Admin' | 'Ministry Leader' | 'Choir' | 'Media Team';

export interface User {
  id: string; // COT-xxxx
  phone: string;
  password?: string; // For simplicity in mock
  name: string;
  email: string;
  dob: string;
  location: string;
  gender: string;
  bloodGroup: string;
  memberSince: string;
  emergency: string;
  role: UserRole;
  status: UserStatus;
  photo?: string;
  joinedDate: string;
}

export interface MemberData {
  name: string;
  email: string;
  dob: string;
  location: string;
  gender: string;
  bloodGroup: string;
  memberSince: string;
  emergency: string;
  role: string;
}
