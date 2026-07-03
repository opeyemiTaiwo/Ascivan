// src/Pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import TechMO from '../Images/TechMO.png';
import TechQA from '../Images/TechQA.png';
import TechDev from '../Images/TechDev.png';
import TechLeads from '../Images/TechLeads.png';
import TechArchs from '../Images/TechArchs.png';
import TechGuard from '../Images/TechGuard.png';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser) navigate('/community');
  }, [currentUser, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSignIn = () => {
    // Send people to the login page, which offers BOTH Google and email/password,
    // instead of triggering Google directly.
    navigate('/login');
  };

  const isVisible = (id) => visibleSections.has(id);

  const features = [
    {
      title: 'Real-World Projects',
      desc: 'Join or post collaborative tech projects and build real products with real teams, from start to finish - the kind of hands-on experience employers actually look for.',
    },
    {
      title: 'TechTalent Badges',
      desc: 'Earn verified credentials across 6 skill tracks as you complete projects. Badges progress from Novice to Expert, building a portfolio that proves what you can do.',
    },
    {
      title: 'Talent Board',
      desc: 'Members with verified work are listed for recruiters and companies looking for proven talent. Your badges and project history speak for themselves.',
    },
    {
      title: 'Community & Workspace',
      desc: 'Connect with tech professionals, collaborate in project workspaces with built-in discussion forums, and grow your network through meaningful work.',
    },
  ];

  const badges = [
    { name: 'TechPO', img: TechMO, label: 'Product / Project Owner', desc: 'Own the product vision, requirements, and backlog, and steer projects to completion.' },
    { name: 'TechQA', img: TechQA, label: 'Quality Assurance', desc: 'Ensure code quality through systematic testing, reviews, and quality control practices.' },
    { name: 'TechDev', img: TechDev, label: 'Development', desc: 'Build and ship software across frontend, backend, mobile, and full-stack disciplines.' },
    { name: 'TechLeads', img: TechLeads, label: 'Non-Technical Roles', desc: 'Lead delivery and fill non-coding roles like management, writing, and research.' },
    { name: 'TechArchs', img: TechArchs, label: 'Low/No-Code Developer', desc: 'Build working products on low-code and no-code platforms.' },
    { name: 'TechGuard', img: TechGuard, label: 'Cybersecurity', desc: 'Protect systems, enforce security protocols, and build resilient infrastructure defenses.' },
  ];

  const stats = [
    { value: '6', label: 'Skill Tracks' },
    { value: '24', label: 'Badge Levels' },
    { value: '100+', label: 'Projects' },
    { value: 'Free', label: 'To Get Started' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign in with Google or email, choose your skill track, and set your experience level. Ready in under a minute.' },
    { num: '02', title: 'Build Real Products', desc: 'Join or post collaborative projects and ship real products with a team, start to finish - gaining experience that counts.' },
    { num: '03', title: 'Earn Badges & Get Discovered', desc: 'Complete projects to earn TechTalent Badges and a verified portfolio - then get found by recruiters hiring for remote and onsite roles.' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300&display=swap');

        .fade-up {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-up.delay-1 { transition-delay: 0.1s; }
        .fade-up.delay-2 { transition-delay: 0.2s; }
        .fade-up.delay-3 { transition-delay: 0.3s; }
        .fade-up.delay-4 { transition-delay: 0.4s; }
        .fade-up.delay-5 { transition-delay: 0.5s; }
        .fade-up.delay-6 { transition-delay: 0.6s; }
      `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/Images/512X512.png" alt="Ascivan" className="w-14 h-14 sm:w-16 sm:h-16" />
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">About</Link>
            <Link to="/support" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Support</Link>
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Get Started'}
            </button>
          </div>
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all disabled:opacity-60"
            >
              {isLoading ? '...' : 'Get Started'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
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
        <div className={`sm:hidden border-t border-gray-200 bg-white transition-all duration-200 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="px-4 py-4 space-y-2">
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-all min-h-[44px]">About</Link>
            <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-all min-h-[44px]">Support</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 id="hero-title" data-animate className={`fade-up delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-800 leading-[1.05] tracking-tight mb-6 mt-2 ${isVisible('hero-title') ? 'visible' : ''}`}>
            <span className="text-blue-600">Ascend</span>{' '}
            <span className="text-orange-500">Achieve</span>{' '}
            <span className="text-gray-900">Advance</span>
          </h1>

          <p id="hero-desc" data-animate className={`fade-up delay-2 text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-normal leading-relaxed ${isVisible('hero-desc') ? 'visible' : ''}`}>
            Build real products with real teams. Earn verified proof of your skills and a network of builders you've actually shipped with, and open doors wherever you want to go: a new job, your own venture, grad school, and beyond.
          </p>

          <div id="hero-cta" data-animate className={`fade-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 ${isVisible('hero-cta') ? 'visible' : ''}`}>
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-4 rounded-lg transition-all disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Join Free'}
            </button>
            <Link
              to="/about"
              className="w-full sm:w-auto border border-gray-300 hover:border-gray-400 text-gray-700 font-medium text-base px-8 py-4 rounded-lg transition-all hover:bg-gray-50 text-center"
            >
              Learn More
            </Link>
          </div>

          <p id="hero-sub" data-animate className={`fade-up delay-4 mt-4 text-gray-400 text-sm ${isVisible('hero-sub') ? 'visible' : ''}`}>
            No credit card required. Sign in with Google or email.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} id={`stat-${i}`} data-animate className={`fade-up delay-${i + 1} text-center ${isVisible(`stat-${i}`) ? 'visible' : ''}`}>
                <div className="text-3xl sm:text-4xl font-800 text-gray-900">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY ASCIVAN - the thesis */}
      <section className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">Why Ascivan</p>
        <p className="text-gray-800 text-lg sm:text-2xl leading-relaxed">
          The world has moved from knowing to doing. Information is saturated and instant; what's rare is the chance to apply it on real work, with a real team, from start to finish. That is the gap Ascivan was built to close, turning knowledge into applied experience with a verified record of what you actually did.
        </p>
        <p className="mt-5 font-bold text-lg sm:text-xl"><span className="text-blue-600">Ascend</span>. <span className="text-orange-500">Achieve</span>. <span className="text-gray-900">Advance</span>.</p>
      </section>

      {/* FEATURES */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6">
        <div id="features-head" data-animate className={`fade-up text-center mb-14 ${isVisible('features-head') ? 'visible' : ''}`}>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Everything You Need</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-800 text-gray-900 mb-4">Accelerate Your Tech Career</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            From real collaborative projects to verified credentials and recruiter visibility, Ascivan gives you everything you need to prove your skills and get hired.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div key={i} id={`feature-${i}`} data-animate className={`fade-up delay-${i + 1} border border-gray-200 rounded-2xl p-7 hover:border-blue-300 hover:shadow-sm transition-all ${isVisible(`feature-${i}`) ? 'visible' : ''}`}>
              <h3 className="text-xl font-700 text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH BADGES */}
      <section className="py-20 sm:py-28 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div id="badges-head" data-animate className={`fade-up text-center mb-14 ${isVisible('badges-head') ? 'visible' : ''}`}>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">TechTalent Badges</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-800 text-gray-900 mb-4">Earn Verified Credentials</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Each badge represents a verified skill track with four progression levels: Novice, Associate, Advanced, and Expert. Earn them by completing real projects.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {badges.map((b, i) => (
              <div key={i} id={`badge-${i}`} data-animate className={`fade-up delay-${i + 1} bg-white border border-gray-200 rounded-2xl p-5 text-center hover:border-blue-300 hover:shadow-sm transition-all ${isVisible(`badge-${i}`) ? 'visible' : ''}`}>
                <img src={b.img} alt={b.name} className="w-16 h-16 mx-auto mb-3" />
                <h3 className="text-sm font-700 text-gray-900 mb-1">{b.label}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-6">
        <div id="how-head" data-animate className={`fade-up text-center mb-14 ${isVisible('how-head') ? 'visible' : ''}`}>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-800 text-gray-900 mb-4">Up and running in minutes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} id={`step-${i}`} data-animate className={`fade-up delay-${i + 1} relative ${isVisible(`step-${i}`) ? 'visible' : ''}`}>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gray-200 z-0" style={{ width: 'calc(100% - 2rem)' }} />
              )}
              <div className="border border-gray-200 rounded-2xl p-7 h-full relative z-10 bg-white">
                <div className="text-4xl sm:text-5xl font-800 text-gray-100 mb-4">{s.num}</div>
                <h3 className="text-lg font-700 text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-16 border-y border-gray-200 bg-gray-50">
        <div id="quote" data-animate className={`fade-up max-w-3xl mx-auto px-4 sm:px-6 text-center ${isVisible('quote') ? 'visible' : ''}`}>
          <p className="text-gray-900 text-xl sm:text-2xl font-normal leading-relaxed mb-6">
            "Ascivan is everything we wished existed when we started our tech careers. One place to find projects, earn credentials, and connect with people who are building real things."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">TA</div>
            <div className="text-left">
              <div className="text-gray-900 text-sm font-semibold">Temitope A.</div>
              <div className="text-gray-500 text-xs">Computer and Electrical Engineering, Morgan State University</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div id="cta" data-animate className={`fade-up max-w-2xl mx-auto px-4 sm:px-6 text-center ${isVisible('cta') ? 'visible' : ''}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-800 text-gray-900 leading-tight mb-6">Your career starts here.</h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Build real experience, earn verified badges, and get discovered by recruiters - through real product work, wherever you are in the world.
          </p>
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-10 py-4 rounded-lg transition-all disabled:opacity-60 w-full sm:w-auto"
          >
            {isLoading ? 'Signing in...' : 'Join Ascivan'}
          </button>
          <p className="mt-4 text-gray-400 text-sm">Sign in with Google or email. Takes seconds.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <img src="/Images/512X512.png" alt="Ascivan" className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-500 text-sm">
              <Link to="/about" className="hover:text-blue-600 transition-colors font-medium">About</Link>
              <Link to="/terms" className="hover:text-blue-600 transition-colors font-medium">Terms</Link>
              <Link to="/privacy" className="hover:text-blue-600 transition-colors font-medium">Privacy</Link>
              <Link to="/support" className="hover:text-blue-600 transition-colors font-medium">Support</Link>
            </div>
            <p className="text-gray-400 text-xs">{new Date().getFullYear()} Ascivan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
