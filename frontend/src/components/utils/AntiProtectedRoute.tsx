import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from '../../apis/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getAuth();
        if (res.authenticated) {
          setAuthorized(true);
        }
      } catch {
        // Not authenticated — do nothing
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) return null;

  if (authorized) {
    navigate('/home');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
