import { Navigate, Outlet } from 'react-router-dom';
import { getLocalStorageItem } from '../services/auth';

export const ProtectedRoute = () => {
  const isAuthenticated = getLocalStorageItem('user_info') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
