// src/App.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './Pages/auth/Login';
import Logout from './Pages/auth/Logout';
import UserDashboard from './Pages/user/dashboard';
import UserProfile from './Pages/user/UserProfile';
import FollowersFollowing from './Pages/user/FollowersFollowing';
import CareerHome from './Pages/career/CareerHome';
import CareerTest from './Pages/career/CareerTest';
import CareerDashboard from './Pages/career/CareerDashboard';
import CareerResourcesHub from './Pages/career/resources';
import ProjectEnrollmentPage from './Pages/career/ProjectEnrollmentPage';
import ProjectGroupView from './Pages/career/ProjectGroupView';
import GroupPostView from './Pages/career/GroupPostView';
import MyGroups from './Pages/career/MyGroups';
import ProjectCompletionPage from './Pages/career/ProjectCompletionPage';
import ProjectCompletionForm from './Pages/career/ProjectCompletionForm';
import UserBadgesPage from './Pages/career/UserBadgesPage';
import CareerAbout from './Pages/career/CareerAbout';
import CareerContact from './Pages/career/CareerContact';
import Support from './Pages/career/Support';
import PrivacyPolicy from './Pages/career/PrivacyPolicy';
import TermsService from './Pages/career/TermsService';
import DatabaseSetup from './Pages/DatabaseSetup';
import ProjectSubmission from './Pages/projects/ProjectSubmission';
import ProjectsListing from './Pages/projects/ProjectsListing';
import ProjectOwnerDashboard from './Pages/projects/ProjectOwnerDashboard';
import ProjectDetail from './Pages/projects/ProjectDetail';
import ProjectEditView from './Pages/projects/ProjectEditView';
import ProjectApplicationForm from './Pages/projects/ProjectApplicationForm';
import NotificationsPage from './Pages/Notifications';
import SubmitApplication from './Pages/applications/SubmitApplication';
import AdminDashboard from './Pages/admin/AdminDashboard';
import TestDailyDigest from './Pages/admin/TestDailyDigest';
import TechTalentBadges from './Pages/TechTalentBadges';
import MembersDirectory from './Pages/MembersDirectory';
import CommunityPosts from './Pages/community/CommunityPosts';
import SubmitPost from './Pages/community/SubmitPost';
import SinglePost from './Pages/community/SinglePost';
import Hub from './Pages/Hub';
import PostHub from './Pages/PostHub';
import MyHubPosts from './Pages/MyHubPosts';
import EventsListing from './Pages/events/EventsListing';
import EventSubmission from './Pages/events/EventSubmission';
import MyEvents from './Pages/events/MyEvents';

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

const ComingSoonPage = ({ feature }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="glass-card-responsive max-w-md w-full text-center bg-white">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-lime-500 to-green-600 rounded-2xl flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-white">!</span>
      </div>
      <h1 className="heading-h2 text-gray-900 mb-3 sm:mb-4">Coming Soon</h1>
      <p className="text-responsive-sm text-gray-600 mb-6 sm:mb-8">
        The {feature} feature is under development.
      </p>
      <button 
        onClick={() => window.location.href = '/'}
        className="btn-responsive-base w-full bg-gradient-to-r from-lime-500 to-green-600 text-white hover:from-lime-600 hover:to-green-700"
      >
        Go Home
      </button>
    </div>
  </div>
);

const EventGroupDashboard = () => <ComingSoonPage feature="Event Groups" />;
const CompanyList = () => <ComingSoonPage feature="Companies" />;
const CreateCompany = () => <ComingSoonPage feature="Company Creation" />;
const CompanyView = () => <ComingSoonPage feature="Company Profile" />;
const MyCompanies = () => <ComingSoonPage feature="My Companies" />;

const PageLoader = () => (
  <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
    <div className="text-center px-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
        <div className="w-full h-full rounded-xl shadow-2xl bg-lime-100 flex items-center justify-center border-2 border-lime-500">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-lime-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-lime-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-lime-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
      </div>
      <p className="text-gray-900 font-bold text-lg sm:text-xl mb-2">Loading...</p>
      <p className="text-gray-600 text-xs sm:text-sm">Just a moment</p>
    </div>
  </div>
);

const BasicProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return null;
  }

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
                <Route path="/" element={<CareerHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/payment" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/career" element={<CareerHome />} />
                <Route path="/career/about" element={<CareerAbout />} />
                <Route path="/career/contact" element={<CareerContact />} />
                <Route path="/career/support" element={<Support />} />
                <Route path="/career/privacy" element={<PrivacyPolicy />} />
                <Route path="/career/terms" element={<TermsService />} />
                
                <Route path="/about" element={<CareerAbout />} />
                <Route path="/contact" element={<CareerContact />} />
                <Route path="/support" element={<Support />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsService />} />
                
                <Route path="/hire-talents" element={<MembersDirectory />} />
                <Route path="/members" element={<MembersDirectory />} />
                <Route path="/directory" element={<MembersDirectory />} />
                <Route path="/talent-directory" element={<MembersDirectory />} />
                <Route path="/find-talent" element={<MembersDirectory />} />
                <Route path="/members-directory" element={<MembersDirectory />} />

                <Route path="/hub" element={<BasicProtectedRoute><Hub /></BasicProtectedRoute>} />
                <Route path="/hub/post" element={<BasicProtectedRoute><PostHub /></BasicProtectedRoute>} />
                <Route path="/hub/my-posts" element={<BasicProtectedRoute><MyHubPosts /></BasicProtectedRoute>} />
                <Route path="/opportunities" element={<BasicProtectedRoute><Hub /></BasicProtectedRoute>} />
                <Route path="/opportunities/post" element={<BasicProtectedRoute><PostHub /></BasicProtectedRoute>} />

                <Route path="/events" element={<EventsListing />} />
                <Route path="/workshops" element={<EventsListing />} />
                <Route path="/webinars" element={<EventsListing />} />
                <Route path="/tech-events" element={<EventsListing />} />
                <Route path="/learning-events" element={<EventsListing />} />
                <Route path="/submit-event" element={<EventSubmission />} />
                <Route path="/host-event" element={<EventSubmission />} />
                <Route path="/create-event" element={<EventSubmission />} />
                <Route path="/events/submit" element={<EventSubmission />} />
                <Route path="/edit-event/:eventId" element={<EventSubmission />} />
                <Route path="/events/edit/:eventId" element={<EventSubmission />} />
                <Route path="/event-group/:eventGroupId" element={<EventGroupDashboard />} />
                <Route path="/events/my-events" element={<BasicProtectedRoute><MyEvents /></BasicProtectedRoute>} />
                <Route path="/my-events" element={<BasicProtectedRoute><MyEvents /></BasicProtectedRoute>} />
                
                <Route path="/projects" element={<BasicProtectedRoute><ProjectsListing /></BasicProtectedRoute>} />
                <Route path="/projects/:projectId" element={<BasicProtectedRoute><ProjectDetail /></BasicProtectedRoute>} />
                <Route path="/submit-project" element={<BasicProtectedRoute><ProjectSubmission /></BasicProtectedRoute>} />
                <Route path="/database-setup" element={<DatabaseSetup />} />
                <Route path="/projects/apply/:projectId" element={<BasicProtectedRoute><ProjectApplicationForm /></BasicProtectedRoute>} />
                <Route path="/projects/:projectId/edit" element={<BasicProtectedRoute><ProjectEditView /></BasicProtectedRoute>} />
                <Route path="/projects/owner-dashboard" element={<BasicProtectedRoute><ProjectOwnerDashboard /></BasicProtectedRoute>} />
                
                <Route path="/community" element={<BasicProtectedRoute><CommunityPosts /></BasicProtectedRoute>} />
                <Route path="/community/submit" element={<BasicProtectedRoute><SubmitPost /></BasicProtectedRoute>} />
                <Route path="/community/post/:postId" element={<BasicProtectedRoute><SinglePost /></BasicProtectedRoute>} />
                <Route path="/post/:postId" element={<BasicProtectedRoute><SinglePost /></BasicProtectedRoute>} />
                
                <Route path="/notifications" element={<BasicProtectedRoute><NotificationsPage /></BasicProtectedRoute>} />
                
                <Route path="/companies" element={<CompanyList />} />
                <Route path="/companies/create" element={<CreateCompany />} />
                <Route path="/companies/:companyId" element={<CompanyView />} />
                <Route path="/my-companies" element={<MyCompanies />} />
                <Route path="/business" element={<CompanyList />} />
                <Route path="/organizations" element={<CompanyList />} />
                <Route path="/create-company" element={<CreateCompany />} />
                <Route path="/start-company" element={<CreateCompany />} />
                
                <Route path="/apply" element={<SubmitApplication />} />
                <Route path="/tech-badges" element={<TechTalentBadges />} />
                <Route path="/badges" element={<TechTalentBadges />} />
                
                <Route path="/dashboard" element={<BasicProtectedRoute><UserDashboard /></BasicProtectedRoute>} />
                <Route path="/user/dashboard" element={<BasicProtectedRoute><UserDashboard /></BasicProtectedRoute>} />
                
                <Route path="/profile/:userEmail" element={<BasicProtectedRoute><UserProfile /></BasicProtectedRoute>} />
                <Route path="/profile/:userId" element={<BasicProtectedRoute><UserProfile /></BasicProtectedRoute>} />
                <Route path="/profile/:userEmail/followers" element={<BasicProtectedRoute><FollowersFollowing /></BasicProtectedRoute>} />
                <Route path="/profile/:userEmail/following" element={<BasicProtectedRoute><FollowersFollowing /></BasicProtectedRoute>} />
                
                <Route path="/career/test" element={<BasicProtectedRoute><CareerTest /></BasicProtectedRoute>} />
                <Route path="/career/dashboard" element={<BasicProtectedRoute><CareerDashboard /></BasicProtectedRoute>} />
                <Route path="/career/resources" element={<BasicProtectedRoute><CareerResourcesHub /></BasicProtectedRoute>} />
                <Route path="/career/projects" element={<BasicProtectedRoute><ProjectEnrollmentPage /></BasicProtectedRoute>} />
                
                <Route path="/my-groups" element={<BasicProtectedRoute><MyGroups /></BasicProtectedRoute>} />
                <Route path="/groups/:groupId" element={<BasicProtectedRoute><ProjectGroupView /></BasicProtectedRoute>} />
                <Route path="/groups/:groupId/posts/:postId" element={<BasicProtectedRoute><GroupPostView /></BasicProtectedRoute>} />
                <Route path="/groups/:groupId/complete" element={<BasicProtectedRoute><ProjectCompletionForm /></BasicProtectedRoute>} />
                <Route path="/career/project-completion/:groupId" element={<BasicProtectedRoute><ProjectCompletionPage /></BasicProtectedRoute>} />
                
                <Route path="/my-badges" element={<BasicProtectedRoute><UserBadgesPage /></BasicProtectedRoute>} />
                <Route path="/my-achievements" element={<BasicProtectedRoute><UserBadgesPage /></BasicProtectedRoute>} />
                
                <Route path="/admin/dashboard" element={<BasicProtectedRoute><AdminDashboard /></BasicProtectedRoute>} />
                <Route path="/admin/test-daily-digest" element={<BasicProtectedRoute><TestDailyDigest /></BasicProtectedRoute>} />
                
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="glass-card-responsive max-w-md w-full text-center bg-white">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-white">404</span>
                      </div>
                      <h1 className="heading-h2 text-gray-900 mb-3 sm:mb-4">Page Not Found</h1>
                      <p className="text-responsive-sm text-gray-600 mb-6 sm:mb-8">
                        The page you're looking for doesn't exist.
                      </p>
                      <div className="space-y-3">
                        <button 
                          onClick={() => window.location.href = '/'}
                          className="btn-responsive-base w-full bg-gradient-to-r from-lime-500 to-green-600 text-white hover:from-lime-600 hover:to-green-700"
                        >
                          Go Home
                        </button>
                        <button 
                          onClick={() => window.history.back()}
                          className="btn-responsive-base w-full bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                        >
                          Go Back
                        </button>
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
