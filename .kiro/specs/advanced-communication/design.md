# Design Document

## Overview

This document outlines the technical design for the Advanced Communication system, a multi-channel messaging solution for City of Truth Ministries. The system extends the existing in-app notification infrastructure with SMS and email capabilities, providing administrators with tools to send targeted announcements, manage external contacts, track delivery status, and maintain communication logs with appropriate permission controls.

## Architecture

### System Components

The Advanced Communication system follows a modular architecture integrated with the existing Firebase-based infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (TypeScript)               │
├─────────────────────────────────────────────────────────────┤
│  Communication UI Components                                 │
│  ├─ CommunicationDashboard.tsx                              │
│  ├─ AnnouncementComposer.tsx                                │
│  ├─ ContactListManager.tsx                                  │
│  ├─ DeliveryTracker.tsx                                     │
│  └─ CommunicationPermissions.tsx                            │
├─────────────────────────────────────────────────────────────┤
│  Communication Service Layer                                 │
│  ├─ communicationService.ts (orchestration)                 │
│  ├─ smsService.ts (SMS delivery)                            │
│  ├─ emailService.ts (email delivery)                        │
│  └─ notificationService.ts (in-app integration)             │
├─────────────────────────────────────────────────────────────┤
│                    Firebase Backend                          │
│  ├─ Firestore (data persistence)                            │
│  ├─ Firebase Functions (message processing)                 │
│  └─ Firebase Storage (contact list imports)                 │
├─────────────────────────────────────────────────────────────┤
│                  External Services                           │
│  ├─ Twilio API (SMS delivery)                               │
│  └─ SendGrid/EmailJS (email delivery)                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19.2.3 with TypeScript
- Lucide React icons for UI
- Framer Motion for animations
- Existing component patterns (cards, modals, forms)

**Backend:**
  targetAudience: {
    userIds?: string[];
    contactListIds?: string[];
    filters?: RecipientFilters;
    broadcastAll?: boolean;
  };
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'sending' | 'completed';
  deliveryReports: Map<CommunicationChannel, DeliveryReport>;
}

// Recipient Filters
export interface RecipientFilters {
  roles?: UserRole[];
  statuses?: UserStatus[];
  locations?: string[];
  hasPhoneNumber?: boolean;
}

// Delivery Tracking
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
- Firebase Firestore (database)
- Firebase Functions (serverless processing)
- Firebase Storage (file uploads)

**Third-Party Services:**
- Twilio API for SMS delivery
- SendGrid or EmailJS for email delivery (EmailJS already available in package.json)

### Integration Points

**Existing Systems:**
1. **User Management**: Leverages existing `User` type with `role`, `status`, `location`, `phone`, `email` fields
2. **In-App Notifications**: Extends current notification structure visible in UserDashboard.tsx
3. **API Service**: Extends `services/api.ts` with communication-specific functions
4. **Admin Dashboard**: Adds new tab to existing admin interface

## Data Model

### Firestore Collections

#### 1. **announcements** Collection
Stores all communication campaigns and announcements.

```typescript
interface Announcement {
  id: string;                           // Auto-generated Firestore ID
  title: string;                        // Announcement title (max 200 chars)
  channels: ('sms' | 'email' | 'inapp')[]; // Selected channels
  content: {
    sms?: string;                       // SMS message (max 160 chars)
    email?: {
      subject: string;                  // Email subject (max 200 chars)
      body: string;                     // Email body (max 1000 chars)
    };
    inapp?: string;                     // In-app notification (max 500 chars)
  };
  targetAudience: {
    type: 'all' | 'filtered' | 'custom'; // Audience selection type
    filters?: {
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

// Audit Log
export interface AuditLogEntry {
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
}
```

