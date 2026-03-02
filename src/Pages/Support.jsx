import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const GOOGLE_FORM_BASE =
  'https://docs.google.com/forms/d/e/1FAIpQLSeauqCwIMFBBxpnoaLtqIqNZUtu4V-0Uw-bXYYZ2yd9SK0RFA/viewform';

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

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) return;

    // Build pre-filled Google Form URL and open in new tab
    const url = new URL(GOOGLE_FORM_BASE);
    url.searchParams.set(ENTRIES.firstName, form.firstName);
    url.searchParams.set(ENTRIES.lastName,  form.lastName);
    url.searchParams.set(ENTRIES.email,     form.email);
    url.searchParams.set(ENTRIES.phone,     form.phone);
    url.searchParams.set(ENTRIES.message,   form.message);
    window.open(url.toString(), '_blank');

    setSubmitted(true);
  };

  const faqs = [
    { q: 'How do I create an account?', a: 'Click the sign-in button on the top right. You can sign up using your university email through Google authentication.' },
    { q: 'Is Loomiqe free to use?', a: 'Yes! Core features including job browsing, housing search, financial resources, and community access are free for all international students.' },
    { q: 'How do I post a job or housing listing?', a: 'Navigate to the Jobs or Housing section from the navbar, then click "Post a Job" or "List Your Space" to create a listing.' },
    { q: 'How do I update my profile?', a: 'Go to your Dashboard and click on the Profile tab to edit your information including university, major, and location.' },
    { q: 'How do I report inappropriate content?', a: 'Use the report button on any post or listing, or contact us through this support page.' },
    { q: 'Is my personal data safe?', a: 'Absolutely. We take data privacy seriously. Read our Privacy Policy for full details on how we protect your information.' },
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
                Fill in your details below — clicking Send will open your pre-filled Google Form in a new tab to submit.
              </p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Form Opened!</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Your details have been pre-filled in the Google Form tab. Just click <strong className="text-white">Submit</strong> there to send your message.
                  </p>
                  <p className="text-gray-500 text-xs mb-6">
                    Didn't see the tab open? Check your browser's popup settings.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm(prev => ({ ...prev, phone: '', message: '' })); }}
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all text-sm"
                    >
                      Send Message →
                    </button>
                    <p className="text-gray-500 text-xs">Opens your pre-filled Google Form in a new tab</p>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Direct Contact */}
          <section className="text-center">
            <p className="text-gray-400 text-sm">
              You can also reach us at{' '}
              <a href="mailto:support@loomiqe.app" className="text-orange-400 hover:text-orange-300 font-semibold">
                support@loomiqe.app
              </a>
            </p>
          </section>

        </div>
      </div>
      <Footer dark={true} />
    </>
  );
};

export default Support;
