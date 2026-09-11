/**
 * Form Safety & Input Validation Service
 * Validates Email addresses (syntax, top-level domain, disposable email prevention)
 * and Phone numbers (Indian +91 standard & International E.164 format)
 * to keep Prayer Requests & Contact communications genuine and spam-free.
 */

export interface EmailValidationResult {
    isValid: boolean;
    message?: string;
    isDisposable?: boolean;
}

export interface PhoneValidationResult {
    isValid: boolean;
    formatted?: string;
    country?: string;
    message?: string;
}

// Known disposable / burner email domains
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com',
    '10minutemail.com',
    'tempmail.com',
    'guerrillamail.com',
    'throwawaymail.com',
    'trashmail.com',
    'yopmail.com',
    'sharklasers.com',
    'getairmail.com',
    'dispostable.com',
    'temp-mail.org',
    'fakemailgenerator.com'
]);

/**
 * Validates an email address syntax and checks against burner/disposable domains.
 */
export function validateEmail(email: string): EmailValidationResult {
    if (!email || !email.trim()) {
        return { isValid: false, message: 'Email address is required' };
    }

    const trimmed = email.trim().toLowerCase();

    // Standard RFC 5322 compliant regex for web forms
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(trimmed)) {
        return { isValid: false, message: 'Please enter a valid email address (e.g. name@domain.com)' };
    }

    const parts = trimmed.split('@');
    if (parts.length === 2) {
        const domain = parts[1];
        if (DISPOSABLE_DOMAINS.has(domain)) {
            return {
                isValid: false,
                isDisposable: true,
                message: 'Temporary/disposable email addresses are not accepted for prayer petitions'
            };
        }

        // Check for realistic TLD
        const domainParts = domain.split('.');
        const tld = domainParts[domainParts.length - 1];
        if (!tld || tld.length < 2) {
            return { isValid: false, message: 'Invalid domain extension in email address' };
        }
    }

    return { isValid: true };
}

/**
 * Validates phone numbers with support for Indian (+91) standard and international E.164 formats.
 */
export function validatePhone(phone: string): PhoneValidationResult {
    if (!phone || !phone.trim()) {
        return { isValid: true }; // Optional field
    }

    // Clean whitespace, hyphens, and brackets
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Indian mobile phone check (+91 followed by 10 digits starting with 6, 7, 8, 9 or raw 10 digits)
    const indianRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (indianRegex.test(cleaned)) {
        const pureDigits = cleaned.slice(-10);
        return {
            isValid: true,
            formatted: `+91 ${pureDigits.slice(0, 5)} ${pureDigits.slice(5)}`,
            country: 'India (IN)'
        };
    }

    // General international E.164 format check (+ followed by 7 to 15 digits)
    const intlRegex = /^\+?[1-9]\d{6,14}$/;
    if (intlRegex.test(cleaned)) {
        const formatted = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
        return {
            isValid: true,
            formatted,
            country: 'International'
        };
    }

    return {
        isValid: false,
        message: 'Please enter a valid 10-digit mobile number or international format (e.g. +91 98765 43210)'
    };
}
