// src/Pages/career/CareerHome.jsx - Responsive with Global Navbar

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Constants
const PROJECT_BENEFITS = [
  {
    title: "Build Your Portfolio",
    subtitle: "Real Projects, Real Impact",
    description: "Work on actual industry projects that matter. Create solutions, collaborate with teams, and build a portfolio that stands out to employers."
  },
  {
    title: "Industry-Ready Skills", 
    subtitle: "Learn by Doing",
    description: "Experience real workplace collaboration. Develop communication, problem-solving, and technical skills through hands-on project work."
  },
  {
    title: "Track Your Growth",
    subtitle: "From Beginner to Expert",
    description: "Earn badges as you progress. Our structured system recognizes your achievements and guides your learning journey."
  }
];

const INDUSTRY_TRACKS = [
  { id: 1, name: 'Healthcare/Medical', icon: '🏥' },
  { id: 2, name: 'Finance/Fintech', icon: '💰' },
  { id: 3, name: 'Education', icon: '📚' },
  { id: 4, name: 'E-commerce', icon: '🛒' },
  { id: 5, name: 'Entertainment/Media', icon: '🎮' },
  { id: 6, name: 'Government', icon: '🏛️' },
  { id: 7, name: 'Technology/Software', icon: '💻' },
  { id: 8, name: 'Cybersecurity', icon: '🔒' },
  { id: 9, name: 'Transportation', icon: '🚚' },
  { id: 10, name: 'Real Estate', icon: '🏠' }
];

const FAQs = [
  {
    question: "Can I showcase my project at the Loomiq?",
    answer: "Yes, but it must be with the consent or agreement of your group members."
  },
  {
    question: "Can two or more people present the same projects?",
    answer: "No, the same project has to be presented as a team. If no other member of your team is interested in presenting, then the person interested can present alone."
  },
  {
    question: "How does the AI analysis work?",
    answer: "Our system uses AI to analyze your complete profile including education, experience, skills, and goals. It compares this against thousands of successful learning transitions to provide personalized recommendations with match scores."
  },
  {
    question: "What makes this different from other skill assessments?",
    answer: "Unlike generic tests, our AI creates fully personalized content including specific learning plans, technical preparation materials, market data, and downloadable PDF reports. Plus, you get access to real projects to build your portfolio."
  },
  {
    question: "How does the project system work?",
    answer: "Browse real projects, apply to work on them, and build your portfolio while earning badges. You can also submit your own projects. This gives you practical experience and showcases your skills to the community."
  },
  {
    question: "What if I don't have any tech experience?",
    answer: "Perfect! Our AI specializes in identifying transferable skills from any background. Many successful users started with zero tech experience and used our personalized transition plans and real projects to advance their learning."
  }
];

