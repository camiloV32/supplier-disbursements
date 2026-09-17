import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '@/app/app-shell';
import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { TextField } from '@/shared/components/text-field';
import { useHasRole } from '@/modules/iam/hooks/use-has-role';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import { useDisbursementRequests } from '../hooks/use-disbursement-requests';
import { DisbursementStatusBadge } from '../components/status-badge';
import type { DisbursementStatus } from '../types/disbursement-request.type';

const STATUS_OPTIONS: Array<{ value: DisbursementStatus | ''; label: string }> =
  [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'APPROVED', label: 'Aprobada' },
    { value: 'REJECTED', label: 'Rechazada' },
  ];

export function DisbursementRequestsListPage() {
  const navigate = useNavigate();
  const isAnalyst = useHasRole('ANALYST');
  const [status, setStatus] = useState<DisbursementStatus | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDisbursementRequests({
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-slate-900">
            Solicitudes de desembolso
          </h1>

          {isAnalyst && (
            <Button onClick={() => navigate('/disbursement-requests/new')}>
              Nueva solicitud
            </Button>
          )}
        </div>

        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="w-full max-w-xs">
              <TextField
                label="Buscar"
                placeholder="Proveedor o referencia..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="status-filter"
                className="text-sm font-medium text-slate-700"
              >
                Estado
              </label>
              <select
                id="status-filter"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as DisbursementStatus | '')
                }
                className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          {isLoading && (
            <p className="text-sm text-slate-500">Cargando solicitudes...</p>
          )}

          {isError && (
            <div className="flex flex-col items-start gap-3">
              <p role="alert" className="text-sm text-status-rejected">
                No se pudo cargar el listado.
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <p className="text-sm text-slate-500">
              No se encontraron solicitudes.
            </p>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Fecha</th>
                    <th className="py-2 pr-4 font-medium">Proveedor</th>
                    <th className="py-2 pr-4 font-medium">Referencia</th>
                    <th className="py-2 pr-4 font-medium">Monto</th>
                    <th className="py-2 pr-4 font-medium">Estado</th>
                    <th className="py-2 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 text-slate-600">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-900">
                          {item.supplier.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.supplier.taxId}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {item.externalReference}
                      </td>
                      <td className="py-3 pr-4 text-slate-900">
                        {formatCurrency(item.amount, item.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        <DisbursementStatusBadge status={item.status} />
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Link
                          to={`/disbursement-requests/${item.id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {hasNextPage && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="secondary"
                    isLoading={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                  >
                    Cargar más
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
