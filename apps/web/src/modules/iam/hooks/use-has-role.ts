import { useAuth } from '../context/use-auth';
import type { UserRole } from '../types/auth-user.type';

export function useHasRole(...roles: UserRole[]): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  return roles.includes(user.role);
}
