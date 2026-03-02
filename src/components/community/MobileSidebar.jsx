// src/components/community/MobileSidebar.jsx - Loomiqe Mobile Navigation - FULLY RESPONSIVE

import React, { useEffect } from 'react';

/**
 * Mobile Sidebar Toggle Button
 * Fully responsive for all screen sizes
 */
export const MobileSidebarToggle = ({ leftSidebarOpen, onToggleLeftSidebar }) => {
  return (
    <div className="fixed bottom-3 right-3 xs:bottom-4 xs:right-4 z-[80] flex flex-col gap-1.5 xs:gap-2 lg:hidden">
      {/* Quick Actions Button */}
      <button
        onClick={onToggleLeftSidebar}
        className={`w-11 h-11 xs:w-12 xs:h-12 rounded-full shadow-2xl border-2 transition-all duration-300 flex items-center justify-center group active:scale-95 ${
          leftSidebarOpen 
            ? 'bg-orange-500 border-orange-400 text-white' 
            : 'bg-black/80 border-white/20 text-orange-400 hover:bg-orange-500 hover:text-white'
        }`}
        aria-label="Toggle quick actions"
        title="Quick Actions"
      >
        <svg 
          className="h-5 w-5 xs:h-6 xs:w-6 transition-transform duration-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      </button>
    </div>
  );
};

/**
 * Mobile Sidebar Drawer Component
 * Fully responsive for all screen sizes
 */
export const MobileSidebarDrawer = ({ isOpen, onClose, children, title, position = 'left' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const slideClass = 'transform translate-x-0';
  const positionClass = position === 'left' ? 'left-0' : 'right-0';
  const borderClass = position === 'left' ? 'border-r' : 'border-l';

  return (
    <div className="fixed inset-0 z-[90] lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`absolute top-0 ${positionClass} h-full w-72 xs:w-80 max-w-[85vw] bg-gradient-to-br from-gray-900/98 via-black/98 to-gray-900/98 ${borderClass} border-orange-500/20 shadow-2xl transition-transform duration-300 overflow-hidden ${slideClass}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 xs:p-4 border-b border-orange-500/10 bg-black/20">
          <h3 className="text-white font-bold text-base xs:text-lg flex items-center gap-1.5 xs:gap-2">
            <svg className="w-4 h-4 xs:w-5 xs:h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="truncate">{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white active:text-gray-300 transition-colors p-1 xs:p-2 rounded-lg hover:bg-white/10 active:bg-white/20 flex-shrink-0"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5 xs:h-6 xs:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-64px)] xs:max-h-[calc(100vh-72px)] overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
