import { useInfiniteQuery } from '@tanstack/react-query';
import { listDisbursementRequests } from '../api/disbursements.api';
import type { DisbursementStatus } from '../types/disbursement-request.type';

export const DISBURSEMENT_REQUESTS_QUERY_KEY = [
  'disbursement-requests',
] as const;

// RF7: status changes made in another session must show up here within ~10s without a
// full reload. There's no push channel (WebSocket/SSE) yet, so this polls on an interval
// comfortably under that budget. React Query pauses it while the tab is in the background
// and catches up via refetch-on-focus, so it doesn't poll a tab nobody is looking at.
const POLL_INTERVAL_MS = 5000;
const PAGE_SIZE = 20;

export function useDisbursementRequests(filters: {
  status?: DisbursementStatus;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: [...DISBURSEMENT_REQUESTS_QUERY_KEY, filters],
    queryFn: ({ pageParam }) =>
      listDisbursementRequests({
        ...filters,
        cursor: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
