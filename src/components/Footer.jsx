// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ dark = true }) => {
  const year = new Date().getFullYear();

  if (dark) {
    return (
      <footer
        style={{ background: '#ffffff' }}
        className="py-8 md:py-10 relative z-10 mt-auto border-t border-gray-200"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center">

            {/* Logo only — no text beside it */}
            <div className="flex items-center justify-center mb-4">
              <img
                src="/Images/512X512.png"
                alt="Loomiqe Logo"
                className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0"
              />
            </div>

            {/* Tagline */}
            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-5">
              Transforming the international student experience with AI
            </p>

            {/* Nav Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-5">
              <Link
                to="/about"
                className="text-gray-500 hover:text-orange-500 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                About
              </Link>
              <span className="text-gray-300 text-xs hidden sm:inline">|</span>
              <Link
                to="/terms"
                className="text-gray-500 hover:text-orange-500 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <span className="text-gray-300 text-xs hidden sm:inline">|</span>
              <Link
                to="/privacy"
                className="text-gray-500 hover:text-orange-500 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300 text-xs hidden sm:inline">|</span>
              <Link
                to="/support"
                className="text-gray-500 hover:text-orange-500 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Support
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-gray-400 text-xs">
              © {year} Loomiqe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Light variant
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 py-6 mt-auto">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center">

          {/* Logo only */}
          <div className="flex items-center justify-center mb-3">
            <img
              src="/Images/512X512.png"
              alt="Loomiqe Logo"
              className="w-10 h-10 flex-shrink-0"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-3">
            <Link to="/about" className="text-gray-500 hover:text-orange-500 text-xs font-medium transition-colors duration-200">
              About
            </Link>
            <span className="text-gray-300 text-xs hidden sm:inline">|</span>
            <Link to="/terms" className="text-gray-500 hover:text-orange-500 text-xs font-medium transition-colors duration-200">
              Terms of Service
            </Link>
            <span className="text-gray-300 text-xs hidden sm:inline">|</span>
            <Link to="/privacy" className="text-gray-500 hover:text-orange-500 text-xs font-medium transition-colors duration-200">
              Privacy Policy
            </Link>
            <span className="text-gray-300 text-xs hidden sm:inline">|</span>
            <Link to="/support" className="text-gray-500 hover:text-orange-500 text-xs font-medium transition-colors duration-200">
              Support
            </Link>
          </div>

          <p className="text-gray-400 text-xs">© {year} Loomiqe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
