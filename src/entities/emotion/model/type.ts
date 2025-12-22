import {EMOTION_SET} from '../config/constant';

export type EmotionCode = 'LIKE' | 'INSPIRATION' | 'NICE' | 'HELLO' | 'FUN' | 'THANK';
export type Emotion = {code: EmotionCode; emoji: string};
export type EmotionOption = Emotion & {label: string};

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
