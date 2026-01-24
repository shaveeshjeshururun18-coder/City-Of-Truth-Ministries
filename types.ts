export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  MINISTRIES = 'MINISTRIES', GOLDEN_MENORAH = 'GOLDEN_MENORAH',
  ID_CARD = 'ID_CARD',

  CONTACT = 'CONTACT',
  ABOUT_VALPARAI = 'ABOUT_VALPARAI',
  HEBREW = 'HEBREW',
  BARUCH_HASHEM = 'BARUCH_HASHEM',
  DEVELOPER = 'DEVELOPER',
  AI = 'AI',
  MENORAH = 'MENORAH',
  MENORAH_FLAG = 'MENORAH_FLAG',
  USER_DASHBOARD = 'USER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export interface NavItem {
  label: string;
  view: ViewState;
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
}
