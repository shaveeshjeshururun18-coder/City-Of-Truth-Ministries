# Firestore Security Rules Documentation

## Overview

This document describes the Firestore security rules implemented for the Advanced Communication system. The rules enforce granular permission checks based on user roles and communication-specific permissions.

## Implementation Date

**Deployed:** June 26, 2026

## Helper Functions

### `isAuthenticated()`
Returns true if the user is authenticated with Firebase Auth.

### `isAdmin()`
Returns true if the authenticated user has the `role` field set to `'Admin'` in the `users` collection.

### `hasPermission(permission)`
Returns true if the user is an admin OR has the specified permission in the `communicationPermissions` collection.

**Parameters:**
- `permission` (string): One of `'createAnnouncements'`, `'sendAnnouncements'`, or `'manageContactLists'`

### `isOwner(userId)`
Returns true if the authenticated user's ID matches the provided `userId`.

## Collection Security Rules

### 1. Announcements Collection

**Path:** `/announcements/{announcementId}`

| Operation | Permission Required | Additional Conditions |
|-----------|-------------------|----------------------|
| Create | `createAnnouncements` | Must be authenticated |
| Read | Any communication permission | Admin can always read |
| Update | `sendAnnouncements` | Must be admin OR announcement creator |
| Delete | Admin OR `createAnnouncements` | Must be creator of the announcement |

**Purpose:** Allows users with appropriate permissions to create, manage, and send announcements while ensuring only authorized users can modify or delete them.

### 2. Contact Lists Collection

**Path:** `/contactLists/{listId}`

| Operation | Permission Required | Additional Conditions |
|-----------|-------------------|----------------------|
| Create | `manageContactLists` | Must be authenticated |
| Read | `manageContactLists`, `createAnnouncements`, or `sendAnnouncements` | Users need at least one permission |
| Update | `manageContactLists` | Must be authenticated |
| Delete | `manageContactLists` | Must be admin OR list creator |

**Purpose:** Controls access to contact list metadata. Users with announcement permissions can read lists to select recipients, but only those with `manageContactLists` can modify them.

### 3. Contacts Collection

**Path:** `/contacts/{contactId}`

| Operation | Permission Required | Additional Conditions |
|-----------|-------------------|----------------------|
| Create | `manageContactLists` | Must be authenticated |
| Read | `manageContactLists`, `createAnnouncements`, or `sendAnnouncements` | Users need at least one permission |
| Update | `manageContactLists` | Must be authenticated |
| Delete | `manageContactLists` | Must be authenticated |

**Purpose:** Manages individual contact records. Similar to contact lists, users with announcement permissions can read contacts but cannot modify them.

### 4. Delivery Records Collection (Server-Side Only)

**Path:** `/deliveryRecords/{recordId}`

| Operation | Permission Required | Additional Conditions |
|-----------|-------------------|----------------------|
| Read | Any communication permission | Admin can always read |
| Create | **BLOCKED** | Only server/admin SDK can write |
| Update | **BLOCKED** | Only server/admin SDK can write |
| Delete | **BLOCKED** | Only server/admin SDK can write |

**Purpose:** Delivery records track the status of sent messages. Clients can read these for reporting purposes, but only server-side code (Firebase Functions or Admin SDK) can create or modify them to prevent tampering.

### 5. Communication Permissions Collection

**Path:** `/communicationPermissions/{userId}`

| Operation | Permission Required | Additional Conditions |
|-----------|-------------------|----------------------|
| Read | Own permissions OR admin | Users can view their own permissions |
| Create | Admin only | Only admins can grant permissions |
| Update | Admin only | Only admins can modify permissions |
| Delete | Admin only | Only admins can revoke permissions |

**Purpose:** Stores granular communication permissions for users. Users can view their own permissions, but only admins can modify them.

### 6. Communication Audit Log Collection (Server-Side Only)

**Path:** `/communicationAuditLog/{logId}`

| Operation | Permission Required | Additional Conditions |
|-----------|-------------------|----------------------|
| Read | Admin only | Only admins can view audit logs |
| Create | **BLOCKED** | Only server can create logs |
| Update | **BLOCKED** | Logs are immutable |
| Delete | **BLOCKED** | Logs are immutable |

**Purpose:** Maintains an audit trail of all communication actions. Only admins can read the logs, and only server-side code can create entries to ensure integrity.

## Fallback Rule

**Path:** `/{document=**}`

All other collections continue to use the existing permissive development rules (open until February 21, 2027). This preserves backward compatibility with existing features while securing communication-specific collections.

## Permission Structure

The `communicationPermissions` document for each user should have this structure:

```typescript
{
  id: string;                // User ID (document ID)
  userId: string;            // Reference to user
  permissions: {
    createAnnouncements: boolean;
    sendAnnouncements: boolean;
    manageContactLists: boolean;
  };
  grantedBy: string;         // Admin user ID who granted permissions
  grantedAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}
```

## Security Best Practices

1. **Permission Checks at Multiple Layers:** Security rules provide database-level protection, but application code should also validate permissions before attempting operations.

2. **Server-Side Operations:** Sensitive operations (creating delivery records, writing audit logs) are restricted to server-side code using the Firebase Admin SDK, which bypasses security rules.

3. **Audit Trail:** All communication actions should be logged to the `communicationAuditLog` collection via server-side functions to maintain accountability.

4. **Least Privilege:** Users should only be granted the minimum permissions needed for their role. For example, a user who only needs to view reports doesn't need create or send permissions.

5. **Admin Oversight:** Only users with the `Admin` role can modify permissions, ensuring centralized control over system access.

## Testing Security Rules

To test the security rules:

1. **Unit Testing:** Use the Firebase Emulator Suite with `@firebase/rules-unit-testing` package
2. **Manual Testing:** Create test users with different permission configurations
3. **Verify Denials:** Ensure unauthorized operations properly fail with permission errors

## Deployment

Security rules were deployed using Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

**Ruleset ID:** `bfa3f75b-5e84-46e7-b3db-296a696f6814`

## Requirements Satisfied

This implementation satisfies the following requirements from the Advanced Communication spec:

- **Requirement 3.1:** Access restriction to Admin role or users with communication permissions
- **Requirement 3.2:** Granular permissions for Create Announcements, Send Announcements, and Manage Contact Lists
- **Requirement 3.9:** Permission assignment without changing user role to Admin

## Future Considerations

1. **Rate Limiting:** Consider implementing Cloud Functions to enforce rate limits on message sending
2. **Data Retention:** Implement automated cleanup for old delivery records (90 days) and audit logs (365 days)
3. **Permission Groups:** Consider grouping permissions into preset roles (e.g., "Communication Manager") for easier administration
4. **Field-Level Security:** Add validation rules to ensure data integrity (e.g., enforce required fields, validate data types)