## Firestore Collections

      roles?: UserRole[];                // Filter by role
      status?: UserStatus[];             // Filter by status
      location?: string[];               // Filter by location
    };
    contactLists?: string[];             // Contact list IDs
    userIds?: string[];                  // Specific user IDs
  };
  createdBy: string;                     // User ID of creator
  createdByName: string;                 // Username for display
  createdAt: string;                     // ISO timestamp
  sentAt?: string;                       // ISO timestamp when sent
  status: 'draft' | 'queued' | 'sending' | 'completed' | 'failed';
  deliveryStats: {
    [channel: string]: {
      total: number;                     // Total recipients
      delivered: number;                 // Successfully delivered
      failed: number;                    // Failed deliveries
      pending: number;                   // In queue
    };
  };
}
```

#### 2. **contactLists** Collection
Manages external contact lists for non-registered recipients.

```typescript
interface ContactList {
  id: string;                           // Auto-generated Firestore ID
  name: string;                         // List name (max 100 chars)
  description?: string;                 // Optional description
  createdBy: string;                    // User ID of creator
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
  contactCount: number;                 // Cached count
}
```

#### 3. **contacts** Collection
Stores individual contacts within contact lists.

```typescript
interface Contact {

### Collection Structure

```
firestore/
├── contact_lists/
│   └── {listId}/
│       ├── id: string
│       ├── name: string
│       ├── description: string
│       ├── createdBy: string
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── contacts: Contact[]
│
├── sms_messages/
│   └── {messageId}/
│       ├── id: string
│       ├── content: string
│       ├── recipients: string[]
│       ├── createdBy: string
│       ├── createdAt: timestamp
│       ├── status: string
│       └── deliveryReport: object
│
├── announcements/
│   └── {announcementId}/
│       ├── id: string
│       ├── subject: string
│       ├── content: string
│       ├── channels: string[]
│       ├── targetAudience: object
│       ├── createdBy: string
│       ├── createdAt: timestamp
│       ├── status: string
│       └── deliveryReports: object
│
├── recipient_delivery_status/
│   └── {statusId}/
│       ├── announcementId: string
│       ├── recipientId: string
  id: string;                           // Auto-generated Firestore ID
  listId: string;                       // Parent contact list ID
  name: string;                         // Contact name (max 100 chars)
  email: string;                        // Email address (RFC 5322 format)
  phone?: string;                       // Phone number (10-15 digits, optional +)
  tags?: string[];                      // Custom labels (max 20, 50 chars each)
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}
```

#### 4. **deliveryRecords** Collection
Tracks individual message delivery status.

```typescript
interface DeliveryRecord {
  id: string;                           // Auto-generated Firestore ID
  announcementId: string;               // Parent announcement ID
  channel: 'sms' | 'email' | 'inapp';  // Delivery channel
  recipientType: 'user' | 'contact';   // Recipient type
  recipientId: string;                  // User ID or Contact ID
  recipientIdentifier: string;          // Email or phone for display
  status: 'queued' | 'sending' | 'delivered' | 'failed' | 'bounced';
  failureReason?: string;               // Error message if failed
  sentAt?: string;                      // ISO timestamp
  deliveredAt?: string;                 // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}
```

#### 5. **communicationPermissions** Collection
Manages granular communication permissions.

```typescript
interface CommunicationPermission {
  id: string;                           // User ID
  userId: string;                       // Reference to user
  permissions: {
    createAnnouncements: boolean;
│       ├── recipientName: string
│       ├── channel: string
│       ├── status: string
│       ├── failureReason: string?
│       └── deliveredAt: timestamp?
│
├── user_permissions/
│   └── {userId}/
│       ├── userId: string
│       ├── permissions: string[]
│       └── updatedAt: timestamp
│
└── communication_audit_log/
    └── {logId}/
        ├── id: string
        ├── senderUserId: string
        ├── senderUsername: string
        ├── timestamp: timestamp
        ├── recipientCount: number
        ├── messageType: string
        ├── actionType: string
        └── metadata: object
```

## Service Layer Design

### Communication Service

**Purpose**: Core business logic for creating and sending communications

**Key Functions**:
```typescript
class CommunicationService {
  // SMS Functions
  async composeSMS(content: string, recipients: string[]): Promise<SMSMessage>
  async sendSMS(messageId: string): Promise<void>
  async validateSMSContent(content: string): ValidationResult
  
  // Announcement Functions
  async createAnnouncement(data: AnnouncementData): Promise<Announcement>
  async sendAnnouncement(announcementId: string): Promise<void>
    sendAnnouncements: boolean;
    manageContactLists: boolean;
  };
  grantedBy: string;                    // Admin user ID
  grantedAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}
```

#### 6. **communicationAuditLog** Collection
Maintains audit trail of all communication actions.

```typescript
interface CommunicationAuditLog {
  id: string;                           // Auto-generated Firestore ID
  userId: string;                       // Acting user ID
  username: string;                     // Username for display
  action: 'create' | 'send' | 'delete' | 'grant_permission' | 'revoke_permission';
  resourceType: 'announcement' | 'contact_list' | 'permission';
  resourceId: string;                   // ID of affected resource
  recipientCount?: number;              // Number of recipients (for sends)
  messageType?: 'sms' | 'email' | 'inapp' | 'multi-channel';
  timestamp: string;                    // ISO timestamp
  metadata?: Record<string, any>;       // Additional context
}
```

#### 7. **memberNotifications** Collection (Existing - Extended)
Extends existing notification structure for in-app messages.

```typescript
interface MemberNotification {
  id: string;                           // Auto-generated Firestore ID
  userId: string;                       // Recipient user ID
  from: string;                         // Sender (always 'admin' for system)
  message: string;                      // Notification text
  kind: 'message' | 'approved' | 'disapproved' | 'recycle' | 'recycle-removed' | 'leader';
  ctaView?: string;                     // Optional navigation target
  async adaptContentForChannels(content: string, channels: Channel[]): Map<Channel, string>
  
  // Recipient Management
  async resolveRecipients(targetAudience: TargetAudience): Promise<Recipient[]>
  async filterRecipientsByChannel(recipients: Recipient[], channel: Channel): Promise<Recipient[]>
  async validateRecipientCount(count: number, channel: Channel): ValidationResult
}
```

### SMS Service

**Purpose**: Integration with SMS provider (Twilio or AWS SNS)

**Key Functions**:
```typescript
class SMSService {
  private provider: TwilioClient | SNSClient;
  
  async sendMessage(phoneNumber: string, content: string): Promise<DeliveryResult>
  async validatePhoneNumber(phone: string): boolean
  async calculateSMSSegments(content: string): number
  async calculateCreditEstimate(recipients: number, segments: number): number
  async getSendingProgress(): SMSProgress
  
  // Batch sending with rate limiting
  async sendBatch(messages: SMSBatch[]): Promise<BatchResult>
}
```

### Contact List Service

**Purpose**: Manage external contact lists

**Key Functions**:
```typescript
class ContactListService {
  async createContactList(name: string, description: string): Promise<ContactList>
  async addContact(listId: string, contact: Contact): Promise<void>
  createdAt: string;                    // ISO timestamp
  read?: boolean;                       // Read status
  announcementId?: string;              // NEW: Link to announcement if from comm system
}
```

### Type Extensions

Extend existing `User` type in `types.ts`:

```typescript
export interface User {
  // ... existing fields ...
  communicationPermissions?: {
    createAnnouncements?: boolean;
    sendAnnouncements?: boolean;
    manageContactLists?: boolean;
  };
}
```

## API Design

### Service Layer Functions

#### communicationService.ts

Core orchestration service for all communication operations.

```typescript
// Announcement Management
export const createAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement>
export const getAnnouncements(filters?: { status?: string, createdBy?: string }): Promise<Announcement[]>
export const getAnnouncementById(id: string): Promise<Announcement | null>
export const updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement>
export const deleteAnnouncement(id: string): Promise<void>
export const sendAnnouncement(id: string): Promise<{ success: boolean, stats: any }>

// Recipient Calculation
export const calculateRecipientCount(targetAudience: Announcement['targetAudience']): Promise<number>
export const getRecipientList(targetAudience: Announcement['targetAudience']): Promise<Array<{type: string, id: string, identifier: string}>>
  async importFromCSV(listId: string, csvFile: File): Promise<ImportResult>
  async validateCSV(csvFile: File): Promise<ValidationResult>
  async deleteContact(listId: string, contactId: string): Promise<void>
  async updateContact(listId: string, contact: Contact): Promise<void>
  async getContactList(listId: string): Promise<ContactList>
  async getAllContactLists(): Promise<ContactList[]>
  
  // CSV Processing
  private parseCSVRow(row: string[]): Contact | null
  private validateEmail(email: string): boolean
  private validatePhone(phone: string): boolean
  private checkDuplicates(listId: string, email: string): boolean
}
```

### Permission Service

**Purpose**: Manage communication permissions

**Key Functions**:
```typescript
class PermissionService {
  async checkPermission(userId: string, permission: CommunicationPermission): Promise<boolean>
  async hasAnyCommunicationPermission(userId: string): Promise<boolean>
  async grantPermission(userId: string, permission: CommunicationPermission): Promise<void>
  async revokePermission(userId: string, permission: CommunicationPermission): Promise<void>
  async getUserPermissions(userId: string): Promise<CommunicationPermission[]>
  
  // Guard functions for UI
  canCreateAnnouncement(userId: string, userRole: UserRole): Promise<boolean>
  canSendAnnouncement(userId: string, userRole: UserRole): Promise<boolean>

// Delivery Tracking
export const getDeliveryRecords(announcementId: string): Promise<DeliveryRecord[]>
export const getDeliveryStats(announcementId: string): Promise<Announcement['deliveryStats']>
export const updateDeliveryStatus(recordId: string, status: DeliveryRecord['status'], failureReason?: string): Promise<void>
```

#### smsService.ts

SMS-specific delivery logic using Twilio API.

```typescript
// SMS Operations
export const sendSMS(phone: string, message: string, announcementId?: string): Promise<{ success: boolean, messageId?: string, error?: string }>
export const sendBulkSMS(recipients: Array<{ phone: string, name?: string }>, message: string, announcementId: string): Promise<{ sent: number, failed: number, records: DeliveryRecord[] }>
export const validatePhoneNumber(phone: string): boolean
export const calculateSMSSegments(message: string): number
export const estimateSMSCredits(message: string, recipientCount: number): number
```

#### emailService.ts

Email-specific delivery logic using EmailJS or SendGrid.

```typescript
// Email Operations
export const sendEmail(to: string, subject: string, body: string, announcementId?: string): Promise<{ success: boolean, messageId?: string, error?: string }>
export const sendBulkEmail(recipients: Array<{ email: string, name?: string }>, subject: string, body: string, announcementId: string): Promise<{ sent: number, failed: number, records: DeliveryRecord[] }>
export const validateEmail(email: string): boolean
export const formatEmailTemplate(subject: string, body: string): string
```

#### notificationService.ts

In-app notification integration with existing system.

```typescript
  canManageContactLists(userId: string, userRole: UserRole): Promise<boolean>
}
```

### Delivery Tracking Service

**Purpose**: Track and report on message delivery

**Key Functions**:
```typescript
class DeliveryTrackingService {
  async updateDeliveryStatus(
    announcementId: string,
    recipientId: string,
    channel: Channel,
    status: DeliveryStatus,
    failureReason?: string
  ): Promise<void>
  
  async generateDeliveryReport(announcementId: string, channel: Channel): Promise<DeliveryReport>
  async getRecipientStatus(announcementId: string): Promise<RecipientDeliveryStatus[]>
  async calculateCompletionPercentage(announcementId: string): Promise<number>
  async isAnnouncementComplete(announcementId: string): Promise<boolean>
  
  // Real-time updates
  subscribeToDeliveryUpdates(announcementId: string, callback: (report: DeliveryReport) => void): Unsubscribe
  
  // Failure analysis
  async getFailureReasons(announcementId: string, channel: Channel): Promise<FailureReason[]>
  async calculateFailurePercentage(announcementId: string, channel: Channel): Promise<number>
}
```

## UI Component Design

### CommunicationHub Component

**Purpose**: Main entry point for communication features

// In-App Notification Operations
export const createMemberNotification(userId: string, message: string, kind?: string, ctaView?: string, announcementId?: string): Promise<MemberNotification>
export const sendBulkNotifications(userIds: string[], message: string, kind?: string, announcementId?: string): Promise<{ sent: number, failed: number, records: DeliveryRecord[] }>
export const getMemberNotifications(userId: string): Promise<MemberNotification[]>
export const markNotificationAsRead(notificationId: string): Promise<void>
export const deleteNotification(notificationId: string): Promise<void>

// Backward compatibility
export const onSendMessageToUsers(userIds: string[], message: string, kind?: string): Promise<void>
```

#### contactListService.ts

Contact list and contact management.

```typescript
// Contact List Management
export const createContactList(name: string, description?: string): Promise<ContactList>
export const getContactLists(userId?: string): Promise<ContactList[]>
export const getContactListById(id: string): Promise<ContactList | null>
export const updateContactList(id: string, updates: Partial<ContactList>): Promise<ContactList>
export const deleteContactList(id: string): Promise<void>

// Contact Management
export const addContact(listId: string, contact: Omit<Contact, 'id' | 'listId' | 'createdAt' | 'updatedAt'>): Promise<Contact>
export const importContactsFromCSV(listId: string, file: File): Promise<{ imported: number, failed: number, errors: Array<{ row: number, reason: string }> }>
export const getContacts(listId: string): Promise<Contact[]>
export const updateContact(id: string, updates: Partial<Contact>): Promise<Contact>
export const deleteContact(id: string): Promise<void>
export const validateContact(contact: Partial<Contact>): { valid: boolean, errors: string[] }
```

#### permissionService.ts

Permission management and access control.

```typescript

**State Management**:
```typescript
interface CommunicationHubState {
  activeTab: 'sms' | 'announcements' | 'contacts' | 'delivery';
  permissions: CommunicationPermission[];
  isLoading: boolean;
}
```

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Communication Hub                               │
├─────────────────────────────────────────────────┤
│ [SMS] [Announcements] [Contact Lists] [Reports] │
├─────────────────────────────────────────────────┤
│                                                 │
│         Tab-specific content here               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### SMSComposer Component

**Purpose**: Compose and send SMS messages

**State Management**:
```typescript
interface SMSComposerState {
  content: string;
  characterCount: number;
  segmentCount: number;
  selectedRecipients: string[];
  creditEstimate: number;
  filters: RecipientFilters;
  showRecipientSelector: boolean;
  isSending: boolean;
  validationErrors: string[];
}
```

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Compose SMS                                     │
├─────────────────────────────────────────────────┤
│ Message: [                               ]      │
│          [                               ]      │
│          Character count: 45/160                │
│          SMS segments: 1                        │
├─────────────────────────────────────────────────┤
│ Recipients:  [Select Recipients...] (125)       │
│              □ Filter by location               │
│              □ Filter by status                 │
│              ☑ Has phone number                 │
├─────────────────────────────────────────────────┤
│ Estimated credits: 125                          │
│                                                 │
│            [Preview] [Send SMS]                 │
└─────────────────────────────────────────────────┘
```

### AnnouncementComposer Component

**Purpose**: Create multi-channel bulk announcements

// Permission Operations
export const getCommunicationPermissions(userId: string): Promise<CommunicationPermission | null>
export const updateCommunicationPermissions(userId: string, permissions: Partial<CommunicationPermission['permissions']>, grantedBy: string): Promise<CommunicationPermission>
export const checkPermission(userId: string, permission: keyof CommunicationPermission['permissions']): Promise<boolean>
export const getAllPermissions(): Promise<CommunicationPermission[]>

// Audit Logging
export const logCommunicationAction(userId: string, username: string, action: CommunicationAuditLog['action'], resourceType: string, resourceId: string, metadata?: any): Promise<void>
export const getAuditLogs(filters?: { startDate?: string, endDate?: string, username?: string, action?: string }): Promise<CommunicationAuditLog[]>
export const cleanupOldAuditLogs(): Promise<number> // Delete logs older than 365 days
```

### API Service Extensions

Add to `services/api.ts`:

```typescript
export const api = {
  // ... existing methods ...
  
  // Communication API
  communication: {
    // Announcements
    createAnnouncement: async (announcement: Omit<Announcement, 'id'>): Promise<Announcement> => { /* ... */ },
    getAnnouncements: async (filters?: any): Promise<Announcement[]> => { /* ... */ },
    sendAnnouncement: async (id: string): Promise<any> => { /* ... */ },
    
    // Contact Lists
    createContactList: async (list: Omit<ContactList, 'id'>): Promise<ContactList> => { /* ... */ },
    getContactLists: async (): Promise<ContactList[]> => { /* ... */ },
    importContacts: async (listId: string, file: File): Promise<any> => { /* ... */ },
    
    // Permissions
    getUserPermissions: async (userId: string): Promise<CommunicationPermission | null> => { /* ... */ },

**State Management**:
```typescript
interface AnnouncementComposerState {
  subject: string;
  content: string;
  selectedChannels: CommunicationChannel[];
  targetAudience: {
    broadcastAll: boolean;
    userIds: string[];
    contactListIds: string[];
    filters: RecipientFilters;
  };
  previewMode: boolean;
  previewChannel: CommunicationChannel;
  adaptedContent: Map<CommunicationChannel, string>;
  isSending: boolean;
  validationErrors: string[];
}
```

**Layout**:
```
┌──────────────────────────────────────────────────┐
│ Create Announcement                              │
├──────────────────────────────────────────────────┤
│ Subject: [________________________]              │
│ Content: [                         ]             │
│          [                         ]             │
│          [                         ]             │
├──────────────────────────────────────────────────┤
│ Channels: ☑ SMS  ☑ Email  ☑ In-App              │
├──────────────────────────────────────────────────┤
│ Target:   ○ Broadcast to All                     │
│           ● Custom Selection                     │
│               [Select Users...] (25)             │
│               [Select Contact Lists...] (3)      │
│           Filters: [Role] [Status] [Location]    │
├──────────────────────────────────────────────────┤
│ Total recipients: 487                            │
│                                                  │
│          [Preview] [Send Announcement]           │
└──────────────────────────────────────────────────┘
```

### ContactListManager Component

**Purpose**: CRUD operations for contact lists

    updatePermissions: async (userId: string, permissions: any): Promise<CommunicationPermission> => { /* ... */ },
    
    // Audit Logs
    getAuditLogs: async (filters?: any): Promise<CommunicationAuditLog[]> => { /* ... */ },
    logAction: async (action: any): Promise<void> => { /* ... */ }
  }
};
```

## Component Design

### UI Components

#### 1. CommunicationDashboard.tsx

Main dashboard for communication management.

**Props:**
```typescript
interface CommunicationDashboardProps {
  user: User;
  onNavigate?: (view: ViewState) => void;
}
```

**Features:**
- Overview statistics (total announcements, recent sends, delivery rates)
- Quick action buttons (New Announcement, View Contact Lists, View Audit Log)
- Recent announcements list with status indicators
- Delivery progress indicators for active sends

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Communication Dashboard                     │
├─────────────────────────────────────────────┤
│  [New Announcement] [Contact Lists] [Audit] │
├──────────┬──────────┬──────────┬────────────┤
│ Total    │ Sent     │ Delivery │ Failed     │
│ Msgs: 45 │ Today: 8 │ Rate:95% │ Count: 2   │
├─────────────────────────────────────────────┤
│  Recent Announcements                        │
│  ○ Welcome Message       [Completed] 98%    │
│  ● Weekly Update         [Sending...]  45%  │
│  ○ Event Reminder        [Queued]           │
└─────────────────────────────────────────────┘
```

#### 2. AnnouncementComposer.tsx

Multi-channel announcement composition interface.

**Props:**
```typescript
interface AnnouncementComposerProps {
  user: User;

**State Management**:
```typescript
interface ContactListManagerState {
  contactLists: ContactList[];
  selectedList: ContactList | null;
  showImportDialog: boolean;
  showAddContactDialog: boolean;
  importResult: ImportResult | null;
  isProcessing: boolean;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────┐
│ Contact Lists                  [+ New List]      │
├──────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌────────────────────────────┐│
│ │ List Name    │  │ Contacts in "Prospective"  ││
│ │──────────────│  │────────────────────────────││
│ │▸ Prospective │  │ Name        Email     Phone││
│ │ Members      │  │ John Doe    john@...  +91..││
│ │              │  │ Jane Smith  jane@...  +91..││
│ │▸ External    │  │ ...                        ││
│ │ Stakeholders │  │                            ││
│ │              │  │ [Import CSV] [Add Contact] ││
│ │▸ Event       │  │                            ││
│ │ Attendees    │  │                            ││
│ └──────────────┘  └────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### DeliveryDashboard Component

**Purpose**: Track delivery progress and view reports

**State Management**:
```typescript
interface DeliveryDashboardState {
  announcements: Announcement[];
  selectedAnnouncement: Announcement | null;
  deliveryReports: Map<CommunicationChannel, DeliveryReport>;
  recipientStatuses: RecipientDeliveryStatus[];
  autoRefresh: boolean;
  refreshInterval: number;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────┐
│ Delivery Dashboard           Auto-refresh: [ON]  │
├──────────────────────────────────────────────────┤
│ Announcement: Easter Service Reminder            │
│ Status: Sending... (75% complete)                │
├──────────────────────────────────────────────────┤
│ Channel    Total  Delivered  Failed  Pending     │
│ ─────────────────────────────────────────────────│
│ SMS        500    375        10      115          │
│ Email      N/A    N/A        N/A     N/A          │
│ In-App     500    500        0       0            │
├──────────────────────────────────────────────────┤
│ Failure Analysis:                                │
│ • Invalid phone number: 8 recipients             │
│ • Network timeout: 2 recipients                  │
│                                                  │
│            [View Recipients] [Export Report]     │
└──────────────────────────────────────────────────┘
```

## Integration with Existing Systems

  announcementId?: string; // For editing existing
  onSave: (announcement: Announcement) => void;
  onCancel: () => void;
}
```

**Features:**
- Channel selection (SMS, Email, In-App) with checkboxes
- Message composition with real-time character count
- Audience targeting (All, Filtered, Contact Lists, Custom)
- Preview mode showing rendered message per channel
- SMS credit estimation display
- Validation and error handling

**Layout:**
```
┌──────────────────────────────────────────────┐
│  Create Announcement                          │
├──────────────────────────────────────────────┤
│  Title: [________________________]            │
│                                               │
│  Channels: [✓] SMS  [✓] Email  [✓] In-App   │
│                                               │
│  ┌─ SMS Message (160 chars) ───────────────┐ │
│  │ [_____________________________] 48/160  │ │
│  │ Est. Credits: 125 (125 recipients × 1)  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─ Email (1000 chars) ──────────────────┐  │
│  │ Subject: [_________________________]   │  │
│  │ Body: [____________________________]   │  │
│  │       [____________________________]   │  │
│  └───────────────────────────────────────┘  │
│                                               │
│  Target Audience: (•) All Users              │
│                   ( ) Filtered                │
│                   ( ) Contact Lists           │
│                                               │
│  [Preview] [Save Draft] [Send Now]           │
└──────────────────────────────────────────────┘
```

#### 3. ContactListManager.tsx

Contact list and contact management interface.

**Props:**
```typescript
interface ContactListManagerProps {
  user: User;
}
```

**Features:**

### In-App Notification Integration

**Approach**: Extend existing `MemberNotification` system without breaking changes

**Implementation**:
```typescript
// Existing interface (unchanged)
interface MemberNotification {
  id: string;
  userId: string;
  from: 'admin' | 'user';
  message: string;
  createdAt: string;
  kind: 'message' | 'event' | 'urgent' | 'system';
  read: boolean;
  ctaLabel?: string;
  ctaView?: ViewState;
}

// Extended functionality in Communication Service
class CommunicationService {
  async createInAppNotifications(
    announcement: Announcement,
    recipients: User[]
  ): Promise<void> {
    const notifications: MemberNotification[] = recipients.map(user => ({
      id: `NTF-${Date.now()}-${user.id}`,
      userId: user.id,
      from: 'admin',
      message: announcement.content,
      createdAt: new Date().toISOString(),
      kind: this.determineKind(announcement),
      read: false,
      ctaLabel: announcement.ctaLabel,
      ctaView: announcement.ctaView
    }));
    
    // Use existing onSendMessageToUsers function signature
    await this.notificationService.sendToUsers(
      recipients.map(u => u.id),
      announcement.content
    );
  }
}
```

### User Data Integration

**Approach**: Use existing `User` type without modification

**Recipient Resolution**:
```typescript
class RecipientResolver {
  async resolveFromFilters(filters: RecipientFilters): Promise<User[]> {
    let users = await api.getUsers();
    
    if (filters.roles) {
      users = users.filter(u => filters.roles!.includes(u.role));
    }
    
    if (filters.statuses) {
      users = users.filter(u => filters.statuses!.includes(u.status));
    }
    
    if (filters.locations) {
      users = users.filter(u => filters.locations!.includes(u.location));
    }
    
    if (filters.hasPhoneNumber) {
      users = users.filter(u => u.phone && u.phone.trim().length > 0);
    }
    
    return users;
  }
}
```

## Security and Access Control

### Permission Matrix

- Contact list creation, editing, deletion
- CSV import with validation and error reporting
- Manual contact addition with form validation
- Contact search and filtering by tags
- Duplicate detection and prevention
- Contact count display

**Layout:**
```
┌──────────────────────────────────────────────┐
│  Contact Lists                                │
├──────────────────────────────────────────────┤
│  [+ New List] [Import CSV]                   │
│                                               │
│  ┌─ Active Members (234 contacts) ─────────┐ │
│  │  [Edit] [Delete] [View Contacts]        │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─ Visitors (89 contacts) ───────────────┐  │
│  │  [Edit] [Delete] [View Contacts]        │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─ Contact Details Modal ─────────────────┐ │
│  │  Name:  [_________________________]     │ │
│  │  Email: [_________________________]     │ │
│  │  Phone: [_________________________]     │ │
│  │  Tags:  [tag1] [tag2] [+]              │ │
│  │  [Save] [Cancel]                        │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

#### 4. DeliveryTracker.tsx

Real-time delivery status tracking interface.

**Props:**
```typescript
interface DeliveryTrackerProps {
  announcementId: string;
  announcement: Announcement;
  onClose: () => void;
}
```

**Features:**
- Overall delivery progress by channel
- Real-time status updates (auto-refresh every 15s)
- Recipient-level delivery status view
- Failure reason display
- Completion notification
- Warning alerts for high failure rates (>10%)

**Layout:**
```
┌──────────────────────────────────────────────┐
│  Delivery Status: Weekly Update               │
├──────────────────────────────────────────────┤
│  Status: [Sending...] ████████░░ 85%         │

| Action                      | Admin Role | "Create Announcements" | "Send Announcements" | "Manage Contact Lists" |
|-----------------------------|------------|------------------------|----------------------|------------------------|
| View Communication Hub      | ✓          | ✓                      | ✓                    | ✓                      |
| Create SMS Message          | ✓          | ✓                      | -                    | -                      |
| Send SMS Message            | ✓          | -                      | ✓                    | -                      |
| Create Announcement         | ✓          | ✓                      | -                    | -                      |
| Send Announcement           | ✓          | -                      | ✓                    | -                      |
| Create Contact List         | ✓          | -                      | -                    | ✓                      |
| Import Contacts             | ✓          | -                      | -                    | ✓                      |
| View Delivery Reports       | ✓          | ✓                      | ✓                    | -                      |
| View Audit Log              | ✓          | -                      | -                    | -                      |

### Permission Enforcement

**Frontend (UI Level)**:
```typescript
// PermissionGuard component
const PermissionGuard: React.FC<{
  permission: CommunicationPermission;
  fallback?: ReactNode;
  children: ReactNode;
}> = ({ permission, fallback, children }) => {
  const { currentUser } = useAuth();
  const { permissions } = usePermissions(currentUser?.id);
  
  const hasPermission = 
    currentUser?.role === 'Admin' || 
    permissions.includes(permission);
  
  if (!hasPermission) {
    return fallback || <PermissionDenied permission={permission} />;
  }
  
  return <>{children}</>;
};

// Usage
<PermissionGuard permission="Create Announcements">
  <AnnouncementComposer />
</PermissionGuard>
```

**Backend (Service Level)**:
```typescript
class CommunicationService {
  async createAnnouncement(
    userId: string,
    data: AnnouncementData
  ): Promise<Announcement> {
    // Check permission
    const hasPermission = await this.permissionService
      .canCreateAnnouncement(userId);
    
    if (!hasPermission) {
      throw new PermissionDeniedError(
        'You do not have permission to create announcements'
      );
    }
    
    // Create audit log entry
    await this.auditLog.log({
      senderUserId: userId,
      actionType: 'create',
      messageType: 'announcement',
      recipientCount: data.targetAudience.length
    });
    
    // Proceed with creation
    return await this.createAnnouncementInternal(data);
  }
}
```

## Error Handling Strategy


### Error Categories

1. **Validation Errors**: User input validation failures
2. **Permission Errors**: Insufficient permissions
3. **Service Errors**: External service failures (SMS provider, email service)
4. **Network Errors**: Connectivity issues
5. **Data Errors**: Database operation failures

### Error Handling Implementation

```typescript
// Custom error types
class CommunicationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CommunicationError';
  }
}

class ValidationError extends CommunicationError {
  constructor(message: string, public field?: string) {
    super('VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

class PermissionDeniedError extends CommunicationError {
  constructor(message: string) {
    super('PERMISSION_DENIED', message);
    this.name = 'PermissionDeniedError';
  }
}

class ServiceError extends CommunicationError {
  constructor(
    public service: string,
    message: string,
    public originalError?: any
  ) {
    super('SERVICE_ERROR', message, originalError);
    this.name = 'ServiceError';
  }
}

// Error handling in service layer
class SMSService {
  async sendMessage(phone: string, content: string): Promise<DeliveryResult> {
    try {
      // Validate phone number
      if (!this.validatePhoneNumber(phone)) {
        throw new ValidationError('Invalid phone number format', 'phone');
      }
      
      // Send via provider
      const result = await this.provider.send(phone, content);
      return { status: 'Delivered', deliveredAt: new Date().toISOString() };
      
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Wrap provider errors
      throw new ServiceError('SMS Provider', 'Failed to send SMS', error);
    }
  }
}

// Error handling in UI
const SMSComposer: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleSend = async () => {
    try {
      setError(null);
      await communicationService.sendSMS(messageId);
      showSuccessToast('SMS sent successfully');
      
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
      } else if (err instanceof PermissionDeniedError) {
        setError('You do not have permission to send SMS');
      } else if (err instanceof ServiceError) {
        setError('SMS service is temporarily unavailable. Please try again.');
        console.error('SMS Service Error:', err.details);
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected error:', err);
      }
    }
  };
  
  // Render UI with error display
};
```

## Delivery Workflow


### Multi-Channel Announcement Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CREATE ANNOUNCEMENT                                          │
│    - Compose content                                            │
│    - Select channels (SMS, Email, In-App)                       │
│    - Define target audience                                     │
│    - Validate inputs                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. RESOLVE RECIPIENTS                                           │
│    - Apply filters to get user list                             │
│    - Resolve contact lists                                      │
│    - Deduplicate recipients                                     │
│    - Filter by channel availability (phone/email)               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. ADAPT CONTENT                                                │
│    - Truncate for SMS (160 chars)                               │
│    - Format for email (1000 chars)                              │
│    - Format for in-app (500 chars)                              │
│    - Generate preview                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. SEND (Parallel Processing)                                   │
│    ┌───────────┐  ┌───────────┐  ┌────────────┐                │
│    │ SMS Queue │  │Email Queue│  │In-App Queue│                │
│    └─────┬─────┘  └─────┬─────┘  └──────┬─────┘                │
│          │              │                │                      │
│          ▼              ▼                ▼                      │
│    ┌─────────┐    ┌─────────┐    ┌──────────┐                 │
│    │ SMS     │    │ Email   │    │ Create   │                 │
│    │ Service │    │ Service │    │ MemberNt │                 │
│    └─────┬───┘    └─────┬───┘    └────┬─────┘                 │
│          │              │              │                        │
└──────────┼──────────────┼──────────────┼────────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. TRACK DELIVERY STATUS                                        │
│    - Update status per recipient per channel                    │
│    - Log failures with reasons                                  │
│    - Calculate delivery percentages                             │
│    - Trigger completion notification                            │
└─────────────────────────────────────────────────────────────────┘
```

### SMS Sending with Rate Limiting

```typescript
class SMSService {
  private queue: SMSTask[] = [];
  private readonly RATE_LIMIT = 5; // messages per second
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.rateLimiter = new RateLimiter(this.RATE_LIMIT);
  }
  
