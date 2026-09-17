import type { ReactNode } from 'react';
import { useAuth } from '@/modules/iam/context/use-auth';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-svh bg-app-bg">
      <header className="border-b border-slate-200 bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold text-slate-900">
            Supplier Disbursements
          </span>

          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="hidden sm:inline">{user.email}</span>
                <Badge tone="neutral">{user.role}</Badge>
              </div>
              <Button variant="secondary" onClick={() => logout()}>
                Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
