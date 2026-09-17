import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '@/app/app-shell';
import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { TextField } from '@/shared/components/text-field';
import { SupplierSelect } from '@/modules/suppliers/components/supplier-select';
import type { Supplier } from '@/modules/suppliers/types/supplier.type';
import { createDisbursementRequest } from '../api/disbursements.api';
import { DISBURSEMENT_REQUESTS_QUERY_KEY } from '../hooks/use-disbursement-requests';

const CURRENCIES = ['COP', 'USD', 'EUR', 'MXN'];

type FormValues = {
  externalReference: string;
  amount: number;
  currency: string;
  concept: string;
};

export function CreateDisbursementRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { currency: CURRENCIES[0] } });

  const mutation = useMutation({
    mutationFn: createDisbursementRequest,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: DISBURSEMENT_REQUESTS_QUERY_KEY,
      });
      navigate(`/disbursement-requests/${result.id}`, { replace: true });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!supplier) {
      setSupplierError('Seleccioná un proveedor');
      return;
    }
    setSupplierError(null);

    try {
      await mutation.mutateAsync({
        supplierId: supplier.id,
        externalReference: values.externalReference,
        amount: Number(values.amount),
        currency: values.currency,
        concept: values.concept,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setSubmitError(
          'Ya existe una solicitud con esa referencia para este proveedor, con datos distintos.',
        );
      } else if (isAxiosError(error) && error.response?.status === 404) {
        setSubmitError('El proveedor seleccionado ya no existe.');
      } else {
        setSubmitError(
          'No se pudo registrar la solicitud. Intentá nuevamente.',
        );
      }
    }
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <Link
          to="/disbursement-requests"
          className="text-sm text-primary-600 hover:underline"
        >
          ← Volver al listado
        </Link>

        <Card className="mt-4">
          <h1 className="text-lg font-semibold text-slate-900">
            Nueva solicitud de desembolso
          </h1>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            <SupplierSelect
              label="Proveedor"
              value={supplier}
              onChange={(next) => {
                setSupplier(next);
                setSupplierError(null);
              }}
              error={supplierError ?? undefined}
            />

            <TextField
              label="Referencia externa"
              error={
                errors.externalReference
                  ? 'La referencia es obligatoria'
                  : undefined
              }
              {...register('externalReference', {
                required: true,
                maxLength: 100,
              })}
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Monto"
                type="number"
                step="0.01"
                min="0.01"
                error={errors.amount ? 'Ingresá un monto válido' : undefined}
                {...register('amount', {
                  required: true,
                  valueAsNumber: true,
                  min: 0.01,
                })}
              />

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="currency"
                >
                  Moneda
                </label>
                <select
                  id="currency"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
                  {...register('currency', { required: true })}
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="concept"
              >
                Concepto
              </label>
              <textarea
                id="concept"
                rows={3}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-primary-500/30 ${
                  errors.concept
                    ? 'border-status-rejected focus:border-status-rejected'
                    : 'border-slate-300 focus:border-primary-500'
                }`}
                {...register('concept', { required: true, maxLength: 500 })}
              />
              {errors.concept && (
                <p className="text-sm text-status-rejected">
                  El concepto es obligatorio (máx. 500 caracteres)
                </p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-status-rejected">
                {submitError}
              </p>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting || mutation.isPending}
              className="mt-2"
            >
              {mutation.isPending ? 'Guardando...' : 'Registrar solicitud'}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
