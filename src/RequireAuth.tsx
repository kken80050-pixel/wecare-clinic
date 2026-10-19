import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Branch } from './BranchesData';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const branch = (location.state as { branch?: Branch } | null)?.branch;
    return <Navigate to="/login" replace state={{ from: location.pathname, branch }} />;
  }

  return <>{children}</>;
}