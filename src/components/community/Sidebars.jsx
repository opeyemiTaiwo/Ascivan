// src/components/community/Sidebars.jsx - Loomiq Sidebar Components - FULLY RESPONSIVE

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getUserCounts, getFollowingStatusForUsers } from '../../utils/followSystem';
import FollowButton from './FollowButton';
import { ClickableUserAvatar } from '../ClickableUser';
import { EnhancedClickableUserName } from './UserComponents';

/**
 * User Quick Links Sidebar - Actions and Navigation
 * Fully responsive for all screen sizes
 */
export const UserQuickLinksSidebar = ({ currentUser, onNavigate, isMobile = false }) => {
  const quickLinks = [
    {
      title: 'Achievements',
      description: 'View badges & certificates',
      path: '/my-badges',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'My Career',
      description: 'Learning resources & AI guidance',
      path: '/career/dashboard',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Projects',
      description: 'Submit & join projects',
      path: '/projects',
      gradient: 'from-blue-500 to-indigo-600'
    }
  ];

  const handleLinkClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  if (!currentUser) return null;

  const containerClass = isMobile 
    ? "p-3 xs:p-4 h-full" 
    : "sticky top-[5.5rem] lg:top-[5.5rem] xl:top-24 h-fit max-h-[calc(100vh-6.5rem)] lg:max-h-[calc(100vh-6.5rem)] xl:max-h-[calc(100vh-7rem)] overflow-hidden";

  const contentClass = isMobile
    ? "h-full flex flex-col"
    : "bg-black/20 backdrop-blur-xl rounded-xl xs:rounded-2xl border border-orange-500/10 p-3 xs:p-4 sm:p-6 shadow-2xl sidebar-content h-full flex flex-col";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {!isMobile && (
          <div className="flex items-center justify-between mb-3 xs:mb-4 flex-shrink-0">
            <h3 className="text-white font-bold text-base xs:text-lg flex items-center gap-1.5 xs:gap-2">
              <svg className="w-4 h-4 xs:w-5 xs:h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h3>
          </div>
        )}
        
        <div className={`space-y-2 xs:space-y-3 ${isMobile ? 'flex-1 overflow-y-auto' : 'flex-1 overflow-y-auto sidebar-scrollable'}`} style={{
          maxHeight: isMobile ? '100%' : 'calc(100vh - 16rem)'
        }}>
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(link.path)}
              className={`flex items-center gap-2 xs:gap-3 p-2.5 xs:p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 active:bg-white/15 transition-all duration-300 cursor-pointer w-full text-left group hover:scale-105 active:scale-100 hover:shadow-lg sidebar-item ${
                isMobile ? 'py-3 xs:py-4' : ''
              }`}
            >
              <div className={`w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-r ${link.gradient} rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-white group-hover:text-orange-300 transition-colors truncate ${isMobile ? 'text-sm xs:text-base' : 'text-xs xs:text-sm'}`}>
                  {link.title}
                </p>
                <p className={`text-gray-400 truncate ${isMobile ? 'text-xs xs:text-sm' : 'text-[10px] xs:text-xs'}`}>
                  {link.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-orange-500/10 flex-shrink-0">
          <p className={`text-gray-400 text-center ${isMobile ? 'text-xs xs:text-sm' : 'text-[10px] xs:text-xs'}`}>
            Quick access to all your tools
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Follow Suggestions Sidebar
 * Fully responsive for all screen sizes
 */
export const FollowSuggestionsSidebar = ({ currentUser, isMobile = false }) => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});
  const [userCounts, setUserCounts] = useState({
    followers: 0,
    following: 0
  });

  // Load suggested users to follow
  useEffect(() => {
    const loadSuggestedUsers = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        const usersQuery = query(
          collection(db, 'users'),
          limit(20)
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const allUsers = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        
        const badgesQuery = query(collection(db, 'member_badges'));
        const badgesSnapshot = await getDocs(badgesQuery);
        
        const userActivityMap = {};
        badgesSnapshot.docs.forEach(doc => {
          const badge = doc.data();
          if (badge.memberEmail) {
            if (!userActivityMap[badge.memberEmail]) {
              userActivityMap[badge.memberEmail] = { badges: 0, lastActivity: null };
            }
            userActivityMap[badge.memberEmail].badges++;
            
            const badgeDate = badge.awardedAt && typeof badge.awardedAt.toDate === 'function' 
              ? badge.awardedAt.toDate() 
              : new Date();
            
            if (!userActivityMap[badge.memberEmail].lastActivity || 
                badgeDate > userActivityMap[badge.memberEmail].lastActivity) {
              userActivityMap[badge.memberEmail].lastActivity = badgeDate;
            }
          }
        });
        
        const candidateUsers = allUsers
          .filter(user => 
            user.uid !== currentUser.uid && 
            user.email && 
            user.email.includes('@')
          )
          .map(user => {
            const activity = userActivityMap[user.email] || { badges: 0, lastActivity: null };
            return {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              displayName: user.displayName || user.email.split('@')[0],
              photoURL: user.photoURL || null,
              badges: activity.badges,
              lastActivity: activity.lastActivity,
              followerCount: 0,
              userStatus: activity.badges >= 5 ? 'veteran' : 
                         activity.badges >= 1 ? 'achiever' : 'newcomer'
            };
          });
        
        const userIds = candidateUsers.map(user => user.uid);
        const statusMap = await getFollowingStatusForUsers(currentUser, userIds);
        
        const unfollowedUsers = candidateUsers.filter(user => 
          !statusMap[user.uid]
        );
        
        const suggestedUsersList = unfollowedUsers
          .sort((a, b) => {
            if (a.badges !== b.badges) return b.badges - a.badges;
            if (a.lastActivity && b.lastActivity) {
              return b.lastActivity - a.lastActivity;
            }
            return a.lastActivity ? -1 : 1;
          })
          .slice(0, 5);
        
        setSuggestedUsers(suggestedUsersList);
        
        const finalStatusMap = {};
        suggestedUsersList.forEach(user => {
          finalStatusMap[user.uid] = false;
        });
        setFollowingStatus(finalStatusMap);
        
      } catch (error) {
        console.error('Error loading suggested users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestedUsers();
  }, [currentUser]);

  // Load current user's follow counts
  useEffect(() => {
    const loadUserCounts = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const counts = await getUserCounts(currentUser.uid);
          setUserCounts(counts);
        } catch (error) {
          console.error('Failed to load user counts:', error);
        }
      }
    };

    loadUserCounts();
  }, [currentUser]);

  const handleCountUpdate = (countData) => {
    setUserCounts(countData.currentUser);
    
    setSuggestedUsers(prev => prev.map(user => 
      user.uid === countData.targetUserId 
        ? { ...user, followerCount: countData.targetUser.followers }
        : user
    ));

    if (countData.targetUserId && followingStatus[countData.targetUserId] === false) {
      setSuggestedUsers(prev => prev.filter(user => user.uid !== countData.targetUserId));
      
      setFollowingStatus(prev => ({
        ...prev,
        [countData.targetUserId]: true
      }));
    }
  };

  const getUserStatusInfo = (userStatus) => {
    const statusInfo = {
      veteran: { 
        label: 'Veteran', 
        color: 'text-yellow-400', 
        bg: 'bg-yellow-500/20', 
        border: 'border-yellow-500/30',
      },
      achiever: { 
        label: 'Achiever', 
        color: 'text-green-400', 
        bg: 'bg-green-500/20', 
        border: 'border-green-500/30',
      },
      newcomer: { 
        label: 'Newcomer', 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/20', 
        border: 'border-blue-500/30',
      }
    };
    return statusInfo[userStatus] || statusInfo.newcomer;
  };

  if (!currentUser) return null;

  const containerClass = isMobile 
    ? "p-3 xs:p-4 h-full" 
    : "h-fit";

  const contentClass = isMobile
    ? "h-full flex flex-col"
    : "bg-black/20 backdrop-blur-xl rounded-xl xs:rounded-2xl border border-orange-500/10 p-3 xs:p-4 sm:p-6 shadow-2xl sidebar-content h-full flex flex-col";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <div className="flex items-center justify-between mb-3 xs:mb-4 flex-shrink-0">
          <div>
            <h3 className="text-white font-bold text-base xs:text-lg flex items-center gap-1.5 xs:gap-2">
              <svg className="w-4 h-4 xs:w-5 xs:h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Discover People</span>
              <span className="sm:hidden">Discover</span>
            </h3>
            <p className="text-gray-400 text-[10px] xs:text-xs mt-0.5 xs:mt-1 hidden sm:block">New connections to follow</p>
          </div>
        </div>
        
        <div className="mb-3 xs:mb-4 p-2.5 xs:p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2 xs:gap-3 text-center">
            <div>
              <div className="text-base xs:text-lg font-bold text-orange-400">{userCounts.following}</div>
              <div className="text-[10px] xs:text-xs text-orange-300">Following</div>
            </div>
            <div>
              <div className="text-base xs:text-lg font-bold text-blue-400">{userCounts.followers}</div>
              <div className="text-[10px] xs:text-xs text-blue-300">Followers</div>
            </div>
          </div>
        </div>
        
        <div className={`space-y-2 xs:space-y-3 ${isMobile ? 'flex-1 overflow-y-auto' : 'flex-1'}`}>
          {loading ? (
            <div className="text-center py-6 xs:py-8">
              <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 border-b-2 border-orange-400 mx-auto mb-2 xs:mb-3"></div>
              <p className="text-gray-400 text-xs xs:text-sm">Finding people...</p>
            </div>
          ) : suggestedUsers.length === 0 ? (
            <div className="text-center py-6 xs:py-8">
              <svg className="w-8 h-8 xs:w-10 xs:h-10 mx-auto mb-2 xs:mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-400 text-xs xs:text-sm">
                All caught up! You're following everyone we can suggest right now.
              </p>
            </div>
          ) : (
            suggestedUsers.map((user) => {
              const statusInfo = getUserStatusInfo(user.userStatus);
              
              return (
                <div
                  key={user.uid}
                  className="flex items-center gap-2 xs:gap-3 p-2.5 xs:p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 active:bg-white/15 transition-all duration-300 group"
                >
                  <ClickableUserAvatar 
                    user={user}
                    size="md"
                    className="flex-shrink-0 ring-2 ring-orange-400/30"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 xs:gap-2 mb-0.5 xs:mb-1">
                      <EnhancedClickableUserName
                        user={user}
                        className="font-semibold text-white text-xs xs:text-sm group-hover:text-orange-300 transition-colors truncate"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] xs:text-xs text-gray-400">
                        {user.badges > 0 ? (
                          <span>{user.badges} badge{user.badges !== 1 ? 's' : ''}</span>
                        ) : (
                          <span>New member</span>
                        )}
                      </div>
                      
                      {user.followerCount > 0 && (
                        <div className="text-[10px] xs:text-xs text-blue-400">
                          {user.followerCount} followers
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <FollowButton
                      targetUser={user}
                      currentUser={currentUser}
                      size="xs"
                      onCountUpdate={handleCountUpdate}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-orange-500/10 flex-shrink-0">
          <p className="text-gray-400 text-center text-[10px] xs:text-xs">
            Expand your professional network
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Company Information Sidebar
 * Fully responsive for all screen sizes
 */
export const CompanyInfoSidebar = ({ isMobile = false }) => {
  const navigate = useNavigate();
  
  const companyLinks = [
    {
      title: 'Support',
      url: '/support',
      external: false
    },
    {
      title: 'About',
      url: '/about',
      external: false
    },
    {
      title: 'Terms of Service',
      url: '/terms',
      external: false
    },
    {
      title: 'Privacy Policy',
      url: '/privacy',
      external: false
    }
  ];

  const handleLinkClick = (link) => {
    if (link.external) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(link.url);
    }
  };

  const containerClass = isMobile 
    ? "p-3 xs:p-4 h-full" 
    : "h-fit";

  const contentClass = isMobile
    ? "h-full flex flex-col"
    : "bg-black/20 backdrop-blur-xl rounded-xl xs:rounded-2xl border border-orange-500/10 p-3 xs:p-4 sm:p-6 shadow-2xl sidebar-content h-full flex flex-col";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <div className="flex items-center justify-center mb-3 xs:mb-4 sm:mb-6 flex-shrink-0">
          <div className="text-center">
            <img 
              src="/Images/loomiq-logo.svg" 
              alt="Loomiq Logo" 
              className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 mx-auto mb-2 xs:mb-2 sm:mb-3 rounded-xl shadow-lg"
            />
            <h3 className="text-white font-bold text-sm xs:text-base sm:text-lg">
              Loomiq
            </h3>
          </div>
        </div>
        
        <div className="mb-3 xs:mb-4 sm:mb-6 flex-shrink-0">
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed text-center">
            Building the future of tech careers through real-world projects, personalized guidance, and validated skill achievements.
          </p>
        </div>

        <div className={`grid grid-cols-2 gap-2 xs:gap-2.5 sm:gap-3 ${isMobile ? 'flex-1' : ''}`}>
          {companyLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(link)}
              className={`flex flex-col items-center justify-center p-2.5 xs:p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 active:bg-white/15 transition-all duration-300 cursor-pointer text-center group hover:scale-105 active:scale-100 hover:shadow-lg sidebar-item ${
                isMobile ? 'min-h-[56px] xs:min-h-[60px]' : 'min-h-[48px] xs:min-h-[50px]'
              }`}
            >
              <div className="flex-1 min-w-0 flex items-center justify-center">
                <p className={`font-medium text-white group-hover:text-orange-300 transition-colors text-center leading-tight ${isMobile ? 'text-xs xs:text-sm' : 'text-[10px] xs:text-xs sm:text-sm'}`}>
                  {link.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 xs:mt-4 sm:mt-6 pt-2.5 xs:pt-3 sm:pt-4 border-t border-orange-500/10 flex-shrink-0">
          <p className={`text-gray-400 text-center font-medium ${isMobile ? 'text-[10px] xs:text-xs' : 'text-[10px] xs:text-xs'}`}>
            Building the future of tech careers
          </p>
        </div>
      </div>
    </div>
  );
};
