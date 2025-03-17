'use client';

import {Badge} from '@/components/ui/badge';

import {useEmotionEnum} from '../emotion';
import type {EmotionCode} from '../emotion/type';

export function EmotionBadges({emotions}: {emotions: EmotionCode[]}) {
  const {getLabel, getEmoji} = useEmotionEnum();

  return emotions.map((emotion) => (
    <Badge key={emotion} variant="secondary" className="gap-1 shrink-0">
      {getEmoji(emotion)} {getLabel(emotion)}
    </Badge>
  ));
}
