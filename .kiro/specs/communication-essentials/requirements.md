# Requirements Document

## Introduction

The Communication Essentials system enhances the existing City of Truth Ministries application by adding focused communication capabilities for member engagement. This feature integrates with the current MemberNotification interface, supports external contact management, provides granular permission controls, enables SMS notifications, supports multi-channel bulk announcements, offers advanced targeted messaging with saved groups, and implements message approval workflows for sensitive communications.

The system operates within a React/TypeScript application with Firebase backend, building upon existing user management (Admin, Member, Visitor roles with Active, Pending, Rejected statuses) and location-based data (districts in Tamil Nadu).

## Glossary

- **System**: The Communication Essentials system within City of Truth Ministries application
- **MemberNotification**: Existing in-app notification interface with userId, from (admin/user), message, createdAt, read, deletedAt, autoDeleteAt fields
- **Contact**: External person not registered in the system, managed separately from User records
- **User**: Registered member with id, phone, name, email, location, role (Admin/Member/Visitor), status (Active/Pending/Rejected), memberSince, and optional district
- **Campaign**: A communication sent to multiple recipients via one or more channels (email, SMS, in-app)
- **Target_Group**: A saved set of filters defining recipient criteria for campaigns
- **Approval_Workflow**: A process requiring designated approvers to review and authorize campaigns before sending
- **Communication_Permission**: Fine-grained access control for communication operations (Create_Campaigns, Send_Campaigns, Manage_Templates, View_Analytics)
- **SMS**: Short Message Service text message limited to 160 characters
- **Delivery_Report**: Record of message delivery status per recipient per channel
- **Audit_Log**: Timestamped record of permission changes and communication actions
- **Character_Counter**: Real-time display of remaining characters for SMS composition
- **Phone_Validator**: Component that verifies phone number format before SMS delivery
- **Recipient_Filter**: Criteria for selecting Users based on role, status, location, memberSince, or custom attributes
- **Deduplication**: Process ensuring each recipient receives a message only once across multiple filters
- **Exclusion_List**: Set of Users or Contacts explicitly removed from a campaign's recipients
- **Channel_Adaptation**: Automatic adjustment of message content format per delivery channel
- **CSV_Import**: Process for bulk loading Contact records from comma-separated values file
- **Contact_Tag**: Label applied to Contacts for categorization and filtering

## Requirements

### Requirement 1: Seamless Integration with Existing Member Notifications

**User Story:** As a system administrator, I want the Communication Essentials system to work with existing MemberNotification records, so that all in-app messaging remains consistent and backward compatible.

#### Acceptance Criteria

1. WHEN a campaign is sent via in-app channel, THE System SHALL create MemberNotification records matching the existing interface structure (userId, from, message, createdAt, read, deletedAt, autoDeleteAt)
2. WHEN an existing MemberNotification is displayed, THE System SHALL render it alongside new communication-generated notifications in the same UI
3. THE System SHALL preserve all existing MemberNotification fields without modification when creating new in-app messages
4. WHEN a User views notifications, THE System SHALL display both legacy and communication-generated messages in chronological order
5. FOR ALL in-app campaign messages, the System SHALL set the "from" field to "admin" and populate "kind" field with appropriate values (message, approved, disapproved, recycle, recycle-removed, leader)

### Requirement 2: Contact List Management

**User Story:** As an administrator, I want to manage external contacts who are not registered users, so that I can communicate with community members outside the registered membership.

#### Acceptance Criteria

1. THE System SHALL store Contact records separately from User records with fields: id, name, email, phone, district, tags, createdAt, updatedAt
2. WHEN an administrator uploads a CSV file, THE System SHALL parse Contact records from columns: name, email, phone, district, tags
3. WHEN CSV import encounters invalid data, THE System SHALL return a validation report listing row numbers and specific errors
4. THE System SHALL validate that each Contact has at minimum a name and either email or phone before saving
5. WHEN an administrator adds a Contact_Tag, THE System SHALL associate the tag with one or more Contact records for filtering
6. THE System SHALL support searching Contacts by name, email, phone, district, or tag
7. WHEN duplicate Contact records are detected (matching email or phone), THE System SHALL prompt the administrator to merge or skip
8. THE System SHALL allow administrators to view, edit, and delete individual Contact records
9. WHEN a Contact is deleted, THE System SHALL remove it from all saved Target_Groups but preserve historical Campaign records referencing it

### Requirement 3: Granular Permission and Access Control

**User Story:** As a system administrator, I want fine-grained communication permissions, so that I can delegate specific communication tasks to team members safely.

#### Acceptance Criteria

1. THE System SHALL define four Communication_Permission types: Create_Campaigns, Send_Campaigns, Manage_Templates, View_Analytics
2. WHEN an administrator assigns a Communication_Permission to a User, THE System SHALL record the permission with userId, permissionType, grantedBy, grantedAt
3. THE System SHALL prevent Users without Create_Campaigns permission from creating new campaigns
4. THE System SHALL prevent Users without Send_Campaigns permission from executing campaign delivery
5. WHEN a Communication_Permission is granted or revoked, THE System SHALL write an Audit_Log entry with timestamp, actor, targetUser, action, permissionType
6. THE System SHALL allow administrators to view all Audit_Log entries filtered by User, date range, or permissionType
7. WHEN a User attempts a restricted communication action, THE System SHALL display a permission error message and log the attempt
8. THE System SHALL assign all Communication_Permissions to Users with Admin role by default
9. FOR ALL Audit_Log entries, retention SHALL be permanent (no automatic deletion)

