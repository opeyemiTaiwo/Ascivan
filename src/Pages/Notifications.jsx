// src/Pages/NotificationsPage.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  doc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));
      
      setNotifications(notificationsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, navigate]);

  const markAsRead = async (notificationId) => {
    try {
      setProcessing(true);
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setProcessing(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setProcessing(true);
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      await Promise.all(
        unreadNotifications.map(notification =>
          updateDoc(doc(db, 'notifications', notification.id), {
            isRead: true
          })
        )
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setProcessing(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setProcessing(true);
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setProcessing(false);
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        setProcessing(true);
        await Promise.all(
          notifications.map(notification =>
            deleteDoc(doc(db, 'notifications', notification.id))
          )
        );
      } catch (error) {
        console.error('Error clearing notifications:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'mentions') return notification.type?.includes('mention');
    if (filter === 'replies') return notification.type?.includes('reply');
    return true;
  });

  const formatNotificationTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5 xs:w-6 xs:h-6";
    
    switch (type) {
      case 'mention':
      case 'post_mention':
      case 'reply_mention':
      case 'repost_mention':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'reply':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'like':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'repost':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'follow':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'group_post':
      case 'group_reply':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'group_member_joined':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'badge_awarded':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'group_completed':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    switch (notification.type) {
      case 'group_post':
      case 'group_reply':
      case 'group_member_joined':
      case 'group_completed':
        if (notification.groupId) {
          navigate(`/groups/${notification.groupId}`);
        }
        break;
      case 'reply_mention':
      case 'repost_mention':
      case 'like':
        navigate('/community');
        break;
      case 'follow':
        if (notification.mentionedByEmail) {
          navigate(`/profile/${encodeURIComponent(notification.mentionedByEmail)}`);
        } else {
          navigate('/community');
        }
        break;
      case 'badge_awarded':
        navigate('/dashboard');
        break;
      default:
        navigate('/community');
        break;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-lime-400 mx-auto mb-4"></div>
            <p className="text-white text-base xs:text-lg">Loading notifications...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        
        {/* Header */}
        <div className="bg-black/50 border-b border-white/10 sticky top-16 z-40">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-3 xs:space-x-4">
                <Link 
                  to="/community"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 active:bg-white/20"
                  title="Back to Home"
                >
                  <svg className="h-5 w-5 xs:h-6 xs:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <p className="text-lime-400 text-xs xs:text-sm mt-0.5">
                      {notifications.filter(n => !n.isRead).length} unread
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 xs:space-x-3 w-full sm:w-auto">
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={processing}
                    className="flex-1 sm:flex-none bg-lime-500 hover:bg-lime-600 active:bg-lime-700 text-black px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {processing ? 'Processing...' : 'Mark all read'}
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    disabled={processing}
                    className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-7 sm:py-8 max-w-4xl">
          
          {/* Filter Tabs */}
          <div className="mb-6 xs:mb-7 sm:mb-8">
            <div className="flex bg-black/30 p-1 rounded-xl overflow-x-auto scrollbar-hide">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
                { key: 'mentions', label: 'Mentions', count: notifications.filter(n => n.type?.includes('mention')).length },
                { key: 'replies', label: 'Replies', count: notifications.filter(n => n.type?.includes('reply')).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[40px] ${
                    filter === tab.key
                      ? 'bg-lime-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      filter === tab.key ? 'bg-black/20 text-black' : 'bg-white/20 text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 xs:py-14 sm:py-16">
              <div className="text-4xl xs:text-5xl sm:text-6xl mb-4">
                <svg className="w-16 h-16 xs:w-20 xs:h-20 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg xs:text-xl font-bold text-white mb-2">
                {filter === 'all' ? 'No notifications yet' : 
                 filter === 'unread' ? 'No unread notifications' :
                 `No ${filter} notifications`}
              </h3>
              <p className="text-gray-400 text-sm xs:text-base">
                {filter === 'all' 
                  ? "You'll see notifications here when someone interacts with your posts"
                  : 'All caught up!'
                }
              </p>
              <Link
                to="/community"
                className="inline-block mt-4 xs:mt-5 sm:mt-6 bg-lime-500 hover:bg-lime-600 active:bg-lime-700 text-black px-5 xs:px-6 py-2.5 xs:py-3 rounded-lg font-semibold transition-colors text-sm xs:text-base min-h-[44px]"
              >
                Go to Home
              </Link>
            </div>
          ) : (
            <div className="space-y-2 xs:space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-black/20 rounded-xl xs:rounded-2xl border transition-all hover:bg-black/30 cursor-pointer group ${
                    notification.isRead 
                      ? 'border-white/10' 
                      : 'border-lime-400/30 bg-lime-500/5'
                  }`}
                >
                  <div className="p-4 xs:p-5 sm:p-6">
                    <div className="flex items-start space-x-3 xs:space-x-4">
                      
                      {/* Notification Icon */}
                      <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-r from-lime-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-black">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2 flex-wrap">
                              {notification.mentionedByPhoto && (
                                <img 
                                  src={notification.mentionedByPhoto} 
                                  alt="Profile" 
                                  className="w-5 h-5 xs:w-6 xs:h-6 rounded-full flex-shrink-0"
                                />
                              )}
                              <p className="text-white font-semibold text-sm xs:text-base truncate">
                                {notification.mentionedByFirstName && notification.mentionedByLastName 
                                  ? `${notification.mentionedByFirstName} ${notification.mentionedByLastName}`
                                  : notification.mentionedByName || 'Someone'
                                }
                              </p>
                            </div>
                            
                            <p className="text-gray-300 mb-2 text-xs xs:text-sm sm:text-base">
                              {notification.message || 
                               `${notification.mentionedByName || 'Someone'} ${
                                 notification.type?.includes('mention') ? 'mentioned you' :
                                 notification.type?.includes('reply') ? 'replied to your post' :
                                 notification.type?.includes('like') ? 'liked your post' :
                                 'interacted with your post'
                               }`}
                            </p>
                            
                            {notification.postTitle && (
                              <p className="text-lime-400 text-xs xs:text-sm mb-2 truncate flex items-center gap-1.5">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="truncate">"{notification.postTitle}"</span>
                              </p>
                            )}
                            
                            {notification.replyContent && (
                              <div className="mt-2 p-2 xs:p-3 bg-white/5 rounded-lg border-l-4 border-lime-400">
                                <p className="text-gray-300 text-xs xs:text-sm italic line-clamp-3">
                                  "{notification.replyContent.length > 100 
                                    ? notification.replyContent.substring(0, 100) + '...'
                                    : notification.replyContent}"
                                </p>
                              </div>
                            )}

                            {notification.groupTitle && (
                              <p className="text-green-400 text-xs xs:text-sm flex items-center gap-1.5 mt-2">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="truncate">{notification.groupTitle}</span>
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1.5 xs:space-x-2 ml-2 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-lime-400 hover:text-lime-300 active:text-lime-500 text-xs xs:text-sm transition-colors p-1.5 xs:p-2 rounded hover:bg-lime-400/10 active:bg-lime-400/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                title="Mark as read"
                              >
                                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-400 active:text-red-500 transition-colors p-1.5 xs:p-2 rounded hover:bg-red-400/10 active:bg-red-400/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
                              title="Delete"
                            >
                              <svg className="h-4 w-4 xs:h-5 xs:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 gap-2">
                          <p className="text-gray-400 text-xs xs:text-sm">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                          
                          <div className="text-gray-400 group-hover:text-lime-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center text-xs xs:text-sm">
                            <span className="mr-1 hidden xs:inline">Click to view</span>
                            <svg className="h-3 w-3 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 bg-lime-400 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
