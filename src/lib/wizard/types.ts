export type WizardStepInputType = 'textarea' | 'text' | 'select' | 'multiselect';

export interface WizardStep {
  stepNumber: number;
  title: string;
  instruction: string;        // What Melissa tells the user to do
  inputType: WizardStepInputType;
  inputPlaceholder?: string;
  inputLabel: string;
  systemPromptFragment: string; // Injected into assembler for this step
}

export interface WizardDefinition {
  toolName: string;
  displayName: string;
  totalSteps: number;
  steps: WizardStep[];
}

export interface WizardStepResult {
  stepNumber: number;
  userInput: string;
  aiCoaching: string;         // AI feedback on this step
  finalOutput: string;        // Approved output for this step (after AI coaching)
  approved: boolean;
}

export interface WizardSessionState {
  sessionId: string;
  toolName: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: WizardStepResult[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface WizardStartRequest {
  toolName: string;
  initialContext?: string;    // Optional: user-provided context (e.g., pasted resume)
}

export interface WizardStepRequest {
  sessionId: string;
  stepNumber: number;
  userInput: string;
  action: 'submit' | 'approve' | 'back';
}

export interface WizardStepResponse {
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  aiCoaching: string;
  isComplete: boolean;
  artifact?: string;          // Only on final step when complete
}
