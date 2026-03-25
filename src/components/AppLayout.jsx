// src/components/AppLayout.jsx — Left sidebar layout for logged-in pages
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const AppLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      let total = 0;
      snap.docs.forEach(d => { total += (d.data().unreadBy || {})[currentUser.uid] || 0; });
      setUnreadMessages(total);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), where('isRead', '==', false));
    const unsub = onSnapshot(q, (snap) => setUnreadNotifications(snap.size), () => {});
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/community', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/my-workspaces', label: 'Workspace' },
    { path: '/support', label: 'Support' },
    { path: '/settings', label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/community') return location.pathname === '/community' || location.pathname.startsWith('/community/');
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-gray-950 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
          <img src="/Images/512X512.png" alt="Loomiqe" className="w-8 h-8" />
          <span className="text-white font-bold text-base">Loomiqe</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-3 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3 space-y-2">
          {currentUser && (
            <Link to={`/profile/${currentUser.email}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{currentUser.displayName || 'User'}</p>
                <p className="text-gray-500 text-xs truncate">{currentUser.email}</p>
              </div>
            </Link>
          )}
          <Link to="/logout" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors">
            Logout
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — sticky, responsive */}
        <header className="sticky top-0 z-30 h-16 sm:h-[72px] flex items-center justify-between px-2 sm:px-4 border-b border-gray-200 bg-white lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3 sm:gap-5 md:gap-7">
            {/* Account */}
            <Link to="/account" className={`flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname === '/account' ? 'text-blue-600' : 'text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Account</span>
            </Link>
            {/* Network */}
            <Link to="/members-directory" className={`flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname.startsWith('/members') ? 'text-blue-600' : 'text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Network</span>
            </Link>
            {/* Messaging */}
            <Link to="/messages" className={`relative flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname === '/messages' ? 'text-blue-600' : 'text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-none ">Messaging</span>
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>
            {/* Notifications */}
            <Link to="/notifications" className={`relative flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname === '/notifications' ? 'text-blue-600' : 'text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-none ">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>
            {/* Me */}
            {currentUser && (
              <Link to={`/profile/${currentUser.email}`} className={`flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname.startsWith('/profile') ? 'text-blue-600' : 'text-gray-500'}`}>
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-[8px] font-bold">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <span className="text-[10px] sm:text-[11px] font-semibold leading-none ">Me</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
