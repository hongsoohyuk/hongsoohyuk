export const BASE_EMOTIONS = [
  {code: 'LIKE', emoji: '🖤'},
  {code: 'INSPIRATION', emoji: '🌊'},
  {code: 'NICE', emoji: '✨'},
  {code: 'HELLO', emoji: '👻'},
  {code: 'FUN', emoji: '🎉'},
  {code: 'THANK', emoji: '😀'},
] as const;

export type Emotion = (typeof BASE_EMOTIONS)[number];
export type EmotionCode = Emotion['code'];
export type EmotionOption = Emotion & {label: string};

export const EMOTION_SET: ReadonlySet<EmotionCode> = new Set(BASE_EMOTIONS.map((emotion) => emotion.code));

export const EMOTION_MAP: Record<EmotionCode, Emotion> = BASE_EMOTIONS.reduce(
  (acc, emotion) => {
    acc[emotion.code] = emotion;
    return acc;
  },
  {} as Record<EmotionCode, Emotion>,
);

export const EMOTION_LABEL_KEYS: Record<EmotionCode, string> = {
  LIKE: 'emotions.LIKE.label',
  INSPIRATION: 'emotions.INSPIRATION.label',
  NICE: 'emotions.NICE.label',
  HELLO: 'emotions.HELLO.label',
  FUN: 'emotions.FUN.label',
  THANK: 'emotions.THANK.label',
} as const;

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
