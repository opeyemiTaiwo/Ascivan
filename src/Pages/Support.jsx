import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PremiumBadge } from '../components/PremiumBadge';

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
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (currentUser) {
      getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setIsPremium(data.membershipPlan === 'Premium' || data.role === 'admin');
        }
      }).catch(() => {});
    }
  }, [currentUser]);

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
    { q: 'What is Ascivan?', a: 'Ascivan is a platform where tech professionals at all levels - from beginners to experts - collaborate on real-world projects, earn TechTalent Badges, and build their professional profile. Think of it as a project-based learning and career acceleration platform.' },
    { q: 'Is Ascivan free to use?', a: 'Yes! Core features including projects, community, messaging, and badges are free for all members. Basic members can complete up to 3 paid projects per year. For unlimited access, we offer a Premium membership ($200/year or $20/month).' },
    { q: 'What are the advantages of Premium membership?', a: 'Premium membership gives you five key advantages: (1) A verified Premium Badge - an orange PRO badge displayed on your profile, directory listing, and across the platform that shows others you are a verified, trustworthy professional. It tells project owners you\'ll deliver, tells team members you\'ll pay, and tells recruiters you\'re serious about your career. (2) Unlimited paid projects - post and apply to as many paid projects as you want with no yearly cap. (3) Talent Board visibility - get listed where recruiters and companies actively search for professionals to hire. (4) Priority support - direct access to our team at info.ascivan@gmail.com. (5) Credibility - Premium members stand out in applications, project teams, and the member directory.' },
    { q: 'What does the Premium Badge mean?', a: 'The Premium Badge is a verified status. Unlike TechTalent Badges which are earned through project work, the Premium Badge is activated through a paid subscription. It signals to everyone on Ascivan - project owners, team members, and recruiters - that you are a verified, invested, and accountable professional. When you see the orange PRO badge on someone\'s profile, it means they are a verified member of the platform.' },
    { q: 'How do projects work?', a: 'Project owners post projects (free or paid) with team roles. Members apply to join. Once accepted, teams collaborate through the project workspace. When the project is completed, badges are automatically awarded based on each member\'s role.' },
    { q: 'What does a project lead need to provide?', a: 'As a project lead you are responsible for setting up and running the project, not just claiming it. You must provide a project submission link in the workspace Resources tab. A GitHub repository is recommended because it is free and gives the team a place to store code and track work, but you may use another platform of your choice. This submission link is required: it is how the team work is reviewed and how badges are verified on completion. As lead you also coordinate the team in the Discussion tab and mark the project complete when done. Leading earns a TechLeads (Leadership) badge.' },
    { q: 'What resources should a project lead set up?', a: 'At minimum, a submission link (GitHub or similar) where the work lives. You can also add a meeting link (Zoom or Google Meet) for team calls and a project details link such as a Google Doc describing scope and tasks. These live in the workspace Resources tab and help the team collaborate and get the work reviewed.' },
    { q: 'How does the project approval process work?', a: 'When the work is done, the project lead submits the project for review from the Complete Project page. The submission includes the submission link from the Resources tab (a folder, such as a GitHub repository, containing all the team work, the list of team members, and the final solutions) and the project workspace link, which is added automatically. The Ascivan team reviews it and can: (1) Approve it, after which the lead can assign badges to the team; (2) Request changes, sending it back with feedback so the team can improve and re-submit (this can happen as many times as needed); or (3) Reject it, in which case no badges are assigned and the project cannot be re-submitted. The lead, and the team, are notified at each step.' },
    { q: 'What makes a strong final project submission?', a: 'Your final presentation should speak to both technical and non-technical audiences: explain what the project does and why it matters in plain language, and also show the technical depth (architecture, key decisions, code). Deploy the project to a live URL if it is something that should run online, or provide a working prototype if a full deployment is not needed. Your submission folder should clearly include all team members and their roles, the final solution and source code, and any documentation or demo links. The goal is that a reviewer, technical or not, can understand what was built, who built it, and how to see it working.' },
    { q: 'How are badges earned?', a: 'Badges are earned automatically when a project is completed. Your badge type is based on your role: developers earn TechDev, QA testers earn TechQA, project managers earn TechMO, leaders earn TechLeads, designers earn TechArchs, and security specialists earn TechGuard. Badge levels progress from Novice to Associate to Advanced to Expert based on how many projects you\'ve completed in that track.' },
    { q: 'How does payment work for paid projects?', a: 'Ascivan does not process payments. All financial transactions happen directly between the project owner and team members. However, when a project owner marks a paid project for completion, every paid member must confirm they\'ve been paid before badges can be awarded. If a member hasn\'t been paid, they can dispute - which notifies both the project owner and Ascivan admins.' },
    { q: 'What if I\'m not paid for a paid project?', a: 'Click "Dispute" on the payment confirmation card in the project page. This flags the dispute to the project owner and Ascivan admins. The project cannot be completed until the dispute is resolved. You can also report through this support page with details and any receipts.' },
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

      {/* Premium Support */}
      {isPremium && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <PremiumBadge size="md" />
          <div>
            <p className="text-gray-900 text-sm font-semibold">Premium Support</p>
            <p className="text-gray-600 text-xs">As a Premium member, reach us directly at <a href="mailto:info.ascivan@gmail.com" className="text-blue-600 font-medium hover:underline">info.ascivan@gmail.com</a></p>
          </div>
        </div>
      )}

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
