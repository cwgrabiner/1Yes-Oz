import { TavilySearchProvider } from './tavily';
import type { SearchProvider } from './types';

/**
 * Get the configured search provider.
 * Returns Tavily if API key is present, otherwise null.
 */
export function getSearchProvider(): SearchProvider | null {
  const provider = new TavilySearchProvider();
  if (provider.isConfigured()) {
    return provider;
  }
  return null;
}

/**
 * Determine if a query should trigger a search.
 */
export function shouldSearch(query: string): 'explicit' | 'ask_permission' | 'not_needed' {
  const lowerQuery = query.toLowerCase().trim();

  // Force explicit search if user explicitly requests web search
  const explicitSearchCommands = [
    /\b(search the web|search online|look up|find online|web search|search for)\b/,
  ];

  if (explicitSearchCommands.some((pattern) => pattern.test(lowerQuery))) {
    return 'explicit';
  }

  // Explicit search triggers - user is asking for current/factual info
  const explicitTriggers = [
    /\b(current|latest|recent|today|now|2024|2025)\b/,
    /\b(list of|list all|list the|what are the)\b/,
    /\b(banks|companies|organizations|institutions|located|headquartered)\b/,
    /\b(news|updates|happenings|developments)\b/,
  ];

  const hasExplicitTrigger = explicitTriggers.some((pattern) => pattern.test(lowerQuery));

  // Patterns that suggest factual lookups
  const factualPatterns = [
    /(banks|companies|organizations).*(in|at|located|headquartered)/,
    /(recent|latest|current).*(news|about|regarding)/,
    /(what|which|who).*(are|is).*(companies|organizations|institutions)/,
  ];

  const hasFactualPattern = factualPatterns.some((pattern) => pattern.test(lowerQuery));

  // Explicit search - user wants current/factual data
  if (hasExplicitTrigger && hasFactualPattern) {
    return 'explicit';
  }

  // If there's an explicit trigger but no clear factual pattern, ask permission
  if (hasExplicitTrigger) {
    return 'ask_permission';
  }

  // Patterns that suggest search would help
  const helpfulPatterns = [
    /\b(salary|compensation|pay|earnings)\b/,
    /\b(company|culture|reputation|reviews)\b/,
    /\b(industry|market|trends)\b/,
  ];

  const wouldHelp = helpfulPatterns.some((pattern) => pattern.test(lowerQuery));

  // General advice, hypotheticals, personal situations - don't search
  const personalPatterns = [
    /\b(should i|what should|how should|my|me|myself)\b/,
    /\b(advice|suggest|recommend|hypothetical|if i)\b/,
  ];

  const isPersonal = personalPatterns.some((pattern) => pattern.test(lowerQuery));

  if (isPersonal) {
    return 'not_needed';
  }

  // If search would help but not required, ask permission
  if (wouldHelp) {
    return 'ask_permission';
  }

  return 'not_needed';
}

/**
 * Format search results for inclusion in prompt.
 */
export function formatSearchResults(results: { results: Array<{ title: string; url: string; content: string }> }): string {
  if (!results.results || results.results.length === 0) {
    return '';
  }

  const formattedResults = results.results
    .slice(0, 3) // Limit to 2-3 sources
    .map((result, index) => {
      return `[${index + 1}] ${result.title}\n   URL: ${result.url}\n   Content: ${result.content.substring(0, 300)}...`;
    })
    .join('\n\n');

  return `\n\nSearch Results:\n${formattedResults}\n`;
}

/**
 * Format sources list for response footer.
 */
export function formatSources(results: { results: Array<{ title: string; url: string }> }): string {
  if (!results.results || results.results.length === 0) {
    return '';
  }

  const sources = results.results.slice(0, 3).map((result) => `- ${result.title}: ${result.url}`).join('\n');

  return `\n\nSources:\n${sources}`;
}
