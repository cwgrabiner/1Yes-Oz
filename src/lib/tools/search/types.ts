export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export interface SearchProvider {
  /**
   * Check if this provider is configured and available.
   */
  isConfigured(): boolean;

  /**
   * Perform a web search.
   * @param query - Search query string
   * @returns Search results with titles, URLs, and content snippets
   */
  search(query: string): Promise<SearchResponse>;
}

export type SearchDecision =
  | { shouldSearch: true; reason: 'explicit' }
  | { shouldSearch: false; reason: 'not_needed' }
  | { shouldSearch: false; reason: 'ask_permission' };