  async sendBatch(messages: SMSBatch[]): Promise<BatchResult> {
    const results: DeliveryResult[] = [];
    
    // Add all messages to queue
    for (const msg of messages) {
      this.queue.push({
        recipientId: msg.recipientId,
        phone: msg.phone,
        content: msg.content,
        announcementId: msg.announcementId
      });
    }
    
    // Process queue with rate limiting
    while (this.queue.length > 0) {
      await this.rateLimiter.waitForToken();
      
      const task = this.queue.shift()!;
      
      try {
        const result = await this.sendMessage(task.phone, task.content);
        
        // Update delivery status
        await deliveryTrackingService.updateDeliveryStatus(
          task.announcementId,
          task.recipientId,
          'sms',
          'Delivered'
        );
        
        results.push({ ...result, recipientId: task.recipientId });
        
      } catch (error) {
        // Log failure
        await deliveryTrackingService.updateDeliveryStatus(
          task.announcementId,
          task.recipientId,
          'sms',
          'Failed',
          error.message
        );
        
        results.push({
          status: 'Failed',
          recipientId: task.recipientId,
          error: error.message
        });
      }
    }
    
    return {
      total: messages.length,
      delivered: results.filter(r => r.status === 'Delivered').length,
      failed: results.filter(r => r.status === 'Failed').length,
      results
    };
  }
}

// Rate limiter implementation
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  
  constructor(private ratePerSecond: number) {
    this.tokens = ratePerSecond;
    this.lastRefill = Date.now();
  }
  
