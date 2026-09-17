import { useQuery } from '@tanstack/react-query';
import { getDisbursementRequest } from '../api/disbursements.api';

const POLL_INTERVAL_MS = 5000;

export function useDisbursementRequest(id: string) {
  return useQuery({
    queryKey: ['disbursement-requests', 'detail', id],
    queryFn: () => getDisbursementRequest(id),
    enabled: Boolean(id),
    refetchInterval: POLL_INTERVAL_MS,
  });
}
