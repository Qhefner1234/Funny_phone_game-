import {SCENARIOS, TOTAL_ROUNDS} from '../data/scenarios';

export const INITIAL_STATE = {
  gold: 5,
  army: 5,
  happiness: 5,
  reputation: 5,
};

export const MAX_STAT = 10;
export const MIN_STAT = 0;

export function clamp(value) {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, value));
}

export function applyEffects(stats, effects) {
  return {
    gold: clamp(stats.gold + effects.gold),
    army: clamp(stats.army + effects.army),
    happiness: clamp(stats.happiness + effects.happiness),
    reputation: clamp(stats.reputation + effects.reputation),
  };
}

export function getRandomScenarios(count = TOTAL_ROUNDS) {
  const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculateScore(stats) {
  return stats.gold + stats.army + stats.happiness + stats.reputation;
}

export function getRating(score) {
  const max = MAX_STAT * 4;
  const pct = (score / max) * 100;
  if (pct >= 85) return {label: 'Supreme Overlord', emoji: '👑'};
  if (pct >= 70) return {label: 'Competent Ruler', emoji: '🏰'};
  if (pct >= 50) return {label: 'Mediocre Monarch', emoji: '🤷'};
  if (pct >= 30) return {label: 'Questionable Leader', emoji: '😬'};
  return {label: 'Legendary Disaster', emoji: '🔥'};
}
