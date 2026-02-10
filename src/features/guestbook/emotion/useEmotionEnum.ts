import {useTranslations} from 'next-intl';

import {BASE_EMOTIONS, EMOTION_LABEL_KEYS} from './constant';
import {EmotionCode, EmotionOption} from './type';

export function useEmotionEnum() {
  const t = useTranslations('Emotion');

  const options: EmotionOption[] = BASE_EMOTIONS.map((emotion) => ({
    code: emotion.code,
    emoji: emotion.emoji,
    label: t(EMOTION_LABEL_KEYS[emotion.code]),
  }));

  const getEmoji = (code: EmotionCode) => {
    return BASE_EMOTIONS.find((emotion) => emotion.code === code)?.emoji;
  };
  const getLabel = (code: EmotionCode) => {
    return t(EMOTION_LABEL_KEYS[code]);
  };
  return {
    getEmoji,
    getLabel,
    options,
  };
}
