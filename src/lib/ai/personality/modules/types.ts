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
    MEMORY = "memory",       // Memory behavior (when memory exists)
    TOOL = "tool"            // Domain expertise modules
  }
  
  export interface PromptModule {
    id: string;
    type: ModuleType;
    purpose: string;
    priority: 1 | 2 | 3;
    maxTokens: number;
    content: string;
    
    // Optional: Wizard configuration for multi-step guided flows
    wizardConfig?: {
      enabled: boolean;
      totalSteps: number;
      stepPrompts: string[]; // Filenames like "step1_upload.md"
    };
  }