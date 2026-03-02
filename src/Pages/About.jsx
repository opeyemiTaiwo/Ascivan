import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const About = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-20 sm:py-28">

          {/* Hero */}
          <section className="text-center mb-16">
            <div className="mb-4 inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 font-semibold text-sm">About Loomiqe</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Empowering International{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-orange-500">Students</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              All-in-one AI-powered solution that transforms the international student experience with housing, finance, jobs, and community support.
            </p>
          </section>

          {/* Mission */}
          <section className="mb-12">
            <div className="bg-white/5 rounded-xl border border-white/20 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                International students face fragmented services for housing, finance, and jobs, making it harder to succeed abroad. Loomiqe leverages cutting-edge AI to deliver a seamless solution, revolutionizing how international students navigate life in a new country.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We're building the platform we wish existed when we arrived — one place to find verified housing, discover visa-compliant jobs, access student-friendly financial resources, and connect with a supportive community of peers and alumni.
              </p>
            </div>
          </section>

          {/* What We Solve */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">What We Solve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '🏠', title: 'Housing', desc: 'Secure verified, affordable housing near your campus.' },
                { icon: '💰', title: 'Finance', desc: 'Access scholarships, grants, loans, and financial aid tailored for international students.' },
                { icon: '💼', title: 'Jobs', desc: 'Discover job opportunities that are visa-compliant.' },
                { icon: '🤝', title: 'Community', desc: 'Connect with a supportive community of peers, mentors, and alumni.' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/20 p-5">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Founder */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 rounded-xl border border-green-500/20 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Founded By</h2>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl text-black font-bold">OA</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Opeyemi Adeniran</h3>
                  <p className="text-green-400 text-sm font-semibold">Founder & CEO</p>
                  <p className="text-gray-400 text-sm mt-1">
                    PhD student in Computer & Electrical Systems Engineering (AI focus) at Morgan State University. Building Loomiqe to support the millions of skilled international students navigating life in the USA.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center">
            <p className="text-gray-400 mb-4">Have questions? Reach out to us.</p>
            <button
              onClick={() => navigate('/support')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all"
            >
              Contact Support
            </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
