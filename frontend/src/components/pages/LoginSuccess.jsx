// frontend/src/components/pages/LoginSuccess.jsx
import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../common/Loader';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const { setUser, setToken } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token || !userParam) {
      // Something went wrong — send to signin
      navigate('/signin?error=google_failed', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      // Store in localStorage — same as regular login
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update AuthContext state
      setToken(token);
      setUser(user);

      // Redirect to home
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ LoginSuccess error:', error);
      navigate('/signin?error=google_failed', { replace: true });
    }
  }, []);

  // Show loader while processing
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0d0d',
      gap: '16px',
    }}>
      <Loader />
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
        Signing you in with Google...
      </p>
    </div>
  );
};

export default LoginSuccess;