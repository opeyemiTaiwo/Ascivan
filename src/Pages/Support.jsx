import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSeauqCwIMFBBxpnoaLtqIqNZUtu4V-0Uw-bXYYZ2yd9SK0RFA/formResponse';

const ENTRIES = {
  firstName: 'entry.1736029807',
  lastName:  'entry.1461328379',
  email:     'entry.1232544873',
  phone:     'entry.1937366356',
  message:   'entry.179653384',
};

const Support = () => {
  const { currentUser } = useAuth();

  const getFirstName = () => {
    if (!currentUser?.displayName) return '';
    return currentUser.displayName.split(' ')[0] || '';
  };
  const getLastName = () => {
    if (!currentUser?.displayName) return '';
    const parts = currentUser.displayName.split(' ');
    return parts.slice(1).join(' ') || '';
  };

  const [form, setForm] = useState({
    firstName: getFirstName(),
    lastName:  getLastName(),
    email:     currentUser?.email || '',
    phone:     '',
    message:   '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);

    const body = new URLSearchParams();
    body.append(ENTRIES.firstName, form.firstName);
    body.append(ENTRIES.lastName,  form.lastName);
    body.append(ENTRIES.email,     form.email);
    body.append(ENTRIES.phone,     form.phone);
    body.append(ENTRIES.message,   form.message);

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (_) {}

    setSending(false);
    setSubmitted(true);
  };

  const faqs = [
    { q: 'How do I create an account?', a: 'Click the sign-in button on the top right. You can sign up using your university email through Google authentication.' },
    { q: 'Is Loomiqe free to use?', a: 'Yes! Core features including job browsing, housing search, financial resources, and community access are free for all international students. We also offer an optional paid Verified Badge that adds a layer of accountability to your profile.' },
    { q: 'How do I post a job or housing listing?', a: 'Navigate to the Jobs or Housing section from the navbar, then click "Post a Job" or "List Your Space" to create a listing.' },
    { q: 'How do I update my profile?', a: 'Go to your Dashboard and click on the Profile tab to edit your information including university, major, location, and portfolio URL.' },
    { q: 'How do I report inappropriate content?', a: 'Use the report button on any post or listing, or contact us through this support page.' },
    { q: 'Is my personal data safe?', a: 'Yes. All user information is securely saved and protected. Your data can be used to investigate any person who engages in fraud or misconduct on the platform. Payment for the Verified Badge is processed securely by Stripe, and we never store your full card details. Read our Privacy Policy for full details.' },
    { q: 'Who is Loomiqe for?', a: 'Loomiqe is primarily for international students studying abroad. Professionals looking to break into a new field, young professionals, and domestic students can also join. Domestic students have access to the Home (community) and Projects sections.' },
    { q: 'I am not an international student. Can I still join?', a: 'Yes. Domestic students (those studying in their home country) can join Loomiqe. You will have access to the Home community and Projects. Features like Jobs, Housing, and some Finance resources are tailored for international students.' },
    { q: 'Are projects free or paid?', a: 'Projects can be either free or paid. Both types contribute to your tech badges when completed. If you are new, we recommend starting with free projects to develop your skills and build your profile before taking on paid ones.' },
    { q: 'How does payment work for paid projects?', a: 'Loomiqe does not collect or process any payment information. All financial transactions for paid projects are directly between the project members and the project owner. Payment method can be any means agreed upon by both parties. Each party must keep receipts of their transactions.' },
    { q: 'What if a project owner refuses to pay?', a: 'If a project owner refuses to honor agreed payment after project completion, you can report the case through this support page. Provide details of the project, the agreement, and any transaction receipts. Our team will review and get back to you. Note that any additional charges or disputes beyond our review are between you and the project owner.' },
    { q: 'Are job, housing, and project listings verified by Loomiqe?', a: 'No. All jobs, projects, and housing listings are posted by users and are not independently verified by Loomiqe. Similarly, Loomiqe does not verify the identity or credentials of any user, including those with a Verified Badge. We recommend you do your own due diligence, check profiles and LinkedIn URLs, and verify all details before committing to any opportunity. All user information is securely stored and can be used to investigate misconduct.' },
    { q: 'What are Tech Badges?', a: 'Tech Badges are earned by completing collaborative projects on Loomiqe. There are 6 badge types (TechDev, TechQA, TechMO, TechLeads, TechArchs, TechGuard) with 4 levels each (Novice, Beginners, Intermediate, Expert). Your badge level is determined by the number of projects you complete in each category.' },
    { q: 'How do I earn Tech Badges?', a: 'Join a project, contribute as a team member, and when the project owner completes the project, they evaluate each member and assign badges based on your role and contribution. Both free and paid projects count toward your badges.' },
    { q: 'Can I verify my identity on Loomiqe?', a: 'Loomiqe does not independently verify user identities. However, you can purchase a Verified Badge from your Dashboard. The badge shows other members that you have completed your profile and made a payment, which adds a layer of accountability. Please note that the Verified Badge does not guarantee the trustworthiness or legitimacy of any user. Always do your own due diligence before engaging with anyone on the platform.' },
    { q: 'What does the Verified Badge mean?', a: 'The Verified Badge means the user has completed their profile (including name, university, and LinkedIn URL) and has made a payment through our secure payment processor. It does NOT mean Loomiqe has verified their identity, background, or credentials. Always check profiles and details carefully before engaging with anyone on the platform.' },
    { q: 'Is the Verified Badge refundable?', a: 'No. Verified Badge purchases are non-refundable. Loomiqe reserves the right to revoke a Verified Badge if the user violates our Terms of Service.' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-20 sm:py-28">

          {/* Hero */}
          <section className="text-center mb-16">
            <div className="mb-4 inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-orange-400 font-semibold text-sm">Support Center</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              How Can We{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-500">Help?</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We're here to support you. Browse FAQs or send us a message.
            </p>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white/5 rounded-xl border border-white/20 overflow-hidden">
                  <summary className="cursor-pointer px-5 py-4 text-white font-semibold text-sm sm:text-base flex items-center justify-between list-none">
                    {faq.q}
                    <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-gray-400 text-sm">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="mb-12">
            <div className="bg-white/5 rounded-xl border border-white/20 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
              <p className="text-gray-400 text-sm mb-6">
                Your message goes directly to our support team.
              </p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Thank you for reaching out. We'll get back to you at{' '}
                    <span className="text-orange-400">{form.email}</span> as soon as possible.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm(prev => ({ ...prev, phone: '', message: '' }));
                    }}
                    className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        First Name <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={handleChange('firstName')}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        Last Name <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={handleChange('lastName')}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        Email Address <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Contact Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm"
                        placeholder="+1 (xxx) xxx-xxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      Describe Your Issue or Question <span className="text-orange-400">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={handleChange('message')}
                      rows={5}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm resize-none"
                      placeholder="Describe your issue or question in detail..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
                  >
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                        </svg>
                        Sending…
                      </span>
                    ) : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Direct Contact */}

        </div>
      </div>
      <Footer dark={true} />
    </>
  );
};

export default Support;
