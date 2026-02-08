import type {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function CliLayout({children}: Props) {
  return <div className="fixed inset-0 z-50 bg-neutral-950">{children}</div>;
}
