import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 60000;
const EXTRACTION_TIMEOUT = 10000; // 10 seconds

export interface ExtractTextResult {
  text: string;
  error?: never;
}

export interface ExtractTextError {
  text?: never;
  error: string;
}

export type ExtractTextResponse = ExtractTextResult | ExtractTextError;

/**
 * Normalizes text by collapsing excessive whitespace and capping length.
 */
function normalizeText(text: string): string {
  // Collapse multiple spaces to single space
  let normalized = text.replace(/[ \t]+/g, ' ');
  // Collapse multiple newlines to single newline
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  // Trim whitespace
  normalized = normalized.trim();
  
  // Cap at max length
  if (normalized.length > MAX_TEXT_LENGTH) {
    normalized = normalized.substring(0, MAX_TEXT_LENGTH);
    normalized += '\n\n[Content trimmed - first 60k chars]';
  }
  
  return normalized;
}

/**
 * Extracts text from a PDF buffer.
 */
async function extractFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text || '';
}

/**
 * Extracts text from a DOCX buffer.
 */
async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

/**
 * Extracts text from a plain text buffer (UTF-8).
 */
async function extractFromText(buffer: Buffer): Promise<string> {
  return buffer.toString('utf-8');
}

/**
 * Extracts plain text from a file buffer based on mime type.
 * 
 * @param buffer - File buffer
 * @param mimeType - MIME type of the file
 * @returns Extracted and normalized text
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractTextResponse> {
  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    return { error: 'File too large (max 10MB)' };
  }

  // Validate mime type
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];

  if (!allowedMimeTypes.includes(mimeType)) {
    return { error: 'Only PDF, DOCX, TXT, and MD supported' };
  }

  try {
    // Set up timeout
    const timeoutPromise = new Promise<ExtractTextError>((resolve) => {
      setTimeout(() => {
        resolve({ error: 'File took too long to process' });
      }, EXTRACTION_TIMEOUT);
    });

    // Extract text based on mime type
    const extractionPromise = (async () => {
      let rawText: string;
      
      if (mimeType === 'application/pdf') {
        rawText = await extractFromPDF(buffer);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        rawText = await extractFromDOCX(buffer);
      } else if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
        rawText = await extractFromText(buffer);
      } else {
        throw new Error('Unsupported file type');
      }
      
      const normalized = normalizeText(rawText);
      return { text: normalized };
    })();

    // Race between extraction and timeout
    const result = await Promise.race([extractionPromise, timeoutPromise]);
    
    if ('error' in result) {
      return result;
    }
    
    return result;
  } catch (error) {
    console.error('Text extraction error:', error);
    return { error: "Couldn't read this file type" };
  }
}