  async waitForToken(): Promise<void> {
    while (this.tokens <= 0) {
      await this.refill();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.tokens--;
  }
  
  private async refill(): Promise<void> {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.ratePerSecond,
      this.tokens + elapsed * this.ratePerSecond
    );
    this.lastRefill = now;
  }
}
```

## Testing Strategy


### Unit Tests

**Test Coverage Areas**:

1. **Validation Functions**
   - Phone number validation (various formats)
   - Email validation (RFC 5322 compliance)
   - Content length validation
   - CSV parsing and validation

2. **Permission Checks**
   - Admin role access
   - Granular permission verification
   - Combined permission scenarios

3. **Content Adaptation**
   - Truncation logic for different channels
   - Character counting
   - SMS segment calculation

4. **Recipient Resolution**
   - Filter application
   - Deduplication
   - Channel-specific filtering

**Example Test**:
```typescript
describe('SMSService', () => {
  describe('validatePhoneNumber', () => {
    it('should accept valid phone numbers', () => {
      const service = new SMSService();
      expect(service.validatePhoneNumber('+919876543210')).toBe(true);
      expect(service.validatePhoneNumber('9876543210')).toBe(true);
    });
    
    it('should reject invalid phone numbers', () => {
      const service = new SMSService();
      expect(service.validatePhoneNumber('123')).toBe(false);
      expect(service.validatePhoneNumber('abcd')).toBe(false);
      expect(service.validatePhoneNumber('')).toBe(false);
    });
    
    it('should reject numbers outside 10-15 digit range', () => {
      const service = new SMSService();
      expect(service.validatePhoneNumber('123456789')).toBe(false); // 9 digits
      expect(service.validatePhoneNumber('1234567890123456')).toBe(false); // 16 digits
    });
  });
});
```

### Integration Tests

**Test Scenarios**:

1. **End-to-End SMS Flow**
   - Create SMS message
   - Send to recipients
   - Track delivery status
   - Generate report

2. **Multi-Channel Announcement**
   - Create announcement with all channels
   - Verify content adaptation
   - Confirm parallel delivery
   - Check delivery reports

3. **Contact List Import**
   - Upload CSV file
   - Validate processing
   - Verify duplicate detection
   - Confirm error reporting

4. **Permission Enforcement**
   - Attempt actions without permissions
   - Verify error messages
   - Test with granular permissions

### Manual Testing Checklist

- [ ] SMS composition UI (character count, recipient selection)
- [ ] SMS sending (delivery confirmation, error handling)
- [ ] Announcement creation (channel selection, content preview)
- [ ] Announcement sending (multi-channel delivery)
- [ ] Contact list creation and management
- [ ] CSV import (valid and invalid files)
- [ ] Delivery dashboard (real-time updates, report generation)
- [ ] Permission enforcement (all permission combinations)
- [ ] Audit log (entry creation, filtering, viewing)
- [ ] Integration with existing notifications (backward compatibility)

## Performance Considerations

│                                               │
│  ┌─ SMS ──────────────────────────────────┐  │
│  │ Total: 125 | Delivered: 110 | Failed: 5 │ │
│  │ Pending: 10                             │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─ Email ────────────────────────────────┐  │
│  │ Total: 125 | Delivered: 120 | Failed: 2 │ │
│  │ Pending: 3                              │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─ In-App ───────────────────────────────┐  │
│  │ Total: 125 | Delivered: 125 | Failed: 0 │ │
│  │ Pending: 0                              │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  [View Failed Recipients] [Export Report]    │
└──────────────────────────────────────────────┘
```

#### 5. CommunicationPermissions.tsx

Permission management interface for admins.

**Props:**
```typescript
interface CommunicationPermissionsProps {
  currentUser: User; // Must be Admin
  targetUser: User;  // User to manage permissions for
  onUpdate: (permissions: CommunicationPermission) => void;
  onClose: () => void;
}
```

**Features:**
- Permission toggle switches
- Visual permission state (enabled/disabled)
- Audit log display for permission changes
- Save confirmation

**Layout:**
```
┌──────────────────────────────────────────────┐
│  Manage Communication Permissions             │
│  User: John Doe (COT-1234)                   │
├──────────────────────────────────────────────┤
│                                               │
│  [✓] Create Announcements                    │
│      Allow user to create announcement drafts│
│                                               │
│  [✓] Send Announcements                      │
│      Allow user to send announcements        │
│                                               │
│  [ ] Manage Contact Lists                    │
│      Allow user to create and edit lists     │
│                                               │
│  [Save Changes] [Cancel]                     │
└──────────────────────────────────────────────┘
```

### Admin Dashboard Integration

Add new tab to existing Admin Dashboard (AdminDashboard.tsx):

**Tab Configuration:**
```typescript
{
  id: 'communication',
  label: 'Communication',
  icon: 'MessageSquare', // Lucide icon
  order: 13, // After existing tabs
  hidden: false
}
```

**Tab Content:**
Renders `<CommunicationDashboard />` component when selected.

## Implementation Flow

### User Flows

#### Flow 1: Send Multi-Channel Announcement

1. Admin opens Communication Dashboard
2. Clicks "New Announcement" button
3. AnnouncementComposer opens
4. Admin enters title: "Weekly Update"
5. Admin selects channels: SMS ✓, Email ✓, In-App ✓
6. Admin composes messages for each channel
7. System shows character counts and SMS credit estimate
8. Admin selects target audience: "All Active Members"
9. System calculates and displays recipient count: 125 users
10. Admin clicks "Preview"
11. System shows rendered messages for all channels
12. Admin clicks "Send Now"
13. System validates permissions (Send Announcements)
14. System creates announcement record with status 'queued'
15. System creates delivery records for all recipients × channels
16. Background process sends messages:
    - In-App: Creates MemberNotification records (immediate)
    - Email: Calls emailService.sendBulkEmail()
    - SMS: Calls smsService.sendBulkSMS()
17. System updates delivery records as messages process
18. DeliveryTracker shows real-time progress
19. On completion, system shows summary notification
20. System logs action to audit log

#### Flow 2: Import Contact List from CSV

1. Admin opens Contact List Manager
2. Clicks "Import CSV" button
3. File picker opens
4. Admin selects CSV file (max 5MB, 10,000 rows)
5. System validates file size and format
6. System parses CSV rows
7. For each row:
   - Validate name (required, max 100 chars)
   - Validate email (RFC 5322 format)
   - Validate phone (10-15 digits, optional +)
   - Check for duplicates by email
   - Collect validation errors
8. System shows import summary:
   - Valid: 234 contacts
   - Invalid: 12 contacts
   - Duplicate: 3 contacts
   - Errors: Row 5 (invalid email), Row 12 (missing name), ...
9. Admin reviews summary
10. Admin clicks "Import Valid Contacts"
11. System creates Contact records in Firestore
12. System updates ContactList.contactCount
13. System shows success message: "234 contacts imported"
14. System logs action to audit log

#### Flow 3: Track Delivery Status

1. Admin sends announcement (Flow 1)
2. System opens DeliveryTracker automatically
3. DeliveryTracker displays initial stats:
   - All channels show "Queued" status
4. System begins message delivery in background
5. Every 15 seconds, DeliveryTracker refreshes:
   - Fetches latest delivery records
   - Updates channel statistics
   - Updates progress bar
6. As messages deliver:
   - Delivered count increases
   - Pending count decreases
   - Failed messages show failure reasons
7. If failure rate > 10% for any channel:
   - System displays warning notification
   - Shows failure reason summary
8. When all messages reach final state:
   - System marks announcement as 'completed'
   - Shows completion notification
   - Auto-refresh stops
9. Admin can click "View Failed Recipients" to see details
10. Admin can click "Export Report" to download CSV

## Security & Permissions

### Permission Checks

**Access Control:**
1. Communication Dashboard access requires:
   - User.role === 'Admin' OR
   - User has ANY communication permission

2. Create Announcement requires:
   - communicationPermissions.createAnnouncements === true

3. Send Announcement requires:
   - communicationPermissions.sendAnnouncements === true

4. Manage Contact Lists requires:
   - communicationPermissions.manageContactLists === true

**Implementation:**
```typescript
// Permission check helper
export const canAccessCommunication = (user: User): boolean => {
  if (user.role === 'Admin') return true;
  if (!user.communicationPermissions) return false;
  return Object.values(user.communicationPermissions).some(p => p === true);
};

export const canCreateAnnouncement = (user: User): boolean => {
  if (user.role === 'Admin') return true;
  return user.communicationPermissions?.createAnnouncements === true;
};

export const canSendAnnouncement = (user: User): boolean => {
  if (user.role === 'Admin') return true;
  return user.communicationPermissions?.sendAnnouncements === true;
};

export const canManageContactLists = (user: User): boolean => {
  if (user.role === 'Admin') return true;
  return user.communicationPermissions?.manageContactLists === true;
};
```

### Data Validation

**Input Validation:**
1. All text inputs sanitized to prevent XSS
2. Email validation using RFC 5322 regex
3. Phone validation: `/^\+?[0-9]{10,15}$/`
4. CSV file size limited to 5MB
5. CSV row limit of 10,000
6. Character limits enforced client-side and server-side

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }
    
    function hasPermission(permission) {
      return request.auth != null && 
             get(/databases/$(database)/documents/communicationPermissions/$(request.auth.uid))
               .data.permissions[permission] == true;
    }
    
    // Announcements
    match /announcements/{announcementId} {
      allow read: if isAdmin() || hasPermission('createAnnouncements');
      allow create: if isAdmin() || hasPermission('createAnnouncements');
      allow update: if isAdmin() || hasPermission('sendAnnouncements');
      allow delete: if isAdmin();
    }
    
    // Contact Lists
    match /contactLists/{listId} {
      allow read: if isAdmin() || hasPermission('manageContactLists');
      allow write: if isAdmin() || hasPermission('manageContactLists');
    }
    
    // Contacts
    match /contacts/{contactId} {
      allow read: if isAdmin() || hasPermission('manageContactLists');
      allow write: if isAdmin() || hasPermission('manageContactLists');
    }
    
    // Delivery Records (read-only for tracking)
    match /deliveryRecords/{recordId} {
      allow read: if isAdmin() || hasPermission('createAnnouncements');
      allow write: if false; // Only server writes
    }
    
    // Communication Permissions
    match /communicationPermissions/{userId} {
      allow read: if isAdmin() || request.auth.uid == userId;
      allow write: if isAdmin();
    }
    
    // Audit Logs (read-only)
    match /communicationAuditLog/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only server writes
    }
  }
}
```

## External Service Integration

### Twilio SMS Service

**Configuration:**
```typescript
// Environment variables (add to .env)
VITE_TWILIO_ACCOUNT_SID=xxx
VITE_TWILIO_AUTH_TOKEN=xxx
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

