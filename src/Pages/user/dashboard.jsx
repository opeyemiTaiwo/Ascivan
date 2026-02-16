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
  onSnapshot, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/config';

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
    { color: 'blue-400', title: 'Be Respectful', description: 'Treat all members with kindness and professionalism' },
    { color: 'orange-400', title: 'Share Knowledge', description: 'Help others learn and grow in their tech journey' },
    { color: 'purple-400', title: 'Stay On Topic', description: 'Keep discussions relevant to tech and career development' },
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

const UserDashboard = ({ currentUser, onNavigate }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('achievements');
  
  const { isInstallable, isInstalled, installing, installApp } = usePWA();
  const [showPWADebug, setShowPWADebug] = useState(process.env.NODE_ENV === 'development');
  
  const [userProfile, setUserProfile] = useState({
    name: 'Loading...',
    email: '',
    certificatesEarned: 0,
    badgesEarned: 0,
    projectsCompleted: 0,
    ongoingProjects: 0,
    companiesOwned: 0,
    eventsHosted: 0,
    eventsAttended: 0,
    photoURL: null
  });
  const [recentBadges, setRecentBadges] = useState([]);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
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

  const sidebarItems = useMemo(() => [
    { id: 'achievements', label: 'Tech Badges' },
    { id: 'learning', label: 'Career' },
    { id: 'hub', label: 'Hub' },
    { id: 'events', label: 'Events' },
    { id: 'projects', label: 'Projects' },
    { id: 'community', label: 'Community' },
    { id: 'innovation-expo', label: 'Innovation Expo' }
  ], []);

  const badgeCategories = useMemo(() => ({
    'mentorship': { name: 'TechMO', color: 'text-yellow-400' },
    'quality-assurance': { name: 'TechQA', color: 'text-blue-400' },
    'development': { name: 'TechDev', color: 'text-green-400' },
    'leadership': { name: 'TechLeads', color: 'text-purple-400' },
    'design': { name: 'TechArchs', color: 'text-orange-400' },
    'security': { name: 'TechGuard', color: 'text-red-400' }
  }), []);

  const dashboardCards = useMemo(() => ({
    achievements: [
      {
        title: 'My Achievements',
        description: 'View all your earned badges and certificates',
        path: '/my-badges',
        stats: `${userProfile.badgesEarned} Badges`,
        gradient: 'from-orange-500 to-orange-600'
      },
      {
        title: 'TechTalent Badges',
        description: 'Discover all available tech badges and learn how to earn them',
        path: '/tech-badges',
        stats: '6 Categories',
        gradient: 'from-blue-500 to-blue-600'
      }
    ],
    learning: [
      {
        title: 'Learning Resources Hub',
        description: 'Access 200+ free courses, tutorials, and certifications for every tech career',
        path: '/career/resources',
        stats: '12+ Career Tracks',
        gradient: 'from-blue-500 to-blue-600'
      },
      {
        title: 'AI Career Recommendations',
        description: 'Get personalized career paths and learning plans powered by AI',
        path: '/career/dashboard',
        stats: 'AI Powered',
        gradient: 'from-orange-500 to-orange-600'
      }
    ],
    hub: [
      {
        title: 'Browse Hub',
        description: 'Discover jobs, projects, events, courses, internships, programs, and scholarships',
        path: '/hub',
        stats: '7 Categories',
        gradient: 'from-lime-500 to-green-600'
      },
      {
        title: 'Post Opportunity',
        description: 'Share jobs, projects, courses, or any opportunity with the community',
        path: '/hub/post',
        stats: 'Create Post',
        gradient: 'from-orange-500 to-orange-600'
      },
      {
        title: 'My Posts',
        description: 'Manage your posted opportunities and track engagement',
        path: '/hub/my-posts',
        stats: 'View All',
        gradient: 'from-blue-500 to-blue-600'
      }
    ],
    events: [
      {
        title: 'Browse Events',
        description: 'Discover and register for tech workshops, webinars, and conferences',
        path: '/events',
        stats: 'Explore All',
        gradient: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Create Event',
        description: 'Host your own tech event and share knowledge with the community',
        path: '/events/submit',
        stats: 'Host Event',
        gradient: 'from-orange-500 to-orange-600'
      },
      {
        title: 'My Events',
        description: 'View events you\'re hosting or attending',
        path: '/events/my-events',
        stats: `${userProfile.eventsHosted} Hosted`,
        gradient: 'from-blue-500 to-blue-600'
      }
    ],
    projects: [
      {
        title: 'Submit Project',
        description: 'Share your work and build your portfolio',
        path: '/submit-project',
        stats: 'Create New',
        gradient: 'from-orange-500 to-orange-600'
      },
      {
        title: 'Join Projects',
        description: 'Discover and apply to exciting opportunities',
        path: '/projects',
        stats: 'Browse All',
        gradient: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Ongoing Projects',
        description: 'Manage your active project groups and track progress',
        path: '/my-groups',
        stats: `${userProfile.ongoingProjects} Active`,
        gradient: 'from-blue-500 to-blue-600'
      }
    ],
    community: [
      {
        title: 'Community Feed',
        description: 'Share ideas, ask questions, and engage with fellow Loomiq members',
        path: '/community',
        stats: 'Join Discussion',
        gradient: 'from-blue-500 to-blue-600'
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
        description: 'Discover and connect with Loomiq members in your field',
        path: '/members-directory',
        stats: 'Browse Members',
        gradient: 'from-purple-500 to-purple-600'
      }
    ],
    companies: [
      {
        title: 'Browse Companies',
        description: 'Explore all companies and discover opportunities',
        path: '/companies',
        stats: 'Explore All',
        gradient: 'from-blue-500 to-blue-600'
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
  }), [userProfile.badgesEarned, userProfile.ongoingProjects, userProfile.companiesOwned, userProfile.eventsHosted]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        const badgesQuery = query(
          collection(db, 'member_badges'),
          where('memberEmail', '==', currentUser.email),
          orderBy('awardedAt', 'desc'),
          limit(3)
        );

        const badgesUnsubscribe = onSnapshot(badgesQuery, (snapshot) => {
          const badges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecentBadges(badges);
        }, (error) => {
          console.error('Error fetching badges:', error);
        });

        const certificatesQuery = query(
          collection(db, 'certificates'),
          where('recipientEmail', '==', currentUser.email),
          orderBy('generatedAt', 'desc'),
          limit(2)
        );

        const certificatesUnsubscribe = onSnapshot(certificatesQuery, (snapshot) => {
          const certificates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecentCertificates(certificates);
        }, (error) => {
          console.error('Error fetching certificates:', error);
        });

        const eventsQuery = query(
          collection(db, 'tech_events'),
          where('submitterEmail', '==', currentUser.email),
          orderBy('createdAt', 'desc'),
          limit(3)
        );

        const eventsUnsubscribe = onSnapshot(eventsQuery, (snapshot) => {
          const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecentEvents(events);
          
          setUserProfile(prev => ({
            ...prev,
            eventsHosted: snapshot.docs.length
          }));
        }, (error) => {
          console.error('Error fetching events:', error);
        });

        const eventAttendeesQuery = query(
          collection(db, 'event_attendees'),
          where('userEmail', '==', currentUser.email)
        );

        const eventAttendeesUnsubscribe = onSnapshot(eventAttendeesQuery, (snapshot) => {
          setUserProfile(prev => ({
            ...prev,
            eventsAttended: snapshot.docs.length
          }));
        }, (error) => {
          console.error('Error fetching event attendees:', error);
        });

        const allBadgesQuery = query(
          collection(db, 'member_badges'),
          where('memberEmail', '==', currentUser.email)
        );

        const allBadgesUnsubscribe = onSnapshot(allBadgesQuery, (snapshot) => {
          const totalBadges = snapshot.docs.length;
          const completedProjects = new Set(snapshot.docs.map(doc => doc.data().groupId)).size;
          
          setUserProfile(prev => ({
            ...prev,
            badgesEarned: totalBadges,
            projectsCompleted: completedProjects
          }));
        }, (error) => {
          console.error('Error fetching all badges:', error);
        });

        const allCertificatesQuery = query(
          collection(db, 'certificates'),
          where('recipientEmail', '==', currentUser.email)
        );

        const allCertificatesUnsubscribe = onSnapshot(allCertificatesQuery, (snapshot) => {
          setUserProfile(prev => ({
            ...prev,
            certificatesEarned: snapshot.docs.length
          }));
        }, (error) => {
          console.error('Error fetching all certificates:', error);
        });

        const groupMembersQuery = query(
          collection(db, 'group_members'),
          where('userEmail', '==', currentUser.email),
          where('status', '==', 'active')
        );

        const groupMembersUnsubscribe = onSnapshot(groupMembersQuery, (snapshot) => {
          setUserProfile(prev => ({
            ...prev,
            ongoingProjects: snapshot.docs.length
          }));
        }, (error) => {
          console.error('Error fetching group members:', error);
        });

        const userCompaniesQuery = query(
          collection(db, 'companies'),
          where('ownerId', '==', currentUser.uid)
        );

        const userCompaniesUnsubscribe = onSnapshot(userCompaniesQuery, (snapshot) => {
          setUserProfile(prev => ({
            ...prev,
            companiesOwned: snapshot.docs.length
          }));
        }, (error) => {
          console.error('Error fetching user companies:', error);
        });
        
        setUserProfile(prev => ({
          ...prev,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '/Images/loomiq-logo.svg'
        }));
        
        setLoading(false);

        return () => {
          badgesUnsubscribe();
          certificatesUnsubscribe();
          eventsUnsubscribe();
          eventAttendeesUnsubscribe();
          allBadgesUnsubscribe();
          allCertificatesUnsubscribe();
          groupMembersUnsubscribe();
          userCompaniesUnsubscribe();
        };
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
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

  const InnovationExpoSection = () => (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8">
      <SectionHeader 
        title="INNOVATION EXPO"
        description=""
        gradientColors="from-orange-300 via-orange-400 to-blue-500"
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 border border-white/20 shadow-2xl">
          <div className="text-center mb-4 xs:mb-5 sm:mb-6 md:mb-8">
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-orange-500 to-blue-600 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6 shadow-lg">
              <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 xs:mb-4" 
                style={{textShadow: '0 0 15px rgba(255,255,255,0.3), 1px 1px 2px rgba(0,0,0,0.8)'}}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-500">
                Calling All Innovators!
              </span>
            </h3>
          </div>

          <div className="space-y-3 xs:space-y-4 sm:space-y-6 text-center">
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed px-2" 
               style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              Are you ready to revolutionize the tech world? It's time to turn your ideas into reality and showcase your brilliance at our Innovation Expo!
            </p>

            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed px-2" 
               style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              Whether you're passionate about coding, engineering, or conducting groundbreaking research, this is your chance to shine. Start building your projects, conducting research, and preparing to blow minds!
            </p>

            <div className="bg-gradient-to-r from-blue-500/20 to-orange-500/20 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-blue-500/30 my-4 xs:my-5 sm:my-6">
              <h4 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-white mb-2 xs:mb-3" 
                  style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                Submit Your Favorite Projects
              </h4>
              <p className="text-xs xs:text-sm sm:text-base text-gray-200 mb-2 xs:mb-3">
                Choose your best work from the platform to present at the Innovation Expo! Your project must have the consent or agreement of your group members before submission.
              </p>
              <div className="bg-black/20 rounded-lg p-2 xs:p-3 sm:p-4 text-left space-y-2">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300">
                    <strong className="text-blue-400">Team Projects:</strong> The same project must be presented as a team with all interested members
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300">
                    <strong className="text-orange-400">Solo Presentation:</strong> If no other team member is interested, you can present alone with their consent
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300">
                    <strong className="text-blue-400">Group Agreement:</strong> All submissions require approval from your project group members
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border border-orange-500/30 my-4 xs:my-5 sm:my-6">
              <p className="text-base xs:text-lg sm:text-xl font-bold text-white mb-2" 
                 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                We are excited to see your work and celebrate you!
              </p>
              <p className="text-lg xs:text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-500">
                Cash and prizes to be won!
              </p>
            </div>

            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed px-2" 
               style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              If you are interested in presenting your project, let us know by filling out the interest form below.
            </p>

            <div className="pt-3 xs:pt-4 sm:pt-6">
              <a href="https://form.jotform.com/241518319102145"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-5 rounded-lg xs:rounded-xl shadow-2xl hover:from-orange-600 hover:to-blue-700 active:from-orange-700 active:to-blue-800 transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
    aria-label="Submit your project for Innovation Expo"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
    Submit Your Project
  </a>
</div>
<p className="text-xs xs:text-sm sm:text-base text-gray-400 mt-3 xs:mt-4 italic">
  Don't miss this opportunity to showcase your innovation and compete for amazing prizes!
</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    const sections = {
      achievements: {
        title: 'Your Achievements',
        description: 'Manage your badges, certificates, and showcase your accomplishments.',
        gradientColors: 'from-orange-300 via-orange-400 to-orange-500',
        cards: dashboardCards.achievements
      },
      learning: {
        title: 'My Career Hub',
        description: 'Access career resources and AI-powered guidance for your professional growth.',
        gradientColors: 'from-blue-300 via-blue-400 to-blue-500',
        cards: dashboardCards.learning
      },
      hub: {
        title: 'Opportunities Hub',
        description: 'Discover and share jobs, projects, events, courses, internships, programs, and scholarships.',
        gradientColors: 'from-lime-300 via-green-400 to-emerald-500',
        cards: dashboardCards.hub
      },
      events: {
        title: 'Tech Events',
        description: 'Discover, register, and host tech events, workshops, and conferences.',
        gradientColors: 'from-purple-300 via-purple-400 to-pink-500',
        cards: dashboardCards.events
      },
      projects: {
        title: 'Project Management',
        description: 'Submit, join, and manage your collaborative projects and build your portfolio.',
        gradientColors: 'from-blue-300 via-blue-400 to-blue-500',
        cards: dashboardCards.projects
      },
      companies: {
        title: 'Company Hub',
        description: 'Create, manage, and explore companies to build your entrepreneurial journey.',
        gradientColors: 'from-orange-300 via-orange-400 to-orange-500',
        cards: dashboardCards.companies
      }
    };

    if (activeSection === 'innovation-expo') {
      return <InnovationExpoSection />;
    }

    if (activeSection === 'community') {
      return (
        <div className="space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8">
          <SectionHeader 
            title="Community Hub"
            description="Connect, collaborate, and grow with the Loomiq community."
            gradientColors="from-blue-300 via-purple-400 to-blue-500"
          />
          
          <CommunityStats />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {dashboardCards.community?.map((card, index) => (
              <DashboardCard key={index} card={card} onCardClick={handleCardClick} />
            ))}
          </div>

          <CommunityGuidelines />

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 border border-blue-500/30 text-center">
            <p className="text-base xs:text-lg sm:text-xl font-bold text-white mb-3 xs:mb-4" 
               style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              Ready to join the conversation?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 justify-center">
              <button
                onClick={() => handleCardClick('/community')}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white font-semibold px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[48px] text-sm xs:text-base"
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
              <img src="/Images/loomiq-logo.svg" alt="Loomiq Logo" className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10" />
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
                src={userProfile.photoURL || '/Images/loomiq-logo.svg'} 
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
              href="https://loomiqhq.com/career/support"
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

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setShowPWADebug(!showPWADebug)}
                className="w-full bg-purple-600 text-white px-2 py-2 rounded-lg text-xs font-medium min-h-[40px] shadow-lg hover:bg-purple-700 active:bg-purple-800 transition-colors"
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
