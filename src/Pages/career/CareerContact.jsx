// src/Pages/career/CareerContact.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const CareerContact = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const { currentUser, isAuthorized } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    description: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission with hidden iframe method
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setFormStatus({ type: '', message: '' });

    try {
      // Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create a form element
      const form = document.createElement('form');
      form.action = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeauqCwIMFBBxpnoaLtqIqNZUtu4V-0Uw-bXYYZ2yd9SK0RFA/formResponse';
      form.method = 'POST';
      form.target = 'hidden_iframe';

      // Add form fields with CORRECT entry IDs from your form
      const fields = {
        'entry.1736029807': formData.firstName,
        'entry.1461328379': formData.lastName,
        'entry.1232544873': formData.email,
        'entry.1937366356': formData.contactNumber,
        'entry.179653384': formData.description
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

      // Clean up
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }, 1000);

      // Success
      setFormStatus({ 
        type: 'success', 
        message: 'Thank you! Your message has been submitted successfully. We\'ll get back to you soon!' 
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        description: ''
      });

    } catch (error) {
      setFormStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
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
              
              {/* Animated Badge */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-blue-600 uppercase tracking-widest text-xs sm:text-sm md:text-lg font-black" 
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        letterSpacing: '0.1em'
                      }}>
                   ProjectX Career Platform
                </span>
                <div className="h-2 w-2 sm:h-4 sm:w-4 bg-orange-500 rounded-full animate-ping"></div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 md:mb-12 leading-[0.9] tracking-tight text-gray-900"
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Access Your{' '}
                <span className="block mt-2 sm:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700">
                  ProjectX Career Path
                </span>
              </h1>
              
              <div className="h-1 sm:h-2 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full shadow-lg mb-8 sm:mb-12 md:mb-16"></div>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 md:mb-16 text-gray-800 max-w-5xl mx-auto leading-relaxed font-light px-4"
                 style={{
                   fontFamily: '"Inter", sans-serif'
                 }}>
                Connect with <span className="text-blue-600 font-semibold">ProjectX learning opportunities</span> where you can prove your expertise through 
                <span className="text-orange-600 font-semibold"> real project completions</span> and earn validated TechTalent badges from 
                <span className="text-blue-600 font-semibold"> Novice to Expert levels</span>.
              </p>

              {/* HERO SUBTITLE: AI Career Navigator */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 md:mb-16 text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium px-4"
                 style={{
                   fontFamily: '"Inter", sans-serif'
                 }}>
                Featuring an <span className="font-bold text-blue-600">AI-powered Career Navigator</span> — personalized pathways, curated resources,
                career tips, and interview prep so <span className="font-semibold text-orange-600">learners from any background</span> can transition into tech.
              </p>
            </div>
          </section>

          {/* Badge Progression System Section */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 p-6 sm:p-8 md:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 md:mb-6" 
                    style={{
                      fontFamily: '"Inter", sans-serif'
                    }}>
                    How Our Platform Validates Skills
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 font-light leading-relaxed" 
                   style={{
                     fontFamily: '"Inter", sans-serif'
                   }}>
                  Each professional on our platform has earned validated TechTalent badges through successful ProjectX completions:
                </p>
              </div>

              <div className="p-6 sm:p-8 md:p-12">
                
                {/* Badge Progression Explanation */}
                <div className="text-center mb-12 sm:mb-16 md:mb-20">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6" 
                      style={{
                        fontFamily: '"Inter", sans-serif'
                      }}>
                    Progressive Skill Validation Through Real Projects
                  </h3>
                  <p className="text-gray-700 text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed" 
                     style={{
                       fontFamily: '"Inter", sans-serif'
                     }}>
                    Our talents grow from <span className="text-yellow-600 font-semibold">Novice to Expert</span> through hands-on experience. 
                    Each TechTalent badge represents not just technical skills, but also proven soft skills like 
                    <span className="text-blue-600 font-semibold"> communication, problem-solving, and collaboration</span>.
                  </p>
                </div>
                
                {/* Badge Levels Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
                  {[
                    { 
                      level: "Expert", 
                      projects: "15+", 
                      color: "from-orange-500 to-orange-600", 
                      icon: "🏆",
                      skills: ["Advanced technical expertise", "Team leadership", "Complex problem solving", "Mentoring abilities"],
                      bgColor: "from-orange-50 to-orange-100",
                      borderColor: "border-orange-300"
                    },
                    { 
                      level: "Intermediate", 
                      projects: "8-14", 
                      color: "from-purple-500 to-indigo-600", 
                      icon: "⭐",
                      skills: ["Independent development", "Cross-functional collaboration", "Code optimization", "Quality assurance"],
                      bgColor: "from-purple-50 to-indigo-100",
                      borderColor: "border-purple-300"
                    },
                    { 
                      level: "Beginners", 
                      projects: "3-7", 
                      color: "from-blue-500 to-cyan-600", 
                      icon: "🎯",
                      skills: ["Core development skills", "Team participation", "Best practices", "Documentation"],
                      bgColor: "from-blue-50 to-cyan-100",
                      borderColor: "border-blue-300"
                    },
                    { 
                      level: "Novice", 
                      projects: "1-2", 
                      color: "from-yellow-500 to-orange-600", 
                      icon: "🌟",
                      skills: ["Basic technical skills", "Learning mindset", "Following guidance", "Eagerness to grow"],
                      bgColor: "from-yellow-50 to-orange-100",
                      borderColor: "border-yellow-300"
                    }
                  ].map((badge, index) => (
                    <div key={index} 
                         className="group transform hover:scale-105 transition-all duration-500">
                      
                      <div className={`bg-gradient-to-br ${badge.bgColor} rounded-2xl p-6 sm:p-8 border-2 ${badge.borderColor} h-full flex flex-col shadow-lg`}>
                        
                        {/* Badge Header */}
                        <div className="text-center mb-6">
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            {badge.icon}
                          </div>
                          <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-2"
                              style={{
                                fontFamily: '"Inter", sans-serif'
                              }}>
                            {badge.level}
                          </h4>
                          <div className={`bg-gradient-to-r ${badge.color} text-white px-3 py-1 rounded-full font-bold text-sm shadow-md inline-block`}>
                            {badge.projects} Projects
                          </div>
                        </div>
                        
                        {/* Skills List */}
                        <ul className="space-y-2 sm:space-y-3 flex-grow">
                          {badge.skills.map((skill, idx) => (
                            <li key={idx} 
                                className="flex items-start text-gray-700 text-sm sm:text-base">
                              <span className="text-blue-600 mr-2 sm:mr-3 text-xs flex-shrink-0 mt-1">
                                ✓
                              </span>
                              <span className="font-medium">{skill}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {/* Progress Indicator */}
                        <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${badge.color} transition-all duration-700 mt-4 rounded-full`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Our Talents Stand Out */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 md:mb-8" 
                  style={{
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Why ProjectX{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700">
                  Learning
                </span>{' '}
                Stands Out
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
              {[
                {
                  icon: "🎯",
                  title: "Real-World Experience",
                  description: "Our talents have completed actual ProjectX initiatives, not just theoretical exercises. Each TechTalent badge represents hands-on problem-solving experience.",
                  gradient: "from-blue-500 to-orange-500"
                },
                {
                  icon: "🤝",
                  title: "Proven Soft Skills",
                  description: "Through collaborative ProjectX work, they've developed essential skills: communication, teamwork, analytical thinking, and professional interaction.",
                  gradient: "from-orange-500 to-blue-600"
                },
                {
                  icon: "📈",
                  title: "Continuous Growth",
                  description: "Our learning progression system ensures ongoing skill development. You're joining a platform committed to continuous improvement.",
                  gradient: "from-blue-500 to-purple-600"
                },
                {
                  icon: "✅",
                  title: "Validated Expertise",
                  description: "Every skill claim is backed by completed ProjectX deliverables. No guesswork - you see exactly what they've accomplished.",
                  gradient: "from-purple-500 to-orange-600"
                },
                {
                  icon: "🏆",
                  title: "Industry-Ready",
                  description: "From day one, they understand professional workflows, code quality standards, and project delivery expectations through ProjectX training.",
                  gradient: "from-orange-500 to-blue-600"
                },
                {
                  icon: "🔄",
                  title: "Adaptable & Reliable",
                  description: "Multi-project experience has taught them to adapt to different technologies, teams, and project requirements efficiently.",
                  gradient: "from-blue-500 to-orange-600"
                }
              ].map((feature, index) => (
                <div key={index} 
                     className="group transform hover:scale-105 transition-all duration-500 cursor-pointer">
                  
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl h-full flex flex-col">
                    
                    {/* Icon */}
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 text-center transform group-hover:scale-125 transition-all duration-500">
                      {feature.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-gray-900 text-center" 
                        style={{
                          fontFamily: '"Inter", sans-serif'
                        }}>
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-700 leading-relaxed text-center text-sm sm:text-base flex-grow" 
                       style={{
                         fontFamily: '"Inter", sans-serif'
                       }}>
                      {feature.description}
                    </p>
                    
                    {/* Animated Underline */}
                    <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} transition-all duration-700 mt-6 rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Career Navigator Section */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-gradient-to-br from-blue-50 to-orange-50 border-2 border-blue-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3" 
                      style={{ fontFamily: '"Inter", sans-serif' }}>
                    AI-powered Career Navigator
                  </h2>
                  <p className="text-gray-700 text-lg mb-4 leading-relaxed" 
                     style={{ fontFamily: '"Inter", sans-serif' }}>
                    Get personalized insights and a curated roadmap based on your projects, skills, and goals.
                    The Navigator recommends projects, learning resources, interview prep modules, and real-world role matches — 
                    making ProjectX the bridge from portfolio to job.
                  </p>

                  <ul className="text-gray-800 space-y-2 mb-6">
                    <li className="flex items-start">
                      <span className="mr-3">🧭</span>
                      <span><strong>Personalized pathways</strong> based on your projects & skills</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">🗂️</span>
                      <span><strong>Curated resources</strong> and learning materials tailored to your goals</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">💼</span>
                      <span><strong>Interview prep</strong> and role-fit tips to help you land opportunities</span>
                    </li>
                  </ul>

                  <div className="flex flex-wrap gap-4">
                    <Link to="/career/navigator" 
                          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-orange-600 text-white px-5 py-3 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105"
                          aria-label="Open Career Navigator">
                      Try the Navigator
                      <span className="ml-2">🤖</span>
                    </Link>

                    <Link to="/projects" 
                          className="inline-flex items-center border-2 border-blue-600 text-blue-600 px-5 py-3 rounded-full font-semibold hover:bg-blue-50"
                          aria-label="Explore Projects">
                      Explore Projects
                    </Link>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-md">
                  <h4 className="text-lg font-black text-gray-900 mb-3">What you'll see</h4>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2">
                    <li><strong>Role matches</strong> that fit your ProjectX portfolio</li>
                    <li><strong>Suggested projects</strong> to level up missing skills</li>
                    <li><strong>Interview packs</strong> by role (questions + scoring)</li>
                    <li><strong>Resource bundles</strong> — tutorials, articles, and example repos</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT FORM SECTION */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700 p-6 sm:p-8 md:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 md:mb-6" 
                    style={{
                      fontFamily: '"Inter", sans-serif'
                    }}>
                  Get Support
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-blue-100 font-light leading-relaxed" 
                   style={{
                     fontFamily: '"Inter", sans-serif'
                   }}>
                  Have questions or need assistance? Fill out the form below and we'll get back to you shortly.
                </p>
              </div>

              {/* Form */}
              <div className="p-6 sm:p-8 md:p-12">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Status Message */}
                  {formStatus.message && (
                    <div className={`p-4 rounded-xl border-2 ${
                      formStatus.type === 'success' 
                        ? 'bg-green-50 border-green-300 text-green-800' 
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                      {formStatus.message}
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contactNumber" className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">
                      Describe Your Issue or Question *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Please provide details about your question or issue..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-12 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-xl ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* Get Started with ProjectX Section */}
          <section className="mb-16 sm:mb-24 md:mb-32">
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-500">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700 p-6 sm:p-8 md:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 md:mb-6" 
                    style={{
                      fontFamily: '"Inter", sans-serif'
                    }}>
                  🚀 Start Your ProjectX Journey!
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 font-light leading-relaxed" 
                   style={{
                     fontFamily: '"Inter", sans-serif'
                   }}>
                  Join ProjectX and build your career through real-world projects and validated TechTalent badges.
                </p>
              </div>

              <div className="p-6 sm:p-8 md:p-12">
                <div className="max-w-4xl mx-auto text-center">
                  
                  {/* Benefits List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
                    {[
                      {
                        icon: "📚",
                        title: "Real Projects",
                        description: "Work on actual projects with real-world impact and build your portfolio"
                      },
                      {
                        icon: "🏆",
                        title: "TechTalent Badges",
                        description: "Earn validated badges that showcase your growing skills and expertise"
                      },
                      {
                        icon: "🚀",
                        title: "Career Growth",
                        description: "Progress from Novice to Expert through our structured learning pathway"
                      }
                    ].map((benefit, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-200 shadow-md">
                        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{benefit.icon}</div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3"
                            style={{
                              fontFamily: '"Inter", sans-serif'
                            }}>
                          {benefit.title}
                        </h3>
                        <p className="text-gray-700 text-sm sm:text-base">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Main CTA Button */}
                  <div className="mb-6 sm:mb-8">
                    <Link
                      to="/projects"
                      className="group relative inline-block bg-gradient-to-r from-blue-600 via-orange-500 to-blue-700 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-full font-black text-lg sm:text-xl md:text-2xl transition-all duration-500 transform hover:scale-110 shadow-xl overflow-hidden"
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        textDecoration: 'none'
                      }}
                      aria-label="Explore Projects"
                    >
                      <span className="relative flex items-center justify-center">
                        Explore Projects
                        <span className="ml-2 sm:ml-4 group-hover:translate-x-2 transition-transform text-xl sm:text-2xl md:text-3xl"></span>
                      </span>
                    </Link>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-blue-200">
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                      <span className="font-bold text-blue-600">Ready to Transform Your Career?</span> Join ProjectX and start building real projects, earning TechTalent badges, and creating a portfolio that stands out to employers.
                    </p>
                  </div>
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
                  <Link to="/career/contact" className="text-blue-400 font-bold transition-colors duration-300 text-sm sm:text-base">
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
                  <Link to="/career/privacy" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">
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

export default CareerContact;
