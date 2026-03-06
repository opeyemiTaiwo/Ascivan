// src/Pages/user/dashboard.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../hooks/usePWA';
import Navbar from '../../components/Navbar';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { deleteUserAccount } from '../../utils/deleteUserContent';
import { toast } from 'react-toastify';

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
  <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 md:p-6 border border-white/20 shadow-2xl">
    <div className="bg-white/5 rounded-lg p-3 xs:p-4 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.98]"
         onClick={() => onCardClick(card.path)}
         role="button"
         tabIndex={0}
         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(card.path); } }}
         aria-label={`${card.title} - ${card.stats}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 xs:gap-3 min-w-0">
          <div className={`w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${card.gradient} rounded-lg xs:rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
            <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-xs xs:text-sm sm:text-base truncate">{card.buttonLabel || card.title}</p>
            <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm truncate">{card.stats}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const badgeData = [
  {
    id: 'techmo',
    title: 'TechMO',
    subtitle: 'Awarded to Tech Mentors',
    image: '/Images/TechMO.png',
    description: 'Awarded to Tech Mentors after the successful completion of each collaborative project. This badge recognizes mentors who guide and support team members effectively in technical growth and project collaboration.',
    skills: 'Mentorship, Leadership, Technical Coaching, Team Development, Knowledge Transfer',
    levels: ['Novice', 'Beginners', 'Intermediate', 'Expert'],
  },
  {
    id: 'techqa',
    title: 'TechQA',
    subtitle: 'Awarded to Quality Testers',
    image: '/Images/TechQA.png',
    description: 'Awarded to Quality Testers who successfully complete collaboration on a project. This badge recognizes QA professionals who contribute effectively to ensuring software quality.',
    skills: 'Quality Assurance, Testing, Bug Detection, Test Automation, Software Validation',
    levels: ['Novice', 'Beginners', 'Intermediate', 'Expert'],
  },
  {
    id: 'techdev',
    title: 'TechDev',
    subtitle: 'Awarded to Coding Developers',
    image: '/Images/TechDev.png',
    description: 'Awarded to Coding Developers who successfully complete collaboration on a project. This badge recognizes developers who contribute effectively to software development.',
    skills: 'Programming, Software Development, Code Review, Debugging, Technical Architecture',
    levels: ['Novice', 'Beginners', 'Intermediate', 'Expert'],
  },
  {
    id: 'techleads',
    title: 'TechLeads',
    subtitle: 'Awarded to Project Leaders',
    image: '/Images/TechLeads.png',
    description: 'Awarded to Project Leaders and non-technical professionals who successfully complete collaboration on a project. This badge recognizes those who lead, manage, or coordinate projects and tasks.',
    skills: 'Project Management, Leadership, Strategic Planning, Team Coordination, Business Analysis',
    levels: ['Novice', 'Beginners', 'Intermediate', 'Expert'],
  },
  {
    id: 'techarchs',
    title: 'TechArchs',
    subtitle: 'Awarded to Designers and No-Code Developers',
    image: '/Images/TechArchs.png',
    description: 'Awarded to No-Code Developers and Designers who successfully complete collaboration on a project. This badge recognizes professionals who contribute using no-code platforms and design tools.',
    skills: 'No-Code Development, UI/UX Design, Visual Design, Platform Architecture, Creative Solutions',
    levels: ['Novice', 'Beginners', 'Intermediate', 'Expert'],
  },
  {
    id: 'techguard',
    title: 'TechGuard',
    subtitle: 'Awarded to Security Professionals',
    image: '/Images/TechGuard.png',
    description: 'Awarded to Network and Cybersecurity professionals, including Cloud Administrators and DevOps Engineers, who successfully complete collaboration on a project.',
    skills: 'Cybersecurity, Network Security, Cloud Administration, DevOps, Infrastructure Security',
    levels: ['Novice', 'Beginners', 'Intermediate', 'Expert'],
  },
];

