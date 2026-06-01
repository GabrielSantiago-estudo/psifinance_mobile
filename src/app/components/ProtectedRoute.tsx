import React from 'react';
import { Navigate } from 'react-router';
import { getCurrentUser } from '../services/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return getCurrentUser() ? <>{children}</> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  return getCurrentUser() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}
