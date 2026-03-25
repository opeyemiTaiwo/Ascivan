// src/Pages/auth/Logout.jsx 

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const Logout = () => {
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  const externalHomeUrl = '/';

  useEffect(() => {
    if (isLoggedOut && !error && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      window.location.href = externalHomeUrl;
    }
  }, [isLoggedOut, error, countdown]);

  useEffect(() => {
    if (currentUser && !isLoggedOut) {
      handleLogout();
    } else if (!currentUser) {
      setIsLoggedOut(true);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError('');
      await logout();
      setIsLoggingOut(false);
      setIsLoggedOut(true);
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  const handleManualLogout = () => {
    if (!isLoggingOut) {
      handleLogout();
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative">

      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pb-6 xs:pb-8 sm:pb-10 flex items-center justify-center px-3 xs:px-4 sm:px-6 relative z-10">
        <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 w-full max-w-[340px] xs:max-w-sm sm:max-w-md md:max-w-lg border border-white/20">
          <div className="text-center">

            {/* Hero Section */}
            <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-1.5 xs:gap-2 mb-3 xs:mb-4 animate-pulse">
                <div className="h-1.5 w-1.5 xs:h-2 xs:w-2 sm:h-3 sm:w-3 bg-green-400 rounded-full"></div>
                <span className="text-green-300 uppercase tracking-wider xs:tracking-widest text-[10px] xs:text-xs sm:text-sm font-black"
                      style={{
                        textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 2px 2px 4px rgba(0,0,0,0.9)',
                        fontFamily: '"Inter", sans-serif',
                        letterSpacing: '0.1em'
                      }}>
                  Signing Out
                </span>
                <div className="h-1.5 w-1.5 xs:h-2 xs:w-2 sm:h-3 sm:w-3 bg-green-400 rounded-full"></div>
              </div>

              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 xs:mb-3 px-2"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)'
                  }}>
                {isLoggedOut ? (
                  <>
                    See You{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-orange-400 to-green-500"
                          style={{ textShadow: 'none', filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))' }}>
                      Soon!
                    </span>
                  </>
                ) : (
                  <>
                    Signing{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500"
                          style={{ textShadow: 'none', filter: 'drop-shadow(0 0 20px rgba(255, 69, 0, 0.5))' }}>
                      Out...
                    </span>
                  </>
                )}
              </h1>

              <div className="h-0.5 xs:h-1 w-12 xs:w-16 sm:w-20 bg-gradient-to-r from-green-400 to-orange-500 mx-auto rounded-full shadow-2xl"></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40 border border-red-500/30 text-red-300 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg xs:rounded-xl mb-4 xs:mb-5 sm:mb-6 shadow-2xl">
                <div className="flex items-start xs:items-center">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 text-red-400 mr-2 xs:mr-3 flex-shrink-0 mt-0.5 xs:mt-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="text-left">
                    <p className="font-bold text-xs xs:text-sm text-red-300">Logout Error</p>
                    <p className="text-[10px] xs:text-xs mt-0.5 xs:mt-1 text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoggingOut && (
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="flex items-center justify-center mb-3 xs:mb-4">
                  <div className="relative">
                    <div className="animate-spin h-10 w-10 xs:h-12 xs:w-12 sm:h-14 sm:w-14 border-3 xs:border-4 border-green-400/20 border-t-green-400 rounded-full shadow-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium text-xs xs:text-sm sm:text-base" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                  Securely signing you out...
                </p>
                <div className="mt-2 xs:mt-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full h-1.5 xs:h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>
            )}

            {/* Success State */}
            {isLoggedOut && !error && (
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="bg-gradient-to-br from-green-900/40 via-green-800/40 to-green-900/40 border border-green-500/30 text-green-300 px-3 xs:px-4 py-3 xs:py-4 rounded-lg xs:rounded-xl mb-3 xs:mb-4 shadow-2xl">
                  <div className="flex items-center justify-center mb-2 xs:mb-3">
                    <div className="relative">
                      <svg className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="absolute inset-0 bg-green-400/20 rounded-full"></div>
                    </div>
                  </div>
                  <p className="font-bold text-base xs:text-lg sm:text-xl text-green-300 mb-1 xs:mb-2">Successfully Logged Out!</p>
                  <p className="text-xs xs:text-sm text-green-200">Thank you for using Loomiqe</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 via-orange-800/30 to-orange-900/30 border border-orange-500/20 text-orange-300 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg xs:rounded-xl">
                  <p className="text-xs xs:text-sm font-medium">
                    Redirecting to home in{' '}
                    <span className="text-orange-400 font-bold text-base xs:text-lg animate-pulse">{countdown}</span>
                    {' '}second{countdown !== 1 ? 's' : ''}...
                  </p>
                  <div className="mt-1.5 xs:mt-2 bg-orange-500/20 rounded-full h-1.5 xs:h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-green-500 h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{width: `${((3 - countdown) / 3) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Not Logged In */}
            {!currentUser && !isLoggedOut && (
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="bg-gradient-to-br from-yellow-900/40 via-yellow-800/40 to-orange-900/40 border border-yellow-500/30 text-yellow-300 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg xs:rounded-xl">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="font-bold text-yellow-300 text-sm xs:text-base">Not Currently Logged In</p>
                  <p className="text-xs xs:text-sm text-yellow-200 mt-1">You are already signed out</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
              {error && (
                <button
                  onClick={handleManualLogout}
                  disabled={isLoggingOut}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 xs:py-3 sm:py-3.5 px-4 rounded-lg xs:rounded-xl font-bold transition-all duration-300 text-xs xs:text-sm sm:text-base min-h-[44px]"
                >
                  {isLoggingOut ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 xs:h-5 xs:w-5" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      <span>Logging out...</span>
                    </span>
                  ) : (
                    <span>Try Again</span>
                  )}
                </button>
              )}

              <button
                onClick={() => { window.location.href = externalHomeUrl; }}
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white py-2.5 xs:py-3 sm:py-3.5 px-4 rounded-lg xs:rounded-xl font-bold transition-all duration-300 text-xs xs:text-sm sm:text-base min-h-[44px]"
                style={{ boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)' }}
              >
                Go to Home
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 text-white py-2.5 xs:py-3 sm:py-3.5 px-4 rounded-lg xs:rounded-xl font-semibold transition-all duration-300 hover:shadow-2xl text-xs xs:text-sm sm:text-base min-h-[44px]"
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
              >
                Sign In Again
              </button>
            </div>

            {/* Footer note */}
            <div className="mt-4 xs:mt-5 sm:mt-6 pt-3 xs:pt-4 border-t border-white/20">
              <p className="text-[10px] xs:text-xs text-gray-400" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                Your session has been securely terminated
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER: white background, logo image only (no text) ── */}
      <footer
        style={{ background: '#ffffff' }}
        className="py-6 xs:py-8 sm:py-10 relative z-10 border-t border-gray-200"
      >
        <div className="container mx-auto px-3 xs:px-4 sm:px-6">
          <div className="text-center">

            {/* Logo only — text removed */}
            <div className="flex items-center justify-center mb-3 xs:mb-4">
              <img
                src="/Images/512X512.png"
                alt="Loomiqe Logo"
                className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14"
              />
            </div>

            <p className="text-gray-500 text-[10px] xs:text-xs sm:text-sm font-medium mb-2">
              Transforming the international student experience with AI
            </p>

            <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm">
              © {new Date().getFullYear()} Loomiqe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(34, 197, 94, 0.8)); }
        }

        ::-webkit-scrollbar { width: 6px; }
        @media (min-width: 640px) { ::-webkit-scrollbar { width: 8px; } }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.5); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.7); }

        @media (max-width: 768px) {
          button, a, input, textarea { min-height: 44px; }
        }

        body { overflow-x: hidden; }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 374px) {
          h1 { font-size: 1.25rem !important; }
        }

        @media (max-height: 600px) and (orientation: landscape) {
          header { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          main { padding-top: 4rem; padding-bottom: 2rem; }
          footer { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        }

        @media (min-width: 1536px) {
          .container { max-width: 1400px; }
        }
      `}</style>
    </div>
  );
};

export default Logout;
