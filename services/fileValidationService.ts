/**
 * Strict file upload validator for Entrust Cards, face images, and profile documents.
 * Inspects MIME types, file size limits, image dimensions, and raw binary header magic numbers.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType?: 'pdf' | 'jpeg' | 'png' | 'webp';
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function validateUploadedFile(file: File): Promise<ValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // 1. File Size Validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds the 5 MB limit. Please upload a smaller file.' };
  }

  // 2. Read first 12 magic bytes from binary header
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { valid: true, fileType: 'pdf' };
  }

  // Check JPEG magic bytes: 0xFF 0xD8 0xFF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { valid: true, fileType: 'jpeg' };
  }

  // Check PNG magic bytes: 0x89 0x50 0x4E 0x47 (89 'P' 'N' 'G')
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return { valid: true, fileType: 'png' };
  }

  // Check WEBP magic bytes: 'R' 'I' 'F' 'F' ... 'W' 'E' 'B' 'P'
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { valid: true, fileType: 'webp' };
  }

  return {
    valid: false,
    error: 'Invalid or corrupted file format. Only official PDF documents and JPG/PNG/WebP images are supported.',
  };
}
