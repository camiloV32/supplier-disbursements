import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '../context/auth-context';
import { useHasRole } from './use-has-role';

const baseAuth: AuthContextValue = {
  user: null,
  status: 'unauthenticated',
  login: async () => {},
  logout: async () => {},
};

function buildWrapper(value: AuthContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  };
}

describe('useHasRole', () => {
  it('returns false when there is no authenticated user', () => {
    const { result } = renderHook(() => useHasRole('SUPERVISOR'), {
      wrapper: buildWrapper(baseAuth),
    });

    expect(result.current).toBe(false);
  });

  it('returns true when the user has one of the required roles', () => {
    const { result } = renderHook(() => useHasRole('SUPERVISOR'), {
      wrapper: buildWrapper({
        ...baseAuth,
        status: 'authenticated',
        user: { id: '1', email: 'supervisor@test.local', role: 'SUPERVISOR' },
      }),
    });

    expect(result.current).toBe(true);
  });

  it('returns false when the user has a different role', () => {
    const { result } = renderHook(() => useHasRole('SUPERVISOR'), {
      wrapper: buildWrapper({
        ...baseAuth,
        status: 'authenticated',
        user: { id: '1', email: 'analyst@test.local', role: 'ANALYST' },
      }),
    });

    expect(result.current).toBe(false);
  });
});
