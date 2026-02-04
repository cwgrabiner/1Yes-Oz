export type HomeChip = {
  id: string;
  text: string;
  toolName?: string;
};

export type HomeChipCategory = {
  general: HomeChip[];
  jobSearch: HomeChip[];
  tools: HomeChip[];
};

export const HOME_CHIP_CATEGORIES: HomeChipCategory = {
  general: [
    { id: "general-1", text: "Teach me how to use 1Yes" },
    { id: "general-2", text: "I'm not sure where to start" },
    { id: "general-3", text: "I'm stuck and need a reset" },
    { id: "general-4", text: "Help me figure out my next step" },
    { id: "general-5", text: "I need to write something important" },
    { id: "general-6", text: "I want to talk things through" },
    { id: "general-7", text: "Help me decide what to do next" },
    { id: "general-8", text: "I don't know what to focus on" },
  ],
  jobSearch: [
    { id: "jobSearch-1", text: "Help me prepare for a tough conversation at work" },
    { id: "jobSearch-2", text: "I want to think through a career change" },
    { id: "jobSearch-3", text: "I'm not getting responses - what should I change?" },
    { id: "jobSearch-4", text: "I need help positioning myself" },
    { id: "jobSearch-5", text: "I'm not sure which roles to target" },
    { id: "jobSearch-6", text: "How can I optimize my annual review?" },
    { id: "jobSearch-7", text: "I want to grow in my current role" },
  ],
  tools: [
    { id: "tools-1", text: "Help me improve my resume", toolName: "resume" },
    { id: "tools-2", text: "Help me prepare for an interview", toolName: "interview" },
    { id: "tools-3", text: "I need help with LinkedIn", toolName: "linkedin" },
    { id: "tools-4", text: "I have an offer/salary question", toolName: "salary" },
    { id: "tools-5", text: "I need a confidence boost", toolName: "confidence" },
    { id: "tools-6", text: "Help me plan job search strategy", toolName: "job-search" },
    { id: "tools-7", text: "Looking for networking advice", toolName: "networking" },
  ],
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns one randomly selected chip from each category in order: [general, jobSearch, tools].
 */
export function getRandomChipSet(): [HomeChip, HomeChip, HomeChip] {
  const general = shuffle(HOME_CHIP_CATEGORIES.general)[0];
  const jobSearch = shuffle(HOME_CHIP_CATEGORIES.jobSearch)[0];
  const tools = shuffle(HOME_CHIP_CATEGORIES.tools)[0];
  return [general, jobSearch, tools];
}