### Requirement 4: SMS Notifications

**User Story:** As an administrator, I want to send SMS messages to users, so that I can reach members immediately with urgent ministry updates.

#### Acceptance Criteria

1. THE System SHALL limit SMS message composition to 160 characters maximum
2. WHEN composing an SMS, THE System SHALL display a Character_Counter showing remaining characters updated in real-time
3. THE System SHALL validate all recipient phone numbers using Phone_Validator before adding to SMS delivery queue
4. WHEN Phone_Validator detects an invalid phone number, THE System SHALL exclude that recipient and log a validation warning
5. THE System SHALL support Recipient_Filter for SMS campaigns based on: role (Admin, Member, Visitor), status (Active, Pending, Rejected), location (district), memberSince date range
6. WHEN an SMS is sent, THE System SHALL create a Delivery_Report record per recipient with: recipientId, phone, message, sentAt, deliveryStatus (Pending, Sent, Failed), failureReason
7. THE System SHALL update Delivery_Report deliveryStatus to "Sent" upon successful delivery confirmation or "Failed" with failureReason upon error
8. WHEN SMS delivery fails, THE System SHALL retry up to 3 times with exponential backoff before marking as Failed
9. THE System SHALL allow administrators to view Delivery_Report records filtered by campaign, recipient, or deliveryStatus

### Requirement 5: Multi-Channel Bulk Announcements

**User Story:** As an administrator, I want to send the same announcement via email, SMS, and in-app simultaneously, so that all members receive important ministry updates through their preferred channel.

#### Acceptance Criteria

1. WHEN creating a Campaign, THE System SHALL allow selection of multiple channels: email, SMS, in-app
2. THE System SHALL perform Channel_Adaptation for each selected channel: SMS (160 char limit), email (HTML formatting), in-app (MemberNotification format)
3. WHEN Channel_Adaptation truncates content for SMS, THE System SHALL append "..." to indicate truncation
4. THE System SHALL deliver messages to all selected channels simultaneously for each recipient
5. WHEN any channel fails for a recipient, THE System SHALL continue delivery on remaining channels and log the failure
6. THE System SHALL generate a consolidated Delivery_Report showing per-recipient, per-channel delivery status
7. WHEN a multi-channel Campaign completes, THE System SHALL display a summary showing total recipients, successful deliveries per channel, and failed deliveries per channel
8. THE System SHALL support sending to mixed recipient lists containing both Users and Contacts, routing to appropriate channels based on available contact information
9. FOR ALL multi-channel campaigns, at least one channel must successfully deliver to count the recipient as reached

### Requirement 6: Advanced Targeted Messaging

**User Story:** As an administrator, I want to create and save target groups with complex filters, so that I can quickly send campaigns to specific member segments without recreating filters each time.

#### Acceptance Criteria

1. WHEN creating a Target_Group, THE System SHALL allow combining multiple Recipient_Filters with AND/OR logic: role, status, location, memberSince, custom User attributes
2. THE System SHALL save Target_Group configurations with: id, name, description, filters, exclusions, createdBy, createdAt, updatedAt
3. WHEN applying a Target_Group to a Campaign, THE System SHALL evaluate all filters against current User and Contact data to build the recipient list
4. THE System SHALL support Exclusion_List per Target_Group to remove specific Users or Contacts from the recipient list
5. THE System SHALL perform Deduplication to ensure each recipient appears only once in the final recipient list even if matching multiple filters
6. WHEN a Target_Group is edited, THE System SHALL update the updatedAt timestamp and preserve historical Campaign references to the original definition
7. THE System SHALL display recipient count preview when configuring a Target_Group before saving
8. THE System SHALL allow administrators to view all saved Target_Groups with recipient counts updated in real-time
9. WHEN a Target_Group is deleted, THE System SHALL preserve it in historical Campaign records but mark it unavailable for future campaigns

### Requirement 7: Message Approval Workflows

**User Story:** As a system administrator, I want sensitive campaigns to require approval before sending, so that all public ministry communications are reviewed for accuracy and appropriateness.

#### Acceptance Criteria

1. WHEN creating a Campaign, THE System SHALL allow marking it as "requires approval"
2. THE System SHALL store approval-required Campaigns with status: Draft, Pending_Approval, Approved, Rejected, Sent
3. WHEN a Campaign status changes to Pending_Approval, THE System SHALL notify all designated approvers via in-app notification
4. THE System SHALL maintain a list of designated approvers (User IDs with Admin role and approval permissions)
5. WHEN an approver reviews a Campaign, THE System SHALL allow actions: Approve, Reject with optional rejection reason
6. WHEN a Campaign is Approved, THE System SHALL change status to Approved and allow Users with Send_Campaigns permission to execute delivery
7. WHEN a Campaign is Rejected, THE System SHALL change status to Rejected, notify the creator with rejection reason, and prevent sending
8. THE System SHALL record approval history with: campaignId, approverId, action (Approved/Rejected), reason, timestamp
9. FOR ALL Campaigns with status Approved, the System SHALL allow editing only by creating a new draft and restarting the approval workflow

