import { getModules } from '../personality/modules/registry';
import type { PromptModule } from '../personality/modules/types';

const TOKEN_BUDGET = 2500;
const AVG_CHARS_PER_TOKEN = 4; // Conservative estimate

interface AssembleInput {
  moduleIds: string[];
  memorySummary?: string;
  retrievedChunk?: string;
  toolsIndex?: string;
  activeToolPrompt?: string;
  webSearchConfig?: string;
  webSearchResults?: string;
}

interface AssembleOutput {
  systemPrompt: string;
  modulesIncluded: string[];
  tokensUsed: number;
  modulesDropped: string[];
}

export function assemblePrompt(input: AssembleInput): AssembleOutput {
  const { moduleIds, memorySummary, retrievedChunk, toolsIndex, activeToolPrompt, webSearchConfig, webSearchResults } = input;
  
  // 1. Get modules from registry
  let modules = getModules(moduleIds);
  
  // 2. Validate invariants
  validateInvariants(modules);
  
  // 3. Sort by priority (1 = keep, 3 = drop first)
  modules.sort((a, b) => a.priority - b.priority);
  
  // 4. Build initial prompt sections
  let sections: { name: string; content: string; tokens: number }[] = [];
  
  // Add modules
  for (const m of modules) {
    sections.push({
      name: m.id,
      content: `### ${m.id}\n${m.content}`,
      tokens: estimateTokens(m.content)
    });
  }

  // Add tools index (priority 1 - never drop)
  if (toolsIndex) {
    sections.push({
      name: "tools_index",
      content: toolsIndex,
      tokens: estimateTokens(toolsIndex)
    });
  }

  // Add active tool prompt (priority 1 - never drop)
  if (activeToolPrompt) {
    sections.push({
      name: "active_tool_prompt",
      content: activeToolPrompt,
      tokens: estimateTokens(activeToolPrompt)
    });
  }

  // Add web search config (priority 1 - never drop)
  if (webSearchConfig) {
    sections.push({
      name: "web_search_config",
      content: webSearchConfig,
      tokens: estimateTokens(webSearchConfig)
    });
  }

  // Add web search results (priority 2 - can truncate)
  if (webSearchResults) {
    sections.push({
      name: "web_search_results",
      content: `### WEB SEARCH RESULTS\n${webSearchResults}`,
      tokens: estimateTokens(webSearchResults)
    });
  }
  
  // Add memory if exists
  if (memorySummary) {
    sections.push({
      name: "memory_summary",
      content: `### CAREER FILE & MEMORY\n${memorySummary}`,
      tokens: estimateTokens(memorySummary)
    });
  }
  
  // Add retrieval if exists
  if (retrievedChunk) {
    sections.push({
      name: "retrieved_domain_context",
      content: `### DOMAIN EXPERTISE\n${retrievedChunk}`,
      tokens: estimateTokens(retrievedChunk)
    });
  }
  
  // 5. Calculate total tokens
  let totalTokens = sections.reduce((sum, s) => sum + s.tokens, 0);
  
  // 6. Drop modules if over budget
  const modulesDropped: string[] = [];
  
  if (totalTokens > TOKEN_BUDGET) {
    // Drop order (from lowest to highest priority)
    const dropOrder = [
      "pov_core",
      "tempo_slow",
      "tempo_normal",
      "friction_medium",
      "friction_high",
      "tempo_fast",
      "decision_philosophy"
    ];
    
    for (const moduleId of dropOrder) {
      if (totalTokens <= TOKEN_BUDGET) break;
      
      const idx = sections.findIndex(s => s.name === moduleId);
      if (idx !== -1) {
        const dropped = sections.splice(idx, 1)[0];
        totalTokens -= dropped.tokens;
        modulesDropped.push(moduleId);
      }
    }
    
    // If still over budget, truncate retrieval
    if (totalTokens > TOKEN_BUDGET) {
      const retrievalIdx = sections.findIndex(s => s.name === "retrieved_domain_context");
      if (retrievalIdx !== -1) {
        const maxRetrievalTokens = 300;
        const retrievalSection = sections[retrievalIdx];
        const excessTokens = totalTokens - TOKEN_BUDGET;
        
        if (retrievalSection.tokens > maxRetrievalTokens) {
          const newTokens = Math.max(maxRetrievalTokens, retrievalSection.tokens - excessTokens);
          const newContent = truncateToTokens(retrievedChunk!, newTokens);
          sections[retrievalIdx] = {
            name: "retrieved_domain_context",
            content: `### DOMAIN EXPERTISE\n${newContent}`,
            tokens: newTokens
          };
          totalTokens = sections.reduce((sum, s) => sum + s.tokens, 0);
        }
      }
    }
    
    // If STILL over budget, truncate memory
    if (totalTokens > TOKEN_BUDGET) {
      const memoryIdx = sections.findIndex(s => s.name === "memory_summary");
      if (memoryIdx !== -1) {
        const maxMemoryTokens = 200;
        const memorySection = sections[memoryIdx];
        const excessTokens = totalTokens - TOKEN_BUDGET;
        
        const newTokens = Math.max(maxMemoryTokens, memorySection.tokens - excessTokens);
        const newContent = truncateToTokens(memorySummary!, newTokens);
        sections[memoryIdx] = {
          name: "memory_summary",
          content: `### CAREER FILE & MEMORY\n${newContent}`,
          tokens: newTokens
        };
        totalTokens = sections.reduce((sum, s) => sum + s.tokens, 0);
      }
    }
  }
  
  // 7. Assemble final prompt
  const systemPrompt = sections.map(s => s.content).join("\n\n").trim();
  
  // 8. Get final module list
  const modulesIncluded = sections
    .filter(s =>
      !s.name.includes("memory") &&
      !s.name.includes("retrieved") &&
      !s.name.includes("tools") &&
      !s.name.includes("active_tool") &&
      !s.name.includes("web_search")
    )
    .map(s => s.name);

  // DEBUG: Verify memory_proposal in assembled prompt
  console.log('=== ASSEMBLER DEBUG ===');
  console.log('Modules included:', modulesIncluded);
  console.log('memory_proposal in modulesIncluded?', modulesIncluded.includes('memory_proposal'));
  console.log('System prompt includes memory_proposal content?', systemPrompt.includes('MEMORY PROPOSAL'));
  console.log('=======================');
  
  return {
    systemPrompt,
    modulesIncluded,
    tokensUsed: totalTokens,
    modulesDropped
  };
}

function validateInvariants(modules: PromptModule[]): void {
  // Check: Must include core_identity, boundaries, voice_baseline, melissa_authority
  const required = ["core_identity", "boundaries", "voice_baseline", "melissa_authority"];
  for (const req of required) {
    if (!modules.find(m => m.id === req)) {
      throw new Error(`INVARIANT VIOLATION: Missing required module: ${req}`);
    }
  }
  
  // Check: Exactly one posture module
  const postureModules = modules.filter(m => m.type === "posture");
  if (postureModules.length !== 1) {
    throw new Error(`INVARIANT VIOLATION: Expected 1 posture module, got ${postureModules.length}`);
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * AVG_CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "...";
}