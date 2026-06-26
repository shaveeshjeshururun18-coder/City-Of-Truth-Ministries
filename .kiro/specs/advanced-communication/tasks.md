# Implementation Plan: Advanced Communication System

## Overview

This implementation plan breaks down the Advanced Communication system into executable tasks following the phased deployment strategy outlined in the design document. The system adds multi-channel messaging capabilities (SMS, email, in-app) to City of Truth Ministries, with contact list management, delivery tracking, and granular permission controls.

## Tasks

- [x] 1. Infrastructure setup and type definitions
  - [x] 1.1 Create TypeScript type definitions in types.ts
    - Define `Announcement`, `ContactList`, `Contact`, `DeliveryRecord` interfaces
    - Define `CommunicationPermission`, `CommunicationAuditLog` interfaces
    - Extend existing `User` interface with `communicationPermissions` field
    - Define `RecipientFilters`, `DeliveryReport`, `RecipientDeliveryStatus` interfaces
    - _Requirements: 1.1, 2.10, 3.2_

  - [x] 1.2 Create Firestore collection structure and indexes
    - Create `firestore.indexes.json` entries for announcements, deliveryRecords, contacts, contactLists, communicationAuditLog
    - Add composite indexes for common query patterns (createdBy + createdAt, status + createdAt, etc.)
    - Deploy indexes using Firebase CLI
    - _Requirements: 1.1, 1.2, 6.10_

  - [x] 1.3 Set up environment configuration for external services
    - Add Twilio configuration variables (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER) to .env
    - Add EmailJS configuration variables (SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY) to .env
    - Add feature flags (ENABLE_SMS, SMS_RATE_LIMIT, MAX_SMS_RECIPIENTS) to .env
    - Document configuration requirements in README
    - _Requirements: 4.1, 5.1_

  - [x] 1.4 Install required dependencies
    - Install `twilio` package for SMS functionality
    - Install `papaparse` for CSV parsing
    - Install `libphonenumber-js` for phone number validation
    - Update package.json and verify @emailjs/browser is available
    - _Requirements: 2.2, 4.1_

- [ ] 2. Checkpoint - Verify infrastructure setup
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Permission system implementation
  - [x] 3.1 Create permission service (services/permissionService.ts)
    - Implement `getCommunicationPermissions(userId)` function
    - Implement `updateCommunicationPermissions(userId, permissions, grantedBy)` function
    - Implement `checkPermission(userId, permission)` helper function
    - Implement `getAllPermissions()` for admin view
    - _Requirements: 3.1, 3.2, 3.3, 3.9_

  - [ ] 3.2 Create permission guard component (components/PermissionGuard.tsx)
    - Create React component that checks user permissions
    - Display fallback content when permission denied
    - Support checking for Admin role OR specific communication permission
    - _Requirements: 3.1, 3.4, 3.6_

  - [x] 3.3 Implement Firestore security rules for communication collections
    - Add security rules for announcements collection (create, read, update, delete)
    - Add security rules for contactLists and contacts collections
    - Add security rules for deliveryRecords (read-only, server writes only)
    - Add security rules for communicationPermissions and communicationAuditLog
    - _Requirements: 3.1, 3.2, 3.9_

  - [ ] 3.4 Create audit logging service (services/auditService.ts)
    - Implement `logCommunicationAction(userId, username, action, resourceType, resourceId, metadata)` function
    - Implement `getAuditLogs(filters)` function with date range, username, action filters
    - Implement `cleanupOldAuditLogs()` function to delete logs older than 365 days
    - _Requirements: 3.7, 3.8, 3.10_

