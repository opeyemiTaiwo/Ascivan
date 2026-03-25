// src/Pages/Notifications.jsx — Clean white design
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date() })));
      setLoading(false);
    });
    return unsub;
  }, [currentUser, navigate]);

  const markAsRead = async (id) => {
    try { await updateDoc(doc(db, 'notifications', id), { isRead: true }); } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    setProcessing(true);
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { isRead: true })));
    } catch (e) { console.error(e); }
    setProcessing(false);
  };

  const deleteNotification = async (id) => {
    try { await deleteDoc(doc(db, 'notifications', id)); } catch (e) { console.error(e); }
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    setProcessing(true);
    try { await Promise.all(notifications.map(n => deleteDoc(doc(db, 'notifications', n.id)))); } catch (e) { console.error(e); }
    setProcessing(false);
  };

  const handleClick = (n) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.postId) navigate(`/community/post/${n.postId}`);
    else if (n.mentionedByEmail) navigate(`/profile/${n.mentionedByEmail}`);
    else navigate('/community');
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.isRead)
    : filter === 'mentions' ? notifications.filter(n => n.type?.includes('mention'))
    : notifications.filter(n => n.type?.includes('reply'));

  const tabs = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { key: 'mentions', label: 'Mentions', count: notifications.filter(n => n.type?.includes('mention')).length },
    { key: 'replies', label: 'Replies', count: notifications.filter(n => n.type?.includes('reply')).length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <p className="text-blue-600 text-sm mt-0.5">{notifications.filter(n => !n.isRead).length} unread</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.filter(n => !n.isRead).length > 0 && (
            <button onClick={markAllAsRead} disabled={processing} className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50">
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} disabled={processing} className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              filter === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-900 font-semibold mb-1">{filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}</p>
          <p className="text-gray-500 text-sm">{filter === 'all' ? "You'll see notifications when someone interacts with you" : 'All caught up!'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`bg-white border rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-all ${
                n.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {n.mentionedByPhoto ? (
                  <img src={n.mentionedByPhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {(n.mentionedByName || n.fromName || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm">
                  <span className="font-semibold">{n.mentionedByName || n.fromName || 'Someone'}</span>
                  {' '}<span className="text-gray-600">{n.message || n.text || 'interacted with your content'}</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">{formatTime(n.createdAt)}</p>
              </div>

              {/* Unread dot + delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
