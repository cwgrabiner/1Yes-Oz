/**
 * Signal Detection
 * Analyzes user input to detect emotional state, intent, domain, and stage
 */

import type { Signals, Domain, Stage } from './types';

/**
 * Detects signals in user text
 * Returns boolean flags for various states and intents
 */
export function detectSignals(text: string): Signals {
  const normalized = text.trim().toLowerCase();
  
  // Helper: Check if any word from array appears in text
  const hasAny = (words: string[]) => 
    words.some(w => normalized.includes(w));

  // EMOTIONAL STATE SIGNALS
  const distress = hasAny([
    "burnt out", "burned out", "hopeless", "panic", "panicking",
    "anxious", "overwhelmed", "i can't", "can't do this", "stuck",
    "giving up", "want to quit", "so stressed", "breaking down",
    "freaking out", "scared", "terrified"
  ]);

  const overwhelm = hasAny([
    "everything", "all of it", "don't know where to start",
    "too much", "so many", "all these options", "paralyzed",
    "can't decide", "too many choices"
  ]);

  // ACTION SIGNALS
  const readyToAct = hasAny([
    "help me write", "rewrite", "draft", "send", "apply", "submit",
    "today", "tomorrow", "in an hour", "asap", "right now",
    "need to send", "deadline", "interview tomorrow", "due"
  ]);

  // QUESTION TYPE SIGNALS
  const decisionAsk = hasAny([
    "should i", "which one", "choose", "decision", "take the offer",
    "accept", "counter", "negotiate", "pivot", "or", "vs", "versus",
    "can't decide", "help me decide"
  ]);

  const teachAsk = hasAny([
    "teach me", "how do i", "how can i", "explain", "why",
    "what is", "help me understand", "walk me through",
    "show me how", "learn"
  ]);

  // URGENCY SIGNALS
  const urgencyHigh = hasAny([
    "in an hour", "today", "tonight", "tomorrow", "asap",
    "deadline", "interview tomorrow", "offer expires", "right now",
    "immediately", "urgent"
  ]);

  const urgencyMedium = !urgencyHigh && hasAny([
    "this week", "soon", "in a few days", "next week", "coming up",
    "upcoming"
  ]);

  // DOMAIN DETECTION
  const domainHits: Signals["domainHits"] = {
    resume: hasAny([
      "resume", "bullet", "bullets", "ats", "experience", "cv", 
      "work history", "accomplishment", "quantify"
    ]),
    linkedin: hasAny([
      "linkedin", "headline", "about", "profile", "banner", 
      "summary", "about section"
    ]),
    networking: hasAny([
      "network", "networking", "referral", "reach out", "message", 
      "coffee chat", "informational", "cold email", "outreach"
    ]),
    interview: hasAny([
      "interview", "interviewing", "recruiter screen", "hiring manager", 
      "tell me about yourself", "star", "behavioral", "phone screen",
      "onsite", "final round"
    ]),
    negotiation: hasAny([
      "salary", "offer", "negotiate", "negotiating", "comp", "equity", 
      "counter", "package", "compensation", "stock options"
    ]),
    confidence: distress || hasAny([
      "confidence", "imposter", "impostor", "self-doubt", 
      "not good enough", "feel like a fraud"
    ]),
  };

  // STAGE DETECTION
  const stageHints: Signals["stageHints"] = {
    applying: hasAny([
      "applying", "applications", "apply", "job search", 
      "looking for", "searching for"
    ]),
    interviewing: hasAny([
      "interview", "interviewing", "screen", "screening", 
      "round", "onsite"
    ]),
    negotiating: hasAny([
      "offer", "negotiate", "negotiating", "counter", 
      "compensation", "accepted"
    ]),
    pivoting: hasAny([
      "career change", "switch industry", "pivot", "transition",
      "changing careers"
    ]),
    stuck: hasAny([
      "stuck", "can't start", "haven't applied", "havent applied", 
      "no progress", "not getting anywhere"
    ]),
  };

  return {
    distress,
    readyToAct,
    decisionAsk,
    teachAsk,
    overwhelm,
    urgencyHigh,
    urgencyMedium,
    domainHits,
    stageHints,
  };
}