- [ ] 4. Contact list management
  - [x] 4.1 Create contact list service (services/contactListService.ts)
    - Implement `createContactList(name, description)` function
    - Implement `getContactLists(userId)` and `getContactListById(id)` functions
    - Implement `updateContactList(id, updates)` and `deleteContactList(id)` functions
    - Implement `addContact(listId, contact)` function with validation
    - Implement `getContacts(listId)`, `updateContact(id, updates)`, `deleteContact(id)` functions
    - _Requirements: 2.1, 2.6_

  - [ ] 4.2 Implement CSV import functionality
    - Implement `importContactsFromCSV(listId, file)` function using PapaParse
    - Validate CSV file size (max 5MB) and row count (max 10,000 rows)
    - Parse CSV rows and validate name (required, max 100 chars), email (RFC 5322), phone (10-15 digits)
    - Implement duplicate detection by comparing email addresses
    - Return import summary with imported count, failed count, and error details with row numbers
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.8_

  - [ ] 4.3 Create contact validation functions
    - Implement `validateContact(contact)` function returning `{ valid, errors }`
    - Implement email validation using RFC 5322 regex pattern
    - Implement phone validation (10-15 digits, optional + prefix)
    - Implement tag validation (max 20 tags, 50 chars each)
    - _Requirements: 2.4, 2.9, 2.10_

  - [ ] 4.4 Create ContactListManager UI component (components/ContactListManager.tsx)
    - Create list view showing all contact lists with contact count
    - Add "New List" button and modal for creating contact lists
    - Add "Import CSV" button and file picker dialog
    - Display import results with valid/invalid/duplicate counts and error details
    - Add manual contact addition form with name, email, phone fields
    - Implement contact editing and deletion
    - _Requirements: 2.1, 2.2, 2.5, 2.6_

- [ ] 5. Checkpoint - Test contact list management
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. SMS communication capability
  - [ ] 6.1 Create SMS service (services/smsService.ts)
    - Implement Twilio client initialization with environment variables
    - Implement `sendSMS(phone, message, announcementId)` function
    - Implement `sendBulkSMS(recipients, message, announcementId)` function with rate limiting
    - Implement `validatePhoneNumber(phone)` using libphonenumber-js
    - Implement `calculateSMSSegments(message)` for character count calculation
    - Implement `estimateSMSCredits(message, recipientCount)` function
    - _Requirements: 4.1, 4.2, 4.7, 4.10, 4.13_

  - [ ] 6.2 Implement SMS rate limiting logic
    - Create RateLimiter class with token bucket algorithm
    - Configure rate limit at 5 messages per second (from environment variable)
    - Implement queue-based processing for bulk SMS sends
    - Add error handling and retry logic for failed sends
    - _Requirements: 4.7_

  - [ ] 6.3 Create SMS composer UI component (components/SMSComposer.tsx)
    - Create message text area with real-time character count display
    - Display SMS segment count and credit estimate
    - Enforce 160 character limit (prevent additional input)
    - Add recipient selection interface with filter options
    - Implement recipient count validation (max 500 recipients per send)
    - Add "Preview" and "Send SMS" buttons
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.8_

  - [ ] 6.4 Implement recipient selection and filtering
    - Create RecipientSelector component with user and contact list selection
    - Implement filters: has phone number, location, status (Member/Visitor)
    - Display selected recipient count in real-time
    - Validate at least one recipient selected before sending
    - Support contact list selection for SMS recipients
    - _Requirements: 4.5, 4.6, 4.12_

  - [ ] 6.5 Integrate SMS with delivery tracking
    - Create delivery records when SMS is sent (status: queued)
    - Update delivery status as messages are processed (sending, delivered, failed)
    - Log validation failures with recipient identifier
    - Log delivery failures with error reason and continue sending to remaining recipients
    - Display confirmation message with number of recipients queued
    - _Requirements: 4.7, 4.8, 4.9, 4.10_

