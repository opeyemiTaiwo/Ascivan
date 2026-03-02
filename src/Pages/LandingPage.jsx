// src/Pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

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
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const isVisible = (id) => visibleSections.has(id);

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      ),
      title: 'Visa-Compliant Jobs',
      desc: 'Browse job listings filtered by your visa type — OPT, CPT, H1-B, and more. No more sifting through roles you can\'t legally take.',
      color: 'from-orange-500 to-amber-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      title: 'Student-Friendly Housing',
      desc: 'Find verified, affordable housing near your campus. No credit history? No SSN? No problem — listings built for international students.',
      color: 'from-green-500 to-emerald-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
      title: 'Finance Without SSN',
      desc: 'Access banking, credit cards, and financial tools designed for those new to the US system. Build your financial foundation from day one.',
      color: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: 'Global Community',
      desc: 'Connect with thousands of international students. Share experiences, get advice, and build a network that spans every campus and country.',
      color: 'from-purple-500 to-violet-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  const stats = [
    { value: '10K+', label: 'International Students' },
    { value: '50+', label: 'Universities' },
    { value: '1,200+', label: 'Job Listings' },
    { value: '100%', label: 'Free to Join' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign in with Google in seconds. Tell us your university, visa type, and what you need.' },
    { num: '02', title: 'Get Personalized Results', desc: 'Our AI filters jobs, housing, and finance options specifically for your situation.' },
    { num: '03', title: 'Connect & Thrive', desc: 'Join the community, share experiences, and build your life abroad with confidence.' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&family=Syne:wght@700;800&display=swap');

        .font-display { font-family: 'Syne', sans-serif; }

        .glow-orange { box-shadow: 0 0 60px rgba(249, 115, 22, 0.3); }
        .glow-green  { box-shadow: 0 0 60px rgba(34, 197, 94, 0.25); }

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .fade-up {
          opacity: 0;
          transform: translateY(40px);
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

        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .card-hover {
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
        }

        .btn-glow {
          position: relative;
          overflow: hidden;
        }
        .btn-glow::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.5s ease, height 0.5s ease;
        }
        .btn-glow:hover::before {
          width: 300px;
          height: 300px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .float { animation: float 4s ease-in-out infinite; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner { animation: marquee 20s linear infinite; }
        .marquee-inner:hover { animation-play-state: paused; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl"
           style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/Images/512X512.png" alt="Loomiqe" className="w-16 h-16" />
            <span className="font-display font-800 text-lg text-white tracking-tight sr-only">Loomiqe</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hidden sm:block text-gray-400 hover:text-white text-sm font-medium transition-colors">About</Link>
            <Link to="/support" className="hidden sm:block text-gray-400 hover:text-white text-sm font-medium transition-colors">Support</Link>
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="btn-glow bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Get Started Free'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center grid-bg noise pt-16 overflow-hidden">
        {/* Blobs */}
        <div className="hero-blob w-[500px] h-[500px] bg-orange-600/20 top-[-100px] left-[-150px]" />
        <div className="hero-blob w-[400px] h-[400px] bg-green-600/15 bottom-[-50px] right-[-100px]" />
        <div className="hero-blob w-[300px] h-[300px] bg-orange-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 float">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-slow" />
            <span className="text-gray-300 text-sm font-medium">Built for international students in the US</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-800 leading-[0.95] tracking-tight mb-6">
            <span className="block text-white">Your Life Abroad,</span>
            <span className="block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-green-400">
                Simplified.
              </span>
            </span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Loomiqe is the all-in-one platform giving international students access to{' '}
            <span className="text-white font-medium">visa-compliant jobs, student housing, financial tools,</span> and a{' '}
            <span className="text-white font-medium">global community</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="btn-glow w-full sm:w-auto glow-orange bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Join Free with Google'}
            </button>
            <Link
              to="/about"
              className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all hover:bg-white/5 text-center"
            >
              Learn More →
            </Link>
          </div>

          <p className="mt-5 text-gray-600 text-sm">No credit card. No SSN. Just your Google account.</p>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="font-display text-2xl sm:text-3xl font-800 text-white">{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="border-y border-white/10 bg-white/[0.02] py-4 overflow-hidden">
        <div className="flex marquee-inner whitespace-nowrap">
          {[...Array(2)].map((_, gi) => (
            <div key={gi} className="flex items-center gap-8 px-8">
              {['Jobs', 'Housing', 'Finance', 'Community', 'OPT Friendly', 'CPT Friendly', 'H1-B Resources', 'No SSN Required'].map((t, i) => (
                <React.Fragment key={i}>
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-widest">{t}</span>
                  <span className="text-orange-500/60">✦</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6">
        <div
          id="features-head"
          data-animate
          className={`fade-up text-center mb-16 ${isVisible('features-head') ? 'visible' : ''}`}
        >
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Everything You Need</span>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-white mt-3 mb-4">
            One platform. Every need.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            We built Loomiqe because navigating a new country is hard enough. Your tools shouldn't make it harder.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              id={`feature-${i}`}
              data-animate
              className={`fade-up delay-${i + 1} card-hover ${f.bg} border ${f.border} rounded-3xl p-7 ${isVisible(`feature-${i}`) ? 'visible' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5`}>
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-700 text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="hero-blob w-[400px] h-[400px] bg-green-600/10 top-0 right-[-100px]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div
            id="how-head"
            data-animate
            className={`fade-up text-center mb-16 ${isVisible('how-head') ? 'visible' : ''}`}
          >
            <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">Simple Process</span>
            <h2 className="font-display text-4xl sm:text-5xl font-800 text-white mt-3 mb-4">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div
                key={i}
                id={`step-${i}`}
                data-animate
                className={`fade-up delay-${i + 1} relative ${isVisible(`step-${i}`) ? 'visible' : ''}`}
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent z-0 -translate-y-1/2" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-7 h-full relative z-10">
                  <div className="font-display text-5xl font-800 text-white/10 mb-4">{s.num}</div>
                  <h3 className="font-display text-lg font-700 text-white mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL / QUOTE ── */}
      <section className="py-20 border-y border-white/10 bg-white/[0.02]">
        <div
          id="quote"
          data-animate
          className={`fade-up max-w-3xl mx-auto px-4 sm:px-6 text-center ${isVisible('quote') ? 'visible' : ''}`}
        >
          <div className="text-5xl text-orange-400/40 font-display mb-4">"</div>
          <p className="text-white text-xl sm:text-2xl font-light leading-relaxed mb-6">
           We spent years figuring it out alone, the housing, the jobs, the paperwork. Loomiqe is everything we wished existed from day one.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div className="text-left">
              <div className="text-white text-sm font-semibold">Temitope A.</div>
              <div className="text-gray-500 text-xs">Computer System Engineering, Morgan State University</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="hero-blob w-[600px] h-[600px] bg-orange-600/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div
          id="cta"
          data-animate
          className={`fade-up relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center ${isVisible('cta') ? 'visible' : ''}`}
        >
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-800 text-white leading-tight mb-6">
            Your journey starts{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-400">here.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Join thousands of international students who've made Loomiqe their first stop after landing in the US.
          </p>
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="btn-glow glow-orange bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all disabled:opacity-60 w-full sm:w-auto"
          >
            {isLoading ? 'Signing in…' : 'Join Loomiqe'}
          </button>
          <p className="mt-4 text-gray-600 text-sm">Sign in with your Google account. Takes 10 seconds.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/Images/512X512.png" alt="Loomiqe" className="w-14 h-14" />
              <span className="font-display font-800 text-white text-base">Loomiqe</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-500 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
            <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Loomiqe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
