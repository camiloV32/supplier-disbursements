import { useAuth } from '@/modules/iam/context/use-auth';
import { useHasRole } from '@/modules/iam/hooks/use-has-role';
import { AppShell } from './app-shell';
import { Card } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';

export function HomePage() {
  const { user } = useAuth();
  const isSupervisor = useHasRole('SUPERVISOR');

  return (
    <AppShell>
      <Card>
        <h1 className="text-lg font-semibold text-slate-900">
          Hola, {user?.email}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-slate-500">Rol:</span>
          <Badge tone="neutral">{user?.role}</Badge>
        </div>

        {isSupervisor && (
          <p className="mt-4 text-sm text-slate-600">
            Tenés permisos de supervisor — vas a poder aprobar y rechazar
            solicitudes.
          </p>
        )}

        <p className="mt-6 text-sm text-slate-400">
          Próximamente: listado y gestión de solicitudes de desembolso.
        </p>
      </Card>
    </AppShell>
  );
}
