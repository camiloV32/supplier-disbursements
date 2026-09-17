import { Badge } from '@/shared/components/badge';
import type { DisbursementStatus } from '../types/disbursement-request.type';

const STATUS_LABEL: Record<DisbursementStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

const STATUS_TONE: Record<
  DisbursementStatus,
  'pending' | 'approved' | 'rejected'
> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export function DisbursementStatusBadge({
  status,
}: {
  status: DisbursementStatus;
}) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
