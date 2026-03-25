import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = 'March 5, 2026';

  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly when you create an account, including your name, email address, specialization, experience level, location, LinkedIn profile URL, GitHub URL, and portfolio URL. We also collect information about your activity on the Platform, including posts, listings, and interactions with other members. We use Google Authentication for sign-in, which provides us with your Google profile information.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use your information to: provide and improve the Platform; personalize your experience; display your profile to other members; send notifications about relevant activity; facilitate connections between users; analyze usage patterns to improve our services; and communicate important updates about the Platform.'
    },
    {
      title: '3. Information Sharing',
      content: 'Your profile information (name, university, major, location) is visible to other authenticated Loomiqe members. Your email address can be copied by other members for the purpose of networking. We do not sell your personal information to third parties. We may share anonymized, aggregated data for analytical purposes.'
    },
    {
      title: '4. Data Storage & Security',
      content: 'Your data is stored securely using Firebase (Google Cloud) infrastructure. We implement industry-standard security measures to protect your information, including encrypted connections and secure authentication. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.'
    },
    {
      title: '5. Your Content',
      content: 'Content you post on Loomiqe (including community posts, job listings, housing listings, and financial resources) is visible to other authenticated users. You can delete your own posts at any time. If you delete your account, your content will be removed from the Platform.'
    },
    {
      title: '6. Cookies & Tracking',
      content: 'Loomiqe uses essential cookies for authentication and session management. We may use analytics tools to understand how the Platform is used. We do not use tracking cookies for advertising purposes.'
    },
    {
      title: '7. Third-Party Services',
      content: 'Loomiqe integrates with third-party services including Google Authentication and Firebase. These services have their own privacy policies that govern their use of your data. We encourage you to review those policies.'
    },
    {
      title: '8. Verified Badge and Payment Data',
      content: 'Loomiqe offers a paid Verified Badge feature. When you purchase a Verified Badge, your payment is processed by our third-party payment processor (Stripe). Loomiqe does not store your full credit card number, CVV, or bank account details. We store your badge purchase status, purchase date, and a transaction reference ID for record-keeping. Payment data such as your card details are handled entirely by Stripe in accordance with their privacy policy and PCI-DSS compliance standards. The Verified Badge is displayed on your profile and is visible to other authenticated members. The Verified Badge does not represent independent identity verification by Loomiqe.'
    },
    {
      title: '9. Project and Collaboration Data',
      content: 'When you create or join projects on Loomiqe, we collect and store project details, team roles, applications, and completion records. If a project is paid, we store the agreed payment amounts but do not collect, process, or store any actual payment information or financial credentials. All financial transactions for projects occur directly between users outside the Platform.'
    },
    {
      title: '10. Tech Badges and Achievement Data',
      content: 'We collect and store information about Tech Badges earned through project completion, including the badge category, level, awarding project, contribution rating, and the date awarded. This information is displayed on your profile and is visible to other authenticated members. Badge data cannot be edited or deleted by users.'
    },
    {
      title: '11. Fraud Prevention and Misconduct',
      content: 'All user information stored on Loomiqe, including profile data, Verified Badge status, project participation history, and activity logs, may be used to investigate and address reports of fraud, misconduct, non-payment disputes, or violations of our Terms of Service. We may share relevant user information with law enforcement if required by law or in response to valid legal processes.'
    },
    {
      title: '12. Your Rights',
      content: 'You have the right to: access, update, or delete your personal information through your Dashboard; delete your account entirely; request a copy of your data; opt out of non-essential communications. To exercise any of these rights, visit your Dashboard or contact our Support team.'
    },
    {
      title: '13. Data Retention',
      content: 'We retain your personal information for as long as your account is active. If you delete your account, we will delete your personal data within a reasonable timeframe. We may retain anonymized data for analytical purposes and may retain project records and transaction references for fraud prevention as required by applicable law.'
    },
    {
      title: '14. Children\'s Privacy',
      content: 'Loomiqe is not intended for users under the age of 18. We do not knowingly collect information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.'
    },
    {
      title: '15. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify users of material changes by posting the updated policy on the Platform. Your continued use of Loomiqe after changes are posted constitutes acceptance of the updated policy.'
    },
    {
      title: '16. Contact Us',
      content: 'If you have questions about this Privacy Policy or your personal data, please contact us at support@loomiq.app or through our Support page.'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-20 sm:py-28">

          <section className="text-center mb-12">
            <div className="mb-4 inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 font-semibold text-sm">Legal</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Last updated: {lastUpdated}</p>
          </section>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/20 p-5 sm:p-6">
                <h2 className="text-white font-bold text-lg mb-3">{section.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center space-x-4">
            <button onClick={() => navigate('/terms')} className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
              Terms of Service →
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

export default PrivacyPolicy;
