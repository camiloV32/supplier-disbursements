import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/iam/context/use-auth';
import type { UserRole } from '@/modules/iam/types/auth-user.type';

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-bg">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
          role="status"
          aria-label="Cargando"
        />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
