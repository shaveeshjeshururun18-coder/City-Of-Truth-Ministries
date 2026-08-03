export enum ViewState {
  HOME = 'HOME',
  AUTH = 'AUTH',
  ABOUT = 'ABOUT',
  MINISTRIES = 'MINISTRIES', GOLDEN_MENORAH = 'GOLDEN_MENORAH',
  ID_CARD = 'ID_CARD',

  CONTACT = 'CONTACT',
  ABOUT_VALPARAI = 'ABOUT_VALPARAI',
  HEBREW = 'HEBREW',
  HEBREW_TOOLS = 'HEBREW_TOOLS',
  HEBREW_CALENDAR = 'HEBREW_CALENDAR',
  HEBREW_CLOCK = 'HEBREW_CLOCK',
  HEBREW_NUMBERS = 'HEBREW_NUMBERS',
  HEBREW_WORDS = 'HEBREW_WORDS',
  HEBREW_LETTERS_AUDIO = 'HEBREW_LETTERS_AUDIO',
  HEBREW_GEMATRIA = 'HEBREW_GEMATRIA',
  HEBREW_FESTIVALS = 'HEBREW_FESTIVALS',
  HEBREW_GRAMMAR = 'HEBREW_GRAMMAR',
  HEBREW_REFERENCE = 'HEBREW_REFERENCE',
  HEBREW_ISRAEL = 'HEBREW_ISRAEL',
  PDF_DOWNLOADS = 'PDF_DOWNLOADS',
  BARUCH_HASHEM = 'BARUCH_HASHEM',
  DEVELOPER = 'DEVELOPER',
  AI = 'AI',
  MENORAH = 'MENORAH',
  MENORAH_FLAG = 'MENORAH_FLAG',
  USER_DASHBOARD = 'USER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  VERIFY_ID = 'VERIFY_ID',
  PASTOR = 'PASTOR',
  MEMBER_FORM = 'MEMBER_FORM',
  BUGS_FIXED = 'BUGS_FIXED'
}

export interface NavItem {
  label: string;
  view: ViewState;
  href?: string;
  hidden?: boolean;
  submenu?: NavItem[];
}

export type UserStatus = 'Pending Verification' | 'Active' | 'Rejected';
export type UserRole = 'Member' | 'Admin';

export interface PendingProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  emergency?: string;
  photo?: string;
  dob?: string;
  memberSince?: string;
  joinedDate?: string;
  linkedProfiles?: SubProfile[];
  bloodGroup?: string;
}
export interface ProfileHistoryEntry {
  id: string;
  timestamp: string;
  changes: Record<string, { old: any; new: any }>;
  approvedBy?: string;
  action?: 'Profile Update' | 'COT ID Generated';
}

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
  fcmTokens?: string[];
  linkedProfiles?: SubProfile[];
  dob?: string;
  bloodGroup?: string;
  verificationDoc?: { name: string; uploadedAt: string };
  pendingProfileUpdate?: PendingProfileUpdate;
  profileHistory?: ProfileHistoryEntry[];
  communityProfile?: {
    denomination?: string;
    churchName?: string;
    role?: string;
    bio?: string;
    district?: string;
    status?: 'Pending' | 'Approved' | 'Rejected';
  };
  cardThemeTone?: 'blue' | 'purple' | 'green' | 'red' | 'gold' | 'lightblue';
  cardLayoutMode?: 'classic' | 'compact' | 'wide';
  cardShapeMode?: 'rounded' | 'soft' | 'sharp';
  cardSizeMode?: 'sm' | 'md' | 'lg';
  communicationPermissions?: {
    createAnnouncements?: boolean;
    sendAnnouncements?: boolean;
    manageContactLists?: boolean;
  };
  faceSignature?: Record<string, any>;
  biometrics?: {
    credentialId: string;
    publicKey: string;
  };
  registrationType?: 'individual' | 'family';
  familyMembers?: { id: string; name: string; relationship: string; photo?: string; isExpanded?: boolean }[];
  customBadges?: { id: string; icon: string; name: string; color: string }[];
  visibleBadgeId?: string;
}

export interface DeletedUser extends User {
  deletedAt: string;
  autoDeleteAt: string;
}

export interface SubProfile {
  id: string;
  name: string;
  role: string;
  photo?: string;
  dob?: string;
  bloodGroup?: string;
  communityProfile?: {
    denomination?: string;
    churchName?: string;
    role?: string;
    bio?: string;
    district?: string;
    status?: 'Pending' | 'Approved' | 'Rejected';
  };
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
  senderType?: 'Registered' | 'Non-Registered';
  senderStatus?: UserStatus | 'Guest';
}
export interface Ministry {
  id: string;
  name?: string;
  description?: string;
  image: string;
  mediaType?: 'image' | 'video';
  duration?: string;
  category?: string;
  hidden?: boolean;
  date: string;
  order?: number;
}

