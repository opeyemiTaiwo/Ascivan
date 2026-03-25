import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSeauqCwIMFBBxpnoaLtqIqNZUtu4V-0Uw-bXYYZ2yd9SK0RFA/formResponse';
const ENTRIES = { firstName: 'entry.1736029807', lastName: 'entry.1461328379', email: 'entry.1232544873', phone: 'entry.1937366356', message: 'entry.179653384' };

const Support = () => {
  const { currentUser } = useAuth();
  const getFirstName = () => currentUser?.displayName?.split(' ')[0] || '';
  const getLastName = () => { const p = (currentUser?.displayName || '').split(' '); return p.slice(1).join(' ') || ''; };

  const [form, setForm] = useState({ firstName: getFirstName(), lastName: getLastName(), email: currentUser?.email || '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    const body = new URLSearchParams();
    Object.entries(ENTRIES).forEach(([k, v]) => body.append(v, form[k]));
    try { await fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() }); } catch (_) {}
    setSending(false);
    setSubmitted(true);
  };

  const faqs = [
    { q: 'What is Loomiqe?', a: 'Loomiqe is a platform where tech professionals at all levels — from beginners to experts — collaborate on real-world projects, earn TechTalent Badges, and build their professional profile. Think of it as a project-based learning and career acceleration platform.' },
    { q: 'Is Loomiqe free to use?', a: 'Yes! Core features including projects, community, messaging, and badges are free for all members. We offer a Premium membership ($100/year) that unlocks the Talent Board and advanced visibility features.' },
    { q: 'How do projects work?', a: 'Project owners post projects (free or paid) with team roles. Members apply to join. Once accepted, teams collaborate through the project workspace. When the project is completed, badges are automatically awarded based on each member\'s role.' },
    { q: 'How are badges earned?', a: 'Badges are earned automatically when a project is completed. Your badge type is based on your role: developers earn TechDev, QA testers earn TechQA, project managers earn TechMO, leaders earn TechLeads, designers earn TechArchs, and security specialists earn TechGuard. Badge levels progress from Novice to Associate to Advanced to Expert based on how many projects you\'ve completed in that track.' },
    { q: 'How does payment work for paid projects?', a: 'Loomiqe does not process payments. All financial transactions happen directly between the project owner and team members. However, when a project owner marks a paid project for completion, every paid member must confirm they\'ve been paid before badges can be awarded. If a member hasn\'t been paid, they can dispute — which notifies both the project owner and Loomiqe admins.' },
    { q: 'What if I\'m not paid for a paid project?', a: 'Click "Dispute" on the payment confirmation card in the project page. This flags the dispute to the project owner and Loomiqe admins. The project cannot be completed until the dispute is resolved. You can also report through this support page with details and any receipts.' },
    { q: 'What are the 6 TechTalent Badges?', a: 'TechMO (Project Management), TechQA (Quality Assurance), TechDev (Development), TechLeads (Leadership), TechArchs (Architecture/Design), and TechGuard (Cybersecurity). Each has 4 levels: Novice, Associate, Advanced, and Expert.' },
    { q: 'Do project owners earn badges too?', a: 'Yes! Project owners automatically receive a TechLeads (Leadership) badge when they complete a project, plus a certificate documenting the project, team size, and badges awarded.' },
    { q: 'Can I control who sees my email?', a: 'Yes. Go to Settings and toggle Email Visibility on or off. When set to private, your email is hidden from other members. They can still message you through the platform.' },
    { q: 'What is the Talent Board?', a: 'The Talent Board is a premium feature where companies and recruiters can search for tech professionals by skill track, experience level, and badges earned. Only Premium members are listed on the Talent Board.' },
    { q: 'How do I report inappropriate content or users?', a: 'Use this support form below to report any issues. Include the username, content description, and any screenshots. Our team will review and take action.' },
    { q: 'Is my data safe?', a: 'Yes. All data is stored securely using Firebase (Google Cloud) infrastructure with encrypted connections. We never store payment card details. See our Privacy Policy for full details.' },
  ];

  const inputClass = "w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Support</h1>
      <p className="text-gray-500 text-sm mb-8">Find answers or contact us.</p>

      {/* FAQ */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                <span className="text-gray-900 text-sm font-medium pr-4">{faq.q}</span>
                <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h2>
        {submitted ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-900 font-semibold mb-1">Message sent!</p>
            <p className="text-gray-500 text-sm">We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">First Name *</label>
                <input type="text" value={form.firstName} onChange={handleChange('firstName')} className={inputClass} required />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Last Name</label>
                <input type="text" value={form.lastName} onChange={handleChange('lastName')} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">Email *</label>
              <input type="email" value={form.email} onChange={handleChange('email')} className={inputClass} required />
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">Message *</label>
              <textarea value={form.message} onChange={handleChange('message')} rows={4} className={inputClass + " resize-none"} placeholder="Describe your issue or question..." required />
            </div>
            <button type="submit" disabled={sending} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Support;