**Implementation:**
```typescript
// services/smsService.ts
import twilio from 'twilio';

const client = twilio(
  import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  import.meta.env.VITE_TWILIO_AUTH_TOKEN
);

export const sendSMS = async (phone: string, message: string) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: import.meta.env.VITE_TWILIO_PHONE_NUMBER,
      to: phone
    });
    return { success: true, messageId: result.sid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
```

**Note:** Twilio API calls should be made from Firebase Functions for security (not exposed in client).

### EmailJS Service

**Configuration:**
```typescript
// Already available in package.json: @emailjs/browser
// Environment variables (add to .env)
VITE_EMAILJS_SERVICE_ID=xxx
VITE_EMAILJS_TEMPLATE_ID=xxx
VITE_EMAILJS_PUBLIC_KEY=xxx
```

**Implementation:**
```typescript
// services/emailService.ts
import emailjs from '@emailjs/browser';

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

export const sendEmail = async (to: string, subject: string, body: string) => {
  try {
    const result = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: to,
        subject: subject,
        message: body,
        from_name: 'City of Truth Ministries'
      }
    );
    return { success: true, messageId: result.text };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
```

## Performance Considerations

### Optimization Strategies

1. **Batch Message Processing:**
   - Process messages in batches of 100 to avoid timeout
   - Use Firebase Functions with increased timeout limits
   - Implement queue system for large sends (>500 recipients)