export interface Permalink {
  id: string;
  url: string;
  label: string;
  pages: ViewState[];
  isVisible: boolean;
  allowShare: boolean;
  shareMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetSettingsConfig {
  shareVisible: boolean;
  shareSize: number;
  shareLabelVisible: boolean;
  shareLabelText: string;
  shareAnimation?: boolean;
  aiVisible: boolean;
  aiSize: number;
  aiLabelVisible: boolean;
  aiLabelText: string;
  aiAnimation?: boolean;
}

export interface NotificationConfig {
  id: string;
  title: string;
  theme: 'amber' | 'emerald' | 'indigo' | 'rose' | 'violet';
  timing: number;
  purpose: string;
  visible: boolean;
}

export interface BugFixItem {
  id: number;
  category: string;
  title: string;
  description: string;
  technicalDetails?: string;
  filesChanged?: string;
  verification?: string;
  icon: string;
  area: 'ui' | 'logic' | 'feature' | 'camera' | 'db' | 'grammar' | 'admin' | 'user';
}

// ============================================================================
// Advanced Communication System Types
// ============================================================================

// Communication Channels
export type CommunicationChannel = 'sms' | 'email' | 'inapp';

// Delivery Status
export type DeliveryStatus = 'queued' | 'sending' | 'delivered' | 'failed' | 'bounced';

// Message Kind for MemberNotification
export type MessageKind = 'message' | 'approved' | 'disapproved' | 'recycle' | 'recycle-removed' | 'leader';

// Contact Management
export interface ContactList {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  contactCount: number;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  link?: string;
  sentBy: string;
}

export interface SiteVisit {
  id: string;
  deviceId: string;
  userId: string | 'Guest';
  isNewDevice: boolean;
  visitCount: number;
  timestamp: string;
}

export interface Contact {
  id: string;
  listId: string;
  name: string;
  email: string;
  phone?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Recipient Filtering
export interface RecipientFilters {
  roles?: UserRole[];
  statuses?: UserStatus[];
  locations?: string[];
  hasPhoneNumber?: boolean;
}

// Announcements
export interface Announcement {
  id: string;
  title: string;
  channels: CommunicationChannel[];
  content: {
    sms?: string;
    email?: {
      subject: string;
      body: string;
    };
    inapp?: string;
  };
  targetAudience: {
    userIds?: string[];
    contactListIds?: string[];
    filters?: RecipientFilters;
    broadcastAll?: boolean;
  };
  createdBy: string;
  createdByName: string;
  createdAt: string;
  sentAt?: string;
  status: 'draft' | 'queued' | 'sending' | 'completed' | 'failed';
  deliveryStats: {
    [channel: string]: {
      total: number;
      delivered: number;
      failed: number;
      pending: number;
    };
  };
}

// Delivery Tracking
export interface DeliveryRecord {
  id: string;
  announcementId: string;
  channel: CommunicationChannel;
  recipientType: 'user' | 'contact';
  recipientId: string;
  recipientIdentifier: string;
  status: DeliveryStatus;
  failureReason?: string;
  sentAt?: string;
  deliveredAt?: string;
  updatedAt: string;
}

export interface DeliveryReport {
  announcementId: string;
  channel: CommunicationChannel;
  totalRecipients: number;
  delivered: number;
  failed: number;
  pending: number;
  bounced: number;
  failureReasons: FailureReason[];
  generatedAt: string;
}

export interface FailureReason {
  reason: string;
  count: number;
  recipientIds: string[];
}

export interface RecipientDeliveryStatus {
  recipientId: string;
  recipientName: string;
  channel: CommunicationChannel;
  status: DeliveryStatus;
  failureReason?: string;
  deliveredAt?: string;
}

// Permission Management
export type CommunicationPermission = 
  | 'Create Announcements'
  | 'Send Announcements'
  | 'Manage Contact Lists';

export interface UserPermissions {
  userId: string;
  permissions: CommunicationPermission[];
  updatedAt: string;
}

// Audit Logging
export interface CommunicationAuditLog {
  id: string;
  senderUserId: string;
  senderUsername: string;
  timestamp: string;
  recipientCount: number;
  messageType: 'sms' | 'announcement';
  actionType: 'create' | 'send' | 'delete';
  metadata?: Record<string, any>;
}

// Integration with Existing Notification System
export interface MemberNotification {
  id: string;
  userId: string;
  from: 'admin' | 'user';
  message: string;
  createdAt: string;
  kind: MessageKind;
  read: boolean;
  ctaLabel?: string;
  ctaView?: ViewState;
  announcementId?: string;
  imageUrl?: string;
  deletedAt?: string;
  autoDeleteAt?: string;
}

export interface WidgetSettingsConfig {
  shareVisible: boolean;
  shareSize: number;
  shareLabelVisible?: boolean;
  shareLabelText?: string;
  shareAnimation?: boolean;
  aiVisible: boolean;
  aiSize: number;
  aiLabelVisible?: boolean;
  aiLabelText?: string;
  aiAnimation?: boolean;
  cotChatVisible?: boolean;
  cotChatSize?: number;
  cotChatLabelVisible?: boolean;
  cotChatLabelText?: string;
}
