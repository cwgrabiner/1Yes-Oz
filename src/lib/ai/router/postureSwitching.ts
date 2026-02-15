/**
 * Posture Switching Rules
 * Determines which posture to use based on detected signals
 */

import type { Signals, RouterState, Posture, Priority, FrictionLevel, UserEnergy } from './types';

/**
 * Determines the appropriate posture, priority, friction, and energy
 * based on detected signals and previous state
 */
export function determinePosture(signals: Signals, prevState: RouterState): {
  posture: Posture;
  priority: Priority;
  friction: FrictionLevel;
  user_energy: UserEnergy;
} {
  // RULE 1: Distress → Companion first
  // Stabilize before moving to action
  if (signals.distress) {
    return {
      posture: "companion",
      priority: "reduce_stress",
      friction: "low",
      user_energy: "low"
    };
  }

  // RULE 2: High urgency or ready to act → Operator
  // Exception: extreme distress (handled above)
  if (signals.urgencyHigh || signals.readyToAct) {
    return {
      posture: "operator",
      priority: "move_now",
      friction: "low",
      user_energy: prevState.user_energy === "low" ? "neutral" : prevState.user_energy
    };
  }

  // RULE 3: Decision request → Strategist
  if (signals.decisionAsk) {
    return {
      posture: "strategist",
      priority: "decide",
      friction: "medium",
      user_energy: "neutral"
    };
  }

  // RULE 4: Teaching request → Coach
  if (signals.teachAsk) {
    return {
      posture: "coach",
      priority: "teach",
      friction: "medium",
      user_energy: "neutral"
    };
  }

  // RULE 5: Overwhelm → Strategist with high friction
  // Force clarity before action
  if (signals.overwhelm) {
    return {
      posture: "strategist",
      priority: "increase_odds",
      friction: "high",
      user_energy: "neutral"
    };
  }

  // RULE 6: Default → Calm Expert
  // Steady, knowledgeable, balanced
  return {
    posture: "calm_expert",
    priority: "increase_odds",
    friction: "medium",
    user_energy: prevState.user_energy || "neutral"
  };
}