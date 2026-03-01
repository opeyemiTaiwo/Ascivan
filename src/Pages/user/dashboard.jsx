// src/Pages/user/dashboard.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../hooks/usePWA';
import Navbar from '../../components/Navbar';
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { deleteUserAccount } from '../../utils/deleteUserContent';
import { showSuccessMessage, showWarningMessage } from '../../utils/errorHandler';

import PWADebugger from '../../components/PWADebugger';

const SectionHeader = ({ title, description, gradientColors }) => (
  <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-8 text-center px-2 xs:px-3">
    <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 xs:mb-2.5 sm:mb-3 leading-tight"
        style={{
          textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
          fontFamily: '"Inter", sans-serif'
        }}>
      <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientColors}`}>
        {title}
      </span>
    </h2>
    <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 px-2" 
       style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
      {description}
    </p>
  </div>
);

const DashboardCard = ({ card, onCardClick }) => (
  <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 md:p-6 border border-white/20 shadow-2xl">
    <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6">
      <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-black text-white flex items-center" 
          style={{textShadow: '0 0 15px rgba(255,255,255,0.3), 1px 1px 2px rgba(0,0,0,0.8)'}}>
        <span className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r ${card.gradient} rounded-md xs:rounded-lg flex items-center justify-center mr-2 xs:mr-2.5 sm:mr-3 shadow-lg`}>
          <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </span>
        <span className="truncate">{card.title.split(' ').slice(0, 2).join(' ')}</span>
      </h3>
      <button 
        onClick={() => onCardClick(card.path)}
        className="text-orange-400 text-xs xs:text-sm font-semibold min-h-[44px] px-2 xs:px-3 py-2 rounded-lg hover:bg-orange-400/10 active:bg-orange-400/20 transition-colors"
        aria-label={`Navigate to ${card.title}`}
      >
        <span className="hidden xs:inline">View</span>
        <svg className="w-4 h-4 xs:hidden inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    
    <div className="space-y-3 xs:space-y-4">
      <p className="text-gray-200 text-xs xs:text-sm leading-relaxed">
        {card.description}
      </p>
      
      <div className="bg-white/5 rounded-lg p-3 xs:p-4 border border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0">
            <div className={`w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${card.gradient} rounded-lg xs:rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
              <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-xs xs:text-sm sm:text-base truncate">{card.title}</p>
              <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm truncate">{card.stats}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-2 xs:pt-3 border-t border-white/10">
        <button
          onClick={() => onCardClick(card.path)}
          className="text-orange-400 hover:text-orange-300 active:text-orange-200 text-xs xs:text-sm font-semibold transition-colors min-h-[44px] px-3 xs:px-4 py-2 rounded-lg hover:bg-orange-400/10 active:bg-orange-400/20"
          aria-label={`Get started with ${card.title}`}
        >
          Get Started
          <svg className="w-3 h-3 xs:w-4 xs:h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const PWAInstallButton = ({ className = "", mobile = false, isInstallable, isInstalled, installing, installApp }) => {
  if (isInstalled || !isInstallable) return null;

  return (
    <button
      onClick={installApp}
      disabled={installing}
      className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 active:scale-95 ${className} ${
        mobile 
          ? 'px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg text-xs xs:text-sm w-full min-h-[48px]' 
          : 'px-2.5 xs:px-3 py-2 rounded-lg text-xs min-h-[40px]'
      }`}
      aria-label={installing ? 'Installing app...' : 'Install app'}
    >
      {installing ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 xs:h-4 xs:w-4 border-b-2 border-white mr-1.5 xs:mr-2"></div>
          {mobile ? <span className="hidden xs:inline">Installing App...</span> : 'Installing...'}
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {mobile ? <span className="hidden xs:inline">Install App</span> : 'Install'}
        </>
      )}
    </button>
  );
};

const CommunityStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6">
    {[
      { label: 'Discussions' },
      { label: 'Members' },
      { label: 'Active Now' },
      { label: 'New Today' }
    ].map((stat, index) => (
      <div key={index} className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-lg xs:rounded-xl p-3 xs:p-4 border border-white/20 text-center">
        <div className="text-[10px] xs:text-xs sm:text-sm text-gray-400">{stat.label}</div>
      </div>
    ))}
  </div>
);

