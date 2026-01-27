import type { SearchProvider, SearchResponse, SearchResult } from './types';

interface TavilyApiResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
  }>;
  query: string;
}

/**
 * Tavily search provider implementation.
 */
export class TavilySearchProvider implements SearchProvider {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async search(query: string): Promise<SearchResponse> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: 'basic',
          include_answer: false,
          include_images: false,
          max_results: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data: TavilyApiResponse = await response.json();

      const results: SearchResult[] = (data.results || []).map((result) => ({
        title: result.title || 'Untitled',
        url: result.url || '',
        content: result.content || '',
      }));

      return {
        results,
        query: data.query || query,
      };
    } catch (error) {
      // TODO Phase 8: send to observability
      console.error('Tavily search error:', error);
      throw error;
    }
  }
}
