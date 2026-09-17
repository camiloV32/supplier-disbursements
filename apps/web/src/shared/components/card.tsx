import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-surface p-6 shadow-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
