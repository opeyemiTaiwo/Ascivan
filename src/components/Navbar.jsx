// src/components/Navbar.jsx 
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Navbar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  const [checkingTest, setCheckingTest] = useState(true);

  // Check if user has completed career test
  useEffect(() => {
    const checkCareerTest = async () => {
      if (!currentUser) {
        setCheckingTest(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setHasCompletedTest(userData.hasCompletedCareerTest === true);
        }
      } catch (error) {
        console.error('Error checking career test status:', error);
      } finally {
        setCheckingTest(false);
      }
    };

    checkCareerTest();
  }, [currentUser]);

  const getCareerPath = () => {
    if (!currentUser) return '/career';
    return hasCompletedTest ? '/career/dashboard' : '/career/test';
  };

  const navItems = [
    { path: '/community', label: 'Home' },
    { path: 'career', label: 'Career', isDynamic: true }, // Mark as dynamic
    { path: '/projects', label: 'Projects' },
    { path: '/hub', label: 'Hub' },
    { path: '/events', label: 'Events' },
    { path: '/members', label: 'Members' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (path) => {
    if (path === 'career') {
      return location.pathname.startsWith('/career');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleCareerClick = (e) => {
    e.preventDefault();
    const careerPath = getCareerPath();
    navigate(careerPath);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <img 
                src="/Images/loomiq-logo.svg" 
                alt="Loomiq" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 transform group-hover:scale-110 transition-transform duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                if (item.isDynamic && item.path === 'career') {
                  return (
                    <button
                      key={item.path}
                      onClick={handleCareerClick}
                      className={`px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Profile - Desktop */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Link>
                
                <Link 
                  to={`/profile/${currentUser.email}`}
                  className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-orange-500"
                    />
                  ) : (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-3 xs:px-4 sm:px-6 max-w-7xl py-4 space-y-2">
              {navItems.map((item) => {
                if (item.isDynamic && item.path === 'career') {
                  return (
                    <button
                      key={item.path}
                      onClick={handleCareerClick}
                      className={`block w-full text-left px-4 py-3 rounded-lg text-base font-semibold transition-all min-h-[44px] ${
                        isActive(item.path)
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all min-h-[44px] ${
                      isActive(item.path)
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {currentUser && (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <Link
                      to="/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-100 transition-all min-h-[44px]"
                    >
                      Notifications
                    </Link>
                    
                    <Link
                      to={`/profile/${currentUser.email}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all min-h-[44px]"
                    >
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                          {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                        </div>
                      )}
                      <span className="text-base font-semibold text-gray-700">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </Link>

                    <Link
                      to="/logout"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50 transition-all min-h-[44px]"
                    >
                      Logout
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  );
};

export default Navbar;
