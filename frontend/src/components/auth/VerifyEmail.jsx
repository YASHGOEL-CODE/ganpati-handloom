import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false); // ✅ Prevent double verification

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    // ✅ Only verify once
    if (!hasVerified.current) {
      hasVerified.current = true;
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-email/${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-golden-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          
          {status === 'verifying' && (
            <>
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLoader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Verifying Your Email...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ✅ Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{message}</p>
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                  🎉 Your account is active. You can login and start shopping!
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Redirecting to login in 3 seconds...
              </p>
              <Link to="/signin" className="inline-block bg-saffron-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-saffron-700 transition-all transform hover:scale-105 shadow-lg">
                Login Now →
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiXCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ❌ Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Possible reasons:</strong>
                  <br />• Link expired (15 min validity)
                  <br />• Link already used
                  <br />• Invalid token
                </p>
              </div>
              <div className="space-y-3">
                <Link to="/resend-verification" className="block w-full bg-saffron-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-saffron-700 transition-colors">
                  📧 Resend Verification Email
                </Link>
                <Link to="/signin" className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;