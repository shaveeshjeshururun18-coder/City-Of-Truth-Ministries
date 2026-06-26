# Requirements Document

## Introduction

The Advanced Communication system is a focused messaging solution for City of Truth Ministries that extends the existing in-app notification system with essential multi-channel capabilities. The system enables ministry administrators to send SMS notifications, multi-channel bulk announcements, and manage external contacts, with appropriate permission controls and basic delivery tracking. This system integrates seamlessly with the existing member notification infrastructure while adding critical communication channels needed for urgent announcements and outreach to non-registered contacts.

## Glossary

- **Communication_System**: The Advanced Communication feature module
- **SMS_Service**: The SMS notification subsystem that sends text messages
- **Email_Service**: The email delivery subsystem that sends bulk announcement emails
- **Announcement**: An immediate bulk message sent to target audiences through one or more channels (SMS, email, in-app)
- **Admin**: A user with administrative privileges who can create and send communications
- **Recipient**: A user or contact who receives a message from the system
- **Contact_List**: A collection of email addresses or phone numbers for non-registered recipients
- **Member_Notification_System**: The existing in-app notification infrastructure
- **Delivery_Status**: The current state of a message (Queued, Sending, Delivered, Failed, Bounced)
- **Permission**: A granular access right that controls communication capabilities

## Requirements

### Requirement 1: Integration with Existing Member Notifications

**User Story:** As a system maintainer, I want the Advanced Communication system to integrate seamlessly with the existing member notification system, so that users experience consistent communication across all channels.

#### Acceptance Criteria

1. WHEN an admin sends a message through the in-app notification channel, THE Communication_System SHALL create MemberNotification records using the existing notification data structure
2. THE Communication_System SHALL support sending messages to the existing Member, Visitor, and Admin user roles without data migration
3. WHEN a user views in-app notifications in the User Dashboard, THE Communication_System SHALL include messages sent through the Advanced Communication system
4. THE Communication_System SHALL preserve existing notification features including read/unread status, deletion, and recycle bin functionality
5. WHEN THE Communication_System creates an in-app notification, THE Communication_System SHALL set the "from" field to "admin" and populate the "kind" field appropriately
6. WHERE an in-app notification includes a CTA (call-to-action), THE Communication_System SHALL support navigation links to specific application pages
7. THE Communication_System SHALL maintain backward compatibility with the existing onSendMessageToUsers function signature

### Requirement 2: Contact List Management

**User Story:** As an admin, I want to manage contact lists for recipients who are not registered users, so that I can communicate with prospective members and external stakeholders.

#### Acceptance Criteria

1. THE Communication_System SHALL provide a contact list management interface for creating, editing, viewing, and deleting Contact_Lists
2. WHEN an admin creates a Contact_List, THE Communication_System SHALL allow importing contacts from CSV files with maximum 10,000 rows and maximum file size of 5 MB
3. THE Communication_System SHALL require CSV files to include columns for name (required, max 100 characters) and email (required) and optionally include phone (max 20 characters)
4. THE Communication_System SHALL validate email addresses using RFC 5322 format validation and SHALL validate phone numbers as containing only digits, spaces, hyphens, parentheses, and plus sign
5. IF a CSV import contains any invalid entries, THEN THE Communication_System SHALL display a summary showing the number of valid contacts imported, the number of invalid entries, and the row numbers of invalid entries
6. THE Communication_System SHALL support manual addition of individual contacts to a Contact_List by providing a form with fields for name, email, and phone
7. WHEN an admin sends an announcement, THE Communication_System SHALL allow targeting registered users, Contact_Lists, or both
8. WHEN importing contacts, THE Communication_System SHALL identify duplicates by comparing email addresses and SHALL reject duplicate contacts with a message indicating the existing contact
9. THE Communication_System SHALL support tagging contacts with up to 20 custom labels where each label has a maximum length of 50 characters
10. THE Communication_System SHALL validate phone numbers as valid if they contain 10 to 15 digits and optionally begin with a plus sign followed by a country code

### Requirement 3: Permission and Access Control

**User Story:** As a system administrator, I want to control who can send communications and to whom, so that I can prevent unauthorized messaging and maintain ministry communication standards.

#### Acceptance Criteria

1. THE Communication_System SHALL restrict access to the communication interface to users with role equal to Admin OR users with at least one communication permission
2. THE Communication_System SHALL provide granular permissions including "Create Announcements", "Send Announcements", and "Manage Contact Lists"
3. WHEN a user attempts to create an announcement, THE Communication_System SHALL verify the user has the "Create Announcements" permission
4. IF a user lacks the "Create Announcements" permission, THEN THE Communication_System SHALL display an error message stating "You do not have permission to create announcements" and prevent access to the announcement creation interface
5. WHEN a user attempts to send an announcement, THE Communication_System SHALL verify the user has the "Send Announcements" permission
6. IF a user lacks the "Send Announcements" permission, THEN THE Communication_System SHALL display an error message stating "You do not have permission to send announcements" and prevent the send operation
7. THE Communication_System SHALL maintain an audit log entry for each communication action where each entry includes sender user ID, sender username, timestamp, recipient count, message type, and action type
8. THE Communication_System SHALL retain audit log entries for 365 days from the action timestamp
9. THE Communication_System SHALL support assigning individual communication permissions to users with role equal to Member without changing their role to Admin
10. THE Communication_System SHALL allow viewing the audit log with filters for date range (start date and end date), sender username, and action type

