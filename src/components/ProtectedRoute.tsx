import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if any of the user's roles are in the allowedRoles list
  const userRoles = user?.roles?.flatMap(r => {
    const role = r.replace('ROLE_', '').toLowerCase();
    return role === 'manager' ? ['manager', 'admin'] : [role];
  }) || (user?.role ? (user.role.toLowerCase() === 'manager' ? ['manager', 'admin'] : [user.role.toLowerCase()]) : []);
  
  const isAllowed = allowedRoles.some(role => userRoles.includes(role.toLowerCase()));

  if (allowedRoles && !isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
