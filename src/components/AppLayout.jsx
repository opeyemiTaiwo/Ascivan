// src/components/AppLayout.jsx - Left sidebar layout for logged-in pages
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AppLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadNetwork, setUnreadNetwork] = useState(0);
  const [unreadAccount, setUnreadAccount] = useState(0);
  const [userPlan, setUserPlan] = useState('Free');
  const [userRole, setUserRole] = useState('member');
  const [isCompany, setIsCompany] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  // Fetch user plan/role
  useEffect(() => {
    if (!currentUser) return;
    getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setUserPlan(data.membershipPlan || 'Free');
        setUserRole(data.role || 'member');
        setIsCompany(!!data.isCompany);
      }
    }).catch(() => {});
  }, [currentUser]);

  // Unread messages
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

  // All unread notifications
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), where('isRead', '==', false));
    const unsub = onSnapshot(q, (snap) => {
      setUnreadNotifications(snap.size);
      // Count network (follow) notifications
      let network = 0, account = 0;
      snap.docs.forEach(d => {
        const type = d.data().type || '';
        if (type === 'follow' || type === 'new_follower' || type.includes('follow')) network++;
        if (type === 'project_completed' || type === 'payment_confirmed' || type === 'payment_confirmation' || type === 'application_approved') account++;
      });
      setUnreadNetwork(network);
      setUnreadAccount(account);
    }, () => {});
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isPremiumOrAdmin = userPlan === 'Premium' || userRole === 'admin';

  // For individuals, group project-related sections under one "Projects" menu to
  // reduce clutter. Companies don't get these contributor-only sections at all.
  const projectChildren = [
    { path: '/projects', label: 'All Projects' },
    { path: '/foundations', label: 'Foundations' },
    { path: '/my-workspaces', label: 'Workspace' },
    { path: '/project-vault', label: 'Project Vault' },
  ];

  const navItems = [
    { path: '/dashboard', label: 'Home' },
    ...(!isCompany ? [{ label: 'Projects', isGroup: true, children: projectChildren }] : []),
    { path: '/proof-wall', label: 'Proof Wall' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/talent-board', label: 'Talent Board' },
    { path: '/support', label: 'Support' },
    { path: '/settings', label: 'Settings' },
    ...(userRole === 'admin' ? [
      { path: '/admin', label: 'Admin' },
    ] : []),
  ];

  const isActive = (path) => {
    if (path === '/proof-wall') return location.pathname === '/proof-wall';
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Keep the Projects group open whenever the user is on one of its pages.
  const projectPaths = ['/projects', '/foundations', '/my-workspaces', '/project-vault'];
  useEffect(() => {
    if (projectPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))) {
      setProjectsOpen(true);
    }
  }, [location.pathname]);

  const hideSidebar = location.pathname === '/community' || location.pathname.startsWith('/community/');

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      {!hideSidebar && (
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 sm:h-[72px] border-b border-gray-200">
          <img src="/Images/512X512.png" alt="Ascivan" className="w-8 h-8" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-gray-400 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            // Expandable group (e.g. Projects with sub-items)
            if (item.isGroup) {
              const anyChildActive = item.children.some(c => isActive(c.path));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setProjectsOpen(o => !o)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      anyChildActive && !projectsOpen ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    <svg className={`w-4 h-4 transition-transform ${projectsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {projectsOpen && (
                    <div className="mt-1 ml-3 pl-2 border-l border-gray-200 space-y-1">
                      {item.children.map(child => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive(child.path) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            // Normal single link
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-200 p-3 space-y-2">
          {currentUser && (
            <Link to={`/profile/${currentUser.email}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-gray-900 text-sm font-medium truncate">{currentUser.displayName || 'User'}</p>
                <p className="text-gray-500 text-xs truncate">{currentUser.email}</p>
              </div>
            </Link>
          )}
          <Link to="/logout" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-100 transition-colors">
            Logout
          </Link>
        </div>
      </aside>
      )}

      {/* Overlay */}
      {sidebarOpen && !hideSidebar && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar - sticky, responsive */}
        <header className="sticky top-0 z-30 h-16 sm:h-[72px] flex items-center justify-between px-2 sm:px-4 border-b border-gray-200 bg-white lg:px-6">
          <div className="flex items-center gap-2">
            {!hideSidebar && (
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            )}
            {location.pathname === '/proof-wall' && (
            <a href="/proof-wall" className="hidden lg:flex items-center gap-1 ml-4">
              <img src="/Images/512X512.png" alt="Ascivan" className="h-9 w-9" />
            </a>
            )}
          </div>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-2 sm:gap-5 md:gap-7 pr-2 sm:pr-12 lg:pr-16 overflow-x-auto overflow-y-visible scrollbar-hide max-w-full pt-1">
            {/* Home */}
            <Link to="/dashboard" className={`relative flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Home</span>
            </Link>
            {/* Account */}
            <Link to="/account" className={`relative flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname === '/account' ? 'text-blue-600' : 'text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Account</span>
              {unreadAccount > 0 && (
                <span className="absolute top-0 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {unreadAccount > 9 ? '9+' : unreadAccount}
                </span>
              )}
            </Link>
            {/* Messaging */}
            <Link to="/messages" className={`relative flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${location.pathname === '/messages' ? 'text-blue-600' : 'text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-none ">Messaging</span>
              {unreadMessages > 0 && (
                <span className="absolute top-0 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
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
                <span className="absolute top-0 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
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
