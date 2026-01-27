/**
 * This file defines the canonical memory marker protocol. Do not change without migrating all dependent layers.
 * 
 * The memory marker format is: [[MEMORY_CANDIDATE]]{...}[[/MEMORY_CANDIDATE]]
 * Where {...} is valid JSON with "key" and "value" string fields.
 */

export interface MemoryCandidate {
  key: string;
  value: string;
}

/**
 * Canonical memory marker constants - single source of truth
 */
export const MEMORY_MARKER_OPEN = '[[MEMORY_CANDIDATE]]';
export const MEMORY_MARKER_CLOSE = '[[/MEMORY_CANDIDATE]]';

/**
 * Build a memory marker string from a candidate object
 */
export function buildMemoryMarker(candidate: MemoryCandidate): string {
  const json = JSON.stringify({ key: candidate.key, value: candidate.value });
  return `${MEMORY_MARKER_OPEN}${json}${MEMORY_MARKER_CLOSE}`;
}

/**
 * Escape special regex characters in a string for use in RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Regex pattern to detect memory candidates in assistant responses
 * Built from canonical constants to ensure consistency
 * Uses non-greedy matching and handles whitespace around JSON block
 */
function buildMemoryPattern(): RegExp {
  // Escape special regex characters in markers
  const openEscaped = escapeRegex(MEMORY_MARKER_OPEN);
  const closeEscaped = escapeRegex(MEMORY_MARKER_CLOSE);
  // Pattern: open marker, optional whitespace, JSON block (non-greedy), optional whitespace, close marker
  // 's' flag allows . to match newlines, 'g' flag for global matching
  return new RegExp(`${openEscaped}\\s*(.*?)\\s*${closeEscaped}`, 'gs');
}

const MEMORY_PATTERN = buildMemoryPattern();

/**
 * Parse memory candidates from assistant response text
 * 
 * Resilient to:
 * - Multiple candidates in one message
 * - Whitespace/newlines around JSON block
 * - JSON parse failures (treated as no candidates, does not crash)
 * 
 * Never throws - returns empty array on any error
 */
export function parseMemoryCandidates(text: string): MemoryCandidate[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const candidates: MemoryCandidate[] = [];
  
  try {
    // Reset regex lastIndex to ensure we start from the beginning
    MEMORY_PATTERN.lastIndex = 0;
    
    let match;
    while ((match = MEMORY_PATTERN.exec(text)) !== null) {
      try {
        // Trim whitespace from captured JSON block
        const jsonBlock = match[1]?.trim();
        if (!jsonBlock) {
          continue;
        }

        const parsed = JSON.parse(jsonBlock);
        
        // Validate structure
        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.key === 'string' &&
          typeof parsed.value === 'string' &&
          parsed.key.trim() &&
          parsed.value.trim()
        ) {
          candidates.push({
            key: parsed.key.trim(),
            value: parsed.value.trim(),
          });
        }
      } catch (parseError) {
        // Individual candidate parse failure - log but continue processing others
        console.error('Failed to parse memory candidate JSON:', parseError);
        // Do not throw - continue to next candidate
      }
    }
  } catch (error) {
    // Pattern matching failure - return empty array, do not crash
    console.error('Error parsing memory candidates:', error);
    return [];
  }

  return candidates;
}

/**
 * Strip memory candidate markers from text for display/storage
 * 
 * Safe and deterministic:
 * - Removes ALL marker blocks reliably
 * - Preserves surrounding content spacing cleanly (no double blank lines)
 * - Only removes content that matches the full open+close block pattern
 * - Never throws
 */
export function stripMemoryMarkers(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    // Replace all marker blocks with empty string
    let cleaned = text.replace(MEMORY_PATTERN, '');
    
    // Clean up excessive whitespace that might result from marker removal
    // Remove lines that are now empty (but preserve intentional spacing)
    cleaned = cleaned
      // Remove standalone marker lines (lines with only whitespace)
      .replace(/^\s*$/gm, '')
      // Collapse multiple consecutive blank lines to max 2
      .replace(/\n{3,}/g, '\n\n')
      // Trim final result
      .trim();
    
    return cleaned;
  } catch (error) {
    // On any error, return original text (fail-safe)
    console.error('Error stripping memory markers:', error);
    return text;
  }
}
