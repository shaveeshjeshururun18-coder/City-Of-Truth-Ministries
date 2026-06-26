import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { ContactList, Contact } from '../types';

// ============================================================================
// Contact List Management Functions
// ============================================================================

/**
 * Creates a new contact list
 * @param name - Name of the contact list (max 100 characters)
 * @param description - Optional description
 * @returns Promise resolving to the created ContactList
 */
export const createContactList = async (
  name: string, 
  description?: string
): Promise<ContactList> => {
  try {
    // Validate name length
    if (!name || name.trim().length === 0) {
      throw new Error('Contact list name is required');
    }
    if (name.length > 100) {
      throw new Error('Contact list name must not exceed 100 characters');
    }

    const contactListData = {
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: 'admin', // TODO: Replace with actual user ID from auth context
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      contactCount: 0
    };

    const docRef = await addDoc(collection(db, 'contactLists'), contactListData);
    
    // Fetch the created document to get server timestamps
    const createdDoc = await getDoc(docRef);
    const data = createdDoc.data();
    
    return {
      id: docRef.id,
      name: data?.name || name,
      description: data?.description,
      createdBy: data?.createdBy || 'admin',
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      contactCount: data?.contactCount || 0
    };
  } catch (error) {
    console.error('Error creating contact list:', error);
    throw error;
  }
};

/**
 * Retrieves all contact lists, optionally filtered by userId
 * @param userId - Optional user ID to filter lists by creator
 * @returns Promise resolving to array of ContactList objects
 */
export const getContactLists = async (userId?: string): Promise<ContactList[]> => {
  try {
    let q;
    if (userId) {
      q = query(collection(db, 'contactLists'), where('createdBy', '==', userId));
    } else {
      q = query(collection(db, 'contactLists'));
    }

    const querySnapshot = await getDocs(q);
    const contactLists: ContactList[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      contactLists.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
        contactCount: data.contactCount || 0
      });
    });

    return contactLists;
  } catch (error) {
    console.error('Error fetching contact lists:', error);
    throw error;
  }
};

/**
 * Retrieves a specific contact list by ID
 * @param id - Contact list ID
 * @returns Promise resolving to ContactList or null if not found
 */
export const getContactListById = async (id: string): Promise<ContactList | null> => {
  try {
    const docRef = doc(db, 'contactLists', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      contactCount: data.contactCount || 0
    };
  } catch (error) {
    console.error('Error fetching contact list:', error);
    throw error;
  }
};

/**
 * Updates a contact list
 * @param id - Contact list ID
 * @param updates - Partial ContactList object with fields to update
 * @returns Promise resolving to updated ContactList
 */
export const updateContactList = async (
  id: string, 
  updates: Partial<ContactList>
): Promise<ContactList> => {
  try {
    const docRef = doc(db, 'contactLists', id);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Contact list not found');
    }

    // Validate name if being updated
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new Error('Contact list name cannot be empty');
      }
      if (updates.name.length > 100) {
        throw new Error('Contact list name must not exceed 100 characters');
      }
    }

    // Prepare update data (only include allowed fields)
    const updateData: any = {
      updatedAt: serverTimestamp()
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description.trim();
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedDoc = await getDoc(docRef);
    const data = updatedDoc.data();

    return {
      id: updatedDoc.id,
      name: data?.name || '',
      description: data?.description,
      createdBy: data?.createdBy || '',
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      contactCount: data?.contactCount || 0
    };
  } catch (error) {
    console.error('Error updating contact list:', error);
    throw error;
  }
};

/**
 * Deletes a contact list and all its contacts
 * @param id - Contact list ID
 * @returns Promise that resolves when deletion is complete
 */
export const deleteContactList = async (id: string): Promise<void> => {
  try {
    // First, delete all contacts in this list
    const contactsQuery = query(collection(db, 'contacts'), where('listId', '==', id));
    const contactsSnapshot = await getDocs(contactsQuery);
    
    const deletePromises = contactsSnapshot.docs.map((contactDoc) => 
      deleteDoc(doc(db, 'contacts', contactDoc.id))
    );
    
    await Promise.all(deletePromises);

    // Then delete the contact list itself
    await deleteDoc(doc(db, 'contactLists', id));
  } catch (error) {
    console.error('Error deleting contact list:', error);
    throw error;
  }
};

// ============================================================================
// Contact Management Functions
// ============================================================================

/**
 * Validates email address using RFC 5322 format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant email validation regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number (10-15 digits, optional + prefix)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
const validatePhone = (phone: string): boolean => {
  // Phone validation: optional + at start, then 10-15 digits (with optional spaces, hyphens, parentheses)
  const phoneRegex = /^\+?[\d\s\-()]{10,20}$/;
  if (!phoneRegex.test(phone)) {
    return false;
  }
  
  // Count actual digits
  const digitCount = phone.replace(/\D/g, '').length;
  return digitCount >= 10 && digitCount <= 15;
};

/**
 * Validates contact data
 * @param contact - Contact data to validate
 * @returns Object with valid flag and array of error messages
 */
