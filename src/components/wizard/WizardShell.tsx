'use client';

import { useState, useCallback } from 'react';

interface WizardShellProps {
  sessionId: string;
  toolName: string;
  displayName: string;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepInstruction: string;
  inputType: string;
  inputLabel: string;
  inputPlaceholder?: string;
  onComplete: (artifact: string) => void;
  onExit: () => void;
}

export function WizardShell({
  sessionId,
  toolName: _toolName,
  displayName,
  currentStep,
  totalSteps,
  stepTitle,
  stepInstruction,
  inputType: _inputType,
  inputLabel,
  inputPlaceholder,
  onComplete,
  onExit
}: WizardShellProps) {
  const [input, setInput] = useState('');
  const [aiCoaching, setAiCoaching] = useState('');
  const [phase, setPhase] = useState<'input' | 'coaching' | 'approve' | 'addMore'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [allowAddMore, setAllowAddMore] = useState(false);
  const [localStep, setLocalStep] = useState(currentStep);
  const [stepData, setStepData] = useState({
    title: stepTitle,
    instruction: stepInstruction,
    placeholder: inputPlaceholder,
    label: inputLabel
  });

  const progress = Math.round((localStep / totalSteps) * 100);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/tools/wizard/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          stepNumber: localStep,
          userInput: input,
          action: 'submit'
        })
      });

      const data = await res.json();
      setAiCoaching(data.aiCoaching);
      setPhase('coaching');
    } catch (e) {
      console.error('Wizard step error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, localStep]);

  const handleApprove = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/tools/wizard/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          stepNumber: localStep,
          userInput: input,
          action: 'approve'
        })
      });

      const data = await res.json();

      if (data.isComplete && data.artifact) {
        onComplete(data.artifact);
        return;
      }

      if (data.allowAddMore) {
        setAllowAddMore(true);
        setPhase('addMore');
        return;
      }

      setLocalStep(data.currentStep);
      setStepData({
        title: data.step.title,
        instruction: data.step.instruction,
        placeholder: data.step.inputPlaceholder,
        label: data.step.inputLabel
      });
      setInput('');
      setAiCoaching('');
      setPhase('input');
      setAllowAddMore(false);
    } catch (e) {
      console.error('Wizard approve error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, localStep, input, onComplete]);

  const handleBack = useCallback(async () => {
    if (localStep === 0) {
      onExit();
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch('/api/tools/wizard/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          stepNumber: localStep,
          userInput: '',
          action: 'back'
        })
      });

      const data = await res.json();
      setLocalStep(data.currentStep);
      setStepData({
        title: data.step.title,
        instruction: data.step.instruction,
        placeholder: data.step.inputPlaceholder,
        label: data.step.inputLabel
      });
      setInput('');
      setAiCoaching('');
      setPhase('input');
    } catch (e) {
      console.error('Wizard back error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, localStep, onExit]);

  const handleAddAnotherRole = useCallback(() => {
    setInput('');
    setAiCoaching('');
    setPhase('input');
    setAllowAddMore(false);
  }, []);

  const handleAdvanceToEducation = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/wizard/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          stepNumber: localStep,
          userInput: '',
          action: 'advance'
        })
      });
      const data = await res.json();
      setLocalStep(data.currentStep);
      setStepData({
        title: data.step.title,
        instruction: data.step.instruction,
        placeholder: data.step.inputPlaceholder,
        label: data.step.inputLabel
      });
      setInput('');
      setAiCoaching('');
      setPhase('input');
      setAllowAddMore(false);
    } catch (e) {
      console.error('Wizard advance error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, localStep]);

  const Spinner = () => (
    <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );

  const stripMarkers = (text: string) =>
    text
      .replace(/---APPROVED_CONTENT---/g, '')
      .replace(/---END---/g, '')
      .replace(/\*\*APPROVED_CONTENT\*\*/g, '')
      .replace(/\*\*END\*\*/g, '')
      .trim();

  const extractApprovedForEdit = (coaching: string): string => {
    const match = coaching.match(/---APPROVED_CONTENT---\s*\n([\s\S]*?)\n---END---/);
    return match ? match[1].trim() : stripMarkers(coaching);
  };

  const cleanedCoaching = stripMarkers(aiCoaching);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto max-h-[calc(100vh-200px)] rounded-xl border border-zinc-700/50 bg-zinc-900/80 p-3 sm:p-5 my-2">
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{displayName}</span>
          <h3 className="text-sm font-semibold text-white mt-0.5">Step {localStep + 1} of {totalSteps}: {stepData.title}</h3>
        </div>
        <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-xs self-start sm:self-auto shrink-0">Exit wizard</button>
      </div>

      <div className="shrink-0 h-1.5 w-full rounded-full bg-zinc-800 mt-4">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mt-4">
        {phase === 'input' && (
          <>
            <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {stepData.instruction}
            </div>
            <div className="mt-4">
              <label className="text-xs text-zinc-400 mb-1.5 block">{stepData.label}</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={stepData.placeholder || ''}
                rows={4}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-green-500 focus:outline-none resize-none"
              />
            </div>
          </>
        )}

        {(phase === 'coaching' || phase === 'addMore') && (
          <div className="w-full rounded-lg border border-[#16a34a]/30 bg-green-950/20 p-3 sm:p-4">
            <p className="text-xs font-medium text-green-500 mb-2">Melissa&apos;s coaching:</p>
            <div className="text-sm sm:text-base text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[40vh] overflow-y-auto">{cleanedCoaching}</div>
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-between pt-4 mt-4 border-t border-zinc-700/50">
        {phase === 'input' && (
          <>
            <button
              onClick={handleBack}
              className="text-sm text-zinc-500 hover:text-zinc-300 px-3 py-1.5 self-start sm:self-auto"
            >
              ← {localStep === 0 ? 'Exit' : 'Back'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed sm:ml-auto"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  1Yes is working...
                </>
              ) : (
                'Submit →'
              )}
            </button>
          </>
        )}
        {phase === 'addMore' && (
          <>
            <button
              onClick={handleAddAnotherRole}
              disabled={isLoading}
              className="w-full sm:w-auto rounded-lg border-2 border-green-600 bg-transparent px-4 py-2.5 text-sm font-medium text-green-500 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Add another role
            </button>
            <button
              onClick={handleAdvanceToEducation}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  1Yes is working...
                </>
              ) : (
                'Move to Education →'
              )}
            </button>
          </>
        )}
        {phase === 'coaching' && (
          <>
            <button
              onClick={() => {
                setInput(extractApprovedForEdit(aiCoaching));
                setPhase('input');
                setAiCoaching('');
              }}
              className="w-full sm:w-auto rounded-lg border-2 border-green-600 bg-transparent px-4 py-2.5 text-sm font-medium text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              ← Edit this version
            </button>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  1Yes is working...
                </>
              ) : (
                `Looks good → Step ${localStep + 2 <= totalSteps ? localStep + 2 : 'Finish'}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
