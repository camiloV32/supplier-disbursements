import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/iam/context/use-auth';

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <p>Cargando...</p>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
