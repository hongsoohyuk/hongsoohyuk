export type EmotionCode = 'LIKE' | 'INSPIRATION' | 'NICE' | 'HELLO' | 'FUN' | 'THANK';
export type Emotion = {code: EmotionCode; emoji: string};
export type EmotionOption = Emotion & {label: string};

export const BASE_EMOTIONS = [
  {code: 'LIKE', emoji: '🖤'},
  {code: 'INSPIRATION', emoji: '🌊'},
  {code: 'NICE', emoji: '✨'},
  {code: 'HELLO', emoji: '👻'},
  {code: 'FUN', emoji: '🎉'},
  {code: 'THANK', emoji: '😀'},
] as const;

export const EMOTION_LABEL_KEYS: Record<EmotionCode, string> = {
  LIKE: 'like.label',
  INSPIRATION: 'inspiration.label',
  NICE: 'nice.label',
  HELLO: 'hello.label',
  FUN: 'fun.label',
  THANK: 'thank.label',
} as const;

export const EMOTION_SET: ReadonlySet<EmotionCode> = new Set(BASE_EMOTIONS.map((emotion) => emotion.code));

export const MAX_EMOTIONS = 2;

export function normalizeGuestbookEmotions(emotions: unknown[], limit = 2): EmotionCode[] {
  const normalized: EmotionCode[] = [];
  const seen = new Set<EmotionCode>();

  for (const emotion of emotions) {
    const code = String(emotion).toUpperCase() as EmotionCode;
    if (!EMOTION_SET.has(code) || seen.has(code)) continue;

    normalized.push(code);
    seen.add(code);
    if (normalized.length >= limit) break;
  }

  return normalized;
}

export function toggleEmotion(current: EmotionCode[], next: EmotionCode): EmotionCode[] {
  if (current.includes(next)) return current.filter((e) => e !== next);

  if (current.length >= MAX_EMOTIONS) return current;

  return [...current, next];
}

export function isValidEmotionSet(emotions: readonly EmotionCode[]): boolean {
  const unique = new Set(emotions);
  return unique.size === emotions.length && emotions.length <= MAX_EMOTIONS;
}