- [ ] 7. Checkpoint - Test SMS functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Multi-channel announcement system
  - [ ] 8.1 Create announcement service (services/communicationService.ts)
    - Implement `createAnnouncement(announcement)` function
    - Implement `getAnnouncements(filters)` with status and createdBy filters
    - Implement `getAnnouncementById(id)`, `updateAnnouncement(id, updates)`, `deleteAnnouncement(id)` functions
    - Implement `sendAnnouncement(id)` orchestration function
    - _Requirements: 5.1, 5.2, 5.6, 5.12_

  - [ ] 8.2 Implement recipient resolution logic
    - Implement `calculateRecipientCount(targetAudience)` function
    - Implement `getRecipientList(targetAudience)` function
    - Resolve "broadcast to all" as Active users with Member or Visitor role
    - Apply filters: role, status, location
    - Merge registered users and contact list recipients
    - Deduplicate recipients across sources
    - _Requirements: 5.7, 5.8, 5.12_

  - [ ] 8.3 Implement content adaptation for channels
    - Create content truncation logic for SMS (160 chars), email (1000 chars), in-app (500 chars)
    - Append ellipsis indicator when content exceeds channel limits
    - Implement preview generation for each selected channel
    - _Requirements: 5.3, 5.4, 5.10_

  - [ ] 8.4 Create email service (services/emailService.ts)
    - Initialize EmailJS with environment variables
    - Implement `sendEmail(to, subject, body, announcementId)` function
    - Implement `sendBulkEmail(recipients, subject, body, announcementId)` function
    - Implement `validateEmail(email)` using RFC 5322 regex
    - Implement `formatEmailTemplate(subject, body)` with ministry branding
    - _Requirements: 5.5, 5.13_

  - [ ] 8.5 Create notification service (services/notificationService.ts)
    - Implement `createMemberNotification(userId, message, kind, ctaView, announcementId)` function
    - Implement `sendBulkNotifications(userIds, message, kind, announcementId)` function
    - Integrate with existing MemberNotification structure (from='admin', kind='message')
    - Implement `getMemberNotifications(userId)`, `markNotificationAsRead(id)`, `deleteNotification(id)` functions
    - Maintain backward compatibility with `onSendMessageToUsers` function signature
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.9_

  - [ ] 8.6 Create AnnouncementComposer UI component (components/AnnouncementComposer.tsx)
    - Create title and content input fields
    - Add channel selection checkboxes (SMS, Email, In-App)
    - Validate at least one channel selected
    - Enforce character limits per channel with real-time display
    - Add target audience selection (Broadcast All, Filtered, Custom)
    - Display total recipient count
    - Add "Preview" button showing rendered messages for each channel
    - Add "Send Now" button with permission validation
    - _Requirements: 5.1, 5.2, 5.3, 5.10, 5.12_

  - [ ] 8.7 Implement multi-channel delivery orchestration
    - Coordinate parallel delivery across SMS, email, and in-app channels
    - Create delivery records for all recipients × channels
    - Call appropriate service for each channel (smsService, emailService, notificationService)
    - Update announcement status (queued → sending → completed)
    - Log channel failures and continue delivery through remaining channels
    - Complete delivery within 30 seconds for in-app, 5 minutes for email/SMS
    - _Requirements: 5.5, 5.6_

  - [ ] 8.8 Generate delivery reports
    - Implement `getDeliveryStats(announcementId)` function
    - Calculate total recipients, delivered, failed, pending per channel
    - Generate report within 60 seconds of announcement completion
    - _Requirements: 5.11_

- [ ] 9. Checkpoint - Test multi-channel announcements
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Delivery tracking and monitoring
  - [ ] 10.1 Create delivery tracking service (services/deliveryTrackingService.ts)
    - Implement `getDeliveryRecords(announcementId)` function
    - Implement `updateDeliveryStatus(recordId, status, failureReason)` function
    - Implement real-time Firestore listener for delivery status updates
    - Track status states: Queued, Sending, Delivered, Failed, Bounced
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 10.2 Implement delivery status tracking
    - Update delivery status within 10 seconds of status change
    - Log failure reasons (invalid address, service error, rejected, network timeout)
    - Mark announcement complete when all messages reach final state (Delivered, Failed, Bounced)
    - Store delivery records for 90 days from send timestamp
    - _Requirements: 6.1, 6.2, 6.4, 6.9, 6.10_

  - [ ] 10.3 Create DeliveryTracker UI component (components/DeliveryTracker.tsx)
    - Display overall delivery progress with progress bar
    - Show per-channel statistics (total, delivered, failed, pending)
    - Implement auto-refresh every 15 seconds while delivery in progress
    - Display individual recipient delivery status grouped by channel
    - Show failure reasons for failed deliveries
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.8_

  - [ ] 10.4 Implement completion notifications and warnings
    - Display notification when announcement reaches completion (announcement name, total recipients, delivered/failed counts per channel)
    - Display warning when failures exceed 10% of total recipients for any channel
    - Show failure percentage and summary of failure reasons
    - Stop auto-refresh when announcement completes
    - _Requirements: 6.6, 6.7_

  - [ ] 10.5 Create delivery dashboard with reports
    - Create dashboard view showing recent announcements with delivery status
    - Add "View Recipients" button to see detailed delivery status
    - Add "Export Report" button to download CSV report
    - Display delivery metrics and statistics
    - _Requirements: 6.3, 6.5_

