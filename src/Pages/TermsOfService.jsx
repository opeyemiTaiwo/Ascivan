import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const TermsOfService = () => {
  const navigate = useNavigate();
  const lastUpdated = 'March 1, 2026';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using Loomiqe ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. Loomiqe is designed to serve international students with housing, finance, jobs, and community resources.'
    },
    {
      title: '2. Eligibility',
      content: 'You must be at least 18 years old to use Loomiqe. By creating an account, you represent that you are at least 18 years of age and that you have the legal capacity to enter into these terms. The Platform is primarily intended for international students, alumni, and organizations that support them.'
    },
    {
      title: '3. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.'
    },
    {
      title: '4. Acceptable Use',
      content: 'You agree not to: post false, misleading, or fraudulent content; harass, abuse, or threaten other users; use the Platform for any illegal purpose; scrape, crawl, or extract data from the Platform; impersonate another person or entity; post spam, malware, or unsolicited advertisements; violate any applicable laws or regulations.'
    },
    {
      title: '5. User-Generated Content',
      content: 'You retain ownership of content you post on Loomiqe. By posting content, you grant Loomiqe a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the Platform. You are solely responsible for the content you post and must ensure it does not infringe on any third-party rights.'
    },
    {
      title: '6. Job, Housing & Finance Listings',
      content: 'Loomiqe provides a platform for users to share job opportunities, housing listings, and financial resources. Loomiqe does not guarantee the accuracy, legality, or quality of any listing. Users should independently verify all information before making decisions. Loomiqe is not a party to any transaction between users.'
    },
    {
      title: '7. Privacy',
      content: 'Your use of Loomiqe is also governed by our Privacy Policy. By using the Platform, you consent to the collection and use of your information as described in the Privacy Policy.'
    },
    {
      title: '8. Intellectual Property',
      content: 'The Loomiqe name, logo, design, and all related content are the intellectual property of Loomiqe and its founder. You may not use, reproduce, or distribute any Loomiqe branding or content without prior written permission.'
    },
    {
      title: '9. Termination',
      content: 'Loomiqe reserves the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, the Platform, or third parties. You may also delete your account at any time through your Dashboard.'
    },
    {
      title: '10. Disclaimers',
      content: 'Loomiqe is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or secure. We are not responsible for any losses or damages arising from your use of the Platform, including but not limited to housing decisions, job applications, or financial transactions.'
    },
    {
      title: '11. Limitation of Liability',
      content: 'To the maximum extent permitted by law, Loomiqe and its founder shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform.'
    },
    {
      title: '12. Changes to Terms',
      content: 'We may update these Terms from time to time. We will notify users of material changes by posting the updated terms on the Platform. Your continued use of Loomiqe after changes are posted constitutes acceptance of the updated Terms.'
    },
    {
      title: '13. Contact',
      content: 'If you have questions about these Terms of Service, please contact us at support@loomiq.app or through our Support page.'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-20 sm:py-28">

          <section className="text-center mb-12">
            <div className="mb-4 inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-orange-400 font-semibold text-sm">Legal</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Terms of Service</h1>
            <p className="text-gray-400 text-sm">Last updated: {lastUpdated}</p>
          </section>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/20 p-5 sm:p-6">
                <h2 className="text-white font-bold text-lg mb-3">{section.title}</h2>
                <p className="text-gray-300 text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center space-x-4">
            <button onClick={() => navigate('/privacy')} className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
              Privacy Policy →
            </button>
            <button onClick={() => navigate('/support')} className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
              Support →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
