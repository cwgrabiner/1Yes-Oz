import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embeddings';
import { SAMPLE_CHUNKS } from './sampleContent';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function loadChunksToDatabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required environment variables');
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  console.log(`Loading ${SAMPLE_CHUNKS.length} chunks...`);
  
  for (let i = 0; i < SAMPLE_CHUNKS.length; i++) {
    const chunk = SAMPLE_CHUNKS[i];
    
    console.log(`[${i + 1}/${SAMPLE_CHUNKS.length}] Generating embedding for: ${chunk.domain} - ${chunk.metadata?.section}`);
    
    // Generate embedding
    const embedding = await generateEmbedding(chunk.content);
    
    // Insert into database
    const { error } = await supabase
      .from('content_chunks')
      .insert({
        content: chunk.content,
        embedding,
        domain: chunk.domain,
        stage: chunk.stage || null,
        metadata: chunk.metadata || {}
      });
    
    if (error) {
      console.error(`Failed to insert chunk:`, error);
    } else {
      console.log(`✓ Loaded: ${chunk.domain} - ${chunk.metadata?.section}`);
    }
  }
  
  console.log('✅ Done loading chunks');
}

// Run this script: npx tsx src/lib/ai/retrieval/loadChunks.ts
if (require.main === module) {
  loadChunksToDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}