- [ ] 11. Checkpoint - Test delivery tracking
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Main communication dashboard
  - [ ] 12.1 Create CommunicationDashboard component (components/CommunicationDashboard.tsx)
    - Create tabbed interface with SMS, Announcements, Contact Lists, Reports tabs
    - Display overview statistics (total announcements, recent sends, delivery rates)
    - Add quick action buttons (New Announcement, View Contact Lists, View Audit Log)
    - Show recent announcements list with status indicators
    - Display delivery progress for active sends
    - _Requirements: 3.1_

  - [ ] 12.2 Integrate dashboard with Admin Dashboard
    - Add "Communication" tab to AdminDashboard.tsx
    - Configure tab with MessageSquare icon from Lucide React
    - Set tab order to 13 (after existing tabs)
    - Render CommunicationDashboard component when tab selected
    - Add permission check: role='Admin' OR any communication permission
    - _Requirements: 3.1_

  - [ ] 12.3 Create permission management UI (components/CommunicationPermissions.tsx)
    - Create permission management interface for admins only
    - Display toggle switches for each permission type
    - Show current permission state for selected user
    - Add save confirmation and audit log entry on permission change
    - _Requirements: 3.3, 3.5, 3.9_

  - [ ] 12.4 Create audit log viewer component
    - Display audit log entries with timestamp, user, action, message type
    - Add filters for date range, username, action type
    - Paginate results (50 entries per page)
    - Restrict access to Admin role only
    - _Requirements: 3.7, 3.10_

- [ ] 13. Integration and error handling
  - [ ] 13.1 Implement comprehensive error handling
    - Create custom error classes (ValidationError, PermissionDeniedError, ServiceError)
    - Add try-catch blocks in all service functions
    - Display user-friendly error messages in UI components
    - Log errors to console and external error tracking (if available)
    - _Requirements: 3.4, 3.6, 4.6, 4.9_

  - [ ] 13.2 Add retry logic for external service calls
    - Implement retryOperation helper with exponential backoff
    - Add retry logic to SMS and email sending functions (max 3 retries)
    - Handle network failures gracefully
    - _Requirements: 4.9, 4.10, 5.6_

  - [ ] 13.3 Implement validation throughout the system
    - Add client-side validation for all forms
    - Add server-side validation for all API calls
    - Sanitize all user inputs to prevent XSS
    - Enforce character limits consistently
    - _Requirements: 2.4, 2.10, 4.4, 5.3_

  - [ ] 13.4 Wire all components together
    - Connect services to UI components
    - Set up Firestore listeners for real-time updates
    - Integrate permission checks throughout UI
    - Connect audit logging to all actions
    - Test end-to-end flows for all major features
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 14. Final checkpoint - Complete system testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Documentation and deployment preparation
  - [ ] 15.1 Write developer documentation
    - Document all service APIs and function signatures
    - Document component props and usage patterns
    - Document configuration requirements
    - Document deployment checklist
    - _Requirements: All_

  - [ ] 15.2 Create admin user guide
    - Document how to use Communication Dashboard
    - Document permission management procedures
    - Document contact list import procedures
    - Document troubleshooting common issues
    - _Requirements: 2.1, 3.9, 4.1, 5.1_

  - [ ] 15.3 Deploy Firestore configuration
    - Deploy security rules to production
    - Deploy indexes to production
    - Verify security rules work correctly
    - _Requirements: 3.3_

  - [ ] 15.4 Configure external services
    - Set up Twilio account and obtain credentials
    - Verify EmailJS configuration
    - Test external API integrations
    - Set up monitoring and alerts
    - _Requirements: 4.1, 5.1_

## Notes

- Tasks are organized into 10 major phases following the design document's deployment strategy
- Each task includes specific implementation details and references to requirements
- Testing tasks are not marked optional as they are critical for system reliability
- Checkpoint tasks ensure incremental validation throughout implementation
- The system uses TypeScript with React and integrates with existing Firebase infrastructure
- External services (Twilio for SMS, EmailJS for email) require configuration before use
- All communication actions are logged to the audit log for compliance
- Permission checks are enforced at both UI and service layers

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "6.1"] },
    { "id": 4, "tasks": ["4.4", "6.2", "6.3"] },
    { "id": 5, "tasks": ["6.4", "6.5", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4", "8.5"] },
    { "id": 7, "tasks": ["8.6", "8.7", "10.1"] },
    { "id": 8, "tasks": ["8.8", "10.2", "10.3"] },
    { "id": 9, "tasks": ["10.4", "10.5", "12.1"] },
    { "id": 10, "tasks": ["12.2", "12.3", "12.4"] },
    { "id": 11, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 12, "tasks": ["13.4"] },
    { "id": 13, "tasks": ["15.1", "15.2"] },
    { "id": 14, "tasks": ["15.3", "15.4"] }
  ]
}
```
