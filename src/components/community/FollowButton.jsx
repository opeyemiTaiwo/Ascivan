// src/components/community/FollowButton.jsx - Loomiq Follow System - FULLY RESPONSIVE

import React, { useState, useEffect } from 'react';
import { 
  getFollowingStatusForUsers, 
  handleFollowToggle 
} from '../../utils/followSystem';
import { showSuccessMessage, showWarningMessage } from '../../utils/errorHandler';

/**
 * Follow/Unfollow Button Component for Loomiq
 * Allows users to follow/unfollow other community members
 * Fully responsive for all screen sizes
 */
const FollowButton = ({ targetUser, currentUser, size = 'sm', onCountUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState({});
  const [followingLoading, setFollowingLoading] = useState({});
  
  // Load initial following status
  useEffect(() => {
    const loadFollowingStatus = async () => {
      if (!currentUser || !targetUser?.uid) return;
      
      try {
        const statusMap = await getFollowingStatusForUsers(currentUser, [targetUser.uid]);
        setFollowingStatus(statusMap);
      } catch (error) {
        console.error('Error loading following status:', error);
      }
    };

    loadFollowingStatus();
  }, [currentUser, targetUser]);
  
  if (!currentUser || !targetUser) return null;
  
  const targetUserId = targetUser.uid;
  if (!targetUserId || currentUser.uid === targetUserId) return null;

  const isCurrentlyFollowing = followingStatus[targetUserId] || false;

  const handleFollowClick = async () => {
    setLoading(true);
    setFollowingLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      const success = await handleFollowToggle(
        currentUser,
        targetUserId,
        isCurrentlyFollowing,
        targetUser,
        (userId, newStatus) => {
          setFollowingStatus(prev => ({ ...prev, [userId]: newStatus }));
        },
        (countData) => {
          console.log('Count update received:', countData);
          if (onCountUpdate) {
            onCountUpdate(countData);
          }
        }
      );
      
      if (!success) {
        console.log('Follow/unfollow operation failed');
      } else {
        showSuccessMessage(
          isCurrentlyFollowing ? 'Unfollowed successfully' : 'Following!',
          { autoClose: 2000 }
        );
      }
      
    } catch (error) {
      console.error('Error in follow toggle:', error);
      showWarningMessage('Unable to update follow status. Please try again.');
    } finally {
      setLoading(false);
      setFollowingLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-[10px] xs:text-xs min-w-[50px] xs:min-w-[60px]',
    sm: 'px-2.5 xs:px-3 py-1 xs:py-1.5 text-xs sm:text-sm min-w-[60px] xs:min-w-[70px] sm:min-w-[80px]',
    md: 'px-3 xs:px-4 py-1.5 xs:py-2 text-sm sm:text-base min-w-[70px] xs:min-w-[80px] sm:min-w-[100px]'
  };

  return (
    <button
      onClick={handleFollowClick}
      disabled={loading || followingLoading[targetUserId]}
      aria-label={isCurrentlyFollowing ? 'Unfollow user' : 'Follow user'}
      className={`${sizeClasses[size]} rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        isCurrentlyFollowing
          ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transform hover:scale-105 active:scale-95'
      }`}
    >
      {loading || followingLoading[targetUserId] ? (
        <span className="flex items-center justify-center gap-1">
          <div className="animate-spin rounded-full h-2.5 w-2.5 xs:h-3 xs:w-3 border-b-2 border-current"></div>
          <span className="hidden xs:inline">...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center">
          {isCurrentlyFollowing ? (
            <>
              <span className="hidden sm:inline">Following</span>
              <span className="sm:hidden">Following</span>
            </>
          ) : (
            <>
              <span className="mr-0.5 xs:mr-1">+</span>
              <span>Follow</span>
            </>
          )}
        </span>
      )}
    </button>
  );
};

export default FollowButton;
