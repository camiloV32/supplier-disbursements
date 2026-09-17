import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/use-auth';

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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1>Iniciar sesión</h1>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        {...register('email', { required: true })}
      />
      {errors.email && <span>El email es obligatorio</span>}

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        {...register('password', { required: true, minLength: 8 })}
      />
      {errors.password && <span>Mínimo 8 caracteres</span>}

      {formError && <p role="alert">{formError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
