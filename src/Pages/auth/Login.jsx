// src/Pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage, isSafariMobileDevice, isAndroidMobileDevice, hasPotentialStorageIssues } from '../../firebase/config';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Login = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('');
  const navigate = useNavigate();

  const isSafariMobile = isSafariMobileDevice();
  const isAndroidMobile = isAndroidMobileDevice();
  const hasStorageIssues = hasPotentialStorageIssues();

  useEffect(() => {
    if (currentUser) {
      navigate('/account-type');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      if (hasStorageIssues) {
        setAuthMethod('popup');
      } else {
        setAuthMethod('redirect');
      }
      await signInWithGoogle();
    } catch (error) {
      const friendlyErrorMessage = getAuthErrorMessage(error);
      setError(friendlyErrorMessage);
      setIsLoading(false);
      setAuthMethod('');
    }
  };

  const getLoadingMessage = () => {
    if (!isLoading) return "Sign in with Google";
    switch (authMethod) {
      case 'popup': return "Opening sign-in popup...";
      case 'redirect': return "Redirecting to Google...";
      default: return "Signing in...";
    }
  };

  const getHelpText = () => {
    if (isSafariMobile) return "On Safari mobile, sign-in will open in a popup window. Please allow popups if prompted.";
    else if (isAndroidMobile) return "On Android devices, sign-in will open in a popup window. Please allow popups if prompted.";
    else if (hasStorageIssues) return "Your browser may have storage restrictions. Sign-in will use a popup window.";
    return "Secure login powered by Google";
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col relative bg-white">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-3 sm:px-4 relative z-10 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-10 w-full max-w-md">
          <div className="text-center">

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <p className="text-blue-600 uppercase tracking-widest text-xs font-semibold mb-3">Secure Access</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                Welcome to{' '}
                <span className="text-blue-600">Loomiqe</span>
              </h1>
              <p className="text-gray-500 text-sm sm:text-base font-normal px-2 mb-3">
                Proof over pedigree. Build real experience, earn verified badges, and get discovered, wherever you are.
              </p>
              <div className="h-0.5 w-16 bg-blue-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-red-700">Sign-in Failed</p>
                    <p className="text-sm mt-1 text-red-600 break-words">{error}</p>
                    {error.includes('popup') && (
                      <p className="text-xs mt-2 text-red-500">Try enabling popups in your browser settings</p>
                    )}
                    {error.includes('refresh') && (
                      <button onClick={() => window.location.reload()} className="text-xs mt-2 underline text-red-500 hover:text-red-700 transition-colors">
                        Click here to refresh the page
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile info */}
            {hasStorageIssues && !error && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-5">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-blue-700">
                      {isSafariMobile ? 'Safari Mobile Detected' : isAndroidMobile ? 'Android Mobile Detected' : 'Mobile Browser Detected'}
                    </p>
                    <p className="text-xs mt-1 text-blue-600">Sign-in will open in a popup. Please allow popups if prompted.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-800 py-3 sm:py-4 px-4 rounded-xl shadow-sm flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    <span className="font-semibold text-sm sm:text-base">{getLoadingMessage()}</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" className="sm:w-6 sm:h-6 flex-shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="font-bold text-sm sm:text-base">Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-blue-700">Free to Get Started</p>
                    <p className="text-xs mt-1 text-blue-600">
                      Sign in to access projects, badges, career tools, and the Proof Wall.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-400 px-2">{getHelpText()}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @media (max-width: 768px) { button, a, input, textarea { min-height: 44px; } }
      `}</style>
    </div>
  );
};

export default Login;
