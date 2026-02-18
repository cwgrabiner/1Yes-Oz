import { RESUME_WIZARD } from './definitions/resume';
import type { WizardDefinition } from './types';

export const WIZARD_REGISTRY: Record<string, WizardDefinition> = {
  resumes: RESUME_WIZARD,
  // Future: interview_prep, networking, negotiations, linkedin_presence, confidence_builder, jobseeker_operations
};

export function getWizard(toolName: string): WizardDefinition | undefined {
  return WIZARD_REGISTRY[toolName];
}

export function hasWizard(toolName: string): boolean {
  return toolName in WIZARD_REGISTRY;
}

export function getWizardDisplayName(toolName: string): string {
  const names: Record<string, string> = {
    resumes: 'Résumé Makeover',
    interview_prep: 'Interview Prep',
    networking: 'Networking Strategy',
    negotiations: 'Salary Negotiation',
    linkedin_presence: 'LinkedIn Presence',
    confidence_builder: 'Confidence Builder',
    jobseeker_operations: 'Job Search Strategy'
  };
  return names[toolName] || toolName;
}
