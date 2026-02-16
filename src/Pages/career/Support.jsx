// src/Pages/career/Support.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const Support = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [formStatus, setFormStatus] = useState({
    message: '',
    isError: false,
    isSubmitting: false,
    isSuccess: false
  });
  const formRef = useRef(null);
  const { currentUser, isAuthorized } = useAuth();

  // Form field values
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [industryTrack, setIndustryTrack] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  
  // Math captcha states
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operation: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');

  // Guide expansion states
  const [expandedGuide, setExpandedGuide] = useState(null);

  const FORM_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeauqCwIMFBBxpnoaLtqIqNZUtu4V-0Uw-bXYYZ2yd9SK0RFA/formResponse';
  const FIRST_NAME_ID = 'entry.1736029807';
  const LAST_NAME_ID = 'entry.1461328379';
  const EMAIL_ID = 'entry.1232544873';
  const CONTACT_NO_ID = 'entry.1937366356';
  const INDUSTRY_TRACK_ID = 'entry.1234567890';
  const MESSAGE_ID = 'entry.179653384';

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let correctAnswer;
    switch (operation) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        correctAnswer = num1 - num2;
        break;
      case '*':
        correctAnswer = num1 * num2;
        break;
      default:
        correctAnswer = num1 + num2;
    }

    setCaptcha({
      num1,
      num2,
      operation,
      answer: correctAnswer
    });
    setUserAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (honeypot) {
      setFormStatus({
        message: 'There was an error sending your message. Please try again later.',
        isError: true,
        isSubmitting: false,
        isSuccess: false
      });
      generateCaptcha();
      return;
    }

    const userAnswerNumber = parseInt(userAnswer.trim(), 10);
    if (isNaN(userAnswerNumber) || userAnswerNumber !== captcha.answer) {
      setFormStatus({
        message: 'Please solve the math problem correctly to verify you are human.',
        isError: true,
        isSubmitting: false,
        isSuccess: false
      });
      generateCaptcha();
      return;
    }

    setFormStatus({
      message: '',
      isError: false,
      isSubmitting: true,
      isSuccess: false
    });

    try {
      const iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.action = FORM_URL;
      form.method = 'POST';
      form.target = 'hidden_iframe';

      const fields = {
        [FIRST_NAME_ID]: firstName,
        [LAST_NAME_ID]: lastName,
        [EMAIL_ID]: email,
        [CONTACT_NO_ID]: contactNo || 'Not provided',
        [INDUSTRY_TRACK_ID]: industryTrack || 'Not specified',
        [MESSAGE_ID]: `[SUPPORT REQUEST] ${message}`
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }, 1000);

      setFormStatus({
        message: 'Your support request has been submitted successfully! We aim to respond to all queries within 5 business days. Thank you for your patience.',
        isError: false,
        isSubmitting: false,
        isSuccess: true
      });
      
      setFirstName('');
      setLastName('');
      setEmail('');
      setContactNo('');
      setIndustryTrack('');
      setMessage('');
      setHoneypot('');
      setUserAnswer('');
      generateCaptcha();
      
    } catch (error) {
      setFormStatus({
        message: 'There was an error sending your message. Please try again later.',
        isError: true,
        isSubmitting: false,
        isSuccess: false
      });
      generateCaptcha();
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative bg-white">

      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-7xl">
          
          {/* Hero Section */}
          <section className="relative mb-16 sm:mb-24 md:mb-32 pt-8 sm:pt-12 md:pt-20">
            <div className="max-w-6xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600 uppercase tracking-widest text-xs sm:text-sm md:text-lg font-black">
                  We're Here to Help You Succeed
                </span>
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-orange-500 rounded-full"></div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 md:mb-12 leading-[0.9] tracking-tight text-gray-900">
                Get the{' '}
                <span className="block mt-2 sm:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500">
                  Support You Need
                </span>
              </h1>
              
              <div className="h-1 sm:h-2 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full mb-8 sm:mb-12 md:mb-16"></div>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 md:mb-16 text-gray-600 max-w-5xl mx-auto leading-relaxed font-light px-4">
                We value your feedback and are here to help with any issues you encounter on 
                <span className="text-orange-600 font-semibold"> Loomiq ProjectX</span>. Whether you need technical assistance with 
                <span className="text-blue-600 font-semibold"> project-driven learning</span>, have questions about 
                <span className="text-orange-600 font-semibold"> TechTalent Badges</span>, or want guidance with our 
                <span className="text-blue-600 font-semibold"> Smart Career Navigator</span>, our team is ready to assist.
              </p>
            </div>
          </section>

          {/* EMAIL COMMUNICATIONS SECTION */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-6 sm:p-8 md:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4">
                  Email Communications
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-green-100">
                  Important information about emails from Loomiq ProjectX
                </p>
              </div>

              <div className="p-6 sm:p-8 md:p-12 space-y-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-yellow-700 mb-4 flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    Check Your Spam Folder
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Our automated emails may sometimes be filtered to your spam or junk folder. To ensure you receive all important updates:
                  </p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span>Check your spam/junk folder regularly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span>Add <strong className="text-gray-900">hello@loomiqhq.com</strong> to your contacts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span>Mark our emails as "Not Spam" if they appear in spam</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span>Create a filter to always allow emails from our domain</span>
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-blue-700 mb-3">Emails You'll Receive</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Application status updates (approved/rejected)</li>
                      <li>• Project completion notifications</li>
                      <li>• Badge award confirmations</li>
                      <li>• Team invitation emails</li>
                      <li>• Project review results</li>
                      <li>• Important platform announcements</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-orange-700 mb-3">Email Response Time</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Automated emails are sent immediately when actions occur on the platform.
                    </p>
                    <p className="text-gray-700 text-sm">
                      Support responses: <strong className="text-gray-900">Within 5 business days</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK START GUIDES SECTION */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Quick Start{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                  Guides
                </span>
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Step-by-step instructions for getting started with ProjectX
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PROJECT OWNER GUIDE */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">
                    For Project Owners
                  </h3>
                  <p className="text-orange-100">Creating and managing your project</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-lg font-bold text-orange-600 mb-3 flex items-center">
                      <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">1</span>
                      Create Your Project
                    </h4>
                    <ul className="space-y-2 text-gray-700 text-sm ml-11">
                      <li>• Navigate to Projects page and click "Submit a Project"</li>
                      <li>• Fill in project details (title, description, requirements)</li>
                      <li>• Select your industry track</li>
                      <li>• Specify team size and required skills</li>
                      <li>• Submit - your project goes live immediately with a collaboration group!</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-lg font-bold text-orange-600 mb-3 flex items-center">
                      <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">2</span>
                      Manage Applications
                    </h4>
                    <ul className="space-y-2 text-gray-700 text-sm ml-11">
                      <li>• Access Owner Dashboard to view applications</li>
                      <li>• Review applicant experience and skills</li>
                      <li>• Approve or reject with feedback</li>
                      <li>• Approved members receive invitation emails</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-lg font-bold text-orange-600 mb-3 flex items-center">
                      <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">3</span>
                      Submit for Completion
                    </h4>
                    <ul className="space-y-2 text-gray-700 text-sm ml-11">
                      <li>• Navigate to your project group</li>
                      <li>• Click "Submit Project for Completion"</li>
                      <li>• Provide GitHub repository URL (must be public)</li>
                      <li>• Add Loomiq as collaborator</li>
                      <li>• Include project summary and technologies used</li>
                      <li>• Submit for admin review</li>
                      <li>• Once approved, assign badges to team members</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* COLLABORATOR GUIDE */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
                  <h3 className="text-2xl font-black mb-2">
                    For Collaborators
                  </h3>
                  <p className="text-blue-100">Joining and contributing to projects</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-lg font-bold text-blue-600 mb-3 flex items-center">
                      <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">1</span>
                      Find a Project
                    </h4>
                    <ul className="space-y-2 text-gray-700 text-sm ml-11">
                      <li>• Browse available projects on Projects page</li>
                      <li>• Filter by industry track, technology, or difficulty</li>
                      <li>• Read project requirements carefully</li>
                      <li>• Click "Apply" on projects that match your skills</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-lg font-bold text-blue-600 mb-3 flex items-center">
                      <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">2</span>
                      Submit Application
                    </h4>
                    <ul className="space-y-2 text-gray-700 text-sm ml-11">
                      <li>• Fill out application form with your details</li>
                      <li>• Highlight relevant experience and skills</li>
                      <li>• Include portfolio links if available</li>
                      <li>• Explain your motivation to join</li>
                      <li>• Wait for owner's decision (email notification)</li>
                      <li>• Check spam folder for approval email!</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-lg font-bold text-blue-600 mb-3 flex items-center">
                      <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">3</span>
                      Join & Contribute
                    </h4>
                    <ul className="space-y-2 text-gray-700 text-sm ml-11">
                      <li>• Click link in approval email to join group</li>
                      <li>• Introduce yourself to the team</li>
                      <li>• Review project requirements and timeline</li>
                      <li>• Start contributing to the project</li>
                      <li>• Collaborate with team members</li>
                      <li>• Earn your TechTalent Badge upon completion!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Categories Section */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 md:mb-8">
                How Can We{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                  Help You Today?
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
              {[
                {
                  title: "Bug Reports",
                  description: "Found a technical issue? Report bugs, glitches, or unexpected behavior to help us improve your experience.",
                  gradient: "from-red-500 to-pink-500",
                  bgHover: "hover:bg-red-50"
                },
                {
                  title: "General Questions",
                  description: "Have questions about our platform, badge system, or how to get started? We're here to guide you.",
                  gradient: "from-blue-500 to-blue-600",
                  bgHover: "hover:bg-blue-50"
                },
                {
                  title: "Project Assistance",
                  description: "Need help with project submissions, team collaboration, or understanding project requirements? We've got you covered.",
                  gradient: "from-blue-500 to-cyan-500",
                  bgHover: "hover:bg-cyan-50"
                },
                {
                  title: "Badge System Support",
                  description: "Questions about earning badges, skill validation, or tracking your progress? Learn more about our certification process.",
                  gradient: "from-orange-500 to-amber-500",
                  bgHover: "hover:bg-orange-50"
                },
                {
                  title: "Technical Issues",
                  description: "Experiencing login problems, dashboard issues, or other technical difficulties? We'll troubleshoot with you.",
                  gradient: "from-cyan-500 to-blue-500",
                  bgHover: "hover:bg-blue-50"
                },
                {
                  title: "Feature Requests",
                  description: "Have ideas for new features or improvements? Share your suggestions to help us build a better platform.",
                  gradient: "from-indigo-500 to-blue-500",
                  bgHover: "hover:bg-indigo-50"
                }
              ].map((category, index) => (
                <div key={index} 
                     className={`group transform hover:scale-105 transition-all duration-500 cursor-pointer`}>
                  
                  <div className={`bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:shadow-lg h-full flex flex-col transition-all duration-300 ${category.bgHover}`}>
                    
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-center transform group-hover:scale-110 transition-all duration-500">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${category.gradient} rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold mx-auto shadow-md group-hover:shadow-lg transition-shadow duration-500`}>
                        {category.title === "Bug Reports" && "BUG"}
                        {category.title === "General Questions" && "FAQ"}
                        {category.title === "Project Assistance" && "PROJ"}
                        {category.title === "Badge System Support" && "BADGE"}
                        {category.title === "Technical Issues" && "TECH"}
                        {category.title === "Feature Requests" && "IDEA"}
                      </div>
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-gray-900 group-hover:text-blue-600 transition-colors duration-500 text-center">
                      {category.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed text-center text-sm sm:text-base flex-grow">
                      {category.description}
                    </p>
                    
                    <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${category.gradient} transition-all duration-700 mt-6 rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Response Time Section */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-500">
              
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 p-6 sm:p-8 md:p-12 text-white relative overflow-hidden">
                <div className="relative">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 md:mb-6">
                    Our Commitment to You
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 font-light leading-relaxed">
                    We understand that timely support is crucial for your learning journey:
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 md:p-12">
                <div className="max-w-2xl mx-auto">
                  <div className="group">
                    <div className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-100 h-full">
                      <div className="flex items-center mb-4 sm:mb-6 md:mb-8 justify-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base md:text-lg font-bold mr-3 sm:mr-4 md:mr-6 shadow-md">
                          TIME
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                          Response Time
                        </h3>
                      </div>
                      
                      <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-5 md:mb-6 leading-relaxed font-light text-center">
                        We aim to respond to all support queries within <span className="text-blue-600 font-bold">5 business days</span>.
                      </p>
                      
                      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200">
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg text-center">
                          <span className="font-bold text-blue-600">Priority Support:</span> Critical issues and bugs are addressed within 24-48 hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Form Section */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm">
              
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 md:mb-8">
                  Submit Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                    Support Request
                  </span>
                </h2>
                <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                  Describe the issue you're experiencing or the assistance you need. Be as detailed as possible to help us provide the best support.
                </p>
              </div>
              
              {formStatus.message && (
                <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-500 ${
                  formStatus.isError 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  <p className="text-base sm:text-lg md:text-xl font-medium">
                    {formStatus.message}
                  </p>
                </div>
              )}
              
              <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    opacity: 0,
                    pointerEvents: 'none',
                    tabIndex: -1
                  }}
                  tabIndex="-1"
                  autoComplete="off"
                />
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="group">
                    <label htmlFor="firstName" className="block text-gray-900 font-bold mb-2 sm:mb-3 text-base sm:text-lg">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg font-medium"
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  
                  <div className="group">
                    <label htmlFor="lastName" className="block text-gray-900 font-bold mb-2 sm:mb-3 text-base sm:text-lg">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg font-medium"
                      placeholder="Your last name"
                      required
                    />
                  </div>
                  
                  <div className="group">
                    <label htmlFor="email" className="block text-gray-900 font-bold mb-2 sm:mb-3 text-base sm:text-lg">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg font-medium"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div className="group">
                    <label htmlFor="contactNo" className="block text-gray-900 font-bold mb-2 sm:mb-3 text-base sm:text-lg">
                      Contact Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="contactNo"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg font-medium"
                      placeholder="Your contact number"
                    />
                  </div>
                
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="group">
                    <label htmlFor="message" className="block text-gray-900 font-bold mb-2 sm:mb-3 text-base sm:text-lg">
                      Describe Your Issue or Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full h-[150px] sm:h-[180px] md:h-[200px] px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg font-medium resize-none"
                      placeholder="Please provide as much detail as possible about the issue you're experiencing, the steps you've taken, what you expected to happen, and what actually happened. If it's a bug, include any error messages you've seen."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="captcha" className="block text-gray-900 font-bold mb-2 sm:mb-3 text-base sm:text-lg">
                      Verify you are human <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 mb-3 sm:mb-4">
                      <div className="flex items-center justify-center space-x-2 sm:space-x-4 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black text-gray-900">
                          {captcha.num1}
                        </span>
                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600">
                          {captcha.operation}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-gray-900">
                          {captcha.num2}
                        </span>
                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600">
                          =
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-gray-400">
                          ?
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9-]*"
                        id="captcha"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base sm:text-lg font-medium text-center"
                        placeholder="Your answer"
                        maxLength="4"
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 border border-orange-200 font-semibold text-sm sm:text-base"
                        title="Generate new problem"
                      >
                        REFRESH
                      </button>
                    </div>
                    
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">
                      Solve the math problem above to verify you are human
                    </p>
                  </div>
                </div>
                
                <div className="lg:col-span-2 flex justify-center mt-6 sm:mt-8">
                  <button
                    type="submit"
                    disabled={formStatus.isSubmitting}
                    className={`group relative bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-full font-black text-lg sm:text-xl md:text-2xl transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden w-full sm:w-auto ${
                      formStatus.isSubmitting ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
                    }`}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative flex items-center justify-center">
                      {formStatus.isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2 sm:mr-4 text-xl sm:text-2xl md:text-3xl">⟳</span>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          Submit Support Request
                          <span className="ml-2 sm:ml-4 group-hover:translate-x-2 transition-transform text-xl sm:text-2xl md:text-3xl">→</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 mb-8 sm:mb-12">
            
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4 sm:mb-6">
                <img 
                  src="/Images/loomiq-logo.svg" 
                  alt="Loomiq Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-2 sm:mr-3 md:mr-4 transform hover:scale-110 transition-transform duration-300"
                />
                <span className="text-xl sm:text-2xl md:text-3xl font-black">
                  Loomiq
                </span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto md:mx-0">
                Tech skills development through hands-on projects and structured learning journeys - completely free.
              </p>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6">
                Quick Links
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/career/about" className="text-blue-400 font-bold transition-colors duration-300 text-sm sm:text-base">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/career/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6">
                Support & Legal
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/career/support" className="text-blue-400 font-bold transition-colors duration-300 text-sm sm:text-base">
                    Support
                  </Link>
                </li>
                <li>
                  <Link to="/career/terms" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/career/privacy" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              
              <p className="text-gray-400 text-sm sm:text-base">
                © {new Date().getFullYear()} Loomiq. All rights reserved.
              </p>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-blue-400 text-lg sm:text-xl">•</span>
                <span className="text-gray-400 text-sm font-medium">
                  Tech Support & Guidance
                </span>
                <span className="text-orange-400 text-lg sm:text-xl">•</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        select option {
          background-color: white;
          color: #111827;
          padding: 10px;
        }

        select option:hover {
          background-color: #eff6ff;
        }

        @media (max-width: 768px) {
          button, a, input, textarea, select {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default Support;
