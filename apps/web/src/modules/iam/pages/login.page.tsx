import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/use-auth';
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { TextField } from '@/shared/components/text-field';

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      await login(values.email, values.password);
      navigate('/', { replace: true });
    } catch {
      setFormError('Credenciales inválidas');
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-app-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Supplier Disbursements
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Iniciá sesión para continuar
          </p>
        </div>

        <Card>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email ? 'El email es obligatorio' : undefined}
              {...register('email', { required: true })}
            />

            <TextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              error={errors.password ? 'Mínimo 8 caracteres' : undefined}
              {...register('password', { required: true, minLength: 8 })}
            />

            {formError && (
              <p role="alert" className="text-sm text-status-rejected">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="mt-2 w-full"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
