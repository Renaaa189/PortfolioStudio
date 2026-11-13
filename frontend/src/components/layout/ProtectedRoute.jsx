import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader } from '../ui/States.jsx';
import { Backdrop } from '../ui/Backdrop.jsx';

export function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <>
        <Backdrop sparkles={10} />
        <Loader label="Verificando sesión…" />
      </>
    );
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
