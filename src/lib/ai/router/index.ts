/**
 * Main Router
 * Orchestrates signal detection, state evolution, module selection, and retrieval
 */

import { detectSignals } from './signals';

/**
 * Detect if user query needs web search (current events, verifiable facts)
 * Conservative: ONLY triggers for truly current events, not general questions.
 */
export function detectWebSearchNeed(text: string): boolean {
  const normalized = text.toLowerCase();

  // ONLY trigger for VERY recent time references
  const veryRecentIndicators = [
    'today', 'tonight', 'this week', 'this month',
    'yesterday', 'last week', 'last month',
    'latest', 'recent news', 'just announced'
  ];

  // ONLY trigger for current year or specific recent dates
  const hasCurrentYear = normalized.includes('2026') || normalized.includes('2025');

  // ONLY trigger for verifiable facts about current state
  const currentStateQuestions = [
    'who won', 'who is the current', 'what is the current price',
    'stock price', 'who holds', 'current ceo', 'current president'
  ];

  const hasVeryRecentIndicator = veryRecentIndicators.some(phrase => normalized.includes(phrase));
  const hasCurrentStateQuestion = currentStateQuestions.some(phrase => normalized.includes(phrase));

  // ONLY search if BOTH recent indicator AND (current year OR current state question)
  // OR if it's a very recent time reference without domain context
  return (hasVeryRecentIndicator && (hasCurrentYear || hasCurrentStateQuestion)) ||
    (hasCurrentStateQuestion && hasCurrentYear);
}

/**
 * Detect which tool to activate based on domain, urgency, and user text
 */
function detectToolNeed(text: string, domain: Domain, urgency: Urgency): string | undefined {
  const normalized = text.toLowerCase();

  // Interview prep tool
  if (domain === 'interview' && (urgency === 'high' || urgency === 'medium')) {
    const interviewSignals = ['interview', 'interviewing', 'phone screen', 'onsite'];
    if (interviewSignals.some(signal => normalized.includes(signal))) {
      return 'interview_prep';
    }
  }

  // Add other tool detections here as needed
  // Example: networking tool, resume tool, etc.

  return undefined;
}

import { determinePosture } from './postureSwitching';
import type { RouterInput, RouterOutput, RouterState, Domain, Stage, Urgency, Signals } from './types';
import { DEFAULT_STATE } from './types';

/**
 * Routes a single turn through the personality system
 * Returns next state, selected modules, and optional retrieval query
 */
export function routeTurn(input: RouterInput): RouterOutput {
  const { userText, prevState = DEFAULT_STATE, memorySummary } = input;
  
  // 1. Detect signals
  const signals = detectSignals(userText);
  
  // 2. Determine domain and stage
  const domain = pickDomain(signals, prevState);
  const stage = pickStage(signals, prevState, domain);
  
  // 3. Determine urgency
  const urgency = pickUrgency(signals, prevState);

  // 3.5 Tool detection
  const activeTool = detectToolNeed(userText, domain, urgency);
  
  // 4. Determine posture, priority, friction, energy
  const { posture, priority, friction, user_energy } = determinePosture(signals, {
    ...prevState,
    domain,
    stage,
    urgency
  });
  
  // 5. Build next state
  const nextState: RouterState = {
    posture,
    priority,
    domain,
    stage,
    urgency,
    friction,
    user_energy
  };
  
  // 6. Select modules
  const moduleIds = selectModules(nextState, memorySummary);
  
  // 7. Generate retrieval query
  const retrievalQuery = buildRetrievalQuery(nextState, userText);

  // 8. Web search detection for current events
  const needsWebSearch = detectWebSearchNeed(userText);

  return {
    nextState,
    moduleIds,
    retrievalQuery,
    needsWebSearch,
    activeTool
  };
}

/**
 * Pick domain based on signal priority
 */
function pickDomain(signals: Signals, prevState: RouterState): Domain {
  // Priority order for domain detection
  const order: Domain[] = [
    "negotiation",
    "interview", 
    "resume",
    "linkedin",
    "networking",
    "confidence",
    "general"
  ];
  
  for (const d of order) {
    if (d !== "general" && signals.domainHits[d]) {
      return d;
    }
  }
  
  // Keep previous domain if no new signal
  return prevState.domain || "general";
}

/**
 * Pick stage based on signal priority
 */
function pickStage(signals: Signals, prevState: RouterState, domain: Domain): Stage {
  // Priority order for stage detection
  const order: Stage[] = [
    "negotiating",
    "interviewing", 
    "applying",
    "pivoting",
    "stuck"
  ];
  
  for (const st of order) {
    if (signals.stageHints[st]) {
      return st;
    }
  }
  
  // Domain-based fallback
  if (domain === "interview") return "interviewing";
  if (domain === "negotiation") return "negotiating";
  
  // Keep previous stage
  return prevState.stage || "unknown";
}

/**
 * Pick urgency level
 */
function pickUrgency(signals: Signals, prevState: RouterState): Urgency {
  if (signals.urgencyHigh) return "high";
  if (signals.urgencyMedium) return "medium";
  return prevState.urgency || "low";
}

/**
 * Select which modules to include based on state
 */
function selectModules(state: RouterState, memorySummary?: string): string[] {
  const modules: string[] = [];
  
  // ALWAYS INCLUDE (invariants)
  modules.push("core_identity");
  modules.push("boundaries");
  modules.push("voice_baseline");
  
  // Memory behavior (if memory exists)
  if (memorySummary) {
    modules.push("memory_behavior");
  }
   // Memory proposal (ALWAYS - so AI can suggest new memories)
   modules.push("memory_proposal");
  
   // POSTURE (exactly one)
   modules.push(`posture_${state.posture}`);
  
  // TEMPO (based on urgency)
  if (state.urgency === "high") {
    modules.push("tempo_fast");
  } else if (state.urgency === "medium") {
    modules.push("tempo_normal");
  }
  // Low urgency: omit tempo (or include tempo_slow if desired)
  
  // FRICTION (only when needed)
  if (state.friction === "high") {
    modules.push("friction_high");
  } else if (state.friction === "medium") {
    modules.push("friction_medium");
  }
  // Low friction: omit
  
  // DECISION PHILOSOPHY (only when priority is "decide")
  if (state.priority === "decide") {
    modules.push("decision_philosophy");
  }
  
  // POV (optional, add if token budget allows)
  modules.push("pov_core");
  
  return modules;
}

/**
 * Build retrieval query for domain content
 */
function buildRetrievalQuery(state: RouterState, userText: string): string | undefined {
  if (state.domain === "general") {
    return undefined;
  }
  
  // Build query: domain + stage + user text (truncated)
  const parts = [
    state.domain,
    state.stage !== "unknown" ? state.stage : "",
    userText
  ].filter(Boolean);
  
  return parts.join(" ").slice(0, 500);
}