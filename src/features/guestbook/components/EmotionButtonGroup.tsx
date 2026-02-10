'use client';

import {useState} from 'react';

import {useEmotionEnum, type EmotionCode} from '../emotion';

import {EmotionButton} from './EmotionButton';

type Props = {
  name?: string;
  maxSelected?: number;
  disabled?: boolean;
  onMaxSelected?: (current: EmotionCode[]) => void;
};

export function EmotionButtonGroup({name = 'emotions', maxSelected = 2, disabled, onMaxSelected}: Props) {
  const [selected, setSelected] = useState<EmotionCode[]>([]);

  const {options} = useEmotionEnum();

  const handleToggle = (code: EmotionCode) => {
    if (disabled) return;
    const isSelected = selected.includes(code);
    if (isSelected) {
      setSelected((prev) => prev.filter((item) => item !== code));
      return;
    }

    if (selected.length >= maxSelected) {
      onMaxSelected?.(selected);
      return;
    }

    setSelected((prev) => [...prev, code]);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {selected.map((code) => (
        <input key={code} type="hidden" name={name} value={code} />
      ))}
      {options.map((option) => (
        <EmotionButton
          key={option.code}
          option={option}
          isSelected={selected.includes(option.code)}
          disabled={disabled}
          onToggle={() => handleToggle(option.code)}
        />
      ))}
    </div>
  );
}