const CommunityGuidelines = () => {
  const guidelines = [
    { color: 'green-400', title: 'Be Respectful', description: 'Treat all members with kindness and professionalism' },
    { color: 'orange-400', title: 'Share Knowledge', description: 'Help others learn and grow in their tech journey' },
    { color: 'orange-400', title: 'Stay On Topic', description: 'Keep discussions relevant to tech and career development' },
    { color: 'green-400', title: 'Build Together', description: 'Collaborate and support each other\'s success' }
  ];

  return (
    <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 md:p-8 border border-white/20 shadow-2xl mt-4 xs:mt-5 sm:mt-6">
      <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 xs:mb-4 flex items-center" 
          style={{textShadow: '0 0 15px rgba(255,255,255,0.3), 1px 1px 2px rgba(0,0,0,0.8)'}}>
        <svg className="w-5 h-5 xs:w-6 xs:h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Community Guidelines
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 text-xs xs:text-sm">
        {guidelines.map((guideline, index) => (
          <div key={index} className="flex items-start gap-2 xs:gap-3">
            <svg className={`w-4 h-4 xs:w-5 xs:h-5 text-${guideline.color} flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-white font-semibold mb-0.5 xs:mb-1">{guideline.title}</p>
              <p className="text-gray-300">{guideline.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// DELETE ACCOUNT CONFIRMATION MODAL
// ─────────────────────────────────────────────
const DeleteAccountModal = ({ isOpen, onClose, currentUser, onDeleted }) => {
  const [step, setStep] = useState(1); // 1=confirm, 2=deleting, 3=done
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setConfirmText('');
      setDeleting(false);
      setDeletionProgress('');
      setError('');
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setDeleting(true);
    setStep(2);
    setError('');

    try {
      setDeletionProgress('Deleting your posts and replies...');
      
      const summary = await deleteUserAccount(currentUser);
      
      if (summary.authDeleted) {
        setDeletionProgress('Account fully deleted!');
      } else {
        setDeletionProgress('All content deleted! Signing you out...');
      }
      
      setStep(3);
      
      setTimeout(() => {
        onDeleted();
      }, 2000);

    } catch (err) {
      console.error('Account deletion error:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
      setStep(1);
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-3 xs:p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl xs:rounded-2xl border border-red-500/30 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 xs:p-5 sm:p-6 border-b border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 xs:w-12 xs:h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 xs:w-6 xs:h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base xs:text-lg font-bold text-red-400">Delete Account</h3>
              <p className="text-xs xs:text-sm text-gray-400">This action is permanent</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 xs:p-5 sm:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 xs:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-xs xs:text-sm font-medium mb-2">This will permanently delete:</p>
                <ul className="text-gray-300 text-xs xs:text-sm space-y-1.5">
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    All your community posts and replies
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Your badges and certificates
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Your project memberships and applications
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Your follow connections and notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Your account and profile data
                  </li>
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                  <p className="text-red-300 text-xs xs:text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-gray-300 text-xs xs:text-sm mb-2">
                  Type <span className="font-bold text-red-400">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full p-2.5 xs:p-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-colors text-sm xs:text-base"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-6 xs:py-8">
              <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 border-b-2 border-red-400 mx-auto mb-4"></div>
              <p className="text-white font-medium text-sm xs:text-base mb-2">Deleting your account...</p>
              <p className="text-gray-400 text-xs xs:text-sm">{deletionProgress}</p>
              <p className="text-gray-500 text-xs mt-3">Please do not close this window</p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 xs:py-8">
              <div className="w-14 h-14 xs:w-16 xs:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 xs:w-8 xs:h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm xs:text-base mb-2">Account Deleted</p>
              <p className="text-gray-400 text-xs xs:text-sm">Redirecting you now...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="p-4 xs:p-5 sm:p-6 border-t border-red-500/10 bg-black/20">
            <div className="flex gap-2 xs:gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm xs:text-base min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 px-3 xs:px-4 py-2.5 xs:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm xs:text-base min-h-[44px]"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserDashboard = ({ currentUser, onNavigate }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('achievements');
  
  const { isInstallable, isInstalled, installing, installApp } = usePWA();
  const [showPWADebug, setShowPWADebug] = useState(process.env.NODE_ENV === 'development');

  // DELETE ACCOUNT STATE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: 'Loading...',
    email: '',
    companiesOwned: 0,
    photoURL: null
  });
  const [recentBadges, setRecentBadges] = useState([]);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowPWADebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showPWADebug]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        if (sidebar && !sidebar.contains(event.target) && !menuButton?.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  // ─── SIDEBAR ITEMS: Career Coach added after Community ───
  const sidebarItems = useMemo(() => [
    { id: 'hub', label: 'Jobs' },
    { id: 'housing', label: 'Housing' },
    { id: 'banking', label: 'Banking' },
    { id: 'community', label: 'Community' },
    { id: 'companies', label: 'Companies' },
  ], []);

  const badgeCategories = useMemo(() => ({
    'mentorship': { name: 'TechMO', color: 'text-yellow-400' },
    'quality-assurance': { name: 'TechQA', color: 'text-green-400' },
    'development': { name: 'TechDev', color: 'text-green-400' },
    'leadership': { name: 'TechLeads', color: 'text-orange-400' },
    'design': { name: 'TechArchs', color: 'text-orange-400' },
    'security': { name: 'TechGuard', color: 'text-red-400' }
  }), []);

  // ─── DASHBOARD CARDS ───
  const dashboardCards = useMemo(() => ({
    hub: [
      {
        title: 'Browse Jobs',
        description: 'Find full-time, freelance & internship roles — filtered by location & visa status',
        path: '/hub',
        stats: 'Explore Jobs',
        gradient: 'from-orange-500 to-orange-600'
      },
      {
        title: 'Post a Job',
        description: 'List a job opportunity for international students',
        path: '/hub/post',
        stats: 'Post Now',
        gradient: 'from-orange-400 to-orange-500'
      },
      {
        title: 'My Job Posts',
        description: 'Manage and track your posted job listings',
        path: '/hub/my-posts',
        stats: 'Manage',
        gradient: 'from-orange-400 to-orange-500'
      }
    ],
    housing: [
      {
        title: 'Find Housing',
        description: 'Browse student-friendly apartments, rooms & studios near your campus',
        path: '/housing',
        stats: 'Browse All',
        gradient: 'from-blue-500 to-blue-600'
      },
      {
        title: 'List Your Space',
        description: 'Have a room or unit available? List it for international students',
        path: '/housing/post',
        stats: 'List Now',
        gradient: 'from-orange-500 to-orange-600'
      }
    ],
    banking: [
      {
        title: 'Banking Services',
        description: 'Find bank accounts, credit cards & financial services that accept international students',
        path: '/banking',
        stats: 'Explore',
        gradient: 'from-green-500 to-green-600'
      },
      {
        title: 'List a Service',
        description: 'Share a banking or financial service that helps international students',
        path: '/banking/post',
        stats: 'List Now',
        gradient: 'from-orange-500 to-orange-600'
      }
    ],
    community: [
      {
        title: 'Community Feed',
        description: 'Share ideas, ask questions, and engage with fellow international students',
        path: '/community',
        stats: 'Join Discussion',
        gradient: 'from-green-500 to-green-600'
      },
      {
        title: 'Create Post',
        description: 'Start a conversation and share your thoughts with the community',
        path: '/community/submit',
        stats: 'New Post',
        gradient: 'from-orange-500 to-orange-600'
      },
      {
        title: 'Member Directory',
        description: 'Discover and connect with international students and alumni in your field',
        path: '/members-directory',
        stats: 'Browse Members',
        gradient: 'from-green-600 to-green-700'
      }
    ],
    companies: [
      {
        title: 'Browse Companies',
        description: 'Explore all companies and discover opportunities',
        path: '/companies',
        stats: 'Explore All',
        gradient: 'from-green-500 to-green-600'
      },
      {
        title: 'Create Company',
        description: 'Start your own company and build your team',
        path: '/companies/create',
        stats: 'Start Now',
        gradient: 'from-orange-500 to-orange-600'
      },
      {
        title: 'My Companies',
        description: 'Manage your owned companies and team members',
        path: '/my-companies',
        stats: `${userProfile.companiesOwned} Owned`,
        gradient: 'from-orange-500 to-orange-600'
      }
    ]
  }), [userProfile.companiesOwned]);

  useEffect(() => {
    const unsubscribers = [];

    const fetchUserProfile = async () => {
      try {
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        const userCompaniesQuery = query(
          collection(db, 'companies'),
          where('ownerId', '==', currentUser.uid)
        );

        unsubscribers.push(onSnapshot(userCompaniesQuery, (snapshot) => {
          setUserProfile(prev => ({
            ...prev,
            companiesOwned: snapshot.docs.length
          }));
        }, (error) => {
          console.error('Error fetching user companies:', error);
        }));
        
        setUserProfile(prev => ({
          ...prev,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '/Images/512X512.png'
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser]);

  const handleCardClick = useCallback((path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  }, [navigate, onNavigate]);

  const handleSidebarItemClick = useCallback((item) => {
    setActiveSection(item.id);
    setSidebarOpen(false);
  }, []);

  const handleAccountDeleted = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const renderContent = () => {
    const sections = {
      hub: {
        title: 'Jobs',
        description: 'Browse full-time, freelance & internship roles — filtered by location and visa compliance.',
        gradientColors: 'from-orange-300 via-orange-400 to-orange-500',
        cards: dashboardCards.hub
      },
      housing: {
        title: 'Housing',
        description: 'Find affordable, student-friendly housing near your university — filtered by city.',
        gradientColors: 'from-blue-300 via-blue-400 to-orange-400',
        cards: dashboardCards.housing
      },
      banking: {
        title: 'Banking Services',
        description: 'Access bank accounts, insurance, money transfers and financial aid open to international students.',
        gradientColors: 'from-green-300 via-green-400 to-orange-400',
        cards: dashboardCards.banking
      },
      companies: {
        title: 'Company Hub',
        description: 'Create, manage, and explore companies to build your entrepreneurial journey.',
        gradientColors: 'from-orange-300 via-orange-400 to-orange-500',
        cards: dashboardCards.companies
      }
    };

    if (activeSection === 'community') {
      return (
        <div className="space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8">
          <SectionHeader 
            title="Community Hub"
            description="Connect, collaborate, and grow with the Loomiq international student community."
            gradientColors="from-green-300 via-orange-400 to-green-500"
          />
          
          <CommunityStats />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {dashboardCards.community?.map((card, index) => (
              <DashboardCard key={index} card={card} onCardClick={handleCardClick} />
            ))}
          </div>

          <CommunityGuidelines />

          <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 border border-green-500/30 text-center">
            <p className="text-base xs:text-lg sm:text-xl font-bold text-white mb-3 xs:mb-4" 
               style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              Ready to join the conversation?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 justify-center">
              <button
                onClick={() => handleCardClick('/community')}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 text-white font-semibold px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[48px] text-sm xs:text-base"
                aria-label="View community feed"
              >
                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Feed
              </button>
              <button
                onClick={() => handleCardClick('/community/submit')}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white font-semibold px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[48px] text-sm xs:text-base"
                aria-label="Create new post"
              >
                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
            </div>
          </div>
        </div>
      );
    }

    const section = sections[activeSection];
    if (!section) return null;

    return (
      <div className="space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8">
        <SectionHeader 
          title={section.title}
          description={section.description}
          gradientColors={section.gradientColors}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
          {section.cards?.map((card, index) => (
            <DashboardCard key={index} card={card} onCardClick={handleCardClick} />
          ))}
        </div>
      </div>
    );
  };

  if (loading || !currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-3 xs:px-4">
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-2xl xs:rounded-3xl p-5 xs:p-6 sm:p-8 border border-white/20 shadow-2xl max-w-md w-full">
            <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-white text-center font-medium text-sm xs:text-base" 
               style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              {!currentUser ? 'Please log in to view dashboard...' : 'Loading your dashboard...'}
            </p>
          </div>
          
          {showPWADebug && <PWADebugger />}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">

        {/* Sidebar */}
        <div 
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-64 xs:w-72 sm:w-80 lg:w-72 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out shadow-2xl`}
          style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 50%, rgba(250,250,250,0.98) 100%)', backdropFilter: 'blur(20px)'}}
        >
          <div className="flex items-center justify-between h-14 xs:h-16 sm:h-18 px-3 xs:px-4 sm:px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center" aria-label="Go to homepage">
              <img src="/Images/512X512.png" alt="Loomiq Logo" className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2 xs:gap-3">
              <img 
                src={userProfile.photoURL || '/Images/512X512.png'} 
                alt={`${userProfile.name}'s profile`}
                className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-orange-400/50 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {userProfile.email ? (
                  <Link 
                    to={`/profile/${encodeURIComponent(userProfile.email)}`}
                    className="font-medium text-gray-800 text-xs xs:text-sm sm:text-base truncate hover:text-orange-500 transition-colors duration-300 cursor-pointer block" 
                    style={{fontFamily: '"Inter", sans-serif'}}
                    title="View your profile"
                  >
                    {userProfile.name}
                  </Link>
                ) : (
                  <div className="font-medium text-gray-800 text-xs xs:text-sm sm:text-base truncate" 
                       style={{fontFamily: '"Inter", sans-serif'}}>
                    {userProfile.name}
                  </div>
                )}
                <div className="text-gray-600 text-[10px] xs:text-xs sm:text-sm truncate">{userProfile.email || 'Email not available'}</div>
                <div className="inline-flex items-center px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-medium bg-green-400/20 text-green-700 mt-1 xs:mt-2 border border-green-400/40">
                  <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-green-500 rounded-full mr-1 xs:mr-2"></span>
                  Active
                </div>
              </div>
            </div>
          </div>

          <nav className="p-2 xs:p-3 sm:p-4 space-y-1 xs:space-y-2 overflow-y-auto flex-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSidebarItemClick(item)}
                className={`w-full flex items-center px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 text-left rounded-lg xs:rounded-xl min-h-[52px] transition-all duration-200 active:scale-[0.98] ${
                  activeSection === item.id
                    ? 'bg-orange-400/20 text-orange-600 border-r-4 border-orange-500 font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900'
                }`}
                style={{fontFamily: '"Inter", sans-serif'}}
                aria-label={`Navigate to ${item.label}`}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span className="font-medium text-xs xs:text-sm sm:text-base">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-2 xs:p-3 sm:p-4 mt-auto border-t border-gray-200 space-y-1 xs:space-y-2">
            <a
              href="/support"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 text-left rounded-lg xs:rounded-xl min-h-[52px] transition-all duration-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900"
              style={{fontFamily: '"Inter", sans-serif'}}
              aria-label="Get support"
            >
              <svg className="w-4 h-4 xs:w-5 xs:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium text-xs xs:text-sm sm:text-base">Support</span>
            </a>

            {/* DELETE ACCOUNT BUTTON */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 text-left rounded-lg xs:rounded-xl min-h-[52px] transition-all duration-200 text-red-500 hover:bg-red-50 active:bg-red-100 hover:text-red-700"
              style={{fontFamily: '"Inter", sans-serif'}}
              aria-label="Delete account"
            >
              <svg className="w-4 h-4 xs:w-5 xs:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="font-medium text-xs xs:text-sm sm:text-base">Delete Account</span>
            </button>

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setShowPWADebug(!showPWADebug)}
                className="w-full bg-gray-600 text-white px-2 py-2 rounded-lg text-xs font-medium min-h-[40px] shadow-lg hover:bg-gray-700 active:bg-gray-800 transition-colors"
                title="Toggle PWA Debug (Ctrl+Shift+D)"
                aria-label="Toggle PWA Debug panel"
              >
                Debug Panel
              </button>
            )}
            
            <button 
              onClick={() => navigate('/logout')} 
              className="w-full bg-gray-200 text-gray-800 px-2 py-2 rounded-lg text-xs font-medium min-h-[40px] shadow-sm border border-gray-300 hover:bg-gray-300 active:bg-gray-400 transition-colors"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 min-w-0">
          <header 
            className="h-14 xs:h-16 sm:h-18 flex items-center justify-between px-3 xs:px-4 sm:px-6 relative z-10 shadow-md"
            style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 50%, rgba(250,250,250,0.98) 100%)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(229, 231, 235, 0.8)'}}
          >
            <div className="flex items-center min-w-0 gap-2 xs:gap-3 sm:gap-4">
              <button
                id="menu-button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Open sidebar menu"
              >
                <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-800 capitalize truncate" 
                  style={{fontFamily: '"Inter", sans-serif'}}>
                {activeSection.replace('-', ' ')}
              </h1>
            </div>
            
            <div className="flex items-center gap-2 xs:gap-3">
              <PWAInstallButton 
                isInstallable={isInstallable}
                isInstalled={isInstalled}
                installing={installing}
                installApp={installApp}
              />
            </div>
          </header>

          <main className="p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
            {renderContent()}
          </main>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {showPWADebug && <PWADebugger />}

        {/* DELETE ACCOUNT MODAL */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          currentUser={currentUser}
          onDeleted={handleAccountDeleted}
        />

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          
          * { font-family: 'Inter', sans-serif; }
          
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
          ::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.5); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.7); }
          
          body { overflow-x: hidden; }

          @media (min-width: 375px) {
            .xs\\:inline { display: inline; }
            .xs\\:hidden { display: none; }
          }
        `}</style>
      </div>
    </>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <UserDashboard 
      currentUser={currentUser} 
      onNavigate={navigate} 
    />
  );
};

export default Dashboard;
