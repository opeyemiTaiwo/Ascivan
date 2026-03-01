// src/Pages/auth/Login.jsx - Using Global Navbar
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage, isSafariMobileDevice, isAndroidMobileDevice, hasPotentialStorageIssues } from '../../firebase/config';
import Navbar from '../../components/Navbar';

const Login = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('');
  const navigate = useNavigate();

  // Check if user is on mobile browser with potential storage issues
  const isSafariMobile = isSafariMobileDevice();
  const isAndroidMobile = isAndroidMobileDevice();
  const hasStorageIssues = hasPotentialStorageIssues();

  // Redirect authenticated users — route guard will check onboarding
  useEffect(() => {
    if (currentUser) {
      console.log('User authenticated, checking onboarding status...');
      navigate('/community');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (hasStorageIssues) {
        setAuthMethod('popup');
        console.log("Mobile browser with potential storage issues detected - using popup authentication");
      } else {
        setAuthMethod('redirect');
      }
      
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      
      const friendlyErrorMessage = getAuthErrorMessage(error);
      setError(friendlyErrorMessage);
      setIsLoading(false);
      setAuthMethod('');
      
      console.error("Technical error details:", {
        code: error?.code,
        message: error?.message,
        isSafariMobile,
        isAndroidMobile,
        hasStorageIssues,
        userAgent: navigator.userAgent
      });
    }
  };

  const getLoadingMessage = () => {
    if (!isLoading) return "Sign in with Google";
    
    switch (authMethod) {
      case 'popup':
        return "Opening sign-in popup...";
      case 'redirect':
        return "Redirecting to Google...";
      default:
        return "Signing in...";
    }
  };

  const getHelpText = () => {
    if (isSafariMobile) {
      return "On Safari mobile, sign-in will open in a popup window. Please allow popups if prompted.";
    } else if (isAndroidMobile) {
      return "On Android devices, sign-in will open in a popup window. Please allow popups if prompted.";
    } else if (hasStorageIssues) {
      return "Your browser may have storage restrictions. Sign-in will use a popup window.";
    }
    return "Secure login powered by Google";
  };

  return (
    <div 
      className="min-h-screen overflow-x-hidden flex flex-col relative"
      style={{}}
    >
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-3 sm:px-4 relative z-10 py-8">
        <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 lg:p-10 w-full max-w-md border border-white/20">
          <div className="text-center">
            {/* Hero Section */}
            <div className="mb-5 sm:mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 animate-pulse">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-3 md:w-3 bg-orange-400 rounded-full" 
                     ></div>
                <span className="text-orange-300 uppercase tracking-widest text-xs sm:text-sm font-black" 
                      style={{
                        textShadow: '0 0 20px rgba(251, 146, 60, 0.8), 2px 2px 4px rgba(0,0,0,0.9)',
                        fontFamily: '"Inter", sans-serif',
                        letterSpacing: '0.1em'
                      }}>
                  Secure Access
                </span>
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-3 md:w-3 bg-orange-400 rounded-full" 
                     ></div>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-3 px-2" 
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)'
                  }}>
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-green-400 to-orange-500"
                      style={{
                        textShadow: 'none',
                        filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))',
                        
                      }}>
                  Loomiq
                </span>
              </h1>
              
              <p className="text-gray-300 text-xs sm:text-sm md:text-base font-medium px-2" 
                 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                Access your personalized dashboard and start your journey
              </p>

              <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-orange-400 to-green-500 mx-auto rounded-full shadow-2xl mt-3 sm:mt-4"
                   ></div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40 border border-red-500/30 text-red-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mb-4 sm:mb-5 md:mb-6 shadow-2xl">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-red-300">Sign-in Failed</p>
                    <p className="text-xs sm:text-sm mt-1 text-red-200 break-words">{error}</p>
                    {error.includes('popup') && (
                      <p className="text-xs mt-2 text-red-400">
                        Try enabling popups in your browser settings
                      </p>
                    )}
                    {error.includes('refresh') && (
                      <button 
                        onClick={() => window.location.reload()} 
                        className="text-xs mt-2 underline text-red-400 hover:text-red-300 transition-colors duration-300"
                      >
                        Click here to refresh the page
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Browser Info Banner */}
            {hasStorageIssues && !error && (
              <div className="bg-gradient-to-br from-green-900/40 via-green-800/40 to-green-900/40 border border-green-500/30 text-green-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mb-4 sm:mb-5 md:mb-6 shadow-2xl">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-green-300">
                      {isSafariMobile ? 'Safari Mobile Detected' : 
                       isAndroidMobile ? 'Android Mobile Detected' : 
                       'Mobile Browser Detected'}
                    </p>
                    <p className="text-xs mt-1 text-green-200">Sign-in will open in a popup. Please allow popups if prompted.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <button 
                onClick={handleGoogleSignIn} 
                disabled={isLoading}
                className="w-full bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 text-white py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 rounded-xl shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-orange-400" fill="none" viewBox="0 0 24 24">
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
                    <span className="font-bold text-sm sm:text-base md:text-lg">Sign in with Google</span>
                    <span className="text-orange-400 group-hover:translate-x-1 transition-transform duration-300 hidden xs:inline">→</span>
                  </>
                )}
              </button>

              {/* FREE ACCESS MESSAGE */}
              <div className="bg-gradient-to-br from-green-900/40 via-green-800/40 to-green-900/40 border border-green-500/30 text-green-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl shadow-2xl">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-green-300">Completely Free!</p>
                    <p className="text-xs mt-1 text-green-200">
                      Sign in to access jobs, housing, finance, and community — all free.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-5 sm:mt-6 md:mt-8">
              <p className="text-xs text-gray-400 px-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                {getHelpText()}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-2 space-y-1 bg-black/20 rounded-lg p-2 border border-white/10">
                  <p className="break-all">Debug: {isSafariMobile ? 'Safari Mobile' : 
                            isAndroidMobile ? 'Android Mobile' : 
                            hasStorageIssues ? 'Mobile with Storage Issues' : 'Desktop Browser'} | Method: {authMethod || 'None'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'}} 
              className="text-white py-6 sm:py-8 md:py-10 lg:py-12 relative z-10 mt-auto">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <img 
                src="/Images/512X512.png" 
                alt="Loomiq Logo" 
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0"
              />
              <span className="text-base sm:text-lg md:text-xl font-black" 
                    style={{
                      textShadow: '0 0 20px rgba(34, 197, 94, 0.5), 2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: '"Inter", sans-serif'
                    }}>
                Loomiq
              </span>
            </div>
            <div className="flex items-center justify-center mb-3 sm:mb-4 px-4">
              <span className="text-gray-300 text-xs sm:text-sm font-medium text-center" 
                    style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                Transforming the international student experience with AI
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm" 
               style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              © {new Date().getFullYear()} Loomiq. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(34, 197, 94, 0.8)); }
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 60px rgba(34, 197, 94, 0.1);
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.7);
        }

        @media (max-width: 768px) {
          button, a, input, textarea {
            min-height: 44px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
