// src/Pages/career/PrivacyPolicy.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const { currentUser } = useAuth();

  // Get current date for automatic updates
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative bg-white">
      
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-6xl">
          
          {/* Hero Section */}
          <section className="relative mb-16 sm:mb-24 md:mb-32 pt-8 sm:pt-12 md:pt-20">
            <div className="max-w-6xl mx-auto text-center">
              
              {/* Animated Badge */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-blue-600 uppercase tracking-widest text-xs sm:text-sm md:text-lg font-black" 
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        letterSpacing: '0.1em'
                      }}>
                  Your Privacy Matters in ProjectX
                </span>
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-orange-500 rounded-full animate-ping"></div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 md:mb-12 leading-[0.9] tracking-tight text-gray-900"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Privacy{' '}
                <span className="block mt-2 sm:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700">
                  Policy
                </span>
              </h1>
              
              <div className="h-1 sm:h-2 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full shadow-lg mb-8 sm:mb-12 md:mb-16"></div>
            </div>
          </section>

          {/* Privacy Policy Content */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl">
              
              {/* Header Section */}
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2" 
                    style={{
                      fontFamily: '"Inter", sans-serif'
                    }}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700">
                    Loomiq ProjectX
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-blue-600 font-medium italic mb-4">
                  Where Projects Power Careers
                </p>
                <p className="text-lg sm:text-xl text-gray-700 font-medium">
                  Effective Date: {getCurrentDate()}
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-10">
                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-6">
                  Loomiq ProjectX values your privacy and is committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard the data of students and learners who engage with our comprehensive career development platform that bridges the gap between academia and industry through real-world, project-driven learning experiences.
                </p>
                
                {/* Updated Platform Features Badge */}
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 sm:p-6 rounded-xl border-2 border-blue-200 mb-6">
                  <div className="flex items-center">
                    <div>
                      <h3 className="text-blue-700 font-bold text-lg sm:text-xl mb-2">ProjectX: Complete Career Development Platform</h3>
                      <p className="text-gray-800 text-sm sm:text-base">
                        ProjectX empowers students with <strong>TechTalent Badges</strong> that showcase skills and achievements, an <strong>AI-powered Career Navigator</strong> for personalized career guidance, and hands-on project experiences that turn learning into career opportunities. Our platform currently offers these core services for free, with potential premium features for advanced career services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Sections */}
              <div className="space-y-8 sm:space-y-10">
                
                {/* Section 1 - Updated for ProjectX */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    1. Information We Collect
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    We collect information necessary to provide our comprehensive ProjectX career development platform, including TechTalent Badges, AI-powered Career Navigator, and project-driven learning experiences. This may include:
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">Basic Profile Information:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Full name and email address",
                          "Educational background and current academic status",
                          "Career interests and professional goals",
                          "GitHub, LinkedIn, or portfolio links (if provided for career development)"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">TechTalent Badges & Skills Data:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Project completion records and achievement data for badge earning",
                          "Skill assessments and technical competency evaluations",
                          "Peer collaboration ratings and teamwork feedback",
                          "Code contributions and project portfolio submissions"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">AI Career Navigator Data:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Career preferences and industry interests for personalized recommendations",
                          "Learning progress and skill development tracking for AI insights",
                          "Interview preparation responses and career assessment results",
                          "Job market research queries and career transition goals"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">Platform Usage Data:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Browser type, IP address, and device information",
                          "Learning module engagement and time spent on platform features",
                          "Project collaboration patterns and team interaction data"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm sm:text-base font-medium">
                        <strong>Current Status:</strong> Our core ProjectX platform including TechTalent Badges and AI Career Navigator are currently free. We do not collect payment information at this time.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm sm:text-base font-medium">
                        <strong>Future Premium Features:</strong> If we introduce advanced career services or premium mentorship programs, we may collect additional information such as payment data, detailed career history, or enhanced profile information. Any such changes would be clearly communicated and require your consent.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 - Updated for ProjectX */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    2. How We Use Your Information
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    We use collected data to power our ProjectX platform and provide comprehensive career development services:
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">Core Platform Functions:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Enable participation in real-world, project-driven learning experiences",
                          "Facilitate team-based collaboration and hands-on skill development",
                          "Provide access to personalized student dashboards and career profiles"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">TechTalent Badges System:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Track project completions and skill achievements for badge awarding",
                          "Validate technical competencies and problem-solving abilities",
                          "Create verifiable digital credentials for career advancement",
                          "Generate portfolio showcases that demonstrate real-world capabilities"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">AI-powered Career Navigator:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Provide personalized career insights and pathway recommendations",
                          "Curate learning resources based on individual goals and progress",
                          "Deliver targeted career tips and interview preparation guidance",
                          "Support career transitions from academia to industry roles",
                          "Match students with relevant projects based on career interests"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-orange-600 font-semibold text-base sm:text-lg mb-2">Platform Enhancement:</h4>
                      <ul className="space-y-2 text-gray-800 text-sm sm:text-base ml-4">
                        {[
                          "Improve AI recommendations and learning experience personalization",
                          "Communicate relevant career opportunities and platform updates",
                          "Ensure student community safety and productive learning environment",
                          "Enhance matching algorithms for team formation and project assignments"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm sm:text-base font-medium">
                      <strong>Future Use:</strong> If we introduce premium career services such as advanced mentorship, personalized career coaching, or industry connections, we may use data to provide these enhanced services, process payments, or deliver premium features. Any new uses would be clearly disclosed and require appropriate consent.
                    </p>
                  </div>
                </div>

                {/* Section 3 - Updated */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    3. Data Sharing and Disclosure
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    We do not sell, rent, or monetize your personal information in any way. ProjectX is designed to empower students and bridge the academia-industry gap, not to profit from your data. We may share limited information with trusted service providers who help us operate the platform (such as cloud hosting, email services, or AI/ML infrastructure providers), but only under strict data protection agreements.
                  </p>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    For our TechTalent Badges system, we may share achievement data with verified employers or educational institutions only with your explicit consent and for the purpose of career advancement. Our AI Career Navigator may use aggregated, anonymized data to improve recommendations, but never shares personal information with third parties.
                  </p>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    If we introduce premium features in the future, we may need to share data with payment processors or advanced service providers, but this would be done with appropriate safeguards and user consent.
                  </p>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                    In rare cases, we may disclose information if legally required to do so.
                  </p>
                </div>

                {/* Section 4 - Updated */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    4. Data Security
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    We take comprehensive technical and organizational measures to protect your personal information from unauthorized access, misuse, or loss. Given the importance of career data, TechTalent Badges, and AI-powered insights, our security measures include:
                  </p>
                  <ul className="space-y-2 text-gray-800 text-sm sm:text-base mb-4 ml-4">
                    {[
                      "Secure data storage with encryption for sensitive career and achievement data",
                      "Role-based access control to protect student information",
                      "Regular security audits and monitoring of AI systems and badge infrastructure",
                      "Secure API connections for third-party integrations",
                      "Backup and recovery systems to prevent data loss"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-3 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                    As our platform evolves and potentially introduces premium features, we will continue to implement security measures proportionate to the sensitivity of the data we collect and our expanding service offerings.
                  </p>
                </div>

                {/* Section 5 - Updated */}
                <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                    5. Your Rights
                  </h3>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4">
                    You have comprehensive rights regarding your data in ProjectX:
                  </p>
                  <ul className="space-y-2 sm:space-y-3 text-gray-800 text-sm sm:text-base mb-4">
                    {[
                      "Request access to all your data including TechTalent Badges and AI insights",
                      "Correct or update any inaccurate personal or career information",
                      "Request deletion of your data (subject to completed badge credentials that may be preserved for verification)",
                      "Withdraw consent for AI Career Navigator features at any time",
                      "Export your data including badges, projects, and achievements for portfolio use",
                      "Control sharing of your badge achievements with employers or institutions",
                      "Opt out of any future premium features or advanced services",
                      "Request human review of any AI-generated career recommendations"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-3 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                    To exercise any of these rights, please{' '}
                    <Link 
                      to="/career/support" 
                      className="text-orange-600 hover:text-orange-700 font-semibold underline"
                    >
                      contact our support team
                    </Link>.
                  </p>
                </div>

                {/* Sections 6-11 */}
                {[
                  {
                    number: 6,
                    title: "Use of Cookies and Analytics",
                    content: "We use cookies and analytics tools to enhance your ProjectX experience, including tracking learning progress for TechTalent Badges, improving AI Career Navigator recommendations, and understanding how students engage with our project-driven learning platform. This helps us optimize the educational and career development experience we currently provide for free. Our AI systems may use session data to provide real-time career insights and personalized learning paths. If we introduce premium features, we may use additional analytics to enhance those services. You can manage cookie preferences through your browser settings, though some features like personalized AI recommendations may be limited."
                  },
                  {
                    number: 7,
                    title: "Third-Party Links and Educational Resources",
                    content: "ProjectX may contain links to external educational sites, career resources, coding platforms, and tools that support our hands-on learning programs and career development goals. We may also integrate with professional platforms like GitHub, LinkedIn, or job boards to enhance your TechTalent Badges and career opportunities. We are not responsible for their privacy practices. Please review those policies independently before sharing any personal information. Any future premium features may include additional third-party integrations for advanced career services, which would be clearly disclosed."
                  },
                  {
                    number: 8,
                    title: "Data Retention",
                    content: "We retain your personal information only as long as necessary to provide ProjectX services and fulfill the purposes outlined in this policy. TechTalent Badges and verified achievements may be retained longer to maintain credential integrity and support your career advancement. When you request account deletion, we will remove your personal data while preserving anonymized learning analytics and anonymized AI training data that help improve our platform for future students. Completed badge credentials may be preserved in anonymized form for verification purposes. If premium features are introduced, retention periods may vary based on the specific services provided."
                  },
                  {
                    number: 9,
                    title: "AI and Machine Learning",
                    content: "Our AI-powered Career Navigator uses machine learning algorithms to provide personalized career insights, learning recommendations, and pathway suggestions. This AI system processes your learning data, project completion records, and career preferences to generate relevant advice. The AI does not make decisions that significantly affect you without human oversight, and you can always request human review of AI recommendations. We continuously improve our AI models using aggregated, anonymized data to better serve all students. You have the right to understand how AI recommendations are made and can opt out of AI-powered features while still accessing core ProjectX functionality."
                  },
                  {
                    number: 10,
                    title: "Updates to This Policy",
                    content: "We may update this Privacy Policy periodically to reflect changes in our ProjectX platform features, introduction of premium career services, enhancements to TechTalent Badges, improvements to our AI Career Navigator, or legal requirements. Any significant changes, especially those related to new data collection for premium services or AI functionality, will be prominently communicated to users through email and platform notifications. We encourage you to review this policy periodically to stay informed about how we protect your privacy while empowering your career development journey."
                  },
                  {
                    number: 11,
                    title: "Contact Information",
                    content: "If you have any questions about this Privacy Policy, our data practices, TechTalent Badges system, AI Career Navigator functionality, or your privacy rights, please contact us through our support page. We are committed to addressing your privacy concerns and will respond to your inquiries in a timely manner. For specific questions about AI recommendations or badge verification, our support team can connect you with the appropriate technical specialists."
                  }
                ].map((section) => (
                  <div key={section.number} className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
                    <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
                      {section.number}. {section.title}
                    </h3>
                    <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                      {section.content}
                      {section.number === 11 && (
                        <>
                          {' '}
                          <Link 
                            to="/career/support" 
                            className="text-orange-600 hover:text-orange-700 font-semibold underline"
                          >
                            support page
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Last Updated */}
              <div className="mt-8 sm:mt-12 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 sm:p-6 rounded-xl border-2 border-blue-200">
                  <p className="text-blue-700 font-semibold text-base sm:text-lg">
                    Last updated: {getCurrentDate()}
                  </p>
                  <p className="text-gray-700 text-sm mt-2">
                    ProjectX Privacy Policy - Protecting your journey from projects to career success
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 mb-8 sm:mb-12">
            
            {/* Logo and Description */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4 sm:mb-6">
                <img 
                  src="/Images/loomiq-logo.svg" 
                  alt="Loomiq Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-2 sm:mr-3 md:mr-4 transform hover:scale-110 transition-transform duration-300"
                />
                <span className="text-xl sm:text-2xl md:text-3xl font-black" 
                      style={{
                        fontFamily: '"Inter", sans-serif'
                      }}>
                  Loomiq
                </span>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-sm mx-auto md:mx-0"
                 style={{
                   fontFamily: '"Inter", sans-serif'
                 }}>
                Tech skills development through hands-on projects and structured learning journeys - completely free.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Quick Links
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/career/about" className="text-blue-400 font-bold transition-colors duration-300 text-sm sm:text-base">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/career/contact" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Support & Legal
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/career/support" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Support
                  </Link>
                </li>
                <li>
                  <Link to="/career/terms" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/career/privacy" className="text-blue-400 font-bold transition-colors duration-300 text-sm sm:text-base">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              
              {/* Copyright */}
              <p className="text-gray-300 text-sm sm:text-base" 
                 style={{
                   fontFamily: '"Inter", sans-serif'
                 }}>
                © {new Date().getFullYear()} Loomiq. All rights reserved.
              </p>

              {/* Social or Additional Info */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-blue-400 text-lg sm:text-xl animate-pulse">•</span>
                <span className="text-gray-300 text-sm font-medium">
                  Transforming Careers with AI
                </span>
                <span className="text-orange-400 text-lg sm:text-xl animate-pulse">•</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }

        /* Enhanced touch targets for mobile */
        @media (max-width: 768px) {
          button, a, input, textarea {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