### Requirement 4: SMS Notification Capability

**User Story:** As an admin, I want to send SMS notifications to members and visitors, so that I can deliver urgent announcements and time-sensitive information.

#### Acceptance Criteria

1. THE Communication_System SHALL provide an SMS composition interface that accepts message text input and displays recipient selection controls
2. WHILE an admin is composing an SMS message, THE Communication_System SHALL display a real-time character count
3. WHILE an admin is composing an SMS message, THE Communication_System SHALL display an SMS credit estimate calculated as (number of selected recipients × number of message segments required)
4. IF an admin attempts to enter more than 160 characters in a single SMS message, THEN THE Communication_System SHALL prevent additional character input
5. WHEN an admin selects recipients for an SMS notification, THE Communication_System SHALL allow selection of up to 500 recipients per send operation
6. IF an admin attempts to send an SMS notification with zero recipients selected, THEN THE Communication_System SHALL display an error message indicating recipient selection is required and prevent message sending
7. WHEN an admin sends an SMS notification, THE SMS_Service SHALL deliver the message to all recipients with valid phone numbers within 2 minutes
8. WHEN an admin sends an SMS notification, THE Communication_System SHALL display a confirmation message indicating the number of recipients queued for delivery
9. IF a recipient phone number fails format validation, THEN THE SMS_Service SHALL log the validation failure with the recipient identifier and continue sending to remaining recipients
10. IF a recipient phone number passes format validation but delivery fails, THEN THE SMS_Service SHALL log the delivery failure with the recipient identifier and error reason, and continue sending to remaining recipients
11. WHEN an SMS message includes a URL, THE Communication_System SHALL display a button to offer URL shortening
12. THE Communication_System SHALL support recipient filtering by: users with phone numbers present in their profile, users with location matching specified values, users with status matching Member or Visitor, and contacts from Contact_Lists with phone numbers
13. THE Communication_System SHALL validate phone numbers as valid if they contain 10 to 15 digits and optionally begin with a plus sign followed by a country code

### Requirement 5: Multi-Channel Bulk Announcements

**User Story:** As an admin, I want to send bulk announcements through multiple channels simultaneously, so that I can ensure important messages reach the entire community.

#### Acceptance Criteria

1. THE Communication_System SHALL provide a multi-channel announcement interface that allows selecting email, SMS, and in-app notification channels
2. IF an admin attempts to create a bulk announcement without selecting at least one channel, THEN THE Communication_System SHALL display an error message and prevent announcement creation
3. WHEN an admin creates a bulk announcement, THE Communication_System SHALL enforce maximum message lengths of 160 characters for SMS, 1000 characters for email subject and body combined, and 500 characters for in-app notifications
4. WHEN an admin creates a bulk announcement with content exceeding channel limits, THE Communication_System SHALL adapt the message for each selected channel by truncating content and appending an ellipsis indicator
5. WHEN an admin sends a bulk announcement, THE Communication_System SHALL deliver the message through all selected channels to the target audience within 30 seconds for in-app notifications and within 5 minutes for email and SMS
6. IF delivery fails for any channel, THEN THE Communication_System SHALL log the channel failure reason and continue delivery through remaining channels
7. THE Communication_System SHALL define "broadcast to all" as targeting all users with status equal to Active AND role equal to Member OR Visitor
8. IF "broadcast to all" targets zero recipients, THEN THE Communication_System SHALL display a warning message and prevent sending
9. WHERE in-app notification is selected, THE Communication_System SHALL create a member notification record for each recipient with fields: userId, from=admin, message, createdAt, kind=message
10. THE Communication_System SHALL provide a preview mode that displays the rendered message appearance for each selected channel before sending
11. WHEN a bulk announcement is sent, THE Communication_System SHALL generate a delivery report within 60 seconds showing total recipients, delivered count, failed count, and pending count for each channel
12. THE Communication_System SHALL support recipient selection from registered users (filtered by role, status, location) and Contact_Lists for email and SMS channels
13. WHERE email channel is selected, THE Communication_System SHALL send messages with a simple text format including sender identification and ministry branding

### Requirement 6: Delivery Tracking

**User Story:** As an admin, I want to track message delivery status for SMS and bulk announcements, so that I can monitor communication progress and identify delivery issues.

#### Acceptance Criteria

1. THE Communication_System SHALL display delivery status for each message including Queued, Sending, Delivered, Failed, and Bounced states
2. WHEN a message delivery status changes, THE Communication_System SHALL update the displayed status within 10 seconds
3. THE Communication_System SHALL provide an announcement dashboard showing total recipients, delivered count, failed count, and pending count per channel
4. WHEN an email or SMS delivery fails, THE Communication_System SHALL log the failure reason (invalid address, service error, rejected, network timeout) in the delivery record
5. THE Communication_System SHALL support viewing individual recipient delivery status within an announcement grouped by channel
6. WHEN an announcement reaches completion, THE Communication_System SHALL display a notification showing announcement name, total recipients, delivered count, and failed count per channel
7. IF delivery failures exceed 10% of total recipients for any channel, THEN THE Communication_System SHALL display a warning notification showing the failure percentage and a summary of failure reasons
8. THE Communication_System SHALL automatically refresh the announcement dashboard every 15 seconds while delivery is in progress
9. THE Communication_System SHALL consider an announcement complete when all messages across all channels are in Delivered, Failed, or Bounced state
10. THE Communication_System SHALL retain delivery records for 90 days from the send timestamp