2. **Real-Time Updates:**
   - Use Firestore listeners for delivery status updates
   - Throttle UI updates to every 15 seconds during active sends
   - Unsubscribe listeners when component unmounts

3. **CSV Import:**
   - Parse CSV client-side to validate before upload
   - Upload to Firebase Storage, process server-side
   - Stream processing for large files

4. **Caching:**
   - Cache contact lists in component state
   - Cache user lists for recipient selection
   - Cache permission checks for session duration

5. **Database Queries:**
   - Create composite indexes for common filter combinations
   - Limit query results with pagination (50 items per page)
   - Use Firestore query cursors for efficient paging

### Required Firestore Indexes

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "announcements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "announcements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "deliveryRecords",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "announcementId", "order": "ASCENDING" },
        { "fieldPath": "channel", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "contacts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "listId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "communicationAuditLog",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" },
        { "fieldPath": "action", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Error Handling

### Error Scenarios

1. **Permission Denied:**
   - Display: "You do not have permission to perform this action"
   - Action: Redirect to dashboard, log attempt

2. **Network Failure:**
   - Display: "Connection lost. Please check your internet connection"
   - Action: Retry operation, queue for later if critical

3. **SMS/Email Delivery Failure:**
   - Display: "Message delivery failed for X recipients. View details"
   - Action: Log failures with reasons, allow retry

4. **Invalid Input:**
   - Display: Inline validation errors on form fields
   - Action: Prevent submission, highlight errors

5. **Quota Exceeded:**
   - Display: "Daily message limit reached (1000 emails / 500 SMS)"
   - Action: Show quota reset time, prevent sending

6. **File Upload Error:**
   - Display: "CSV import failed: [specific reason]"
   - Action: Show error details, allow file reselection

### Error Recovery

```typescript
// Retry logic for external API calls
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retries exceeded');
};
```

## Testing Strategy

### Unit Tests

Test individual service functions:
- `smsService.validatePhoneNumber()`
- `emailService.validateEmail()`
- `communicationService.calculateRecipientCount()`
- `contactListService.validateContact()`

### Integration Tests

Test component interactions:
- AnnouncementComposer saves draft correctly
- ContactListManager imports CSV successfully
- DeliveryTracker displays real-time updates
- Permission checks prevent unauthorized access

### End-to-End Tests

Test complete user flows:
- Admin creates and sends multi-channel announcement
- Admin imports contact list from CSV
- Admin grants communication permissions to member
- Member with permissions creates but cannot send announcement

### Manual Testing Checklist

- [ ] Send SMS to valid and invalid phone numbers
- [ ] Send email to valid and invalid addresses
- [ ] Create in-app notifications visible in UserDashboard
- [ ] Import CSV with various error conditions
- [ ] Test permission checks for all roles
- [ ] Verify delivery tracking updates in real-time
- [ ] Test with large recipient lists (500+ users)
- [ ] Verify audit log entries created correctly
- [ ] Test character limits and validation
- [ ] Verify quota limits enforced

## Deployment Checklist

### Pre-Deployment

- [ ] Configure Twilio account and obtain credentials
- [ ] Configure EmailJS account and obtain credentials
- [ ] Add environment variables to `.env` file
- [ ] Deploy Firestore security rules
- [ ] Create Firestore indexes
- [ ] Deploy Firebase Functions for message processing
- [ ] Test all external API integrations
- [ ] Run full test suite

### Post-Deployment

- [ ] Verify Communication Dashboard accessible to admins
- [ ] Test sending messages through all channels
- [ ] Monitor Firestore usage and costs
- [ ] Monitor Twilio SMS credits
- [ ] Set up alerts for high failure rates
- [ ] Document admin procedures
- [ ] Train administrators on new features

## Future Enhancements

### Phase 2 Considerations

1. **Message Scheduling:**
   - Schedule announcements for future delivery
   - Recurring announcements (weekly, monthly)

2. **Message Templates:**
   - Pre-defined message templates with placeholders
   - Template categories and search

3. **Advanced Analytics:**
   - Email open tracking with tracking pixels
   - Click tracking for links
   - Engagement reports and charts

4. **Message Approval Workflow:**
   - Require admin approval before sending
   - Multi-level approval chains

5. **URL Shortening:**
   - Automatic URL shortening for SMS
   - Click tracking through short URLs

6. **Rich Email Templates:**
   - HTML email templates with branding
   - Drag-and-drop email builder

7. **Two-Way SMS:**
   - Receive and respond to SMS replies
   - SMS conversation threads

8. **Unsubscribe Management:**
   - Allow recipients to opt-out of communications
   - Manage unsubscribe lists

These enhancements are documented for future consideration but not included in the current implementation scope.

## Conclusion

This design provides a comprehensive blueprint for implementing the Advanced Communication system. The architecture leverages existing Firebase infrastructure, integrates seamlessly with the current notification system, and provides administrators with powerful multi-channel communication capabilities while maintaining appropriate security controls and audit trails.

The modular design allows for incremental implementation, starting with core announcement and contact list features, then expanding to delivery tracking and permission management as development progresses.

### Optimization Strategies

1. **Batch Processing**
   - Process SMS in batches of 100
   - Use Firebase batch writes for delivery status updates
   - Implement queue-based processing

2. **Rate Limiting**
   - Enforce SMS provider rate limits (5 messages/second)
   - Implement token bucket algorithm
   - Queue excess messages

3. **Caching**
   - Cache user permissions (5-minute TTL)
   - Cache contact lists (1-minute TTL)
   - Cache delivery reports (30-second TTL)

4. **Lazy Loading**
   - Load recipient list on demand
   - Paginate delivery status table
   - Lazy load contact list contents

5. **Real-time Updates**
   - Use Firestore listeners for delivery status
   - Debounce UI updates (500ms)
   - Auto-refresh dashboard every 15 seconds

### Performance Targets

| Operation                    | Target Time     | Notes                          |
|------------------------------|-----------------|--------------------------------|
| Load Communication Hub       | < 2 seconds     | Initial page load              |
| Resolve recipients           | < 2 seconds     | Up to 1000 users               |
| SMS delivery (per message)   | < 2 minutes     | Including queue time           |
| In-app notification creation | < 30 seconds    | Batch creation                 |
| Generate delivery report     | < 60 seconds    | For completed announcement     |
| CSV import (10K rows)        | < 10 seconds    | With validation                |
| Permission check             | < 100ms         | With caching                   |

## Deployment Strategy

### Phase 1: Core Infrastructure (Week 1-2)

- [ ] Data models and TypeScript types
- [ ] Firestore collections and indexes
- [ ] Permission service implementation
- [ ] Basic UI components (Communication Hub shell)

### Phase 2: Contact List Management (Week 3)

- [ ] Contact list CRUD operations
- [ ] CSV import functionality
- [ ] Contact list UI
- [ ] Testing and validation

### Phase 3: SMS Capability (Week 4-5)

- [ ] SMS service integration (Twilio or AWS SNS)
- [ ] SMS composer UI
- [ ] Recipient selection and filtering
- [ ] SMS sending with rate limiting
- [ ] Delivery tracking for SMS

### Phase 4: Multi-Channel Announcements (Week 6-7)

- [ ] Announcement composer UI
- [ ] Content adaptation logic
- [ ] Multi-channel delivery orchestration
- [ ] Integration with existing notifications
- [ ] Delivery dashboard

### Phase 5: Delivery Tracking & Analytics (Week 8)

- [ ] Real-time delivery status updates
- [ ] Delivery report generation
- [ ] Failure analysis
- [ ] Audit log implementation

### Phase 6: Testing & Refinement (Week 9-10)

- [ ] Unit test coverage
- [ ] Integration testing
- [ ] Manual testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production deployment

## Dependencies

### External Services

1. **SMS Provider** (Choose one):
   - **Twilio**: Well-documented, reliable, global coverage
   - **AWS SNS**: Good integration with AWS ecosystem, cost-effective
   - **Recommended**: Twilio for ease of integration

2. **Firebase/Firestore**:
   - Already in use
   - No additional setup required

### NPM Packages

```json
{
  "dependencies": {
    "twilio": "^4.x.x",           // If using Twilio
    "@aws-sdk/client-sns": "^3.x.x", // If using AWS SNS
    "papaparse": "^5.x.x",        // CSV parsing
    "libphonenumber-js": "^1.x.x" // Phone number validation
  }
}
```

## Configuration

### Environment Variables

```env
# SMS Provider Configuration (Twilio)
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_number

# Or AWS SNS
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key

# Feature Flags
VITE_ENABLE_SMS=true
VITE_ENABLE_EMAIL=false  # Phase 2 feature
VITE_SMS_RATE_LIMIT=5    # messages per second
VITE_MAX_SMS_RECIPIENTS=500
```

## Security Considerations


### Data Protection

1. **Phone Number Handling**
   - Never log full phone numbers
   - Mask phone numbers in UI (show last 4 digits only)
   - Encrypt phone numbers at rest in contact lists

2. **Permission Verification**
   - Check permissions on every sensitive operation
   - Server-side validation (not just UI)
   - Audit all permission-gated actions

3. **Rate Limiting**
   - Prevent abuse through quota enforcement
   - Track daily message limits per account
   - Alert on unusual sending patterns

4. **Input Sanitization**
   - Sanitize all user inputs
   - Validate CSV file contents
   - Prevent injection attacks

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }
    
    function hasPermission(permission) {
      return isAdmin() || 
        (request.auth != null && 
         get(/databases/$(database)/documents/user_permissions/$(request.auth.uid))
           .data.permissions.hasAny([permission]));
    }
    
    // Contact Lists
    match /contact_lists/{listId} {
      allow read: if hasPermission('Manage Contact Lists');
      allow create, update, delete: if hasPermission('Manage Contact Lists');
    }
    
    // SMS Messages
    match /sms_messages/{messageId} {
      allow read: if hasPermission('Create Announcements') || 
                     hasPermission('Send Announcements');
      allow create: if hasPermission('Create Announcements');
      allow update: if hasPermission('Send Announcements');
      allow delete: if isAdmin();
    }
    
    // Announcements
    match /announcements/{announcementId} {
      allow read: if hasPermission('Create Announcements') || 
                     hasPermission('Send Announcements');
      allow create: if hasPermission('Create Announcements');
      allow update: if hasPermission('Send Announcements');
      allow delete: if isAdmin();
    }
    
    // Delivery Status
    match /recipient_delivery_status/{statusId} {
      allow read: if hasPermission('Create Announcements') || 
                     hasPermission('Send Announcements');
      allow write: if false; // Only backend can write
    }
    
    // User Permissions
    match /user_permissions/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if isAdmin();
    }
    
    // Audit Log
    match /communication_audit_log/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only backend can write
    }
  }
}
```

## Monitoring and Logging

### Metrics to Track

1. **Delivery Metrics**
   - Total messages sent (by channel)
   - Delivery success rate
   - Average delivery time
   - Failure rate by reason

2. **Usage Metrics**
   - Active users of communication features
   - Messages sent per day/week/month
   - Most used channels
   - Contact list sizes

3. **Performance Metrics**
   - API response times
   - SMS provider latency
   - Database query performance
   - UI load times

### Logging Strategy

```typescript
class CommunicationLogger {
  info(message: string, metadata?: object) {
    console.info(`[Communication] ${message}`, metadata);
  }
  
