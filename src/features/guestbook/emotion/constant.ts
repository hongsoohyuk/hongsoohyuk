import {EmotionCode} from '../model/type';

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