const CareerHome = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const { currentUser } = useAuth();

  const handleStartTest = () => {
    if (currentUser) {
      navigate('/career/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleViewProjects = () => {
    if (currentUser) {
      navigate('/projects');
    } else {
      navigate('/login');
    }
  };

  const handleIndustryTrackClick = (trackName) => {
    if (currentUser) {
      navigate(`/projects?industry=${trackName.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')}`);
    } else {
      navigate('/login');
    }
  };

  const handleBadgesClick = () => {
    if (currentUser) {
      navigate('/tech-badges');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Global Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/Images/loomiq-logo.svg" 
                alt="Loomiq" 
                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
              />
            </Link>
            
            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {currentUser ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
                  >
                    Dashboard
                  </Link>
                  
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
                    {currentUser.photoURL && (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName || currentUser.email} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {currentUser.displayName || currentUser.email.split('@')[0]}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate('/logout')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Link to="/dashboard" className="text-gray-700 font-semibold text-sm">
                    Dashboard
                  </Link>
                  {currentUser.photoURL && (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================= */}
      {/* HERO SECTION                              */}
      {/* Background image positioned to left,      */}
      {/* text always on the right side.             */}
      {/* On mobile: bg is left-aligned, text has    */}
      {/* a gradient overlay so it's readable.       */}
      {/* ========================================= */}
      <section 
        className="relative overflow-hidden min-h-screen"
        style={{
          backgroundColor: '#0f2a4a'
        }}
      >
        {/* Background image — positioned to the left, doesn't stretch full width */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/Images/backg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'left center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Gradient overlay: fades from transparent on the left (showing robot) 
            to dark on the right (readable text area).
            On mobile, a stronger overall overlay keeps text readable. */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right, 
                rgba(15,42,74,0) 0%, 
                rgba(15,42,74,0.3) 25%, 
                rgba(15,42,74,0.85) 45%, 
                rgba(15,42,74,0.97) 55%, 
                rgba(15,42,74,1) 65%
              )
            `
          }}
        />
        
        {/* Mobile overlay — adds extra darkness so text is always readable on small screens */}
        <div className="absolute inset-0 bg-[#0f2a4a]/50 sm:bg-[#0f2a4a]/30 lg:bg-transparent transition-colors duration-300" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-screen pt-24 sm:pt-20 pb-12 sm:pb-16">
          
          {/* Push content to the right */}
          <div className="w-full flex justify-end">
            <div className="w-full sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[55%] 2xl:w-[50%] text-white">
              
              {/* Eyebrow */}
              <div className="mb-6 sm:mb-8">
                <span className="inline-block text-blue-100 font-semibold text-sm sm:text-base px-4 py-2 bg-blue-600/30 backdrop-blur-sm rounded-full border border-blue-400/30">
                  Where Learning Meets Real-World Experience
                </span>
              </div>
              
              {/* Main Headline */}
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] xl:text-[80px] 2xl:text-[90px] font-black flex flex-col gap-0 leading-[1.05] mb-8 md:mb-10">
                <p>Transform Your</p>
                <p>Tech Career with</p>
                <p className="bg-gradient-to-b from-[#FC711B] via-[#FC711B] to-[#FBFF4B] inline-block text-transparent bg-clip-text">
                  Real Projects
                </p>
              </div>
              
              {/* Details area */}
              <div className="flex flex-col gap-6 max-w-xl">
                
                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl text-blue-50 leading-relaxed">
                  Join <span className="font-semibold text-blue-200">ProjectX</span> by Loomiq — 
                  build industry-ready skills through hands-on collaboration, 
                  earn <span className="font-semibold text-orange-300">TechTalent Badges</span>, 
                  and get AI-powered career guidance tailored to your goals.
                </p>
                
                {/* Value Props */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                    <div className="font-bold text-white text-sm">Real Projects</div>
                    <div className="text-blue-100 text-xs">Build actual solutions</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                    <div className="font-bold text-white text-sm">Earn Badges</div>
                    <div className="text-blue-100 text-xs">Track your progress</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                    <div className="font-bold text-white text-sm">AI Guidance</div>
                    <div className="text-blue-100 text-xs">Personalized pathways</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleStartTest}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Your Journey →
                  </button>
                  <button
                    onClick={handleViewProjects}
                    className="bg-white/20 backdrop-blur-md border-2 border-white/40 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-all"
                  >
                    Explore Projects
                  </button>
                </div>

                {/* Social Proof */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-blue-100 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">✓</span>
                    <span>No Experience Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-300">✓</span>
                    <span>Industry-Recognized Badges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">✓</span>
                    <span>AI Career Navigator</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of content on white background */}
      <div className="bg-white">
        
        {/* How It Works Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                How <span className="text-blue-600">ProjectX</span> Works
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                Your journey from learner to professional in three simple steps
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "1",
                    title: "Discover Your Path",
                    description: "Take our AI-powered assessment to identify your strengths, interests, and the perfect tech career path for you.",
                    color: "blue"
                  },
                  {
                    step: "2",
                    title: "Build Real Solutions",
                    description: "Join industry-aligned projects, collaborate with teams, and create portfolio-worthy work that employers value.",
                    color: "blue"
                  },
                  {
                    step: "3",
                    title: "Earn & Advance",
                    description: "Gain TechTalent Badges as you progress, showcase your skills, and transition into your dream tech role.",
                    color: "orange"
                  }
                ].map((item, index) => (
                  <div key={index} className="relative">
                    {index < 2 && (
                      <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent"></div>
                    )}
                    
                    <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all h-full">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${item.color}-600 text-white font-black text-xl mb-4`}>
                        {item.step}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tech Badges Section */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Earn Your{' '}
                <span className="text-orange-600">TechTalent Badges</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                Progress through specialized tracks and showcase your growing expertise with industry-recognized badges
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {[
                { name: "TechMO", image: "/Images/TechMO.png", title: "Mentorship" },
                { name: "TechQA", image: "/Images/TechQA.png", title: "Quality Testing" },
                { name: "TechDev", image: "/Images/TechDev.png", title: "Development" },
                { name: "TechLeads", image: "/Images/TechLeads.png", title: "Leadership" },
                { name: "TechArchs", image: "/Images/TechArchs.png", title: "Design & No-Code" },
                { name: "TechGuard", image: "/Images/TechGuard.png", title: "Security & DevOps" }
              ].map((badge, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 mx-auto w-fit">
                      <img 
                        src={badge.image} 
                        alt={badge.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {badge.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10 sm:mt-12">
              <button
                onClick={handleBadgesClick}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-colors"
              >
                Learn About All Badge Tracks →
              </button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Why Choose <span className="text-blue-600">ProjectX?</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                Bridge the gap between academic learning and industry success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {PROJECT_BENEFITS.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-orange-600 text-sm font-semibold mb-3">
                    {benefit.subtitle}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Tracks */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Pick Your <span className="text-blue-600">Industry Focus</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                Choose from 21 industry tracks and build expertise in your field
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {INDUSTRY_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleIndustryTrackClick(track.name)}
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{track.icon}</div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {track.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Common <span className="text-blue-600">Questions</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Everything you need to know about ProjectX
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {FAQs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-xl border border-gray-200">
                  <button
                    className="w-full text-left p-4 sm:p-6"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900">
                        {faq.question}
                      </h3>
                      <span className={`text-blue-600 text-xl transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`}>
                        ⌄
                      </span>
                    </div>
                    <div className={`overflow-hidden transition-all ${expandedFAQ === index ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Ready to Launch Your <span className="text-orange-600">Tech Career?</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 mb-8 sm:mb-10">
                Join thousands of students transforming their careers through real-world projects
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleStartTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-colors"
                >
                  Get Started Free →
                </button>
                <button
                  onClick={handleViewProjects}
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-colors border-2 border-gray-300"
                >
                  View Live Projects
                </button>
              </div>
              
              <p className="mt-6 text-gray-600 text-sm">
                No credit card required • Start building immediately
              </p>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Loomiq ProjectX. Transforming careers through real-world experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CareerHome;
