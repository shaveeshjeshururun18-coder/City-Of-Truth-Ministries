# Contact List Service Implementation

## Overview

The Contact List Service provides functionality for managing contact lists and contacts for the Advanced Communication System. This service handles CRUD operations for contact lists and their associated contacts, including validation, duplicate detection, and proper Firestore integration.

## Implementation Summary

**File:** `services/contactListService.ts`

**Status:** ✅ Complete

**Requirements Covered:**
- Requirement 2.1: Contact list management interface (create, edit, view, delete)
- Requirement 2.6: Manual addition of individual contacts

## Implemented Functions

### Contact List Management

#### `createContactList(name: string, description?: string): Promise<ContactList>`
Creates a new contact list with the specified name and optional description.

**Validation:**
- Name is required and cannot be empty
- Name must not exceed 100 characters
- Trims whitespace from name and description

**Returns:** Created ContactList object with server-generated ID and timestamps

---

#### `getContactLists(userId?: string): Promise<ContactList[]>`
Retrieves all contact lists, optionally filtered by creator userId.

**Parameters:**
- `userId` (optional): Filter lists created by this user

**Returns:** Array of ContactList objects

---

#### `getContactListById(id: string): Promise<ContactList | null>`
Retrieves a specific contact list by its ID.

**Returns:** ContactList object or null if not found

---

#### `updateContactList(id: string, updates: Partial<ContactList>): Promise<ContactList>`
Updates a contact list's name and/or description.

**Validation:**
- Contact list must exist
- Name validation (if being updated)
- Only name and description can be updated

**Returns:** Updated ContactList object

---

#### `deleteContactList(id: string): Promise<void>`
Deletes a contact list and all its associated contacts.

**Behavior:**
- First deletes all contacts in the list
- Then deletes the contact list document
- Uses batch operations for efficiency

---

### Contact Management

#### `addContact(listId: string, contact: Omit<Contact, 'id' | 'listId' | 'createdAt' | 'updatedAt'>): Promise<Contact>`
Adds a new contact to a contact list with comprehensive validation.

**Validation:**
- Contact list must exist
- Contact data must be valid (see validateContact)
- Email must not duplicate existing contact in the list
- Automatically increments contactCount in parent list

**Returns:** Created Contact object with server-generated ID and timestamps

---

#### `getContacts(listId: string): Promise<Contact[]>`
Retrieves all contacts for a specific contact list.

**Returns:** Array of Contact objects

---

#### `updateContact(id: string, updates: Partial<Contact>): Promise<Contact>`
Updates a contact's information.

**Validation:**
- Contact must exist
- Updated data must be valid
- Email uniqueness check if email is being changed

**Returns:** Updated Contact object

---

#### `deleteContact(id: string): Promise<void>`
Deletes a contact from a contact list.

**Behavior:**
- Removes contact document
- Decrements contactCount in parent list

---

### Validation Functions

#### `validateContact(contact: Partial<Contact>): { valid: boolean; errors: string[] }`
Validates contact data according to requirements.

**Validation Rules:**

1. **Name** (Required):
   - Cannot be empty
   - Maximum 100 characters

2. **Email** (Required):
   - Cannot be empty
   - Must match RFC 5322 format
   - Regex: `/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/`

3. **Phone** (Optional):
   - Maximum 20 characters
   - Must contain 10-15 digits
   - Can include spaces, hyphens, parentheses, and + prefix
   - Regex: `/^\+?[\d\s\-()]{10,20}$/`

4. **Tags** (Optional):
   - Maximum 20 tags
   - Each tag maximum 50 characters

**Returns:** Object with `valid` boolean and `errors` array

---

## Data Flow

### Creating a Contact List

```
User Input → createContactList()
  ↓
Validate name (required, max 100 chars)
  ↓
Create Firestore document in 'contactLists' collection
  ↓
Initialize contactCount to 0
  ↓
Return ContactList with server timestamps
```

### Adding a Contact

```
User Input → addContact()
  ↓
Verify contact list exists
  ↓
Validate contact data (name, email, phone, tags)
  ↓
Check for duplicate email in list
  ↓
Create Firestore document in 'contacts' collection
  ↓
Increment contactCount in parent list
  ↓
Return Contact with server timestamps
```

### Deleting a Contact List

```
User Action → deleteContactList()
  ↓
Query all contacts with matching listId
  ↓
Delete all contact documents in parallel
  ↓
Delete contact list document
  ↓
Complete
```

## Firestore Collections

### contactLists Collection

```typescript
{
  id: string;              // Auto-generated Firestore ID
  name: string;            // List name (max 100 chars)
  description?: string;    // Optional description
  createdBy: string;       // User ID of creator
  createdAt: Timestamp;    // Server timestamp
  updatedAt: Timestamp;    // Server timestamp
  contactCount: number;    // Cached count of contacts
}
```

### contacts Collection

```typescript
{
  id: string;              // Auto-generated Firestore ID
  listId: string;          // Parent contact list ID
  name: string;            // Contact name (max 100 chars)
  email: string;           // Email address (lowercase)
  phone?: string;          // Phone number (optional)
  tags?: string[];         // Custom labels (max 20, 50 chars each)
  createdAt: Timestamp;    // Server timestamp
  updatedAt: Timestamp;    // Server timestamp
}
```

