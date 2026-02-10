import React from 'react';

type EnumType = {[key: string]: string | number};
type EnumValue<T> = T[keyof T];

type CaseRendererProps<T extends string | number | boolean | EnumValue<EnumType>> = {
  value: T;
  cases: {[K in T extends boolean ? `${T}` : T]: React.ReactNode};
  defaultComponent?: React.ReactNode;
};

const CaseRenderer = <T extends string | number | boolean | EnumValue<EnumType>>(props: CaseRendererProps<T>) =>
  (props.cases[props.value] ?? props.defaultComponent ?? null) as React.ReactElement;

export default CaseRenderer;