  warn(message: string, metadata?: object) {
    console.warn(`[Communication] ${message}`, metadata);
  }
  
  error(message: string, error: Error, metadata?: object) {
    console.error(`[Communication] ${message}`, {
      error: error.message,
      stack: error.stack,
      ...metadata
    });
    
    // Send to error tracking service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: metadata });
    }
  }
  
  audit(action: string, userId: string, metadata?: object) {
    console.info(`[Communication Audit] ${action}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
}
```

## Future Enhancements

### Phase 2 Features (Not in Current Scope)

1. **Email Campaign Management**
   - Rich HTML email templates
   - Email open tracking
   - Click tracking
   - Unsubscribe management

2. **Message Scheduling**
   - Schedule messages for future delivery
   - Recurring messages
   - Timezone-aware scheduling

3. **Advanced Templates**
   - Reusable message templates
   - Personalization placeholders
   - Template library

4. **Enhanced Analytics**
   - Engagement metrics
   - A/B testing
   - Recipient segmentation analysis

5. **Two-Way SMS**
   - Receive and display SMS replies
   - Auto-responders
   - Keyword-based responses

## Conclusion

This design document provides a comprehensive blueprint for implementing the Advanced Communication system. The design prioritizes:

- **Seamless Integration**: Works with existing notification system without breaking changes
- **Security**: Permission-based access control with audit logging
- **Scalability**: Batch processing and rate limiting for high-volume messaging
- **Reliability**: Robust error handling and delivery tracking
- **Usability**: Intuitive UI components with real-time feedback

The phased deployment approach allows for incremental delivery of value while managing risk and complexity.
