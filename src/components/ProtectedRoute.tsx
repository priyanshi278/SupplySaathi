import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'vendor' | 'supplier';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser || !userData) {
    return <Navigate to="/login" replace />;
  }

  if (role && userData.role !== role) {
    return <Navigate to={userData.role === 'vendor' ? '/vendor' : '/supplier'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;