// src/Pages/career/TermsService.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const TermsService = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const { currentUser } = useAuth();

  // Get current date for automatic updates
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative bg-white">
      
      {/* Header */}
      <Navbar />
      

      {/* Main Content */}
      <main className="flex-grow pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-6xl">
          
          {/* Hero Section */}
          <section className="relative mb-16 sm:mb-24 md:mb-32 pt-8 sm:pt-12 md:pt-20">
            <div className="max-w-6xl mx-auto text-center">
              
              {/* Animated Badge */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-blue-400 rounded-full animate-ping"></div>
                <span className="text-blue-600 uppercase tracking-widest text-xs sm:text-sm md:text-lg font-black" 
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        letterSpacing: '0.1em'
                      }}>
                  Our Service Terms & Guidelines
                </span>
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-blue-400 rounded-full animate-ping"></div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 md:mb-12 leading-[0.9] tracking-tight text-gray-900"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Terms of{' '}
                <span className="block mt-2 sm:mt-4 text-blue-600">
                  Service
                </span>
              </h1>
              
              <div className="h-1 sm:h-2 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full shadow-lg mb-8 sm:mb-12 md:mb-16"></div>
            </div>
          </section>

          {/* Terms of Service Content */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg">
              
              {/* Header Section */}
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4" 
                    style={{
                      fontFamily: '"Inter", sans-serif'
                    }}>
                  <span className="text-orange-600">
                    Loomiq  
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-700 font-medium">
                  Effective Date: {getCurrentDate()}
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-10">
                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-6">
                  Welcome to Loomiq, a tech skills development platform designed to empower individuals through hands-on, team-based projects and structured learning journeys. By accessing or using our platform, you agree to abide by these Terms of Service. These Terms govern your use of the services, resources, and content provided by Loomiq for educational and portfolio development purposes.
                </p>
                
                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-6">
                  If you do not agree to these Terms, please do not use the platform.
                </p>
              </div>

              {/* Terms Sections */}
              <div className="space-y-8 sm:space-y-10">
                
                {/* Section 1 - Eligibility */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    1. Eligibility
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                    To use Loomiq, you must be at least 13 years old or the age of digital consent in your jurisdiction. By using the platform, you confirm that you meet this requirement and understand that participation is voluntary and focused on tech skills development through hands-on learning experiences.
                  </p>
                </div>

                {/* Section 2 - User Responsibilities */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    2. User Responsibilities
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    As a participant, you agree to:
                  </p>
                  <ul className="space-y-2 sm:space-y-3 text-gray-800 text-sm sm:text-base mb-4">
                    {[
                      "Provide accurate and complete information when signing up or submitting forms",
                      "Engage respectfully with others in all communication channels and team-based projects",
                      "Use the platform for its intended purposes: tech skills development, hands-on learning, collaboration, and portfolio building",
                      "Not impersonate another person or misrepresent your identity or skill level",
                      "Understand that participation is voluntary, educational in nature, and part of a structured learning journey"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-3 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                    You are responsible for maintaining the confidentiality of any login credentials associated with your account.
                  </p>
                </div>

                {/* Section 3 - Platform Use and Conduct */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    3. Platform Use and Conduct
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    You may not:
                  </p>
                  <ul className="space-y-2 sm:space-y-3 text-gray-800 text-sm sm:text-base mb-4">
                    {[
                      "Upload malicious code, spam, or attempt unauthorized access to other users' data",
                      "Use the platform in any way that violates applicable laws or infringes on intellectual property",
                      "Misuse the platform for unauthorized purposes outside of tech skills development and learning",
                      "Attempt to commercialize or monetize access to the platform or its resources without permission"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-3 mt-1">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm sm:text-base font-medium">
                      <strong>Warning:</strong> Violations of these terms may result in restricted access, suspension, or permanent removal from the platform.
                    </p>
                  </div>
                </div>

                {/* Section 4 - Intellectual Property */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    4. Intellectual Property
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                    All content, tools, and materials provided by Loomiq are the intellectual property of Loomiq unless otherwise stated. You may not reproduce, distribute, or use any part of the platform's content for commercial use without written permission. Educational and personal use for learning purposes is encouraged.
                  </p>
                </div>

                {/* Section 5 - Platform Services */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    5. Platform Services
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    Loomiq provides tech skills development through hands-on, team-based projects and structured learning journeys. Our services include:
                  </p>
                  <ul className="space-y-2 sm:space-y-3 text-gray-800 text-sm sm:text-base mb-4">
                    {[
                      "Project collaboration and team-based learning experiences",
                      "Portfolio building tools and showcase features",
                      "Skill development resources and learning materials",
                      "TechTalent Badge system for skill validation",
                      "Career development guidance and resources",
                      "Community support and mentorship opportunities"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-3 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                    These educational services support our mission to provide accessible tech education and career development opportunities.
                  </p>
                </div>

                {/* Section 6 - Volunteer Projects and Intellectual Property */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    6. Volunteer Projects and Intellectual Property
                  </h3>
                  
                  {/* Subsections */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">A. Educational Nature of All Projects:</h4>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        All projects on Loomiq are volunteer opportunities designed for educational purposes, tech skills development, and portfolio building through hands-on, team-based learning experiences. No monetary compensation is provided for any project participation. Projects are intended as structured learning journeys and should not be used directly in production environments without proper review, additional development, and security considerations.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">B. Portfolio and Learning Rights:</h4>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        All participants retain the right to showcase their contributions in their personal portfolios, resumes, and professional profiles. This includes the right to reference projects, describe their role and contributions, and display work samples for career development purposes. Participants may use their project contributions as examples of their tech skills and experience when applying for jobs or educational opportunities.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">C. Project Ownership and Usage:</h4>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Unless otherwise specified in a project agreement, volunteer projects are collaborative learning exercises designed to develop tech skills through hands-on experience. Project creators who submit ideas to the platform understand that the resulting work is primarily for educational benefit. Loomiq facilitates these learning opportunities but does not claim ownership of volunteer project outputs. Any commercial use of project results should be discussed and agreed upon by all project participants.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">D. Open Source and Learning Focus:</h4>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        We encourage open source practices and knowledge sharing. Many projects may be made publicly available for the broader learning community. Participants should be prepared for their contributions to be part of educational resources that benefit future learners. If you have concerns about sharing specific work, please discuss this with project coordinators before participating.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sections 7-10 */}
                {[
                  {
                    number: 7,
                    title: "Third-Party Services",
                    content: "Our platform may link to third-party websites or services for educational purposes. Loomiq is not responsible for the content or privacy practices of those external platforms. Users engage with them at their own discretion and should review their respective terms of service."
                  },
                  {
                    number: 8,
                    title: "Educational Disclaimers",
                    content: "Please understand that: All projects are learning exercises and should not be used in production without proper review and additional development; Participation does not guarantee employment, certification, or specific career outcomes; The platform provides tech skills development opportunities but does not replace formal education or professional training; Project quality and outcomes may vary as they are created by volunteers for learning purposes through hands-on experience."
                  },
                  {
                    number: 9,
                    title: "Modifications and Termination",
                    content: "We reserve the right to modify or discontinue any part of the platform at any time with reasonable notice when possible. We may also revise these Terms from time to time, and continued use of the platform after such changes implies acceptance of the new Terms."
                  },
                  {
                    number: 10,
                    title: "General Disclaimers",
                    content: "Loomiq is provided as a tech skills development service without warranties or guarantees of any kind. We make no guarantees regarding uninterrupted access, error-free performance, or specific learning outcomes. We are not liable for any damages resulting from your use of the platform, and users participate at their own risk and discretion."
                  }
                ].map((section) => (
                  <div key={section.number} className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                    <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                      {section.number}. {section.title}
                    </h3>
                    <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Last Updated */}
              <div className="mt-8 sm:mt-12 text-center">
                <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-xl">
                  <p className="text-blue-700 font-semibold text-base sm:text-lg">
                    Last updated: {getCurrentDate()}
                  </p>
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
                Tech skills development platform empowering individuals through hands-on, team-based projects and structured learning journeys - currently free with potential premium features.
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
                  <Link to="/career/terms" className="text-blue-400 font-bold transition-colors duration-300 text-sm sm:text-base">
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
                © {new Date().getFullYear()} Loomiq All rights reserved.
              </p>

              {/* Social or Additional Info */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-blue-400 text-lg sm:text-xl animate-pulse">•</span>
                <span className="text-gray-300 text-sm font-medium">
                  Fair Terms & Transparent Guidelines
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

export default TermsService;
