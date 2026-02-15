import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embeddings';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

import type { Domain, RetrievalResult } from './types';

const MAX_CHUNKS = 3;
const SIMILARITY_THRESHOLD = 0.7;

export async function retrieveContext(
  query: string,
  domain: Domain
): Promise<RetrievalResult[]> {
  // Skip retrieval for general domain
  if (domain === 'general') {
    return [];
  }

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for similar chunks
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.rpc('search_chunks', {
      query_embedding: queryEmbedding,
      match_domain: domain,
      match_count: MAX_CHUNKS,
      similarity_threshold: SIMILARITY_THRESHOLD
    });
    
    if (error) {
      console.error('Retrieval error:', error);
      return [];
    }
    
    // Transform database results to RetrievalResult format
    return (data || []).map((row: any) => ({
      content: row.content,
      similarity: row.similarity,
      domain: row.domain,
      stage: row.stage,
      metadata: row.metadata
    }));
    
  } catch (error) {
    console.error('Retrieval system error:', error);
    return [];
  }
}