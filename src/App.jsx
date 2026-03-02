// src/App.jsx - update

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Critical path - keep eager
import Login from './Pages/auth/Login';
import Logout from './Pages/auth/Logout';
import LandingPage from './Pages/LandingPage';
import Onboarding from './Pages/Onboarding';
import CommunityPosts from './Pages/community/CommunityPosts';

// Lazy-load secondary pages for faster initial load
const UserDashboard = lazy(() => import('./Pages/user/dashboard'));
const UserProfile = lazy(() => import('./Pages/user/UserProfile'));
const FollowersFollowing = lazy(() => import('./Pages/user/FollowersFollowing'));
const DatabaseSetup = lazy(() => import('./Pages/DatabaseSetup'));
const NotificationsPage = lazy(() => import('./Pages/Notifications'));
const Messages = lazy(() => import('./Pages/Messages'));
const SubmitApplication = lazy(() => import('./Pages/applications/SubmitApplication'));
const AdminDashboard = lazy(() => import('./Pages/admin/AdminDashboard'));
const TestDailyDigest = lazy(() => import('./Pages/admin/TestDailyDigest'));
const MembersDirectory = lazy(() => import('./Pages/MembersDirectory'));
const SubmitPost = lazy(() => import('./Pages/community/SubmitPost'));
const SinglePost = lazy(() => import('./Pages/community/SinglePost'));
const Jobs = lazy(() => import('./Pages/Jobs'));
const PostJobs = lazy(() => import('./Pages/PostJobs'));
const MyJobPosts = lazy(() => import('./Pages/MyJobPosts'));
const Housing = lazy(() => import('./Pages/Housing'));
const PostHousing = lazy(() => import('./Pages/PostHousing'));
const Finance = lazy(() => import('./Pages/Finance'));
const PostFinance = lazy(() => import('./Pages/PostFinance'));
const About = lazy(() => import('./Pages/About'));
const Support = lazy(() => import('./Pages/Support'));
const TermsOfService = lazy(() => import('./Pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy'));
const DigitalSolutionsHome = lazy(() => import('./Pages/digital/DigitalSolutionsHome'));
const DigitalTermsOfService = lazy(() => import('./Pages/digital/DigitalTermsOfService'));
const DigitalPrivacyPolicy = lazy(() => import('./Pages/digital/DigitalPrivacyPolicy'));

try {
  require('./services/googleFormService');
} catch (e) {
  console.log('Google Form Service not found');
}

let ErrorBoundary;
try {
  ErrorBoundary = require('./components/ErrorBoundary').default;
} catch (e) {
  ErrorBoundary = ({ children }) => children;
}

const PageLoader = () => (
  <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
    <div className="text-center px-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
        <div className="w-full h-full rounded-xl shadow-2xl bg-orange-100 flex items-center justify-center border-2 border-orange-500">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
      </div>
      <p className="text-gray-900 font-bold text-lg sm:text-xl mb-2">Loading...</p>
      <p className="text-gray-600 text-xs sm:text-sm">Just a moment</p>
    </div>
  </div>
);

