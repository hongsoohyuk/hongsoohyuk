// dataviz 검증 완료 팔레트 (light/dark 각각 CVD·명도·채도 체크 통과) — 순서 변경 금지
// Tailwind JIT 추출을 위해 완성형 정적 클래스 문자열만 사용 (런타임 조립 금지)
export const SERIES_STROKE_CLASSES = [
  'stroke-[#2a78d6] dark:stroke-[#3987e5]',
  'stroke-[#008300] dark:stroke-[#008300]',
  'stroke-[#e87ba4] dark:stroke-[#d55181]',
  'stroke-[#eda100] dark:stroke-[#c98500]',
  'stroke-[#1baf7a] dark:stroke-[#199e70]',
];

export const SERIES_SWATCH_CLASSES = [
  'bg-[#2a78d6] dark:bg-[#3987e5]',
  'bg-[#008300] dark:bg-[#008300]',
  'bg-[#e87ba4] dark:bg-[#d55181]',
  'bg-[#eda100] dark:bg-[#c98500]',
  'bg-[#1baf7a] dark:bg-[#199e70]',
];

// 시퀀셜(히트맵)·스파크라인은 슬롯1 단일 색 + opacity 램프
export const HEAT_CELL_CLASS = 'bg-[#2a78d6] dark:bg-[#3987e5]';
export const SPARK_STROKE_CLASS = 'stroke-[#2a78d6] dark:stroke-[#3987e5]';
