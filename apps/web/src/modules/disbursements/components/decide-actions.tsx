import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/button';
import { decideDisbursementRequest } from '../api/disbursements.api';
import { DISBURSEMENT_REQUESTS_QUERY_KEY } from '../hooks/use-disbursement-requests';
import type { DecisionType } from '../types/disbursement-request.type';

type DecideActionsProps = {
  requestId: string;
};

export function DecideActions({ requestId }: DecideActionsProps) {
  const queryClient = useQueryClient();
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { decision: DecisionType; reason?: string }) =>
      decideDisbursementRequest(requestId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['disbursement-requests', 'detail', requestId],
        }),
        queryClient.invalidateQueries({
          queryKey: DISBURSEMENT_REQUESTS_QUERY_KEY,
        }),
      ]);
      setIsRejecting(false);
      setReason('');
    },
  });

  const handleError = (error: unknown) => {
    // RF6: lost the concurrency race — another session already decided this
    // request between our page load and this click. Surface it and let the
    // invalidated queries above (or the next poll) bring the real status in.
    if (isAxiosError(error) && error.response?.status === 409) {
      setFormError('Esta solicitud ya fue decidida desde otra sesión.');
      return;
    }

    setFormError('No se pudo registrar la decisión. Intentá nuevamente.');
  };

  const approve = () => {
    setFormError(null);
    mutation.mutate({ decision: 'APPROVED' }, { onError: handleError });
  };

  const submitRejection = () => {
    setFormError(null);
    mutation.mutate({ decision: 'REJECTED', reason }, { onError: handleError });
  };

  if (isRejecting) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
        <label
          htmlFor="reject-reason"
          className="text-sm font-medium text-slate-700"
        >
          Razón del rechazo
        </label>
        <textarea
          id="reject-reason"
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
        />

        {formError && (
          <p role="alert" className="text-sm text-status-rejected">
            {formError}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={submitRejection}
            isLoading={mutation.isPending}
            disabled={reason.trim().length === 0}
          >
            Confirmar rechazo
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setIsRejecting(false);
              setReason('');
              setFormError(null);
            }}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {formError && (
        <p role="alert" className="text-sm text-status-rejected">
          {formError}
        </p>
      )}
      <div className="flex gap-3">
        <Button onClick={approve} isLoading={mutation.isPending}>
          Aprobar
        </Button>
        <Button
          variant="danger"
          onClick={() => setIsRejecting(true)}
          disabled={mutation.isPending}
        >
          Rechazar
        </Button>
      </div>
    </div>
  );
}