const BasicProtectedRoute = ({ children, skipOnboardingCheck = false }) => {
  const { currentUser, loading, getUserData } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
      return;
    }

    if (!loading && currentUser && !skipOnboardingCheck) {
      getUserData(currentUser.uid).then(userData => {
        if (userData && !userData.onboardingComplete) {
          navigate('/onboarding', { replace: true });
        } else {
          setCheckingOnboarding(false);
        }
      }).catch(() => setCheckingOnboarding(false));
    } else if (!loading) {
      setCheckingOnboarding(false);
    }
  }, [loading, currentUser, navigate, skipOnboardingCheck, getUserData]);

  if (loading || checkingOnboarding) return <PageLoader />;
  if (!currentUser) return null;
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="w-full min-h-screen overflow-x-hidden bg-gray-50">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/payment" element={<Navigate to="/dashboard" replace />} />

                {/* Onboarding — protected but skips the onboarding check itself */}
                <Route path="/onboarding" element={
                  <BasicProtectedRoute skipOnboardingCheck={true}>
                    <Onboarding />
                  </BasicProtectedRoute>
                } />

                {/* Members Directory */}
                <Route path="/members" element={<MembersDirectory />} />
                <Route path="/directory" element={<MembersDirectory />} />
                <Route path="/members-directory" element={<MembersDirectory />} />

                {/* Digital Solutions */}
                <Route path="/solutions" element={<DigitalSolutionsHome />} />
                <Route path="/solutions/terms" element={<DigitalTermsOfService />} />
                <Route path="/solutions/privacy" element={<DigitalPrivacyPolicy />} />
                <Route path="/digital-solutions" element={<DigitalSolutionsHome />} />
                <Route path="/services" element={<DigitalSolutionsHome />} />

                {/* About, Support, Terms, Privacy */}
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Support />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Jobs */}
                <Route path="/jobs" element={<BasicProtectedRoute><Jobs /></BasicProtectedRoute>} />
                <Route path="/jobs/post" element={<BasicProtectedRoute><PostJobs /></BasicProtectedRoute>} />
                <Route path="/jobs/my-posts" element={<BasicProtectedRoute><MyJobPosts /></BasicProtectedRoute>} />
                {/* Legacy hub routes redirect to jobs */}
                <Route path="/hub" element={<Navigate to="/jobs" replace />} />
                <Route path="/hub/post" element={<Navigate to="/jobs/post" replace />} />
                <Route path="/hub/my-posts" element={<Navigate to="/jobs/my-posts" replace />} />

                {/* Housing */}
                <Route path="/housing" element={<BasicProtectedRoute><Housing /></BasicProtectedRoute>} />
                <Route path="/housing/post" element={<BasicProtectedRoute><PostHousing /></BasicProtectedRoute>} />

                {/* Finance & Financial Resources */}
                <Route path="/finance" element={<BasicProtectedRoute><Finance /></BasicProtectedRoute>} />
                <Route path="/finance/post" element={<BasicProtectedRoute><PostFinance /></BasicProtectedRoute>} />
                {/* Legacy banking routes redirect to finance */}
                <Route path="/banking" element={<Navigate to="/finance" replace />} />
                <Route path="/banking/post" element={<Navigate to="/finance/post" replace />} />
                <Route path="/opportunities" element={<Navigate to="/jobs" replace />} />
                <Route path="/opportunities/post" element={<Navigate to="/jobs/post" replace />} />

                {/* Community */}
                <Route path="/community" element={<BasicProtectedRoute><CommunityPosts /></BasicProtectedRoute>} />
                <Route path="/community/submit" element={<BasicProtectedRoute><SubmitPost /></BasicProtectedRoute>} />
                <Route path="/community/post/:postId" element={<BasicProtectedRoute><SinglePost /></BasicProtectedRoute>} />
                <Route path="/post/:postId" element={<BasicProtectedRoute><SinglePost /></BasicProtectedRoute>} />

                {/* Notifications */}
                <Route path="/notifications" element={<BasicProtectedRoute><NotificationsPage /></BasicProtectedRoute>} />

                {/* Messages */}
                <Route path="/messages" element={<BasicProtectedRoute><Messages /></BasicProtectedRoute>} />

                {/* Apply */}
                <Route path="/apply" element={<SubmitApplication />} />

                {/* Dashboard & Profile */}
                <Route path="/dashboard" element={<BasicProtectedRoute><UserDashboard /></BasicProtectedRoute>} />
                <Route path="/user/dashboard" element={<BasicProtectedRoute><UserDashboard /></BasicProtectedRoute>} />
                <Route path="/profile/:userEmail" element={<BasicProtectedRoute><UserProfile /></BasicProtectedRoute>} />
                <Route path="/profile/:userId" element={<BasicProtectedRoute><UserProfile /></BasicProtectedRoute>} />
                <Route path="/profile/:userEmail/followers" element={<BasicProtectedRoute><FollowersFollowing /></BasicProtectedRoute>} />
                <Route path="/profile/:userEmail/following" element={<BasicProtectedRoute><FollowersFollowing /></BasicProtectedRoute>} />

                {/* Admin */}
                <Route path="/database-setup" element={<DatabaseSetup />} />
                <Route path="/admin/dashboard" element={<BasicProtectedRoute><AdminDashboard /></BasicProtectedRoute>} />
                <Route path="/admin/test-daily-digest" element={<BasicProtectedRoute><TestDailyDigest /></BasicProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-md">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">404</span>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
                      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                      <div className="space-y-3">
                        <button onClick={() => window.location.href = '/community'} className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all">Go Home</button>
                        <button onClick={() => window.history.back()} className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl border border-gray-300 transition-all">Go Back</button>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="mt-20 sm:mt-4"
            toastClassName="text-sm sm:text-base"
            toastStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              color: '#111827',
              margin: '0.5rem',
              maxWidth: '90vw',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