## Error Handling

All functions include try-catch blocks and throw descriptive errors:

- **Validation errors**: "Contact list name is required", "Invalid email format", etc.
- **Not found errors**: "Contact list not found", "Contact not found"
- **Duplicate errors**: "A contact with email X already exists in this list"
- **Firestore errors**: Propagated with console logging

## Usage Examples

### Creating a Contact List

```typescript
import { createContactList } from './services/contactListService';

const newList = await createContactList(
  'Ministry Leaders',
  'Contact information for ministry leaders'
);
console.log('Created list:', newList.id);
```

### Adding a Contact

```typescript
import { addContact } from './services/contactListService';

const contact = await addContact('list-id-123', {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 (234) 567-8901',
  tags: ['leader', 'volunteer']
});
console.log('Created contact:', contact.id);
```

### Validating Before Adding

```typescript
import { validateContact, addContact } from './services/contactListService';

const contactData = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '1234567890'
};

const validation = validateContact(contactData);
if (validation.valid) {
  await addContact('list-id-123', contactData);
} else {
  console.error('Validation errors:', validation.errors);
}
```

### Retrieving and Updating

```typescript
import { getContactLists, getContacts, updateContact } from './services/contactListService';

// Get all contact lists
const lists = await getContactLists();

// Get contacts for a specific list
const contacts = await getContacts('list-id-123');

// Update a contact
const updated = await updateContact('contact-id-456', {
  phone: '+1 (555) 123-4567',
  tags: ['leader', 'volunteer', 'teacher']
});
```

### Deleting

```typescript
import { deleteContact, deleteContactList } from './services/contactListService';

// Delete a contact (decrements parent list count)
await deleteContact('contact-id-456');

// Delete entire list and all contacts
await deleteContactList('list-id-123');
```

## Testing

The service includes validation tests in `contactListService.test.ts` covering:

- Name validation (required, max length)
- Email validation (RFC 5322 format)
- Phone validation (10-15 digits, formats)
- Tag validation (max count, max length per tag)
- Edge cases and invalid inputs

To test manually, use the validation function:

```typescript
import { validateContact } from './services/contactListService';

// Test various inputs
const tests = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: '', email: 'invalid' },
  { name: 'A'.repeat(101), email: 'test@test.com' },
  { name: 'Jane', email: 'jane@example.com', phone: '123' }
];

tests.forEach(test => {
  const result = validateContact(test);
  console.log(test, result);
});
```

## Future Enhancements

Potential improvements for future iterations:

1. **CSV Import**: Implement `importContactsFromCSV()` function (Task 4.2)
2. **Batch Operations**: Add functions for bulk contact operations
3. **Search**: Add search/filter capabilities for contacts
4. **Export**: Add CSV export functionality
5. **History**: Track contact update history
6. **Validation**: Add phone number format validation using libphonenumber-js
7. **Pagination**: Add pagination for large contact lists

## Dependencies

- `firebase/firestore`: Firestore database operations
- `./firebase`: Firebase app configuration
- `../types`: TypeScript type definitions

## Type Safety

The service is fully typed with TypeScript:
- All functions have explicit return types
- Contact and ContactList interfaces from types.ts
- Proper handling of Firestore timestamp conversions
- Type-safe Firestore operations

## Notes

- All email addresses are stored in lowercase for consistency
- All string inputs are trimmed before storage
- Server timestamps are used for accurate time tracking
- contactCount is cached in the list document for performance
- Duplicate detection uses email as the unique identifier
- Phone validation allows various formats (spaces, hyphens, parentheses)
- Tags are stored as an array for easy querying

## Related Files

- `types.ts`: Type definitions for ContactList and Contact
- `services/firebase.ts`: Firebase configuration and initialization
- `services/contactListService.test.ts`: Test suite
- Task 4.2: CSV import functionality (to be implemented)
- Task 4.3: Additional validation (already complete)
- Task 4.4: ContactListManager UI component (separate task)

## Completion Checklist

✅ Create contact list function  
✅ Get contact lists function (with optional user filter)  
✅ Get contact list by ID function  
✅ Update contact list function  
✅ Delete contact list function  
✅ Add contact function with validation  
✅ Get contacts function  
✅ Update contact function  
✅ Delete contact function  
✅ Contact validation function  
✅ Email validation (RFC 5322)  
✅ Phone validation (10-15 digits)  
✅ Tag validation (max 20, 50 chars each)  
✅ Duplicate detection  
✅ contactCount management  
✅ Error handling  
✅ TypeScript compilation  
✅ Documentation  

## Task 4.1 Status: ✅ COMPLETE

All required functionality has been implemented according to the task details:
- ✅ Implement `createContactList(name, description)` function
- ✅ Implement `getContactLists(userId)` and `getContactListById(id)` functions
- ✅ Implement `updateContactList(id, updates)` and `deleteContactList(id)` functions
- ✅ Implement `addContact(listId, contact)` function with validation
- ✅ Implement `getContacts(listId)`, `updateContact(id, updates)`, `deleteContact(id)` functions

The service is ready for integration with the UI components in Task 4.4.