export const validateContact = (
  contact: Partial<Contact>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate name
  if (!contact.name || contact.name.trim().length === 0) {
    errors.push('Contact name is required');
  } else if (contact.name.length > 100) {
    errors.push('Contact name must not exceed 100 characters');
  }

  // Validate email
  if (!contact.email || contact.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validateEmail(contact.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone (optional)
  if (contact.phone && contact.phone.trim().length > 0) {
    if (contact.phone.length > 20) {
      errors.push('Phone number must not exceed 20 characters');
    } else if (!validatePhone(contact.phone)) {
      errors.push('Invalid phone number format (must contain 10-15 digits)');
    }
  }

  // Validate tags (optional)
  if (contact.tags) {
    if (contact.tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }
    for (const tag of contact.tags) {
      if (tag.length > 50) {
        errors.push('Each tag must not exceed 50 characters');
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Checks if a contact with the same email already exists in the list
 * @param listId - Contact list ID
 * @param email - Email to check
 * @returns Promise resolving to true if duplicate exists, false otherwise
 */
const checkDuplicateContact = async (listId: string, email: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'contacts'),
      where('listId', '==', listId),
      where('email', '==', email.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking duplicate contact:', error);
    throw error;
  }
};

/**
 * Adds a new contact to a contact list with validation
 * @param listId - Contact list ID
 * @param contact - Contact data (without id, listId, timestamps)
 * @returns Promise resolving to the created Contact
 */
export const addContact = async (
  listId: string,
  contact: Omit<Contact, 'id' | 'listId' | 'createdAt' | 'updatedAt'>
): Promise<Contact> => {
  try {
    // Validate contact list exists
    const listRef = doc(db, 'contactLists', listId);
    const listSnap = await getDoc(listRef);
    if (!listSnap.exists()) {
      throw new Error('Contact list not found');
    }

    // Validate contact data
    const validation = validateContact(contact);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check for duplicates
    const isDuplicate = await checkDuplicateContact(listId, contact.email);
    if (isDuplicate) {
      throw new Error(`A contact with email ${contact.email} already exists in this list`);
    }

    // Create contact document
    const contactData = {
      listId,
      name: contact.name.trim(),
      email: contact.email.toLowerCase().trim(),
      phone: contact.phone?.trim() || null,
      tags: contact.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'contacts'), contactData);

    // Update contact count in list
    const currentContactCount = listSnap.data()?.contactCount || 0;
    await updateDoc(listRef, {
      contactCount: currentContactCount + 1,
      updatedAt: serverTimestamp()
    });

    // Fetch created document
    const createdDoc = await getDoc(docRef);
    const data = createdDoc.data();

    return {
      id: docRef.id,
      listId: data?.listId || listId,
      name: data?.name || contact.name,
      email: data?.email || contact.email,
      phone: data?.phone || undefined,
      tags: data?.tags || [],
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

/**
 * Retrieves all contacts for a specific contact list
 * @param listId - Contact list ID
 * @returns Promise resolving to array of Contact objects
 */
export const getContacts = async (listId: string): Promise<Contact[]> => {
  try {
    const q = query(collection(db, 'contacts'), where('listId', '==', listId));
    const querySnapshot = await getDocs(q);
    const contacts: Contact[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      contacts.push({
        id: doc.id,
        listId: data.listId,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      });
    });

    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

/**
 * Updates a contact
 * @param id - Contact ID
 * @param updates - Partial Contact object with fields to update
 * @returns Promise resolving to updated Contact
 */
export const updateContact = async (
  id: string,
  updates: Partial<Contact>
): Promise<Contact> => {
  try {
    const docRef = doc(db, 'contacts', id);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Contact not found');
    }

    const currentData = docSnap.data();

    // Validate updates
    const validation = validateContact({ ...currentData, ...updates });
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check for duplicate email if email is being updated
    if (updates.email && updates.email !== currentData.email) {
      const isDuplicate = await checkDuplicateContact(currentData.listId, updates.email);
      if (isDuplicate) {
        throw new Error(`A contact with email ${updates.email} already exists in this list`);
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: serverTimestamp()
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email.toLowerCase().trim();
    }
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone.trim() || null;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags;
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedDoc = await getDoc(docRef);
    const data = updatedDoc.data();

    return {
      id: updatedDoc.id,
      listId: data?.listId || '',
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || undefined,
      tags: data?.tags || [],
      createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

/**
 * Deletes a contact
 * @param id - Contact ID
 * @returns Promise that resolves when deletion is complete
 */
export const deleteContact = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'contacts', id);
    
    // Get contact data before deletion to update list count
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Contact not found');
    }

    const contactData = docSnap.data() as any;
    const listId = contactData.listId;

    // Delete contact
    await deleteDoc(docRef);

    // Update contact count in list
    const listRef = doc(db, 'contactLists', listId);
    const listSnap = await getDoc(listRef);
    if (listSnap.exists()) {
      const currentContactCount = listSnap.data()?.contactCount || 0;
      await updateDoc(listRef, {
        contactCount: Math.max(0, currentContactCount - 1),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};
