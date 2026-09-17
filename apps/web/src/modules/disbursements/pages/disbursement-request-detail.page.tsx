import { isAxiosError } from 'axios';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '@/app/app-shell';
import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import { useHasRole } from '@/modules/iam/hooks/use-has-role';
import { useDisbursementRequest } from '../hooks/use-disbursement-request';
import { DisbursementStatusBadge } from '../components/status-badge';
import { DecideActions } from '../components/decide-actions';

export function DisbursementRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useDisbursementRequest(
    id ?? '',
  );
  const isSupervisor = useHasRole('SUPERVISOR');

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Link
          to="/disbursement-requests"
          className="text-sm text-primary-600 hover:underline"
        >
          ← Volver al listado
        </Link>

        <Card className="mt-4">
          {isLoading && (
            <p className="text-sm text-slate-500">Cargando solicitud...</p>
          )}

          {isError && (
            <div className="flex flex-col items-start gap-3">
              <p role="alert" className="text-sm text-status-rejected">
                {isAxiosError(error) && error.response?.status === 404
                  ? 'Esta solicitud no existe.'
                  : 'No se pudo cargar la solicitud.'}
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {data && (
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    {data.externalReference}
                  </h1>
                  <p className="text-sm text-slate-500">
                    Creada el {formatDateTime(data.createdAt)}
                  </p>
                </div>
                <DisbursementStatusBadge status={data.status} />
              </div>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-400">
                    Proveedor
                  </dt>
                  <dd className="text-sm text-slate-900">
                    {data.supplier.name}
                  </dd>
                  <dd className="text-xs text-slate-500">
                    {data.supplier.taxId}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase text-slate-400">
                    Monto
                  </dt>
                  <dd className="text-sm text-slate-900">
                    {formatCurrency(data.amount, data.currency)}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase text-slate-400">
                    Concepto
                  </dt>
                  <dd className="whitespace-pre-wrap text-sm text-slate-900">
                    {data.concept}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase text-slate-400">
                    Última actualización
                  </dt>
                  <dd className="text-sm text-slate-900">
                    {formatDateTime(data.updatedAt)}
                  </dd>
                </div>
              </dl>

              {data.decision && (
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Decisión
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    Decidida el {formatDateTime(data.decision.decidedAt)}
                  </p>
                  {data.decision.reason && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      <span className="font-medium">Razón: </span>
                      {data.decision.reason}
                    </p>
                  )}
                </div>
              )}

              {isSupervisor && data.status === 'PENDING' && (
                <DecideActions requestId={data.id} />
              )}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
