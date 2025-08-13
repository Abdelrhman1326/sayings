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
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (checking) return null; // Or a spinner/loading UI

    return authorized ? <>{children}</> : null;
};

export default ProtectedRoute;
