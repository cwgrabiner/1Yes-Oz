/**
 * Module Registry
 * Central registry of all personality modules
 */

import type { PromptModule } from './types';

// Import all modules
import { MODULE as core_identity } from './core_identity';
import { MODULE as boundaries } from './boundaries';
import { MODULE as voice_baseline } from './voice_baseline';
import { MODULE as memory_behavior } from './memory_behavior';
import { MODULE as posture_calm_expert } from './posture_calm_expert';
import { MODULE as posture_coach } from './posture_coach';
import { MODULE as posture_strategist } from './posture_strategist';
import { MODULE as posture_operator } from './posture_operator';
import { MODULE as posture_companion } from './posture_companion';
import { MODULE as tempo_fast } from './tempo_fast';
import { MODULE as tempo_normal } from './tempo_normal';
import { MODULE as tempo_slow } from './tempo_slow';
import { MODULE as friction_high } from './friction_high';
import { MODULE as friction_medium } from './friction_medium';
import { MODULE as decision_philosophy } from './decision_philosophy';
import { MODULE as pov_core } from './pov_core';
import { MODULE as memory_proposal } from './memory_proposal';
// Tool modules
import { MODULE as tool_resumes } from './tools/tool_resumes';
import { MODULE as tool_interview_prep } from './tools/tool_interview_prep';
import { MODULE as tool_linkedin } from './tools/tool_linkedin';
import { MODULE as tool_negotiations } from './tools/tool_negotiations';
import { MODULE as tool_networking } from './tools/tool_networking';
import { MODULE as tool_confidence } from './tools/tool_confidence';
import { MODULE as tool_jobseeker_ops } from './tools/tool_jobseeker_ops';

/**
 * Central registry - maps module ID to module object
 */
export const MODULE_REGISTRY: Record<string, PromptModule> = {
  core_identity,
  boundaries,
  voice_baseline,
  memory_behavior,
  memory_proposal,
  posture_calm_expert,
  posture_coach,
  posture_strategist,
  posture_operator,
  posture_companion,
  tempo_fast,
  tempo_normal,
  tempo_slow,
  friction_high,
  friction_medium,
  decision_philosophy,
  pov_core,
  tool_resumes,
  tool_interview_prep,
  tool_linkedin,
  tool_negotiations,
  tool_networking,
  tool_confidence,
  tool_jobseeker_ops,
};

/**
 * Get a single module by ID
 */
export function getModule(id: string): PromptModule | undefined {
  return MODULE_REGISTRY[id];
}

/**
 * Get multiple modules by IDs
 */
export function getModules(ids: string[]): PromptModule[] {
  return ids.map(id => getModule(id)).filter(Boolean) as PromptModule[];
}

/**
 * Validate that a module ID exists
 */
export function validateModuleId(id: string): boolean {
  return id in MODULE_REGISTRY;
}

/**
 * Get all module IDs
 */
export function getAllModuleIds(): string[] {
  return Object.keys(MODULE_REGISTRY);
}