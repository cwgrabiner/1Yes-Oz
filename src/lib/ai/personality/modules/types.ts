/**
 * Module Types
 * Defines the structure of personality modules
 */

export enum ModuleType {
    CORE = "core",           // Never drop, identity-critical
    POSTURE = "posture",     // Exactly one per turn
    POLICY = "policy",       // Tempo, friction - conditional
    DECISION = "decision",   // Decision-making guidance
    VOICE = "voice",         // Writing style baseline
    POV = "pov",            // Belief system (optional)
    MEMORY = "memory"        // Memory behavior (when memory exists)
  }
  
  export interface PromptModule {
    id: string;              // Unique identifier
    type: ModuleType;        // Category
    purpose: string;         // One-line description
    priority: 1 | 2 | 3;    // 1=keep always, 2=keep if possible, 3=drop first
    maxTokens: number;       // Estimated token count
    content: string;         // The actual prompt text
  }