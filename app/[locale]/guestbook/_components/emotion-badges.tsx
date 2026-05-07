'use client';

import {Badge} from '@/components/ui/badge';

import {useEmotionEnum} from '../_lib/use-emotion-enum';
import type {EmotionCode} from '../_lib/emotion';

export function EmotionBadges({emotions}: {emotions: EmotionCode[]}) {
  const {getLabel, getEmoji} = useEmotionEnum();

  return emotions.map((emotion) => (
    <Badge key={emotion} variant="secondary" className="gap-1 shrink-0">
      {getEmoji(emotion)} {getLabel(emotion)}
    </Badge>
  ));
}
