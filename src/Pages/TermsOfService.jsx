import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const TermsOfService = () => {
  const navigate = useNavigate();
  const lastUpdated = 'March 5, 2026';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using Loomiqe ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. Loomiqe is designed to serve tech professionals with projects, career tools, jobs, and community resources.'
    },
    {
      title: '2. Eligibility',
      content: 'You must be at least 18 years old to use Loomiqe. By creating an account, you represent that you are at least 18 years of age and that you have the legal capacity to enter into these terms. The Platform is intended for tech professionals at all experience levels and organizations that support or hire them.'
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
      title: '7. Projects and Collaboration',
      content: 'Loomiqe provides a platform for users to create, join, and manage collaborative projects. Projects can be free or paid. Both types contribute to a member\'s Tech Badge progress upon completion. Loomiqe does not manage, guarantee, or enforce any project deliverables, timelines, or outcomes. Project owners are solely responsible for managing their teams and project completion.'
    },
    {
      title: '8. Project Payments and Transactions',
      content: 'Loomiqe does not collect, process, or hold any payment information related to paid projects. All financial transactions for paid projects are conducted directly between the project owner and team members. Payment methods are determined by mutual agreement between the parties involved. Each party is responsible for keeping receipts and records of all transactions. Loomiqe is not liable for any payment disputes, non-payment, or financial losses arising from project transactions. Users may report payment disputes through our Support page for review, but any additional charges or legal actions are the responsibility of the parties involved.'
    },
    {
      title: '9. Tech Badges',
      content: 'Tech Badges are earned by completing collaborative projects on Loomiqe. Badge assignment is at the sole discretion of the project owner upon project completion. Loomiqe does not guarantee badge assignment for any project. Badges are non-transferable and represent participation and contribution in specific project categories.'
    },
    {
      title: '10. Platform Access for Different User Types',
      content: 'Loomiqe is designed for tech professionals at every stage of their career, from beginners to experts. Companies and organizations that hire, train, or support tech talent are also welcome. All users have access to the full platform including projects, jobs, community, and career tools.'
    },
    {
      title: '11. Listing and User Verification Disclaimer',
      content: 'All jobs, projects, housing listings, and financial resources posted on Loomiqe are user-generated and are not independently verified by Loomiqe. Loomiqe does not verify the identity, credentials, background, or legitimacy of any user on the platform. Users should exercise their own judgment, conduct their own due diligence, and independently verify the details of any listing, user, or opportunity before engaging. While all user information is securely stored and can be used to investigate reports of fraud or misconduct, Loomiqe does not guarantee the accuracy, legitimacy, safety, or quality of any listing or user profile. By using the Platform, you acknowledge and accept this risk.'
    },
    {
      title: '12. Verified Badge',
      content: 'Loomiqe offers a paid Verified Badge that users may purchase to display on their profile. The Verified Badge indicates that the user has completed their profile (including name, university, and LinkedIn URL) and has made a payment through our payment processor. The Verified Badge does NOT represent independent identity verification, background checks, or endorsement by Loomiqe. It does not guarantee the trustworthiness, legitimacy, or reliability of the badge holder. Users should always conduct their own due diligence before engaging with any member on the platform, regardless of whether they hold a Verified Badge. Loomiqe reserves the right to revoke a Verified Badge at any time if the user violates these Terms of Service or engages in fraudulent or harmful behavior. Verified Badge purchases are non-refundable.'
    },
    {
      title: '13. Privacy',
      content: 'Your use of Loomiqe is also governed by our Privacy Policy. By using the Platform, you consent to the collection and use of your information as described in the Privacy Policy.'
    },
    {
      title: '14. Intellectual Property',
      content: 'The Loomiqe name, logo, design, and all related content are the intellectual property of Loomiqe and its founder. You may not use, reproduce, or distribute any Loomiqe branding or content without prior written permission.'
    },
    {
      title: '15. Termination',
      content: 'Loomiqe reserves the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, the Platform, or third parties. You may also delete your account at any time through your Dashboard.'
    },
    {
      title: '16. Disclaimers',
      content: 'Loomiqe is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or secure. We are not responsible for any losses or damages arising from your use of the Platform, including but not limited to housing decisions, job applications, project participation, or financial transactions.'
    },
    {
      title: '17. Limitation of Liability',
      content: 'To the maximum extent permitted by law, Loomiqe and its founder shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform, including but not limited to project payment disputes, listing inaccuracies, or user misconduct.'
    },
    {
      title: '18. Changes to Terms',
      content: 'We may update these Terms from time to time. We will notify users of material changes by posting the updated terms on the Platform. Your continued use of Loomiqe after changes are posted constitutes acceptance of the updated Terms.'
    },
    {
      title: '19. Contact',
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