const BadgeInfoSection = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-center py-3 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
      >
        {expanded ? 'Hide Badge Info' : 'Learn about Tech Badges'}
        <svg className={`w-4 h-4 inline ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-4">
          <div className="bg-white/5 border border-white/20 rounded-2xl p-4 sm:p-6">
            <h3 className="text-white font-bold text-base sm:text-lg mb-2">Tech Badges</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              Earn badges by completing collaborative projects. Each badge has 4 levels based on the number of projects you complete in that category: Novice (1), Beginners (2-5), Intermediate (6-10), and Expert (11+).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badgeData.map(badge => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
                  className={`p-3 rounded-xl border text-center transition-all active:scale-[0.97] ${
                    selectedBadge?.id === badge.id
                      ? 'border-orange-400 bg-orange-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <img
                    src={badge.image}
                    alt={badge.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-lg object-contain mb-2"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <p className="text-white font-bold text-xs sm:text-sm">{badge.title}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{badge.subtitle}</p>
                </button>
              ))}
            </div>

            {/* Selected badge detail */}
            {selectedBadge && (
              <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={selectedBadge.image} alt={selectedBadge.title} className="w-14 h-14 rounded-lg object-contain" onError={e => { e.target.style.display = 'none'; }} />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">{selectedBadge.title} Badges</p>
                    <p className="text-orange-400 text-xs">{selectedBadge.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{selectedBadge.description}</p>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Skills Recognized</p>
                  <p className="text-gray-300 text-xs">{selectedBadge.skills}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Badge Levels</p>
                  <div className="flex gap-2">
                    {selectedBadge.levels.map(level => (
                      <span key={level} className="px-2 py-0.5 bg-white/10 rounded-md text-gray-300 text-[10px] font-medium">{level}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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

// ─────────────────────────────────────────────
// DELETE ACCOUNT CONFIRMATION MODAL
// ─────────────────────────────────────────────
const DeleteAccountModal = ({ isOpen, onClose, currentUser, onDeleted }) => {
  const [step, setStep] = useState(1);
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
      setTimeout(() => { onDeleted(); }, 2000);
    } catch (err) {
      console.error('Account deletion error:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
      setStep(1);
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-3 xs:p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl xs:rounded-2xl border border-red-500/30 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="p-4 xs:p-5 sm:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 xs:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-xs xs:text-sm font-medium mb-2">This will permanently delete:</p>
                <ul className="text-gray-300 text-xs xs:text-sm space-y-1.5">
                  {[
                    'All your home posts and replies',
                    'Your badges and certificates',
                    'Your project memberships and applications',
                    'Your follow connections and notifications',
                    'Your account and profile data',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
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
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'community';
  });
  
  const { isInstallable, isInstalled, installing, installApp } = usePWA();
  const [showPWADebug, setShowPWADebug] = useState(process.env.NODE_ENV === 'development');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: 'Loading...',
    email: '',
    photoURL: null
  });
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState('individual'); // 'individual' | 'company'
  const [studentType, setStudentType] = useState('international'); // 'international' | 'domestic'

  const [profileData, setProfileData] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '', university: '', major: '', visaStatus: '', city: '', state: '', portfolioUrl: '', linkedinUrl: '',
    isCompany: false, companyName: '', companyEmail: '', companyWebsite: '', companyLocation: '', companyDescription: '',
  });

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowPWADebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const sidebarOpenRef = useRef(sidebarOpen);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpenRef.current && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        if (sidebar && !sidebar.contains(event.target) && !menuButton?.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape' && sidebarOpenRef.current) setSidebarOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024 && sidebarOpenRef.current) setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sidebarItems = useMemo(() => {
    if (accountType === 'company') {
      return [
        { id: 'community', label: 'Home' },
        { id: 'hub', label: 'Jobs' },
        { id: 'projects', label: 'Projects' },
        { id: 'housing', label: 'Housing' },
        { id: 'banking', label: 'Finance' },
        { id: 'profile', label: 'Profile' },
      ];
    }
    // Domestic individual — limited tabs
    if (studentType === 'domestic') {
      return [
        { id: 'community', label: 'Home' },
        { id: 'projects', label: 'Projects' },
        { id: 'banking', label: 'Finance' },
        { id: 'profile', label: 'Profile' },
      ];
    }
    // International individual — full tabs
    return [
      { id: 'community', label: 'Home' },
      { id: 'hub', label: 'Jobs' },
      { id: 'projects', label: 'Projects' },
      { id: 'housing', label: 'Housing' },
      { id: 'banking', label: 'Finance' },
      { id: 'profile', label: 'Profile' },
    ];
  }, [accountType, studentType]);

  const dashboardCards = useMemo(() => {
    if (accountType === 'company') {
      return {
        community: [
          {
            title: 'Home Feed',
            description: 'Share ideas, ask questions, and engage with the community',
            path: '/community',
            stats: 'Join Discussion',
            gradient: 'from-green-500 to-green-600',
            buttonLabel: 'View Feed'
          },
          {
            title: 'Create Post',
            description: 'Start a conversation and share updates with the community',
            path: '/community/submit',
            stats: 'New Post',
            gradient: 'from-orange-500 to-orange-600',
            buttonLabel: 'Create Post'
          },
          {
            title: 'Connect',
            description: 'Discover and connect with international students and alumni',
            path: '/members-directory',
            stats: 'Find people in your field',
            gradient: 'from-green-600 to-green-700',
            buttonLabel: 'Network'
          }
        ],
        hub: [
          {
            title: 'Post Job',
            description: 'List a job opportunity for international students',
            path: '/jobs/post',
            stats: 'Post Now',
            gradient: 'from-orange-500 to-orange-600',
            buttonLabel: 'Post Job'
          },
          {
            title: 'My Job Posts',
            description: 'Manage and track job listings you have posted',
            path: '/jobs/my-posts',
            stats: 'Manage',
            gradient: 'from-orange-400 to-orange-500',
            buttonLabel: 'My Posts'
          },
          {
            title: 'Applicants',
            description: 'View and manage applications received for your job listings',
            path: '/jobs/my-applications',
            stats: 'Review',
            gradient: 'from-green-500 to-green-600',
            buttonLabel: 'View Applicants'
          }
        ],
        housing: [
          {
            title: 'Post Listing',
            description: 'List a housing space or room for international students',
            path: '/housing/post',
            stats: 'List Now',
            gradient: 'from-blue-500 to-blue-600',
            buttonLabel: 'Post Listing'
          },
          {
            title: 'My Housing Posts',
            description: 'Manage and track housing listings you have posted',
            path: '/housing/my-posts',
            stats: 'Manage',
            gradient: 'from-blue-400 to-blue-500',
            buttonLabel: 'My Listings'
          }
        ],
        banking: [
          {
            title: 'Post Resource',
            description: 'Share a financial resource, scholarship, or grant opportunity with the community',
            path: '/finance/post',
            stats: 'Share',
            gradient: 'from-orange-500 to-orange-600',
            buttonLabel: 'Post Resource'
          },
          {
            title: 'My Posts',
            description: 'Manage financial resource listings you have posted',
            path: '/finance/my-posts',
            stats: 'Manage',
            gradient: 'from-green-400 to-green-500',
            buttonLabel: 'My Posts'
          }
        ],
        projects: [
          {
            title: 'Browse Projects',
            description: 'Explore active projects looking for team members',
            path: '/projects',
            stats: 'Explore',
            gradient: 'from-purple-500 to-purple-600',
            buttonLabel: 'Browse Projects'
          },
          {
            title: 'Post Project',
            description: 'Create a new project and build your team',
            path: '/projects/submit',
            stats: 'Create',
            gradient: 'from-orange-500 to-orange-600',
            buttonLabel: 'Post Project'
          },
          {
            title: 'My Projects',
            description: 'Manage projects you have created or joined',
            path: '/projects/my-projects',
            stats: 'Manage',
            gradient: 'from-purple-400 to-purple-500',
            buttonLabel: 'My Projects'
          }
        ],
      };
    }
    // Individual
    return {
      community: [
        {
          title: 'Home Feed',
          description: 'Share ideas, ask questions, and engage with fellow international students',
          path: '/community',
          stats: 'Join Discussion',
          gradient: 'from-green-500 to-green-600',
          buttonLabel: 'View Feed'
        },
        {
          title: 'Create Post',
          description: 'Start a conversation and share your thoughts with the home feed',
          path: '/community/submit',
          stats: 'New Post',
          gradient: 'from-orange-500 to-orange-600',
          buttonLabel: 'Create Post'
        },
        {
          title: 'Connect',
          description: 'Discover and connect with international students and alumni in your field',
          path: '/members-directory',
          stats: 'Find people in your field',
          gradient: 'from-green-600 to-green-700',
          buttonLabel: 'Network'
        }
      ],
      hub: [
        {
          title: 'Browse Jobs',
          description: 'Find full-time, freelance & internship roles, filtered by location & visa status',
          path: '/jobs',
          stats: 'Explore Jobs',
          gradient: 'from-orange-500 to-orange-600',
          buttonLabel: 'Browse Jobs'
        },
        {
          title: 'My Applications',
          description: 'Track and manage jobs you have applied to',
          path: '/jobs/my-applications',
          stats: 'Track Status',
          gradient: 'from-green-500 to-green-600',
          buttonLabel: 'My Applications'
        },
        {
          title: 'My Job Posts',
          description: 'Manage job listings you have posted',
          path: '/jobs/my-posts',
          stats: 'Manage',
          gradient: 'from-orange-400 to-orange-500',
          buttonLabel: 'My Posts'
        }
      ],
      housing: [
        {
          title: 'Find Housing',
          description: 'Browse student-friendly apartments, rooms & studios near your campus',
          path: '/housing',
          stats: 'Browse All',
          gradient: 'from-blue-500 to-blue-600',
          buttonLabel: 'Find Housing'
        },
        {
          title: 'List Your Room',
          description: 'Have a room or unit available? List it for international students',
          path: '/housing/post',
          stats: 'List Now',
          gradient: 'from-orange-500 to-orange-600',
          buttonLabel: 'List Room'
        },
        {
          title: 'My Housing Posts',
          description: 'Manage and track housing listings you have posted',
          path: '/housing/my-posts',
          stats: 'Manage',
          gradient: 'from-blue-400 to-blue-500',
          buttonLabel: 'My Listings'
        }
      ],
      banking: [
        {
          title: 'Finance Resources',
          description: 'Scholarships, loans, work-study, grants, fellowships & financial services',
          path: '/finance',
          stats: 'Explore',
          gradient: 'from-green-500 to-green-600',
          buttonLabel: 'Browse Resources'
        }
      ],
      projects: [
        {
          title: 'Browse Projects',
          description: 'Explore active projects looking for team members',
          path: '/projects',
          stats: 'Explore',
          gradient: 'from-purple-500 to-purple-600',
          buttonLabel: 'Browse Projects'
        },
        {
          title: 'Post Project',
          description: 'Create a new project and build your team',
          path: '/projects/submit',
          stats: 'Create',
          gradient: 'from-orange-500 to-orange-600',
          buttonLabel: 'Post Project'
        },
        {
          title: 'My Projects',
          description: 'Track projects you have applied to or created',
          path: '/projects/my-projects',
          stats: 'Manage',
          gradient: 'from-purple-400 to-purple-500',
          buttonLabel: 'My Projects'
        }
      ],
    };
  }, [accountType]);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setUserProfile(prev => ({
      ...prev,
      name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || '/Images/512X512.png'
    }));
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfileData(data);
          // Use custom uploaded photo if available, otherwise Google photo
          if (data.customPhotoURL || data.photoURL) {
            setUserProfile(prev => ({ ...prev, photoURL: data.customPhotoURL || data.photoURL || prev.photoURL }));
          }
          // Set account type from Firestore
          if (data.accountType) {
            setAccountType(data.accountType);
          } else if (data.isCompany) {
            setAccountType('company');
          }
          if (data.studentType) {
            setStudentType(data.studentType);
          }
          const cp = data.companyProfile || {};
          setProfileForm({
            displayName: data.displayName || currentUser.displayName || '',
            university: data.university || '',
            major: data.major || '',
            visaStatus: data.visaStatus || '',
            city: data.city || '',
            state: data.state || '',
            portfolioUrl: data.portfolioUrl || '',
            linkedinUrl: data.linkedinUrl || '',
            isCompany: data.isCompany || false,
            companyName: cp.companyName || '',
            companyEmail: cp.companyEmail || '',
            companyWebsite: cp.companyWebsite || '',
            companyLocation: cp.companyLocation || '',
            companyDescription: cp.companyDescription || '',
          });
        }
      } catch (e) { console.error('Error fetching profile:', e); }
    };
    fetchProfile();
    setLoading(false);

    // Listen for user's badges
    if (currentUser?.email) {
      const badgeQ = query(collection(db, 'member_badges'), where('memberEmail', '==', currentUser.email));
      const unsubBadges = onSnapshot(badgeQ, (snap) => {
        setUserBadges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return unsubBadges;
    }
  }, [currentUser]);

  const handleCardClick = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [navigate, onNavigate]);

  const handleSidebarItemClick = useCallback((item) => {
    setActiveSection(item.id);
    setSidebarOpen(false);
  }, []);

  const handleAccountDeleted = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const renderContent = () => {
    // Section metadata for headers
    const sectionMeta = {
      community: { title: 'Home', description: 'Connect, collaborate, and grow with the Loomiqe community.', gradientColors: 'from-green-300 via-orange-400 to-green-500' },
      hub: { title: 'Jobs', description: accountType === 'company' ? 'Post and manage job listings for international students.' : 'Browse full-time, freelance & internship roles, filtered by location and visa compliance.', gradientColors: 'from-orange-300 via-orange-400 to-orange-500' },
      projects: { title: 'Projects', description: 'Build real projects, grow your skills, and earn badges.', gradientColors: 'from-purple-300 via-purple-400 to-orange-400' },
      housing: { title: 'Housing', description: accountType === 'company' ? 'List housing spaces for international students.' : 'Find affordable, student-friendly housing near your university.', gradientColors: 'from-blue-300 via-blue-400 to-orange-400' },
      banking: { title: 'Finance', description: 'Scholarships, loans, work-study, grants, fellowships & financial aid for international students.', gradientColors: 'from-green-300 via-green-400 to-orange-400' },
      directory: { title: 'Member Directory', description: 'Discover and connect with international students and alumni.', gradientColors: 'from-green-300 via-green-400 to-green-500' },
    };

    if (activeSection === 'profile') {
      const BLOCKED_DOMAINS = ['gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.co.in','outlook.com','hotmail.com','live.com','msn.com','aol.com','icloud.com','me.com','mac.com','protonmail.com','proton.me','zoho.com','yandex.com','mail.com','gmx.com','fastmail.com','tutanota.com'];
      const isBizEmail = (e) => e && e.includes('@') && !BLOCKED_DOMAINS.includes(e.split('@')[1]?.toLowerCase());

      const handleProfileSave = async () => {
        if (!profileForm.displayName.trim()) { toast.error('Name is required'); return; }
        if (!profileForm.linkedinUrl.trim()) { toast.error('LinkedIn profile URL is required'); return; }
        if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i.test(profileForm.linkedinUrl.trim())) {
          toast.error('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)'); return;
        }
        if (profileForm.isCompany) {
          if (!profileForm.companyName.trim()) { toast.error('Company name is required'); return; }
          if (!profileForm.companyEmail.trim()) { toast.error('Business email is required'); return; }
          if (!isBizEmail(profileForm.companyEmail)) { toast.error('Please use a business email (not Gmail, Yahoo, Outlook, etc.)'); return; }
        }
        setProfileSaving(true);
        try {
          const updateData = {
            displayName: profileForm.displayName.trim(),
            university: profileForm.university.trim() || null,
            major: profileForm.major.trim() || null,
            visaStatus: profileForm.visaStatus || null,
            city: profileForm.city.trim() || null,
            state: profileForm.state.trim() || null,
            portfolioUrl: profileForm.portfolioUrl.trim() || null,
            linkedinUrl: profileForm.linkedinUrl.trim(),
            isCompany: profileForm.isCompany,
            profileComplete: true,
          };
          if (profileForm.isCompany) {
            updateData.companyProfile = {
              companyName: profileForm.companyName.trim(),
              companyEmail: profileForm.companyEmail.trim(),
              companyWebsite: profileForm.companyWebsite.trim() || null,
              companyLocation: profileForm.companyLocation.trim() || null,
              companyDescription: profileForm.companyDescription.trim() || null,
              updatedAt: new Date(),
            };
          } else {
            updateData.companyProfile = null;
          }
          await setDoc(doc(db, 'users', currentUser.uid), updateData, { merge: true });
          setUserProfile(prev => ({ ...prev, name: updateData.displayName }));
          setProfileData(prev => ({ ...prev, ...updateData }));
          setProfileEditing(false);
          toast.success('Profile updated!');
        } catch (e) {
          console.error(e);
          toast.error('Failed to save profile');
        } finally {
          setProfileSaving(false);
        }
      };

      const visaOpts = [
        { id: 'F-1', label: 'F-1 Student Visa' }, { id: 'OPT', label: 'OPT' }, { id: 'CPT', label: 'CPT' },
        { id: 'H-1B', label: 'H-1B Work Visa' }, { id: 'J-1', label: 'J-1 Exchange Visitor' },
        { id: 'PR', label: 'Permanent Resident' }, { id: 'Citizen', label: 'US Citizen' }, { id: 'Other', label: 'Other' },
      ];

      const inputCls = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[44px] text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm transition-all";
      const labelCls = "block text-orange-400 font-semibold mb-2 text-sm";

      return (
        <div className="space-y-4 sm:space-y-6">
          <SectionHeader title="Profile" description="View and update your personal and company information." gradientColors="from-orange-300 via-orange-400 to-orange-500" />
          <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
            {!profileEditing ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Personal Information</h3>
                  <button onClick={() => setProfileEditing(true)} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-all min-h-[44px]">Edit Profile</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['Name', profileForm.displayName],
                    ['University', profileForm.university],
                    ['Major', profileForm.major],
                    ['Visa Status', profileForm.visaStatus],
                    ['City', profileForm.city],
                    ['State', profileForm.state],
                    ['LinkedIn', profileForm.linkedinUrl],
                    ['Portfolio', profileForm.portfolioUrl],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                      {(label === 'Portfolio' || label === 'LinkedIn') && val ? (
                        <a href={val} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 text-sm font-medium underline break-all">{val}</a>
                      ) : (
                        <p className="text-white text-sm font-medium">{val || 'N/A'}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${profileForm.isCompany ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                    {profileForm.isCompany ? 'Company Account' : 'Individual Account'}
                  </span>
                </div>
                {profileForm.isCompany && profileData?.companyProfile && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <h3 className="text-lg font-bold text-white">Company Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        ['Company Name', profileData.companyProfile.companyName],
                        ['Business Email', profileData.companyProfile.companyEmail],
                        ['Website', profileData.companyProfile.companyWebsite],
                        ['Location', profileData.companyProfile.companyLocation],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-white text-sm font-medium break-all">{val || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                    {profileData.companyProfile.companyDescription && (
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Description</p>
                        <p className="text-gray-300 text-sm">{profileData.companyProfile.companyDescription}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Badges Section */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Badges Earned</h3>
                  {userBadges.length === 0 ? (
                    <p className="text-gray-500 text-sm">No badges earned yet. Complete projects to earn tech badges.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-bold border border-orange-500/30">
                          {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''} earned
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {userBadges.map(badge => {
                          const badgeImages = {
                            'mentorship': '/Images/TechMO.png',
                            'quality-assurance': '/Images/TechQA.png',
                            'development': '/Images/TechDev.png',
                            'leadership': '/Images/TechLeads.png',
                            'design': '/Images/TechArchs.png',
                            'security': '/Images/TechGuard.png',
                          };
                          return (
                            <div key={badge.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                              <img 
                                src={badgeImages[badge.badgeCategory] || '/Images/TechDev.png'} 
                                alt={badge.badgeName} 
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain flex-shrink-0"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                              <div className="min-w-0">
                                <p className="text-white font-semibold text-xs sm:text-sm truncate">{badge.badgeName}</p>
                                <p className="text-gray-400 text-[10px] sm:text-xs">Level: {badge.badgeLevel}</p>
                                <p className="text-gray-500 text-[10px] truncate">{badge.projectTitle}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                  <button onClick={() => setProfileEditing(false)} className="text-gray-400 hover:text-white text-sm font-semibold min-h-[44px]">Cancel</button>
                </div>
                <div className="space-y-4">
                  {/* Profile Photo Upload */}
                  <div>
                    <label className={labelCls}>Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <img
                        src={userProfile.photoURL || '/Images/512X512.png'}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-400/50 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                            if (!validTypes.includes(file.type)) { toast.error('Please upload a JPG, PNG, or WebP image'); return; }
                            if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
                            try {
                              toast.info('Uploading photo...');
                              const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
                              await uploadBytes(storageRef, file);
                              const downloadURL = await getDownloadURL(storageRef);
                              await setDoc(doc(db, 'users', currentUser.uid), { customPhotoURL: downloadURL }, { merge: true });
                              setUserProfile(prev => ({ ...prev, photoURL: downloadURL }));
                              toast.success('Profile photo updated!');
                            } catch (err) {
                              console.error('Photo upload error:', err);
                              toast.error('Failed to upload photo. Please try again.');
                            }
                          }}
                          className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 file:cursor-pointer file:transition-all"
                        />
                        <p className="text-gray-600 text-[10px] mt-1">JPG, PNG, or WebP. Max 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Name *</label>
                    <input type="text" value={profileForm.displayName} onChange={e => setProfileForm(p => ({...p, displayName: e.target.value}))} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>University</label>
                      <input type="text" value={profileForm.university} onChange={e => setProfileForm(p => ({...p, university: e.target.value}))} className={inputCls} placeholder="e.g., Morgan State University" />
                    </div>
                    <div>
                      <label className={labelCls}>Major</label>
                      <input type="text" value={profileForm.major} onChange={e => setProfileForm(p => ({...p, major: e.target.value}))} className={inputCls} placeholder="e.g., Computer Science" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Visa Status</label>
                    <select value={profileForm.visaStatus} onChange={e => setProfileForm(p => ({...p, visaStatus: e.target.value}))} className={inputCls}>
                      <option value="">Select...</option>
                      {visaOpts.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>City</label>
                      <input type="text" value={profileForm.city} onChange={e => setProfileForm(p => ({...p, city: e.target.value}))} className={inputCls} placeholder="e.g., Baltimore" />
                    </div>
                    <div>
                      <label className={labelCls}>State</label>
                      <input type="text" value={profileForm.state} onChange={e => setProfileForm(p => ({...p, state: e.target.value}))} className={inputCls} placeholder="e.g., MD" maxLength={2} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>LinkedIn Profile URL *</label>
                    <input type="url" value={profileForm.linkedinUrl} onChange={e => setProfileForm(p => ({...p, linkedinUrl: e.target.value}))} className={inputCls} placeholder="https://linkedin.com/in/yourname" />
                    {profileForm.linkedinUrl.trim() && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i.test(profileForm.linkedinUrl.trim()) && (
                      <p className="text-red-400 text-xs mt-1 font-semibold">Please use the format: https://linkedin.com/in/yourname</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Portfolio URL</label>
                    <input type="url" value={profileForm.portfolioUrl} onChange={e => setProfileForm(p => ({...p, portfolioUrl: e.target.value}))} className={inputCls} placeholder="https://your-portfolio.com" />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-white">Account Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setProfileForm(p => ({...p, isCompany: false}))}
                      className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${!profileForm.isCompany ? 'border-orange-400 bg-orange-500/20 shadow-lg' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                      <svg className="w-6 h-6 mx-auto mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <div className={`text-sm font-bold ${!profileForm.isCompany ? 'text-white' : 'text-gray-300'}`}>Individual</div>
                    </button>
                    <button type="button" onClick={() => setProfileForm(p => ({...p, isCompany: true}))}
                      className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${profileForm.isCompany ? 'border-orange-400 bg-orange-500/20 shadow-lg' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                      <div className={`text-sm font-bold ${profileForm.isCompany ? 'text-white' : 'text-gray-300'}`}>Company</div>
                    </button>
                  </div>
                  {profileForm.isCompany && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className={labelCls}>Company Name *</label>
                        <input type="text" value={profileForm.companyName} onChange={e => setProfileForm(p => ({...p, companyName: e.target.value}))} className={inputCls} placeholder="e.g., TechStart Inc." />
                      </div>
                      <div>
                        <label className={labelCls}>Business Email *</label>
                        <input type="email" value={profileForm.companyEmail} onChange={e => setProfileForm(p => ({...p, companyEmail: e.target.value}))}
                          className={`${inputCls} ${profileForm.companyEmail && !isBizEmail(profileForm.companyEmail) ? 'border-red-500/50' : ''}`}
                          placeholder="you@company.com" />
                        {profileForm.companyEmail && !isBizEmail(profileForm.companyEmail) && (
                          <p className="text-red-400 text-xs mt-1.5 font-semibold">Business email required. Gmail, Yahoo, Outlook not accepted.</p>
                        )}
                      </div>
                      <div>
                        <label className={labelCls}>Website</label>
                        <input type="url" value={profileForm.companyWebsite} onChange={e => setProfileForm(p => ({...p, companyWebsite: e.target.value}))} className={inputCls} placeholder="https://company.com" />
                      </div>
                      <div>
                        <label className={labelCls}>Company Location</label>
                        <input type="text" value={profileForm.companyLocation} onChange={e => setProfileForm(p => ({...p, companyLocation: e.target.value}))} className={inputCls} placeholder="e.g., Baltimore, MD" />
                      </div>
                      <div>
                        <label className={labelCls}>Description</label>
                        <textarea value={profileForm.companyDescription} onChange={e => setProfileForm(p => ({...p, companyDescription: e.target.value}))} className={inputCls + " resize-none"} rows="3" placeholder="What does your company do?" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setProfileEditing(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all min-h-[44px]">Cancel</button>
                  <button onClick={handleProfileSave} disabled={profileSaving}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 min-h-[44px]">
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <style jsx>{`select option { background-color: #111; color: white; }`}</style>
        </div>
      );
    }

    // Generic section renderer for all sections
    const meta = sectionMeta[activeSection];
    const cards = dashboardCards[activeSection];
    if (!meta) return null;

    return (
      <div className="space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8">
        <SectionHeader 
          title={meta.title}
          description={meta.description}
          gradientColors={meta.gradientColors}
        />

        {/* Earnings / Spending Summary - shown on Home tab */}
        {activeSection === 'community' && profileData && (
          <div className="flex flex-wrap justify-center gap-3 xs:gap-4">
            <div className="w-full sm:w-[calc(50%-0.75rem)] bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Money Earned</p>
              <p className="text-green-400 text-xl sm:text-2xl font-black mt-1">${(profileData.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{profileData.completedPaidProjects || 0} paid project{(profileData.completedPaidProjects || 0) !== 1 ? 's' : ''} completed</p>
            </div>
            <div className="w-full sm:w-[calc(50%-0.75rem)] bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Money Disbursed</p>
              <p className="text-orange-400 text-xl sm:text-2xl font-black mt-1">${(profileData.totalDisbursed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{profileData.completedPostedProjects || 0} project{(profileData.completedPostedProjects || 0) !== 1 ? 's' : ''} posted and completed</p>
            </div>
          </div>
        )}

        {cards && cards.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`w-full ${
                  cards.length === 1
                    ? 'sm:w-[calc(50%-0.75rem)]'
                    : cards.length === 2
                    ? 'sm:w-[calc(50%-0.75rem)] lg:w-[calc(50%-1rem)]'
                    : 'sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]'
                }`}
              >
                <DashboardCard card={card} onCardClick={handleCardClick} />
              </div>
            ))}
          </div>
        )}

        {/* Tech Badges Info - shown only on Projects tab */}
        {activeSection === 'projects' && (
          <BadgeInfoSection />
        )}
      </div>
    );
  };

  if (loading || !currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-3 xs:px-4" style={{ backgroundColor: '#000' }}>
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-2xl xs:rounded-3xl p-5 xs:p-6 sm:p-8 border border-white/20 shadow-2xl max-w-md w-full">
            <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-white text-center font-medium text-sm xs:text-base" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
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
      <div className="min-h-screen flex" style={{ backgroundColor: '#000' }}>

        {/* ── SIDEBAR ── */}
        <div 
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-64 xs:w-72 sm:w-80 lg:w-72 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col`}
          style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.97) 50%, rgba(250,250,250,0.98) 100%)'}}
        >
          {/* ── SIDEBAR HEADER: close button only on mobile, nothing on desktop ── */}
          <div className="flex items-center justify-end h-14 xs:h-16 px-3 xs:px-4 border-b border-gray-200 lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── USER PROFILE ── */}
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
                  <div className="font-medium text-gray-800 text-xs xs:text-sm sm:text-base truncate" style={{fontFamily: '"Inter", sans-serif'}}>
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

          {/* ── NAV ITEMS ── */}
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

          {/* ── BOTTOM ACTIONS ── */}
          <div className="p-2 xs:p-3 sm:p-4 mt-auto border-t border-gray-200 space-y-1 xs:space-y-2">
            <a
              href="/support"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 text-left rounded-lg xs:rounded-xl min-h-[52px] transition-all duration-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900"
              style={{fontFamily: '"Inter", sans-serif'}}
            >
              <svg className="w-4 h-4 xs:w-5 xs:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium text-xs xs:text-sm sm:text-base">Support</span>
            </a>

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setShowPWADebug(!showPWADebug)}
                className="w-full bg-gray-600 text-white px-2 py-2 rounded-lg text-xs font-medium min-h-[40px] shadow-lg hover:bg-gray-700 active:bg-gray-800 transition-colors"
                title="Toggle PWA Debug (Ctrl+Shift+D)"
              >
                Debug Panel
              </button>
            )}

            <button 
              onClick={() => navigate('/logout')} 
              className="w-full bg-gray-200 text-gray-800 px-2 py-2 rounded-lg text-xs font-medium min-h-[40px] shadow-sm border border-gray-300 hover:bg-gray-300 active:bg-gray-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 lg:ml-0 min-w-0">
          <header 
            className="h-14 xs:h-16 sm:h-18 flex items-center justify-between px-3 xs:px-4 sm:px-6 relative z-10 border-b border-white/10"
            style={{ backgroundColor: '#000' }}
          >
            <div className="flex items-center min-w-0 gap-2 xs:gap-3 sm:gap-4">
              <button
                id="menu-button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
                aria-label="Open sidebar menu"
              >
                <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
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

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {showPWADebug && <PWADebugger />}

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
  return <UserDashboard currentUser={currentUser} onNavigate={navigate} />;
};

export default Dashboard;
