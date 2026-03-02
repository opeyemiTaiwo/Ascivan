// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ dark = true }) => {
  const year = new Date().getFullYear();

  if (dark) {
    return (
      <footer
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7))' }}
        className="text-white py-8 md:py-10 relative z-10 mt-auto border-t border-white/10"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img
                src="/Images/512X512.png"
                alt="Loomiqe Logo"
                className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0"
              />
              <span
                className="text-lg md:text-xl font-black"
                style={{
                  textShadow: '0 0 20px rgba(34, 197, 94, 0.5), 2px 2px 4px rgba(0,0,0,0.8)',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Loomiqe
              </span>
            </div>

            {/* Tagline */}
            <p className="text-gray-300 text-xs sm:text-sm font-medium mb-5"
               style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              Transforming the international student experience with AI
            </p>

            {/* Nav Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-5">
              <Link
                to="/about"
                className="text-gray-300 hover:text-green-400 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                About
              </Link>
              <span className="text-gray-600 text-xs hidden sm:inline">|</span>
              <Link
                to="/terms"
                className="text-gray-300 hover:text-green-400 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <span className="text-gray-600 text-xs hidden sm:inline">|</span>
              <Link
                to="/privacy"
                className="text-gray-300 hover:text-green-400 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600 text-xs hidden sm:inline">|</span>
              <Link
                to="/support"
                className="text-gray-300 hover:text-green-400 text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Support
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-gray-500 text-xs" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              © {year} Loomiqe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Light variant
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-600 py-6 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <img src="/Images/512X512.png" alt="Loomiqe Logo" className="w-6 h-6 flex-shrink-0" />
            <span className="text-base font-black text-gray-800">Loomiqe</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-3">
            <Link to="/about" className="text-gray-500 hover:text-green-600 text-xs font-medium transition-colors duration-200">
              About
            </Link>
            <span className="text-gray-300 text-xs hidden sm:inline">|</span>
            <Link to="/terms" className="text-gray-500 hover:text-green-600 text-xs font-medium transition-colors duration-200">
              Terms of Service
            </Link>
            <span className="text-gray-300 text-xs hidden sm:inline">|</span>
            <Link to="/privacy" className="text-gray-500 hover:text-green-600 text-xs font-medium transition-colors duration-200">
              Privacy Policy
            </Link>
            <span className="text-gray-300 text-xs hidden sm:inline">|</span>
            <Link to="/support" className="text-gray-500 hover:text-green-600 text-xs font-medium transition-colors duration-200">
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
