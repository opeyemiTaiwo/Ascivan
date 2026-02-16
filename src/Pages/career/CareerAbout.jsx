// src/Pages/career/CareerAbout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const CareerAbout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const { currentUser, isAuthorized } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative bg-white">
      
      {/* Header */}
      <Navbar />

    
      {/* Main Content */}
      <main className="flex-grow pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-7xl">
          
          {/* Hero Section */}
          <section className="relative mb-16 sm:mb-24 md:mb-32 pt-8 sm:pt-12 md:pt-20">
            <div className="max-w-6xl mx-auto text-center">
              
              {/* Animated Badge */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-blue-600 uppercase tracking-widest text-xs sm:text-sm md:text-lg font-black" 
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        letterSpacing: '0.1em'
                      }}>
                  Where Projects Power Careers
                </span>
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-orange-500 rounded-full animate-ping"></div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 md:mb-12 leading-[0.9] tracking-tight text-gray-900"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                About{' '}
                <span className="block mt-2 sm:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700">
                  Loomiq
                </span>
              </h1>
              
              <div className="h-1 sm:h-2 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full shadow-lg mb-8 sm:mb-12 md:mb-16"></div>
            </div>
          </section>

          {/* ProjectX Section */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl transform hover:scale-105 transition-all duration-500">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 md:mb-8" 
                    style={{
                      fontFamily: '"Inter", sans-serif'
                    }}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700">
                    Loomiq ProjectX
                  </span>
                </h2>
                <div className="flex items-center justify-center mb-6 sm:mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-24 sm:w-32 mr-4"></div>
                  <span className="text-lg sm:text-xl md:text-2xl text-orange-600 font-semibold italic"
                        style={{
                          fontFamily: '"Inter", sans-serif'
                        }}>
                    Where Projects Power Careers
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-24 sm:w-32 ml-4"></div>
                </div>
              </div>
              
              <div className="space-y-6 sm:space-y-8">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-800 leading-relaxed font-light text-center" 
                   style={{
                     fontFamily: '"Inter", sans-serif'
                   }}>
                  <span className="text-orange-600 font-semibold">ProjectX</span> bridges the gap between academia and industry by empowering students with real-world, project-driven learning. Earn <span className="text-orange-600 font-semibold">TechTalent Badges</span> that demonstrate your skills, achievements, and problem-solving abilities while collaborating on hands-on projects.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-blue-200 transform hover:scale-105 transition-transform duration-500">
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-800 leading-relaxed font-light text-center" 
                     style={{
                       fontFamily: '"Inter", sans-serif'
                     }}>
                    With our <span className="text-blue-600 font-semibold">Smart Career Navigator</span>, learners from diverse backgrounds can develop tech skills through personalized insights, curated resources, career guidance, and interview preparation—turning projects into pathways for growing tech careers.
                  </p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
                  
                  {/* Real-World Projects */}
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-blue-300 shadow-lg transform hover:scale-105 transition-all duration-500">
                    <div className="text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                        BUILD
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4" 
                          style={{
                            fontFamily: '"Inter", sans-serif'
                          }}>
                        Real-World Projects
                      </h3>
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        Bridge academia and industry with hands-on, collaborative projects
                      </p>
                    </div>
                  </div>

                  {/* TechTalent Badges */}
                  <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-orange-300 shadow-lg transform hover:scale-105 transition-all duration-500">
                    <div className="text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                        EARN
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4" 
                          style={{
                            fontFamily: '"Inter", sans-serif'
                          }}>
                        TechTalent Badges
                      </h3>
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        Demonstrate your skills and achievements with verifiable badges
                      </p>
                    </div>
                  </div>

                  {/* Smart Career Navigator */}
                  <div className="group bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-blue-300 shadow-lg transform hover:scale-105 transition-all duration-500">
                    <div className="text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-orange-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                        GUIDE
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4" 
                          style={{
                            fontFamily: '"Inter", sans-serif'
                          }}>
                        Smart Career Navigator
                      </h3>
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        Personalized career guidance and resources for any background
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 mb-8 sm:mb-12">
            
            {/* Logo and Description */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4 sm:mb-6">
                <img 
                  src="/Images/loomiq-logo.svg" 
                  alt="Loomiq Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-2 sm:mr-3 md:mr-4 transform hover:scale-110 transition-transform duration-300"
                />
                <span className="text-xl sm:text-2xl md:text-3xl font-black" 
                      style={{
                        fontFamily: '"Inter", sans-serif'
                      }}>
                  Loomiq
                </span>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-sm mx-auto md:mx-0"
                 style={{
                   fontFamily: '"Inter", sans-serif'
                 }}>
                Tech skills development through hands-on projects and structured learning journeys - completely free.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Quick Links
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/career/about" className="text-blue-400 font-bold transition-colors duration-300 text-sm sm:text-base">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/career/contact" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Support & Legal
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/career/support" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Support
                  </Link>
                </li>
                <li>
                  <Link to="/career/terms" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/career/privacy" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              
              {/* Copyright */}
              <p className="text-gray-300 text-sm sm:text-base" 
                 style={{
                   fontFamily: '"Inter", sans-serif'
                 }}>
                © {new Date().getFullYear()} Loomiq. All rights reserved.
              </p>

              {/* Social or Additional Info */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-blue-400 text-lg sm:text-xl animate-pulse">•</span>
                <span className="text-gray-300 text-sm font-medium">
                  Transforming Careers with AI
                </span>
                <span className="text-orange-400 text-lg sm:text-xl animate-pulse">•</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }

        /* Enhanced touch targets for mobile */
        @media (max-width: 768px) {
          button, a, input, textarea {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default CareerAbout;
