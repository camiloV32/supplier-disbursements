import type { ReactNode } from 'react';

type BadgeTone = 'pending' | 'approved' | 'rejected' | 'neutral';

const toneClasses: Record<BadgeTone, string> = {
  pending: 'bg-status-pending-bg text-status-pending',
  approved: 'bg-status-approved-bg text-status-approved',
  rejected: 'bg-status-rejected-bg text-status-rejected',
  neutral: 'bg-slate-100 text-slate-600',
};

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
