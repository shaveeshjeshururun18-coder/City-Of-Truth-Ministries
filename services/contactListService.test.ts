import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createContactList,
  getContactLists,
  getContactListById,
  updateContactList,
  deleteContactList,
  addContact,
  getContacts,
  updateContact,
  deleteContact,
  validateContact
} from './contactListService';

// Mock Firebase
vi.mock('./firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _seconds: Date.now() / 1000 })),
  Timestamp: vi.fn()
}));

describe('Contact List Service - Validation Tests', () => {
  describe('validateContact', () => {
    it('should validate a correct contact', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject contact without name', () => {
      const contact = {
        name: '',
        email: 'john@example.com'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Contact name is required');
    });

    it('should reject contact without email', () => {
      const contact = {
        name: 'John Doe',
        email: ''
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should reject contact with invalid email format', () => {
      const contact = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject contact with name exceeding 100 characters', () => {
      const contact = {
        name: 'A'.repeat(101),
        email: 'john@example.com'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Contact name must not exceed 100 characters');
    });

    it('should reject contact with invalid phone number (too few digits)', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '12345'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format (must contain 10-15 digits)');
    });

    it('should reject contact with invalid phone number (too many digits)', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890123456'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format (must contain 10-15 digits)');
    });

    it('should accept contact with valid phone number with + prefix', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+12345678901'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept contact with valid phone number with spaces and hyphens', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (234) 567-8901'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept contact without phone number', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject contact with more than 20 tags', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        tags: Array(21).fill('tag')
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Maximum 20 tags allowed');
    });

    it('should reject contact with tag exceeding 50 characters', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        tags: ['A'.repeat(51)]
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Each tag must not exceed 50 characters');
    });

    it('should accept contact with valid tags', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        tags: ['important', 'member', 'volunteer']
      };

      const result = validateContact(contact);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('Contact List Service - Email Validation', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'simple@example.com',
      'user.name@example.com',
      'user+tag@example.co.uk',
      'user_name@example.com',
      'user123@example.com',
      'user@sub.example.com'
    ];

    validEmails.forEach(email => {
      const result = validateContact({ name: 'Test', email });
      expect(result.valid).toBe(true);
    });
  });

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'invalid',
      'invalid@',
      '@example.com',
      'user @example.com',
      'user@.com',
      'user@example',
      'user..name@example.com'
    ];

    invalidEmails.forEach(email => {
      const result = validateContact({ name: 'Test', email });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });
});

describe('Contact List Service - Phone Validation', () => {
  it('should accept valid phone numbers', () => {
    const validPhones = [
      '1234567890',        // 10 digits
      '123456789012345',   // 15 digits
      '+1234567890',       // with + prefix
      '+12345678901234',   // with + prefix, 14 digits
      '(123) 456-7890',    // with parentheses and hyphens
      '+1 (234) 567-8901', // full format
      '123-456-7890'       // with hyphens
    ];

    validPhones.forEach(phone => {
      const result = validateContact({ name: 'Test', email: 'test@test.com', phone });
      expect(result.valid).toBe(true);
    });
  });

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '123',               // too few digits
      '12345678901234567', // too many digits
      'abcdefghij',        // letters
      '+abc1234567',       // letters with prefix
      '123-456'            // too few digits
    ];

    invalidPhones.forEach(phone => {
      const result = validateContact({ name: 'Test', email: 'test@test.com', phone });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format (must contain 10-15 digits)');
    });
  });
});
