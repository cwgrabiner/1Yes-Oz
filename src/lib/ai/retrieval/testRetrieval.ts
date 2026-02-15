import { retrieveContext } from './index';
import type { Domain } from './types';

async function testRetrieval() {
  console.log('Testing retrieval system...\n');

  const tests = [
    { query: "I have an interview tomorrow and I'm panicking", domain: "interview" as Domain },
    { query: "How do I write better resume bullets", domain: "resume" as Domain },
    { query: "Should I take offer A or offer B", domain: "negotiation" as Domain },
    { query: "How do I network effectively", domain: "networking" as Domain }
  ];

  for (const test of tests) {
    console.log(`Query: "${test.query}"`);
    console.log(`Domain: ${test.domain}\n`);

    const results = await retrieveContext(test.query, test.domain);

    console.log(`Found ${results.length} chunks:`);
    results.forEach((r, i) => {
      console.log(`\n[${i + 1}] Similarity: ${r.similarity.toFixed(3)}`);
      console.log(`Section: ${r.metadata?.section || 'unknown'}`);
      console.log(`Preview: ${r.content.substring(0, 100)}...`);
    });

    console.log('\n---\n');
  }

  console.log('✅ Retrieval test complete');
}

testRetrieval()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });