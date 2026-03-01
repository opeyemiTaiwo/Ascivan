// src/Pages/user/UserProfile.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { userEmail } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const userParam = userEmail ? decodeURIComponent(userEmail).trim() : '';
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    photoURL: null,
    joinedDate: null,
    certificatesEarned: 0,
    badgesEarned: 0,
    projectsCompleted: 0,
    ongoingProjects: 0,
    firstName: '',
    lastName: '',
    displayName: '',
    initials: '',
    profile: {}
  });
  const [recentBadges, setRecentBadges] = useState([]);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [projectHistory, setProjectHistory] = useState([]);
  const [badgesByCategory, setBadgesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(true);
  const [debugInfo, setDebugInfo] = useState([]);

  const isValidEmail = (str) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  };

  const isUID = (str) => {
    return str && str.length > 20 && !str.includes('@') && !str.includes('.');
  };

  const searchUserInFirestore = async (param) => {
    const normalizedParam = param.toLowerCase().trim();
    
    try {
      setDebugInfo([`Starting search for: ${param}`]);

      if (isUID(param)) {
        setDebugInfo(prev => [...prev, `Detected UID format: ${param}`]);
        
        try {
          const userDoc = await getDoc(doc(db, 'users', param));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDebugInfo(prev => [...prev, `Found user by UID`]);
            return { found: true, source: 'users_by_uid', data: { ...userData, uid: param } };
          }
        } catch (error) {
          setDebugInfo(prev => [...prev, `UID search failed: ${error.message}`]);
        }

        const uidQuery = query(
          collection(db, 'users'),
          where('uid', '==', param),
          limit(1)
        );
        const uidSnapshot = await getDocs(uidQuery);
        
        if (!uidSnapshot.empty) {
          const userData = uidSnapshot.docs[0].data();
          setDebugInfo(prev => [...prev, `Found user by UID query`]);
          return { found: true, source: 'users_uid_query', data: userData };
        }
      }

      if (isValidEmail(param)) {
        setDebugInfo(prev => [...prev, `Detected email format: ${param}`]);
        
        const emailQuery = query(
          collection(db, 'users'),
          where('email', '==', normalizedParam),
          limit(1)
        );
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
          const userData = emailSnapshot.docs[0].data();
          setDebugInfo(prev => [...prev, `Found user by email`]);
          return { found: true, source: 'users_by_email', data: userData };
        }
      }

      setDebugInfo(prev => [...prev, `Fallback search starting`]);
      
      const allUsersQuery = query(collection(db, 'users'));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      for (const docSnapshot of allUsersSnapshot.docs) {
        const userData = docSnapshot.data();
        const docId = docSnapshot.id;
        
        if (docId === param || 
            userData.uid === param ||
            (userData.email && userData.email.toLowerCase() === normalizedParam) ||
            (userData.displayName && userData.displayName.toLowerCase() === normalizedParam.toLowerCase())) {
          setDebugInfo(prev => [...prev, `Found user in fallback search`]);
          return { found: true, source: 'users_fallback', data: { ...userData, uid: docId } };
        }
      }

      const memberQueries = [
        query(collection(db, 'group_members'), where('userEmail', '==', normalizedParam), limit(1)),
        query(collection(db, 'group_members'), where('userId', '==', param), limit(1))
      ];
      
      for (const memberQuery of memberQueries) {
        try {
          const memberSnapshot = await getDocs(memberQuery);
          if (!memberSnapshot.empty) {
            const memberData = memberSnapshot.docs[0].data();
            setDebugInfo(prev => [...prev, `Found in group_members`]);
            return { found: true, source: 'group_members', data: memberData };
          }
        } catch (error) {
          console.log('Group members search error:', error);
        }
      }

      const badgeQueries = [
        query(collection(db, 'member_badges'), where('memberEmail', '==', normalizedParam), limit(1)),
        query(collection(db, 'member_badges'), where('memberId', '==', param), limit(1))
      ];
      
      for (const badgeQuery of badgeQueries) {
        try {
          const badgeSnapshot = await getDocs(badgeQuery);
          if (!badgeSnapshot.empty) {
            const badgeData = badgeSnapshot.docs[0].data();
            setDebugInfo(prev => [...prev, `Found in member_badges`]);
            return { found: true, source: 'member_badges', data: badgeData };
          }
        } catch (error) {
          console.log('Member badges search error:', error);
        }
      }

      setDebugInfo(prev => [...prev, `User not found in any collection`]);
      return { found: false, source: null, data: null };

    } catch (error) {
      console.error('Error searching for user:', error);
      setDebugInfo(prev => [...prev, `Search error: ${error.message}`]);
      throw error;
    }
  };

  const handleOwnProfileFallback = () => {
    if (currentUser && (currentUser.email?.toLowerCase() === userParam.toLowerCase() || currentUser.uid === userParam)) {
      setDebugInfo(prev => [...prev, `Using Firebase Auth data as fallback for own profile`]);
      setUserProfile({
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || null,
        joinedDate: currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime) : null,
        certificatesEarned: 0,
        badgesEarned: 0,
        projectsCompleted: 0,
        ongoingProjects: 0,
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ')[1] || '',
        displayName: currentUser.displayName || '',
        initials: currentUser.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || currentUser.email?.[0]?.toUpperCase() || '',
        profile: {},
        uid: currentUser.uid
      });
      setUserExists(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const badgeCategories = {
    'mentorship': { name: 'TechMO', color: 'text-green-400', bgColor: 'from-green-500/20 to-green-600/20', borderColor: 'border-green-500/30' },
    'quality-assurance': { name: 'TechQA', color: 'text-orange-400', bgColor: 'from-orange-500/20 to-orange-600/20', borderColor: 'border-orange-500/30' },
    'development': { name: 'TechDev', color: 'text-green-400', bgColor: 'from-green-500/20 to-green-600/20', borderColor: 'border-green-500/30' },
    'leadership': { name: 'TechLeads', color: 'text-orange-400', bgColor: 'from-orange-500/20 to-orange-600/20', borderColor: 'border-orange-500/30' },
    'design': { name: 'TechArchs', color: 'text-green-400', bgColor: 'from-green-500/20 to-green-600/20', borderColor: 'border-green-500/30' },
    'security': { name: 'TechGuard', color: 'text-orange-400', bgColor: 'from-orange-500/20 to-orange-600/20', borderColor: 'border-orange-500/30' }
  };

  const getBadgeLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'novice': return 'text-orange-300';
      case 'beginners': return 'text-green-300';
      case 'intermediate': return 'text-orange-400';
      case 'expert': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    const unsubscribers = [];

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setDebugInfo([`Starting search for parameter: ${userParam}`]);

        if (!userParam) {
          setDebugInfo(prev => [...prev, 'No parameter provided in URL']);
          setUserExists(false);
          setLoading(false);
          return;
        }

        const searchResult = await searchUserInFirestore(userParam);
        
        if (!searchResult.found) {
          setDebugInfo(prev => [...prev, 'User not found in Firestore, trying fallback']);
          
          if (handleOwnProfileFallback()) {
            setLoading(false);
            const emailToUse = currentUser.email;
            const uidToUse = currentUser.uid;
            setupDataListeners(emailToUse, uidToUse);
            return;
          } else {
            setDebugInfo(prev => [...prev, 'User not found in any collection']);
            setUserExists(false);
            setLoading(false);
            return;
          }
        }

        const userData = searchResult.data;
        const emailToUse = userData.email || userData.userEmail || userData.memberEmail || '';
        const uidToUse = userData.uid || userParam;
        
        setUserProfile(prev => ({
          ...prev,
          name: userData.displayName || 
                userData.userName ||
                (userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}` 
                  : emailToUse.split('@')[0] || 'Unknown User'),
          email: emailToUse,
          photoURL: userData.photoURL || userData.userPhoto || null,
          joinedDate: userData.createdAt?.toDate() || userData.joinedAt?.toDate() || null,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          displayName: userData.displayName || userData.userName || '',
          initials: userData.initials || '',
          profile: userData.profile || {},
          uid: uidToUse
        }));

        setDebugInfo(prev => [...prev, `Found user via: ${searchResult.source}`]);
        setupDataListeners(emailToUse, uidToUse);

      } catch (error) {
        console.error('Error fetching user profile:', error);
        setDebugInfo(prev => [...prev, `Profile fetch error: ${error.message}`]);
        toast.error('Failed to load user profile');
        setUserExists(false);
        setLoading(false);
      }
    };

    const setupDataListeners = (emailToUse, uidToUse) => {
      const queryIdentifier = emailToUse || uidToUse;
      const queryType = emailToUse ? 'email' : 'uid';

      let badgesQuery;
      if (queryType === 'email') {
        badgesQuery = query(
          collection(db, 'member_badges'),
          where('memberEmail', '==', queryIdentifier),
          orderBy('awardedAt', 'desc')
        );
      } else {
        badgesQuery = query(
          collection(db, 'member_badges'),
          where('memberId', '==', queryIdentifier),
          orderBy('awardedAt', 'desc')
        );
      }

      unsubscribers.push(onSnapshot(badgesQuery, (snapshot) => {
        const badges = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          awardedAt: doc.data().awardedAt?.toDate() || new Date()
        }));
        
        setDebugInfo(prev => [...prev, `Found ${badges.length} badges`]);
        setRecentBadges(badges.slice(0, 5));
        
        const categoryCount = badges.reduce((acc, badge) => {
          const category = badge.badgeCategory || 'other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        setBadgesByCategory(categoryCount);
        
        setUserProfile(prev => ({
          ...prev,
          badgesEarned: badges.length,
          projectsCompleted: new Set(badges.map(b => b.groupId)).size
        }));
      }, (error) => {
        setDebugInfo(prev => [...prev, `Badge fetch error: ${error.message}`]);
      }));

      let certificatesQuery;
      if (queryType === 'email') {
        certificatesQuery = query(
          collection(db, 'certificates'),
          where('recipientEmail', '==', queryIdentifier),
          orderBy('generatedAt', 'desc')
        );
      } else {
        certificatesQuery = query(
          collection(db, 'certificates'),
          where('recipientId', '==', queryIdentifier),
          orderBy('generatedAt', 'desc')
        );
      }

      unsubscribers.push(onSnapshot(certificatesQuery, (snapshot) => {
        const certificates = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          generatedAt: doc.data().generatedAt?.toDate() || new Date()
        }));
        
        setDebugInfo(prev => [...prev, `Found ${certificates.length} certificates`]);
        setRecentCertificates(certificates.slice(0, 3));
        setUserProfile(prev => ({
          ...prev,
          certificatesEarned: certificates.length
        }));
      }, (error) => {
        setDebugInfo(prev => [...prev, `Certificate fetch error: ${error.message}`]);
      }));

      let projectMembersQuery;
      if (queryType === 'email') {
        projectMembersQuery = query(
          collection(db, 'group_members'),
          where('userEmail', '==', queryIdentifier),
          orderBy('joinedAt', 'desc')
        );
      } else {
        projectMembersQuery = query(
          collection(db, 'group_members'),
          where('userId', '==', queryIdentifier),
          orderBy('joinedAt', 'desc')
        );
      }

      unsubscribers.push(onSnapshot(projectMembersQuery, async (snapshot) => {
        const memberships = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          joinedAt: doc.data().joinedAt?.toDate() || new Date()
        }));

        setDebugInfo(prev => [...prev, `Found ${memberships.length} project memberships`]);

        const projectsWithDetails = await Promise.all(
          memberships.map(async (membership) => {
            try {
              const groupDoc = await getDoc(doc(db, 'groups', membership.groupId));
              
              if (groupDoc.exists()) {
                const groupData = groupDoc.data();
                return {
                  ...membership,
                  projectTitle: groupData.projectTitle || 'Untitled Project',
                  projectDescription: groupData.description || '',
                  projectStatus: groupData.status || 'active',
                  memberCount: groupData.memberCount || 0
                };
              }
              return {
                ...membership,
                projectTitle: 'Project',
                projectDescription: '',
                projectStatus: 'unknown',
                memberCount: 0
              };
            } catch (error) {
              return {
                ...membership,
                projectTitle: 'Project',
                projectDescription: '',
                projectStatus: 'unknown',
                memberCount: 0
              };
            }
          })
        );

        setProjectHistory(projectsWithDetails);
        
        const ongoingCount = projectsWithDetails.filter(
          p => p.status === 'active' && (p.projectStatus === 'active' || p.projectStatus === 'completing')
        ).length;
        
        setUserProfile(prev => ({
          ...prev,
          ongoingProjects: ongoingCount
        }));
      }, (error) => {
        setDebugInfo(prev => [...prev, `Project fetch error: ${error.message}`]);
      }));

      setLoading(false);
    };

    if (userParam) {
      fetchUserProfile();
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userParam, currentUser]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-3 xs:p-4">
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-7 sm:p-8 border border-white/20 text-center max-w-lg w-full">
            <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white text-base xs:text-lg">Loading profile...</p>
            <div className="text-xs xs:text-sm text-gray-400 mt-3 xs:mt-4">
              Searching for: <span className="font-mono text-[10px] xs:text-xs">{userParam}</span>
              <br />
              <span className="text-[10px] xs:text-xs">
                {isUID(userParam) ? '(User ID detected)' : isValidEmail(userParam) ? '(Email detected)' : '(Unknown format)'}
              </span>
            </div>
            {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
              <div className="mt-4 text-[10px] xs:text-xs text-left bg-black/20 p-2 xs:p-3 rounded-lg max-w-md">
                <div className="text-gray-300 font-bold mb-2">Debug Info:</div>
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-400">{info}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  if (!userExists) {
    // Show a basic profile with the name derived from the parameter instead of "User Not Found"
    const derivedName = isValidEmail(userParam) 
      ? userParam.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : userParam.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-3 xs:p-4">
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-8 sm:p-10 md:p-12 border border-white/20 text-center max-w-md w-full">
            <div className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-gradient-to-br from-green-500 to-orange-500 flex items-center justify-center mx-auto mb-4 ring-4 ring-green-400/30">
              <span className="text-2xl xs:text-3xl text-black font-bold">
                {derivedName.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <h2 className="text-xl xs:text-2xl font-bold text-white mb-2">{derivedName}</h2>
            <p className="text-gray-400 text-sm mb-6">This member hasn't set up their profile yet.</p>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">University</span>
                <span className="text-gray-600 text-sm">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Major</span>
                <span className="text-gray-600 text-sm">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Location</span>
                <span className="text-gray-600 text-sm">—</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 xs:px-6 py-2.5 xs:py-3 rounded-lg xs:rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 active:from-gray-700 active:to-gray-800 transition-all duration-300 text-sm xs:text-base min-h-[44px] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Go Back
              </button>
              <button 
                onClick={() => navigate('/members')}
                className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 text-white px-4 xs:px-6 py-2.5 xs:py-3 rounded-lg xs:rounded-xl font-semibold hover:from-green-600 hover:to-orange-600 active:from-green-700 active:to-orange-700 transition-all duration-300 text-sm xs:text-base min-h-[44px]"
              >
                Browse Members
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        
        <main className="pt-16 xs:pt-18 sm:pt-20 pb-12 xs:pb-14 sm:pb-16">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 max-w-6xl">
            
            {/* Profile Header */}
            <section className="mb-8 xs:mb-10 sm:mb-12">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 border border-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 xs:gap-5 sm:gap-6">
                    <div className="relative flex-shrink-0">
                      {userProfile.photoURL ? (
                        <img 
                          src={userProfile.photoURL} 
                          alt="Profile" 
                          className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover ring-2 xs:ring-4 ring-green-400/50 shadow-2xl"/>
                      ) : (
                        <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-500 to-orange-500 flex items-center justify-center ring-2 xs:ring-4 ring-green-400/50 shadow-2xl">
                          <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-white font-bold">
                            {userProfile.firstName && userProfile.lastName 
                              ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                              : userProfile.initials || userProfile.name?.charAt(0)?.toUpperCase() || '?'
                            }
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 xs:-bottom-2 xs:-right-2 w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-r from-green-400 to-orange-500 rounded-full border-2 xs:border-4 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 xs:w-3 xs:h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="text-center sm:text-left">
                      <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2" 
                          style={{
                            textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
                            fontFamily: '"Inter", sans-serif'
                          }}>
                        {userProfile.name}
                      </h1>

                      {userProfile.email && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(userProfile.email).then(() => {
                              toast.success('Email copied to clipboard!', { autoClose: 2000 });
                            }).catch(() => {
                              prompt('Copy this email:', userProfile.email);
                            });
                          }}
                          className="flex items-center gap-1.5 xs:gap-2 text-gray-400 hover:text-green-400 text-xs xs:text-sm font-medium mb-2 xs:mb-3 transition-colors duration-200 group"
                          title="Click to copy email"
                        >
                          <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          <span className="group-hover:underline">Copy Email</span>
                        </button>
                      )}
                      {userProfile.joinedDate && (
                        <p className="text-gray-400 text-xs xs:text-sm">
                          Member since {userProfile.joinedDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
                    <div className="bg-green-500/10 backdrop-blur-xl rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 border border-green-500/20 text-center">
                      <div className="text-lg xs:text-xl sm:text-2xl font-black text-green-400">{userProfile.badgesEarned}</div>
                      <div className="text-[10px] xs:text-xs text-green-300 font-bold uppercase">Badges</div>
                    </div>
                    <div className="bg-orange-500/10 backdrop-blur-xl rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 border border-orange-500/20 text-center">
                      <div className="text-lg xs:text-xl sm:text-2xl font-black text-orange-400">{userProfile.certificatesEarned}</div>
                      <div className="text-[10px] xs:text-xs text-orange-300 font-bold uppercase">Certificates</div>
                    </div>
                    <div className="bg-green-500/10 backdrop-blur-xl rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 border border-green-500/20 text-center">
                      <div className="text-lg xs:text-xl sm:text-2xl font-black text-green-400">{userProfile.projectsCompleted}</div>
                      <div className="text-[10px] xs:text-xs text-green-300 font-bold uppercase">Completed</div>
                    </div>
                    <div className="bg-orange-500/10 backdrop-blur-xl rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 border border-orange-500/20 text-center">
                      <div className="text-lg xs:text-xl sm:text-2xl font-black text-orange-400">{userProfile.ongoingProjects}</div>
                      <div className="text-[10px] xs:text-xs text-orange-300 font-bold uppercase">Ongoing</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8">
              
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6 xs:space-y-7 sm:space-y-8">
                
                {/* No Activity State */}
                {recentBadges.length === 0 && recentCertificates.length === 0 && projectHistory.length === 0 && (
                  <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-7 sm:p-8 border border-white/20 text-center">
                    <svg className="w-16 h-16 xs:w-20 xs:h-20 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-3 xs:mb-4">Getting Started</h3>
                    <p className="text-gray-300 mb-4 xs:mb-5 sm:mb-6 text-sm xs:text-base px-2">
                      {currentUser?.email === userProfile.email 
                        ? "You're new to the platform! Start participating in projects to earn badges and build your profile."
                        : `${userProfile.name} is new to the platform and hasn't participated in any projects yet. Their journey is just beginning!`
                      }
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4 text-center">
                      <div className="bg-green-500/10 rounded-lg xs:rounded-xl p-3 xs:p-4 border border-green-500/20">
                        <div className="text-xs xs:text-sm text-green-400">Ready for projects</div>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg xs:rounded-xl p-3 xs:p-4 border border-orange-500/20">
                        <div className="text-xs xs:text-sm text-orange-400">Eager to learn</div>
                      </div>
                      <div className="bg-green-500/10 rounded-lg xs:rounded-xl p-3 xs:p-4 border border-green-500/20">
                        <div className="text-xs xs:text-sm text-green-400">Available to connect</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Recent Badges */}
                {recentBadges.length > 0 && (
                  <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/20">
                    <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-4 xs:mb-5 sm:mb-6 flex items-center flex-wrap gap-2">
                      <span>Recent Badges</span>
                      <span className="text-xs xs:text-sm bg-green-500/20 text-green-400 px-2 xs:px-3 py-1 rounded-full">
                        {userProfile.badgesEarned} total
                      </span>
                    </h3>
                    <div className="space-y-3 xs:space-y-4">
                      {recentBadges.map((badge) => {
                        const categoryInfo = badgeCategories[badge.badgeCategory] || badgeCategories['development'];
                        return (
                          <div key={badge.id} className={`bg-gradient-to-r ${categoryInfo.bgColor} backdrop-blur-xl rounded-lg xs:rounded-xl p-3 xs:p-4 border ${categoryInfo.borderColor}`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3 xs:gap-4 flex-1 min-w-0">
                                <svg className="w-8 h-8 xs:w-10 xs:h-10 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <div className="min-w-0">
                                  <div className="font-bold text-white text-sm xs:text-base truncate">
                                    {categoryInfo.name} - {badge.badgeLevel?.charAt(0).toUpperCase() + badge.badgeLevel?.slice(1)}
                                  </div>
                                  <div className="text-gray-300 text-xs xs:text-sm truncate">
                                    {badge.projectTitle}
                                  </div>
                                  <div className="text-gray-400 text-[10px] xs:text-xs">
                                    Awarded {badge.awardedAt?.toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className={`px-2 xs:px-3 py-1 rounded-full text-[10px] xs:text-xs font-bold ${getBadgeLevelColor(badge.badgeLevel)} bg-black/20 whitespace-nowrap flex-shrink-0`}>
                                {badge.badgeLevel?.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Certificates */}
                {recentCertificates.length > 0 && (
                  <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/20">
                    <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-4 xs:mb-5 sm:mb-6 flex items-center flex-wrap gap-2">
                      <span>Certificates</span>
                      <span className="text-xs xs:text-sm bg-orange-500/20 text-orange-400 px-2 xs:px-3 py-1 rounded-full">
                        {userProfile.certificatesEarned} earned
                      </span>
                    </h3>
                    <div className="space-y-3 xs:space-y-4">
                      {recentCertificates.map((certificate) => (
                        <div key={certificate.id} className="bg-gradient-to-r from-orange-500/10 to-green-500/10 backdrop-blur-xl rounded-lg xs:rounded-xl p-3 xs:p-4 border border-orange-500/20">
                          <div className="flex items-center gap-3 xs:gap-4">
                            <svg className="w-8 h-8 xs:w-10 xs:h-10 flex-shrink-0 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-grow min-w-0">
                              <div className="font-bold text-white text-sm xs:text-base">
                                Project Completion Certificate
                              </div>
                              <div className="text-gray-300 text-xs xs:text-sm truncate">
                                {certificate.projectTitle}
                              </div>
                              <div className="text-gray-400 text-[10px] xs:text-xs">
                                Generated {certificate.generatedAt?.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project History */}
                {projectHistory.length > 0 && (
                  <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/20">
                    <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-4 xs:mb-5 sm:mb-6">Project History</h3>
                    <div className="space-y-3 xs:space-y-4">
                      {projectHistory.map((project) => (
                        <div key={project.id} className="bg-white/5 rounded-lg xs:rounded-xl p-3 xs:p-4 border border-white/10 hover:bg-white/10 active:bg-white/15 transition-all duration-300">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="font-bold text-white text-sm xs:text-base flex-1 min-w-0">
                              {project.projectTitle || 'Untitled Project'}
                            </div>
                            <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                              {project.role === 'admin' && (
                                <span className="text-[10px] xs:text-xs bg-orange-500/20 text-orange-400 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full whitespace-nowrap">
                                  Admin
                                </span>
                              )}
                              <span className={`text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full whitespace-nowrap ${
                                project.projectStatus === 'completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : project.projectStatus === 'completing'
                                  ? 'bg-orange-500/20 text-orange-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}>
                                {project.projectStatus === 'completed' ? 'Completed' : 
                                 project.projectStatus === 'completing' ? 'Completing' : 'Active'}
                              </span>
                            </div>
                          </div>
                          {project.projectDescription && (
                            <p className="text-gray-400 text-xs xs:text-sm mb-2 line-clamp-2">{project.projectDescription}</p>
                          )}
                          <div className="flex items-center justify-between text-[10px] xs:text-xs text-gray-500">
                            <span>
                              Joined {project.joinedAt?.toLocaleDateString()}
                            </span>
                            {project.memberCount && (
                              <span>
                                {project.memberCount} members
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6 xs:space-y-7 sm:space-y-8">
                
                {/* Badge Categories */}
                {Object.keys(badgesByCategory).length > 0 && (
                  <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/20 lg:sticky lg:top-28">
                    <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-4 xs:mb-5 sm:mb-6">Badge Categories</h3>
                    <div className="space-y-3 xs:space-y-4">
                      {Object.entries(badgesByCategory).map(([category, count]) => {
                        const categoryInfo = badgeCategories[category] || { 
                          name: category, 
                          color: 'text-gray-400',
                          bgColor: 'from-gray-500/20 to-gray-600/20',
                          borderColor: 'border-gray-500/30'
                        };
                        return (
                          <div key={category} className={`bg-gradient-to-r ${categoryInfo.bgColor} backdrop-blur-xl rounded-lg xs:rounded-xl p-3 xs:p-4 border ${categoryInfo.borderColor}`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 xs:gap-3 flex-1 min-w-0">
                                <svg className="w-6 h-6 xs:w-7 xs:h-7 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <div className="min-w-0">
                                  <div className="font-bold text-white text-xs xs:text-sm truncate">
                                    {categoryInfo.name}
                                  </div>
                                  <div className="text-gray-400 text-[10px] xs:text-xs truncate">
                                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                </div>
                              </div>
                              <div className={`text-lg xs:text-xl font-black ${categoryInfo.color} flex-shrink-0`}>
                                {count}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Profile Stats Summary */}
                <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/20">
                  <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-4 xs:mb-5 sm:mb-6">Profile Summary</h3>
                  <div className="space-y-3 xs:space-y-4">
                    <div className="flex items-center justify-between p-2.5 xs:p-3 bg-white/5 rounded-lg xs:rounded-xl">
                      <span className="text-gray-300 text-xs xs:text-sm">Total Projects</span>
                      <span className="text-white font-bold text-sm xs:text-base">{projectHistory.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 xs:p-3 bg-white/5 rounded-lg xs:rounded-xl">
                      <span className="text-gray-300 text-xs xs:text-sm">Success Rate</span>
                      <span className="text-green-400 font-bold text-sm xs:text-base">
                        {projectHistory.length > 0 
                          ? Math.round((userProfile.projectsCompleted / projectHistory.length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 xs:p-3 bg-white/5 rounded-lg xs:rounded-xl">
                      <span className="text-gray-300 text-xs xs:text-sm">Admin Projects</span>
                      <span className="text-orange-400 font-bold text-sm xs:text-base">
                        {projectHistory.filter(p => p.role === 'admin').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 xs:p-3 bg-white/5 rounded-lg xs:rounded-xl">
                      <span className="text-gray-300 text-xs xs:text-sm">Profile Score</span>
                      <span className="text-green-400 font-bold text-sm xs:text-base">
                        {Math.min(100, (userProfile.badgesEarned * 10) + (userProfile.certificatesEarned * 15) + (userProfile.projectsCompleted * 5))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          * { font-family: 'Inter', sans-serif; }
        `}</style>
      </div>
    </>
  );
};

export default UserProfile;
