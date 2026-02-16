// src/Pages/career/ProjectEnrollmentPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const ProjectEnrollmentPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const categories = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'join', name: 'Join Projects', icon: '🤝' },
    { id: 'ongoing', name: 'Ongoing Projects', icon: '🚀' },
    { id: 'completed', name: 'Completed Projects', icon: '✅' },
    { id: 'repository', name: 'Project Repository', icon: '📁' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ongoing':
        return (
          <div className="py-8 sm:py-12 md:py-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">🚀</div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6">
                  Are You Currently{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                    Enrolled?
                  </span>
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                  Choose your next step based on your current project status
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* YES - Enrolled */}
                <div className="group hover:shadow-lg transition-all duration-300 rounded-2xl">
                  <div className="bg-orange-50 rounded-2xl p-6 sm:p-8 border border-orange-200 h-full">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">✅</div>
                      <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6 group-hover:text-orange-600 transition-colors duration-300">
                        YES, I'm Enrolled!
                      </h4>
                      <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                        Perfect! Join your team on Discord and start collaborating with your project members.
                      </p>
                      <a
                        href="https://discord.gg/529vW5DaNh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-black rounded-full text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        <span>Join Your Team</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* NO - Not Enrolled */}
                <div className="group hover:shadow-lg transition-all duration-300 rounded-2xl">
                  <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-200 h-full">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🔍</div>
                      <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6 group-hover:text-blue-600 transition-colors duration-300">
                        NO, I'm Not Enrolled
                      </h4>
                      <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                        No problem! Apply for a project or submit your own project idea to get started.
                      </p>
                      <Link
                        to="/projects"
                        className="inline-flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-black rounded-full text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Apply or Submit Project</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="py-8 sm:py-12 md:py-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">🏆</div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6">
                  Project{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                    Completed?
                  </span>
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                  Are you done with your project and have uploaded all necessary files to the repository?
                </p>
              </div>

              {/* Ready to Submit */}
              <div className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-200 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-3">
                  <div className="text-3xl sm:text-4xl">📋</div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 text-center sm:text-left">
                    Ready to Submit?
                  </h4>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed text-center">
                  If yes, click here to submit your project for final review and completion.
                </p>
                <div className="text-center">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfAXo-wxu42mqatBk5WKkBlcqxNph2PVV2HMtQZVJf6oOP2gA/viewform?usp=sharing&ouid=109164778386207080679"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center px-6 sm:px-10 py-3 sm:py-5 text-base sm:text-lg font-black rounded-full text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg overflow-hidden"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 relative flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="relative">Click Here to Submit Your Project</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </a>
                </div>
              </div>

              {/* Note */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
                <p className="text-gray-600 text-sm sm:text-base text-center">
                  <strong className="text-blue-600">Note:</strong> Make sure all your code, documentation, and project files are uploaded to your assigned repository before submitting.
                </p>
              </div>

              {/* Achievement Reward */}
              <div className="bg-orange-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-orange-200">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-3">
                  <div className="text-3xl sm:text-4xl">🎖️</div>
                  <h5 className="text-xl sm:text-2xl font-black text-gray-900 text-center sm:text-left">
                    Achievement Reward
                  </h5>
                </div>
                <p className="text-center text-gray-700 text-sm sm:text-base leading-relaxed">
                  <span className="font-bold text-orange-600">Once your contribution is verified</span>, you will receive your 
                  <span className="font-bold text-orange-600"> achievement badge via email</span> as recognition for your successful project completion!
                </p>
              </div>
            </div>
          </div>
        );

      case 'repository':
        return (
          <div className="py-8 sm:py-12 md:py-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">📁</div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6">
                  Project{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                    Repository
                  </span>
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                  Access your project repository on GitHub
                </p>
              </div>

              {/* Find Repository */}
              <div className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-200 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 gap-3">
                  <div className="text-3xl sm:text-4xl">🔗</div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 text-center sm:text-left">
                    Find Your Repository
                  </h4>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed text-center">
                  Click the link below to find your project repository. If not found, reach out to your product lead to create the repository and add you to the project. If the project is yet to start, wait till then.
                </p>
                <div className="text-center">
                  <a
                    href="https://github.com/FavoredOnlineInc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center px-6 sm:px-10 py-3 sm:py-5 text-base sm:text-lg font-black rounded-full text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg overflow-hidden"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 relative flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="relative">Visit GitHub Repository</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </a>
                </div>
              </div>

              {/* Help Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3 flex-shrink-0">❓</span>
                    <h5 className="text-base sm:text-lg font-black text-gray-900">Repository Not Found?</h5>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Contact your product lead to create the repository and add you to the project.
                  </p>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 sm:p-6 border border-orange-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3 flex-shrink-0">⏳</span>
                    <h5 className="text-base sm:text-lg font-black text-gray-900">Project Not Started?</h5>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    If the project hasn't started yet, please wait until the project kickoff.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'join':
        return (
          <div className="py-8 sm:py-12 md:py-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">🤝</div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6">
                  Join{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                    Projects
                  </span>
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                  Ready to dive into exciting projects and make an impact?
                </p>
              </div>

              {/* Two Opportunities */}
              <div className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-100 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 gap-3">
                  <div className="text-3xl sm:text-4xl">💡</div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 text-center sm:text-left">
                    Two Amazing Opportunities
                  </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl mr-3 flex-shrink-0">🎯</span>
                      <h5 className="text-base sm:text-lg font-black text-gray-900">Join a Project</h5>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Looking for a project to join? Browse available opportunities and collaborate with talented teams on innovative solutions.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl mr-3 flex-shrink-0">💼</span>
                      <h5 className="text-base sm:text-lg font-black text-gray-900">Become a Product Owner</h5>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Have an amazing project idea? Submit your project proposal and lead a team of skilled developers to bring your vision to life.
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed text-center">
                  Whether you're looking to contribute your skills to an existing project or lead your own initiative, we have the perfect opportunity for you. Join our community of innovators and builders!
                </p>

                <div className="text-center">
                  <Link
                    to="/projects"
                    className="group relative inline-flex items-center px-6 sm:px-10 py-3 sm:py-5 text-base sm:text-lg font-black rounded-full text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg overflow-hidden"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 relative flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="relative">Get Started - Explore Projects</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Link>
                </div>
              </div>

              {/* Tech Talent Badges */}
              <div className="bg-orange-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-orange-200 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 gap-3">
                  <div className="text-3xl sm:text-4xl">🏅</div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 text-center sm:text-left">
                    Tech Talent Badges
                  </h4>
                </div>

                <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed text-center">
                  Our <span className="font-bold text-orange-600">tech badges</span> help you build an impressive portfolio, enhance your technical skills, and position yourself for greater career opportunities. Badges are awarded based on successfully completed projects — 
                  <span className="font-bold text-orange-600"> showcase your achievements</span> and 
                  <span className="font-bold text-orange-600"> build your professional reputation</span> in the tech industry.
                </p>

                {/* Before You Enroll */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-2">
                    <span className="text-2xl sm:text-3xl">💡</span>
                    <h5 className="text-base sm:text-lg md:text-xl font-black text-gray-900 text-center sm:text-left">
                      Before You Enroll
                    </h5>
                  </div>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center mb-6 sm:mb-8">
                    Take time to understand how our tech badge system works, explore the different badge categories tailored to your specific career path, and learn about the progressive badge advancement system that grows with your expertise.
                  </p>

                  <div className="text-center">
                    <Link
                      to="/tech-badges"
                      className="group relative inline-flex items-center px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-full text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg overflow-hidden"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 relative flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="relative">Learn About Tech Badges</span>
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Link>
                  </div>
                </div>

                {/* Badge Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
                    <h6 className="text-sm sm:text-base font-black text-gray-900 mb-2">🎯 Career Focused</h6>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      Badges tailored to specific career paths and skill tracks.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
                    <h6 className="text-sm sm:text-base font-black text-gray-900 mb-2">📈 Progressive System</h6>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      Advance through badge levels as your skills develop.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
                    <h6 className="text-sm sm:text-base font-black text-gray-900 mb-2">🏆 Industry Recognition</h6>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      Showcase verified achievements to potential employers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                  <h5 className="text-sm sm:text-base font-black text-gray-900 mb-2">📚 Skill Growth</h5>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Learn new technologies and enhance your portfolio with real-world projects.
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 sm:p-6 border border-orange-200">
                  <h5 className="text-sm sm:text-base font-black text-gray-900 mb-2">👥 Team Collaboration</h5>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Work with diverse, talented teams and build lasting professional connections.
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                  <h5 className="text-sm sm:text-base font-black text-gray-900 mb-2">💡 Innovation</h5>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Turn your innovative ideas into reality with our supportive ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div className="py-8 sm:py-12 md:py-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">📊</div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6">
                  Project{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                    Overview
                  </span>
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                  Welcome to your project dashboard. Navigate through different sections to manage your project journey.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    icon: '🤝',
                    title: 'Join Projects',
                    description: 'Browse available projects or submit your own project idea to become a product owner.',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    hoverText: 'group-hover:text-blue-600'
                  },
                  {
                    icon: '🚀',
                    title: 'Ongoing Projects',
                    description: 'Check your current enrollment status and join your team on Discord.',
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    hoverText: 'group-hover:text-blue-600'
                  },
                  {
                    icon: '✅',
                    title: 'Completed Projects',
                    description: 'Submit your finished project for final review and completion.',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    hoverText: 'group-hover:text-orange-600'
                  },
                  {
                    icon: '📁',
                    title: 'Project Repository',
                    description: 'Access your GitHub repository for code collaboration and version control.',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    hoverText: 'group-hover:text-blue-600'
                  },
                  {
                    icon: '📊',
                    title: 'Project Overview',
                    description: 'Get a comprehensive view of all your project activities and progress.',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    hoverText: 'group-hover:text-orange-600'
                  }
                ].map((item, index) => (
                  <div key={index} className="group transform hover:scale-105 transition-all duration-300">
                    <div className={`${item.bg} rounded-2xl p-5 sm:p-6 md:p-8 border ${item.border} hover:shadow-lg h-full transition-all duration-300`}>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                          {item.icon}
                        </div>
                        <h4 className={`text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4 ${item.hoverText} transition-colors duration-300`}>
                          {item.title}
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative bg-white">

      {/* Global Navbar */}
      <Navbar />

      {/* Hero Header */}
      <div className="relative z-20 pt-16 sm:pt-20 md:pt-24">
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600 uppercase tracking-widest text-xs sm:text-sm font-black">
                  Project Management Hub
                </span>
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-orange-500 rounded-full"></div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-[0.9] tracking-tight text-gray-900">
                Project{' '}
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500">
                  Dashboard
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-light max-w-4xl mx-auto mb-6 sm:mb-8">
                Manage your projects, track progress, and collaborate with your team
              </p>

              <div className="h-1 sm:h-1.5 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 max-w-7xl">

          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <Link
              to="/career/dashboard"
              className="group inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:-translate-x-1 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-4 sm:mb-6 text-center">
                Navigate Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                  Projects
                </span>
              </h2>

              <div className="overflow-x-auto -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
                <div className="flex space-x-2 sm:space-x-3 min-w-max justify-start sm:justify-center pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`px-3 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 min-w-max text-sm sm:text-base ${
                        activeTab === category.id
                          ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <span className="text-base sm:text-lg md:text-xl">
                          {category.icon}
                        </span>
                        <span className="whitespace-nowrap">
                          {category.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <img
              src="/Images/loomiq-logo.svg"
              alt="Loomiq Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-2 sm:mr-3 md:mr-4 transform hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl sm:text-2xl md:text-3xl font-black">
              Loomiq
            </span>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            © {new Date().getFullYear()} Loomiq. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 6px;
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

        @media (max-width: 768px) {
          button, a, input, textarea {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectEnrollmentPage;
