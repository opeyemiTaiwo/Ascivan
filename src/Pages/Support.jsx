import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const Support = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ name: currentUser?.displayName || '', email: currentUser?.email || '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    // Simulate send — integrate with your backend/email service
    setTimeout(() => {
      toast.success('Your message has been sent! We\'ll get back to you soon.');
      setForm(prev => ({ ...prev, subject: '', message: '' }));
      setSending(false);
    }, 1200);
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
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm"
                      placeholder="Your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm"
                    placeholder="What's this about?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={5}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none text-sm resize-none"
                    placeholder="Describe your issue or question..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </section>

          {/* Direct Contact */}
          <section className="text-center">
            <p className="text-gray-400 text-sm">
              You can also reach us at{' '}
              <a href="mailto:support@loomiq.app" className="text-orange-400 hover:text-orange-300 font-semibold">
                support@loomiq.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Support;
