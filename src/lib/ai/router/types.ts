/**
 * Router Types
 * Defines all state, signal, and output types for the 1Yes personality router
 */

export type Posture = 
  | "calm_expert" 
  | "coach" 
  | "strategist" 
  | "operator" 
  | "companion";

export type Priority = 
  | "reduce_stress"   // Companion mode, stabilize first
  | "move_now"        // Operator mode, execute immediately
  | "decide"          // Strategist mode, decision support
  | "teach"           // Coach mode, skill-building
  | "increase_odds";  // Default, optimize strategy

export type Domain = 
  | "resume" 
  | "linkedin" 
  | "networking" 
  | "interview" 
  | "negotiation" 
  | "confidence" 
  | "general";

export type Stage = 
  | "applying" 
  | "interviewing" 
  | "negotiating" 
  | "pivoting" 
  | "stuck" 
  | "unknown";

export type Urgency = "high" | "medium" | "low";

export type FrictionLevel = "high" | "medium" | "low";

export type UserEnergy = "high" | "neutral" | "low";

/**
 * RouterState - The complete state that evolves turn-by-turn
 * This is the "memory" for the stateless LLM
 */
export interface RouterState {
  posture: Posture;
  priority: Priority;
  domain: Domain;
  stage: Stage;
  urgency: Urgency;
  friction: FrictionLevel;
  user_energy: UserEnergy;
}

/**
 * Default state - used for first turn or when no previous state exists
 */
export const DEFAULT_STATE: RouterState = {
  posture: "calm_expert",
  priority: "increase_odds",
  domain: "general",
  stage: "unknown",
  urgency: "low",
  friction: "medium",
  user_energy: "neutral"
};

/**
 * Signals - Detected patterns in user input
 */
export interface Signals {
  distress: boolean;           // Panic, burnout, hopelessness
  readyToAct: boolean;         // Execution requests, urgency
  decisionAsk: boolean;        // Choice paralysis, "should I"
  teachAsk: boolean;           // "How do I", "teach me"
  overwhelm: boolean;          // Too many options, don't know where to start
  urgencyHigh: boolean;        // Today, tomorrow, deadline
  urgencyMedium: boolean;      // This week, soon
  domainHits: Partial<Record<Domain, boolean>>;
  stageHints: Partial<Record<Stage, boolean>>;
}

/**
 * RouterInput - What the router receives each turn
 */
export interface RouterInput {
  userText: string;
  prevState?: RouterState;
  memorySummary?: string;
}

/**
 * RouterOutput - What the router produces each turn
 */
export interface RouterOutput {
  nextState: RouterState;      // Evolved state for next turn
  moduleIds: string[];         // Which modules to include in prompt
  retrievalQuery?: string;     // Query for domain content retrieval (optional)
  needsWebSearch?: boolean;    // Auto-trigger web search for current events questions
  activeTool?: string;         // Recommended tool to activate
}