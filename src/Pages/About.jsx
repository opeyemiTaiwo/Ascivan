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
    { name: 'TechMO', img: TechMO, label: 'Project Management' },
    { name: 'TechQA', img: TechQA, label: 'Quality Assurance' },
    { name: 'TechDev', img: TechDev, label: 'Development' },
    { name: 'TechLeads', img: TechLeads, label: 'Leadership' },
    { name: 'TechArchs', img: TechArchs, label: 'Architecture' },
    { name: 'TechGuard', img: TechGuard, label: 'Cybersecurity' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-1">
            <img src="/Images/512X512.png" alt="Loomiqe" className="w-10 h-10" />
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
            <p className="text-blue-600 font-semibold text-sm">About Loomiqe <span className="text-gray-400 font-normal">(pronounced "loo-meek")</span></p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Where Tech Professionals{' '}
            <span className="text-blue-600">Build, Earn, and Grow</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Loomiqe is where you build real-world experience — collaborating on real products from start to finish, earning verified skill badges, and getting discovered by recruiters, wherever you are.
          </p>
          <p className="text-gray-400 text-sm mt-3">
            Loomiqe is pronounced <span className="text-gray-600 font-medium">"loo-meek."</span>
          </p>
        </section>

        {/* Mission */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Talent is everywhere, but the chance to prove it is not. Many capable people — international students especially — have the skills but no easy way to gain real, verifiable work experience that recruiters trust. Research, coursework, and competitions build ability; they rarely produce the one thing employers look for: proof that you've shipped a real product, with a team, from start to finish.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Loomiqe closes that gap. We simulate real-world experience — collaborative teams building products end to end — so you earn verified credentials and a portfolio of genuine work, then become visible to recruiters hiring for remote and onsite roles. No matter where you are in the world, your work speaks for you.
            </p>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Real-World Projects', desc: 'Join or post collaborative projects and build real products with real teams across development, QA, architecture, security, and more — from start to finish.' },
              { title: 'TechTalent Badges', desc: 'Earn verified credentials across 6 skill tracks with 4 progression levels each. Badges are awarded based on your role and contribution in completed projects.' },
              { title: 'Talent Board', desc: 'Every member with verified work is listed for recruiters and companies to discover. Your badges, project history, and verified profile do the talking.' },
              { title: 'Project Workspaces', desc: 'Every project gets a dedicated workspace with a discussion forum, resource sharing, and team directory — all logged for accountability.' },
              { title: 'Community & Messaging', desc: 'Post updates, follow professionals, and message anyone on the platform. Build a network through collaboration, not just connections.' },
              { title: 'Verified by Contribution', desc: 'Project owners evaluate each member, and badges record the role and contribution level — so the proof on your profile is honest and trusted by recruiters.' },
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

        {/* Membership */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Membership</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-900 font-semibold text-base mb-2">Free (Basic)</h3>
                <p className="text-gray-500 text-sm">Unlimited collaborative projects, all 6 badge tracks, a Talent Board listing for recruiters, community access, messaging, and project workspaces.</p>
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-base mb-2">Premium — $200/year or $20/month</h3>
                <p className="text-gray-500 text-sm">Everything in Basic plus priority Talent Board ranking, direct recruiter outreach, a verified Premium badge on your profile, and priority support at premium@loomiqe.com.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Founded By</h2>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl text-white font-bold">OA</span>
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg">Opeyemi Adeniran</h3>
                <p className="text-gray-500 text-sm mt-1">
                  PhD candidate in Computer and Electrical Systems Engineering (AI focus) at Morgan State University. Building Loomiqe to give every tech professional — from first-time coders to senior architects — a place to grow through real work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-gray-500 mb-4">Ready to start building your tech career?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all">
              Join Loomiqe
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
          <p className="text-gray-400 text-xs">{new Date().getFullYear()} Loomiqe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
