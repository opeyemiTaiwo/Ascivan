import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-20 sm:py-28">

          {/* Hero */}
          <section className="text-center mb-16">
            <div className="mb-4 inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-600 font-semibold text-sm">About Loomiqe</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Empowering Tech{' '}
              <span className="text-blue-600">Professionals</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              An all-in-one platform that accelerates tech careers through real-world projects, verified skill badges, AI-powered career guidance, and a professional community.
            </p>
          </section>

          {/* Mission */}
          <section className="mb-12">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Tech professionals, from beginners exploring their first project to experts leading complex systems, deserve a unified platform to grow, collaborate, and get recognized for their skills.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Loomiqe bridges the gap between learning and doing. We connect professionals with real projects, help them earn verified TechTalent Badges, and provide the community and tools needed to advance at every stage of a tech career.
              </p>
            </div>
          </section>

          {/* What We Offer */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Projects', desc: 'Join collaborative, real-world tech projects across development, QA, architecture, security, and more.' },
                { title: 'TechTalent Badges', desc: 'Earn verified credentials across six skill tracks, each with four progression levels from Novice to Expert.' },
                { title: 'AI Career Path', desc: 'Get personalized project and career recommendations powered by AI that adapts to your profile and goals.' },
                { title: 'Talent Board', desc: 'Showcase your badges and portfolio to recruiters and companies looking for verified tech talent.' },
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skill Tracks</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {badges.map((b, i) => (
                <div key={i} className="text-center">
                  <img src={b.img} alt={b.name} className="w-14 h-14 mx-auto mb-2" />
                  <p className="text-gray-700 text-xs font-semibold">{b.label}</p>
                </div>
              ))}
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
                    PhD candidate in Computer and Electrical Systems Engineering (AI focus) at Morgan State University. Building Loomiqe to empower tech professionals at every level with the tools, projects, and community they need to advance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center">
            <p className="text-gray-500 mb-4">Have questions? Reach out to us.</p>
            <button
              onClick={() => navigate('/support')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
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
