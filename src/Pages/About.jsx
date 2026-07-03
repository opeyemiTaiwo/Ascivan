// src/Pages/About.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

import TechMO from '../Images/TechMO.png';
import TechQA from '../Images/TechQA.png';
import TechDev from '../Images/TechDev.png';
import TechLeads from '../Images/TechLeads.png';
import TechArchs from '../Images/TechArchs.png';
import TechGuard from '../Images/TechGuard.png';

const About = () => {
  const navigate = useNavigate();

  const badges = [
    { name: 'TechPO', img: TechMO, label: 'Product / Project Owner' },
    { name: 'TechQA', img: TechQA, label: 'Quality Assurance' },
    { name: 'TechDev', img: TechDev, label: 'Development' },
    { name: 'TechLeads', img: TechLeads, label: 'Non-Technical Roles' },
    { name: 'TechArchs', img: TechArchs, label: 'Low/No-Code Developer' },
    { name: 'TechGuard', img: TechGuard, label: 'Cybersecurity' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-1">
            <img src="/Images/512X512.png" alt="Ascivan" className="w-10 h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/support" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Support</Link>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">

        {/* Hero */}
        <section className="text-center mb-16">
          <div className="mb-4 inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-600 font-semibold text-sm">About Ascivan</p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-600">Ascend</span>{' '}
            <span className="text-orange-500">Achieve</span>{' '}
            <span className="text-gray-900">Advance</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ascivan is where you turn ability into proof by doing real work. Collaborate on real products from start to finish, earn verified badges, and build a network of fellow builders, so you can open doors in every direction: a job, your own venture, grad school, grants, or the next step in your career, no matter your background or location.
          </p>
        </section>

        {/* Why Ascivan - the thesis */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Why Ascivan</p>
            <p className="text-gray-800 text-lg sm:text-xl leading-relaxed">
              The world has moved from knowing to doing. Information is saturated and instant; what's rare is the chance to apply it on real work, with a real team, from start to finish. That is the gap Ascivan was built to close, turning knowledge into applied experience with a verified record of what you actually did.
            </p>
            <p className="mt-4 font-bold"><span className="text-blue-600">Ascend</span>. <span className="text-orange-500">Achieve</span>. <span className="text-gray-900">Advance</span>.</p>
          </div>
        </section>

        {/* The path: Ascend, Achieve, Advance */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What Ascend, Achieve, Advance means</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-2xl">Our name is a path, not just a phrase. Ascivan is built to move you along it, from wherever you start, to real accomplishment, to a career that keeps moving forward.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                <span className="text-blue-600 font-extrabold">1</span>
              </div>
              <h3 className="text-blue-600 font-bold text-lg mb-2">Ascend</h3>
              <p className="text-gray-500 text-sm">Start from wherever you are and rise. Discover your path in tech, learn the foundations, and choose the skill track that fits you, then grow into someone ready to contribute, no gatekeeping and no matter your background or location.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center mb-3">
                <span className="text-orange-500 font-extrabold">2</span>
              </div>
              <h3 className="text-orange-500 font-bold text-lg mb-2">Achieve</h3>
              <p className="text-gray-500 text-sm">Do work that counts. Ship real products with real teams from start to finish, and the people you build with become collaborators, partners, and clients, while verified badges prove exactly what you can do.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-3">
                <span className="text-gray-900 font-extrabold">3</span>
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">Advance</h3>
              <p className="text-gray-500 text-sm">Turn proof into momentum. Your verified work and the people you built it with open doors in every direction: a new job, your own venture, freelance clients, a co-founder, or a stronger case for grad school, grants, and the next step in your career. Advance on your own terms.</p>
            </div>
          </div>
        </section>

        {/* Who is Ascivan for */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Who is Ascivan for?</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-2xl">However you define moving forward, it starts the same way here: real work, real proof.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h3 className="font-bold text-gray-900">Career growth</h3>
              </div>
              <p className="text-gray-500 text-sm">Anyone looking for a job, changing roles, or discovering their path in tech.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
                <h3 className="font-bold text-gray-900">Academic advancement</h3>
              </div>
              <p className="text-gray-500 text-sm">Anyone aiming for a master's or PhD, applying to grad schools, or seeking grants and funding to study further, at home or abroad.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" /></svg>
                </div>
                <h3 className="font-bold text-gray-900">Building a business</h3>
              </div>
              <p className="text-gray-500 text-sm">Anyone looking for a co-founder, a business partner, or a team to build with.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-gray-900">Extra income</h3>
              </div>
              <p className="text-gray-500 text-sm">Anyone wanting freelance work and paid opportunities on the side.</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-6 font-medium">Wherever you're headed, your proven work opens the door.</p>
        </section>

        {/* Mission */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Talent is everywhere, but the chance to prove it is not. Many capable people have the skills but no easy way to gain real, verifiable work experience. Degrees, coursework, and competitions build ability; they rarely produce the one thing that opens doors: proof that you've shipped a real product, with a team, from start to finish. Ascivan closes that gap. We turn knowledge into applied experience, real teams building products end to end, so you earn verified proof, a portfolio of genuine work, and a network of people you've actually built with. And it opens doors in every direction: a job, your own venture, freelance clients, grad school, grants, and the next step in your career. No matter where you are in the world, your work speaks for you.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Ascivan closes that gap. We simulate real-world experience - collaborative teams building products end to end - so you earn verified credentials and a portfolio of genuine work, then become visible to recruiters hiring for remote and onsite roles. No matter where you are in the world, your work speaks for you.
            </p>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Real-World Projects', desc: 'Join or post collaborative projects and build real products with real teams across development, QA, architecture, security, and more - from start to finish.' },
              { title: 'TechTalent Badges', desc: 'Earn verified credentials across 6 skill tracks with 4 progression levels each. Badges are awarded based on your role and contribution in completed projects.' },
              { title: 'Talent Board', desc: 'Every member with verified work is listed for recruiters and companies to discover. Your badges, project history, and verified profile do the talking.' },
              { title: 'Project Workspaces', desc: 'Every project gets a dedicated workspace with a discussion forum, resource sharing, and team directory - all logged for accountability.' },
              { title: 'Community & Messaging', desc: 'Post updates, follow professionals, and message anyone on the platform. Build a network through collaboration, not just connections.' },
              { title: 'Verified by Contribution', desc: 'Project owners evaluate each member, and badges record the role and contribution level - so the proof on your profile is honest and trusted by recruiters.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-gray-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Badge Tracks */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">6 Skill Tracks</h2>
          <p className="text-gray-500 text-sm mb-6">Each track has 4 levels: Novice, Associate, Advanced, Expert. Badges are earned by completing real projects in that role.</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {badges.map((b, i) => (
              <div key={i} className="text-center">
                <img src={b.img} alt={b.name} className="w-14 h-14 mx-auto mb-2" />
                <p className="text-gray-700 text-xs font-semibold">{b.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-4">
            {[
              { num: '1', title: 'Sign up and build your profile', desc: 'Sign in with Google, pick your skill track, and set your experience level. Takes under a minute.' },
              { num: '2', title: 'Join or post a project', desc: 'Browse open projects and apply with your portfolio and LinkedIn. Or post your own project and build a team.' },
              { num: '3', title: 'Collaborate in workspaces', desc: 'Once approved, access the project workspace. Discuss in the forum, share resources, and coordinate with your team.' },
              { num: '4', title: 'Complete and earn badges', desc: 'When the project is done, the owner evaluates the team. Badges are awarded based on your role and contribution, building a verified portfolio recruiters can trust.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{step.num}</div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-base">{step.title}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-gray-500 mb-4">Ready to start building your tech career?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all">
              Join Ascivan
            </Link>
            <button onClick={() => navigate('/support')} className="border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-all">
              Contact Support
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <Link to="/terms" className="hover:text-blue-600">Terms</Link>
            <Link to="/privacy" className="hover:text-blue-600">Privacy</Link>
            <Link to="/support" className="hover:text-blue-600">Support</Link>
          </div>
          <p className="text-gray-400 text-xs">{new Date().getFullYear()} Ascivan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
