import {EmotionCode} from './type';

export const MAX_EMOTIONS = 2;

export function toggleEmotion(current: EmotionCode[], next: EmotionCode): EmotionCode[] {
  if (current.includes(next)) return current.filter((e) => e !== next);

  if (current.length >= MAX_EMOTIONS) return current;

  return [...current, next];
}

export function isValidEmotionSet(emotions: readonly EmotionCode[]): boolean {
  const unique = new Set(emotions);
  return unique.size === emotions.length && emotions.length <= MAX_EMOTIONS;
}
