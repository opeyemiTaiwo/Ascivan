// src/Pages/TechTalentBadges.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const TechTalentBadges = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const { currentUser, isAuthorized } = useAuth();

  const industryTracks = [
    { id: 1, name: 'Healthcare/Medical', description: 'Building solutions for patient care, hospital management, telemedicine, health monitoring, medical records, diagnostics, and wellness applications that improve healthcare delivery and outcomes.', icon: '🏥' },
    { id: 2, name: 'Finance/Fintech', description: 'Creating financial technology solutions including banking apps, payment systems, investment platforms, cryptocurrency, budgeting tools, insurance tech, and financial literacy applications.', icon: '💰' },
    { id: 3, name: 'Education', description: 'Developing educational technology (EdTech) for online learning, classroom management, student assessment, tutoring platforms, educational games, and tools that enhance teaching and learning experiences.', icon: '📚' },
    { id: 4, name: 'E-commerce', description: 'Building online shopping platforms, marketplace solutions, inventory management systems, checkout experiences, product recommendation engines, and tools that facilitate digital commerce.', icon: '🛒' },
    { id: 5, name: 'Entertainment/Media', description: 'Creating content streaming platforms, gaming applications, social media tools, digital art platforms, music/video production software, and solutions for content creators and consumers.', icon: '🎮' },
    { id: 6, name: 'Government', description: 'Developing civic technology (GovTech) for public services, citizen engagement, voting systems, transparency tools, public records management, and solutions that improve government operations and accessibility.', icon: '🏛️' },
    { id: 7, name: 'Technology/Software/SaaS', description: 'Building general software-as-a-service platforms, developer tools, productivity applications, collaboration software, APIs, and infrastructure solutions that serve various industries.', icon: '💻' },
    { id: 8, name: 'Cybersecurity', description: 'Creating security solutions including threat detection systems, encryption tools, identity management, vulnerability scanning, penetration testing platforms, and applications that protect data and networks.', icon: '🔒' },
    { id: 9, name: 'Transportation/Logistics', description: 'Developing solutions for shipping, delivery tracking, route optimization, fleet management, ride-sharing, public transit, supply chain coordination, and mobility services.', icon: '🚚' },
    { id: 10, name: 'Real Estate/PropTech', description: 'Building property technology solutions for home buying/selling, rental platforms, property management, virtual tours, smart home integration, real estate analytics, and construction project management.', icon: '🏠' },
    { id: 11, name: 'Energy/Utilities', description: 'Creating solutions for renewable energy management, smart grid technology, energy consumption monitoring, utility billing, carbon tracking, and sustainable resource management.', icon: '⚡' },
    { id: 12, name: 'Agriculture/AgTech', description: 'Developing agricultural technology including precision farming tools, crop monitoring, livestock management, farm automation, supply chain tracking, and solutions for sustainable food production.', icon: '🌾' },
    { id: 13, name: 'Manufacturing/Industrial', description: 'Building solutions for factory automation, quality control, production monitoring, industrial IoT, predictive maintenance, warehouse management, and manufacturing optimization.', icon: '🏭' },
    { id: 14, name: 'Legal Tech', description: 'Creating technology for legal document automation, case management, contract analysis, legal research tools, compliance tracking, e-discovery, and solutions that streamline legal processes.', icon: '⚖️' },
    { id: 15, name: 'Non-Profit/Social Impact', description: 'Developing solutions for charitable organizations, community engagement, volunteer management, fundraising platforms, social good initiatives, and projects addressing societal challenges.', icon: '🤝' },
    { id: 16, name: 'Travel/Hospitality', description: 'Building solutions for hotel booking, travel planning, tourism experiences, event management, restaurant reservations, destination guides, and hospitality industry operations.', icon: '✈️' },
    { id: 17, name: 'Sports/Fitness', description: 'Creating fitness tracking apps, workout programs, sports analytics, athlete performance monitoring, recreation booking systems, and wellness applications for physical activity.', icon: '⚽' },
    { id: 18, name: 'Food/Beverage', description: 'Developing restaurant management systems, food delivery platforms, recipe apps, nutrition tracking, meal planning tools, kitchen automation, and solutions for the food industry.', icon: '🍽️' },
    { id: 19, name: 'Fashion/Retail', description: 'Building solutions for online fashion stores, virtual try-on experiences, inventory management, trend forecasting, sustainable fashion tracking, and retail operations.', icon: '👗' },
    { id: 20, name: 'Construction/Infrastructure', description: 'Creating tools for building design, project management, safety monitoring, equipment tracking, urban planning, blueprint digitization, and construction site coordination.', icon: '🏗️' },
    { id: 21, name: 'Marketing/Advertising', description: 'Developing marketing automation tools, advertising platforms, social media management, analytics dashboards, customer relationship management (CRM), and campaign optimization solutions.', icon: '📢' }
  ];

  const badgeCategories = [
    {
      id: 'techmo',
      badgeTitle: 'TechMO Badges',
      category: 'mentorship',
      subtitle: 'Awarded to Tech Mentors',
      image: '/Images/TechMO.png',
      companyName: 'TechTalents City',
      description: 'Awarded to Tech Mentors after the successful completion of each collaborative project. This badge marks the entry point for mentors demonstrating their capability to guide and support team members effectively in technical growth and project collaboration.',
      requiredSkills: 'Mentorship, Leadership, Technical Coaching, Team Development, Knowledge Transfer',
      badgeGoals: 'Build exceptional mentorship ability and experience, reserved for the most accomplished and skilled tech mentors who excel in developing technical talent.',
      postedDate: '2025-05-30T08:00:00Z',
      levels: ['Novice', 'Beginners', 'Intermediate', 'Expert']
    },
    {
      id: 'techqa',
      badgeTitle: 'TechQA Badges',
      category: 'quality-assurance',
      subtitle: 'Awarded to Quality Testers',
      image: '/Images/TechQA.png',
      companyName: 'TechTalents City',
      description: 'Awarded to Quality Testers who successfully complete their first collaboration on a project. This badge marks the entry point for quality assurance professionals demonstrating their capability to contribute effectively to ensuring software quality.',
      requiredSkills: 'Quality Assurance, Testing, Bug Detection, Test Automation, Software Validation',
      badgeGoals: 'Achieve exceptional quality assurance ability and experience, reserved for the most accomplished and skilled quality testers in their respective fields.',
      postedDate: '2025-05-29T08:00:00Z',
      levels: ['Novice', 'Beginners', 'Intermediate', 'Expert']
    },
    {
      id: 'techdev',
      badgeTitle: 'TechDev Badges',
      category: 'development',
      subtitle: 'Awarded to Coding Developers',
      image: '/Images/TechDev.png',
      companyName: 'TechTalents City',
      description: 'Awarded to Coding Developers who successfully complete their first collaboration on a project. This badge marks the entry point for coding professionals demonstrating their capability to contribute effectively to software development.',
      requiredSkills: 'Programming, Software Development, Code Review, Debugging, Technical Architecture',
      badgeGoals: 'Achieve exceptional coding ability and experience, reserved for the most accomplished and skilled coding developers in their respective fields.',
      postedDate: '2025-05-28T08:00:00Z',
      levels: ['Novice', 'Beginners', 'Intermediate', 'Expert']
    },
    {
      id: 'techleads',
      badgeTitle: 'TechLeads Badges',
      category: 'leadership',
      subtitle: 'Awarded to Non-Technical Professionals',
      image: '/Images/TechLeads.png',
      companyName: 'TechTalents City',
      description: 'Awarded to Non-Technical Professionals who successfully complete their first collaboration on a project. This badge marks the entry point for non-technical roles demonstrating their capability to create, lead, or manage projects or tasks within a project.',
      requiredSkills: 'Project Management, Leadership, Strategic Planning, Team Coordination, Business Analysis',
      badgeGoals: 'Achieve exceptional ability and experience in project leadership and management, reserved for the most accomplished and skilled professionals in their respective fields.',
      postedDate: '2025-05-27T08:00:00Z',
      levels: ['Novice', 'Beginners', 'Intermediate', 'Expert']
    },
    {
      id: 'techarchs',
      badgeTitle: 'TechArchs Badges',
      category: 'design',
      subtitle: 'Awarded to No-Code Developers and Designers',
      image: '/Images/TechArchs.png',
      companyName: 'TechTalents City',
      description: 'Awarded to No-Code Developers and Designers who successfully complete their first collaboration on a project. This badge marks the entry point for professionals demonstrating their capability to contribute effectively to tech projects using no-code platforms and design tools.',
      requiredSkills: 'No-Code Development, UI/UX Design, Visual Design, Platform Architecture, Creative Solutions',
      badgeGoals: 'Achieve exceptional ability and experience in no-code development and design, reserved for the most accomplished and skilled professionals in their respective fields.',
      postedDate: '2025-05-26T08:00:00Z',
      levels: ['Novice', 'Beginners', 'Intermediate', 'Expert']
    },
    {
      id: 'techguard',
      badgeTitle: 'TechGuard Badges',
      category: 'security',
      subtitle: 'Awarded to Network and Cybersecurity Professionals',
      image: '/Images/TechGuard.png',
      companyName: 'TechTalents City',
      description: 'Awarded to Network and Cybersecurity professionals, including Cloud Administrators and DevOps Engineers, who successfully complete their first collaboration on a project. This badge marks the entry point for professionals demonstrating their capability to implement and manage network and security tasks within a project effectively.',
      requiredSkills: 'Cybersecurity, Network Security, Cloud Administration, DevOps, Infrastructure Security',
      badgeGoals: 'Achieve exceptional expertise in securing and optimizing complex digital systems and infrastructures, reserved for the most accomplished professionals.',
      postedDate: '2025-05-25T08:00:00Z',
      levels: ['Novice', 'Beginners', 'Intermediate', 'Expert']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Badge Categories' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'quality-assurance', label: 'Quality Assurance' },
    { value: 'development', label: 'Development' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'design', label: 'Design & No-Code' },
    { value: 'security', label: 'Security & DevOps' }
  ];

  const filteredBadges = badgeCategories.filter(badge => {
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesSearch = badge.badgeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.requiredSkills.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const openBadgeModal = (badge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setSelectedBadge(null);
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative bg-white">

      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-16 sm:pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-7xl">
          
          {/* Hero Section */}
          <section className="relative mb-16 sm:mb-24 pt-8 sm:pt-12 md:pt-20">
            <div className="max-w-4xl mx-auto text-center">
              
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600 uppercase tracking-widest text-xs sm:text-sm md:text-lg font-black">
                  🚀 Loomiq ProjectX
                </span>
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-orange-500 rounded-full"></div>
              </div>
              
              <div className="text-center mb-4 sm:mb-6">
                <span className="text-orange-500 italic text-base sm:text-lg md:text-xl font-medium">
                  Where Projects Power Careers
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 md:mb-12 leading-[0.9] tracking-tight text-gray-900">
                Bridge Academia{' '}
                <span className="block mt-2 sm:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500">
                  to Industry
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed font-light mb-8 sm:mb-10 md:mb-12">
                <span className="text-blue-600 font-semibold">ProjectX</span> empowers students with real-world, project-driven learning. Earn 
                <span className="text-blue-600 font-semibold"> TechTalent Badges</span> that showcase your skills, achievements, and problem-solving abilities while collaborating on hands-on projects.
                <br className="hidden sm:block" /><br className="hidden sm:block" />
                With our <span className="text-orange-600 font-semibold">AI-powered Career Navigator</span>, learners from any background can transition into tech with personalized insights, curated resources, career tips, and interview prep—turning projects into pathways for future-proof careers.
              </p>
              
              <div className="h-1 sm:h-2 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto rounded-full mb-8 sm:mb-12 md:mb-16"></div>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search badge categories by title, description, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-gray-600">
                  <span className="text-blue-600 font-semibold">{filteredBadges.length}</span> TechTalent badge categories found
                </div>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </section>

          {/* Badge Categories Grid */}
          <section>
            {filteredBadges.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No badge categories found</h3>
                <p className="text-gray-600">Try adjusting your search or filters to see more results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredBadges.map((badge) => (
                  <div key={badge.id} className="group">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-500 h-full flex flex-col">
                      
                      <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center mb-4">
                            <img 
                              src={badge.image} 
                              alt={`${badge.badgeTitle} Icon`}
                              className="w-12 h-12 mr-4 object-contain"
                            />
                            <div>
                              <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                {badge.badgeTitle}
                              </h3>
                              <p className="text-blue-600 font-semibold text-sm">{badge.subtitle}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <span className="mr-4">🏢 {badge.companyName}</span>
                          <span>📅 {new Date(badge.postedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mb-6 flex-grow">
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base line-clamp-4">
                          {badge.description}
                        </p>
                      </div>

                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {badge.requiredSkills.split(', ').slice(0, 4).map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                              {skill}
                            </span>
                          ))}
                          {badge.requiredSkills.split(', ').length > 4 && (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                              +{badge.requiredSkills.split(', ').length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="text-gray-500 text-sm mb-2">Badge Levels:</div>
                        <div className="flex flex-wrap gap-2">
                          {badge.levels.map((level, index) => {
                            const colors = ['#f97316', '#3b82f6', '#f59e0b', '#2563eb'];
                            return (
                              <span 
                                key={index}
                                className="px-2 py-1 rounded-lg text-xs font-medium border"
                                style={{
                                  backgroundColor: `${colors[index]}10`,
                                  borderColor: `${colors[index]}30`,
                                  color: colors[index]
                                }}
                              >
                                {level}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => openBadgeModal(badge)}
                        className="group/btn relative bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-sm transition-all duration-500 transform hover:scale-105 shadow-md hover:shadow-lg overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative flex items-center justify-center">
                          View Badge Details
                          <span className="ml-2 group-hover/btn:translate-x-1 transition-transform text-lg">🏆</span>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Become a Product Owner Section */}
          <section className="mt-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              
              <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 p-6 sm:p-8 md:p-12 text-white relative overflow-hidden">
                <div className="relative text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
                    💡 Become a Product Owner
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-orange-100 font-light leading-relaxed max-w-4xl mx-auto">
                    Lead your own project, build a team, and bring your ideas to life while others earn badges working with you.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">
                      🚀 How It Works
                    </h3>
                    <ol className="space-y-4 text-gray-700">
                      {[
                        'A Product Owner submits a project. They can be a developer or anyone with an idea—tech badges or niche categories are not required at this stage.',
                        'People apply to join the project.',
                        'Loomiq will review and approve collaborators, create the project channel, and add both you and the accepted team members.',
                        'The Product Owner leads the team and ensures that the Project Manager (or themselves, if acting as both) delivers the project within the given timeline.'
                      ].map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
                            {index + 1}
                          </span>
                          <span className="text-sm sm:text-base leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">
                      🏆 Benefits of Becoming a Product Owner
                    </h3>
                    <ul className="space-y-4 text-gray-700">
                      {[
                        'You own and lead the project',
                        'You choose the direction and vision for the work',
                        'If your project gains interest or attracts potential buyers, you will be the primary point of contact',
                        'You receive a Certificate of Ownership from Loomiq'
                      ].map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-3 text-lg flex-shrink-0 mt-1">✓</span>
                          <span className="text-sm sm:text-base leading-relaxed font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="mt-12 bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">
                    📋 Responsibilities
                  </h3>
                  <ul className="space-y-4 text-gray-700">
                    {[
                      'While Loomiq promotes your project, you are also responsible for sharing and speaking about your idea across your personal platforms',
                      'Projects are for educational purposes only and must not be used for commercial or business activities. If a project demonstrates potential for commercialization, all team members will be contacted and involved, and appropriate legal processes will be carried out to ensure fair recognition and protection of contributions',
                      'Loomiq reserves the right to host project files in its repository to protect the interests of all contributors and to maintain transparent project records',
                      'Loomiq will also monitor your project timeline, provide light oversight, and may periodically check in to ensure steady progress and team alignment'
                    ].map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-3 text-lg flex-shrink-0 mt-1">•</span>
                        <span className="text-sm sm:text-base leading-relaxed">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools & Guidelines */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
                      🛠️ Tools & Collaboration Guidelines
                    </h4>
                    <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
                      {[
                        'All projects must be executed within Loomiq\'s approved repositories and communication channels',
                        'Loomiq provides access to private GitHub repositories and dedicated discussion channels for each project',
                        'Product Owners and teams may use Google Meet or Zoom for virtual meetings',
                        'Final project submissions must be made to the assigned repository following provided instructions',
                        'External tools may not be used for project tracking or submissions unless explicitly approved'
                      ].map((guideline, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2 text-sm flex-shrink-0 mt-1">→</span>
                          <span>{guideline}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-xl font-black text-gray-900 mb-3">
                        ✨ Eligibility
                      </h4>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        Anyone passionate about solving real-world problems—whether you're a student, developer, designer, or aspiring entrepreneur—can become a Product Owner. No prior badge or tech category is required.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                      <h4 className="text-xl font-black text-gray-900 mb-3">
                        ⏰ Time Commitment
                      </h4>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        Projects typically last <span className="text-orange-600 font-semibold">4–8 weeks</span>, depending on scope. Product Owners are expected to guide the team and ensure milestones are achieved.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                      <h4 className="text-xl font-black text-gray-900 mb-3">
                        🤝 Community Values
                      </h4>
                      <p className="text-gray-700 text-sm mb-3">We expect all participants to:</p>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        {[
                          'Foster a respectful and inclusive team culture',
                          'Communicate clearly and consistently',
                          'Credit every team member\'s contributions',
                          'Maintain professionalism throughout the project lifecycle'
                        ].map((value, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 text-xs flex-shrink-0 mt-1">•</span>
                            <span>{value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Project Manager Tips & Best Practices Section */}
          <section className="mt-12 sm:mt-16">
            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 p-4 sm:p-6 md:p-8 lg:p-12 text-white relative overflow-hidden">
                <div className="relative text-center">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 md:mb-6 leading-tight">
                    📋 Project Manager Tips & Best Practices
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 font-light leading-relaxed max-w-4xl mx-auto px-2 sm:px-4">
                    Master the art of project management with proven strategies and best practices for leading successful teams.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                
                {/* Core Responsibilities */}
                <div className="mb-8 sm:mb-10 md:mb-12">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-6 sm:mb-8 text-center sm:text-left">
                    🎯 Core Responsibilities
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-blue-100 hover:border-blue-200 transition-all duration-300">
                      <div className="text-blue-600 text-xl sm:text-2xl mb-2 sm:mb-3">📅</div>
                      <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">
                        Weekly Planning & Reporting
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        Project managers organize weekly meetings to gather progress reports and strategize for the upcoming week toward project completion.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-orange-100 hover:border-orange-200 transition-all duration-300">
                      <div className="text-orange-600 text-xl sm:text-2xl mb-2 sm:mb-3">🚀</div>
                      <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">
                        Team Development
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        Project managers collaborate with mentors to organize workshops, webinars, and tech talks for the team.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-blue-100 hover:border-blue-200 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                      <div className="text-blue-600 text-xl sm:text-2xl mb-2 sm:mb-3">🤝</div>
                      <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">
                        Team Member Support
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        Project managers ensure team members have the resources, guidance, and support needed to succeed in their roles.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Tips */}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-6 sm:mb-8 text-center sm:text-left">
                    💡 Additional Tips for Effective Project Management
                  </h3>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                    
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100 hover:border-blue-200 transition-all duration-300">
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-4 sm:mb-6">
                        💬 Communication & Coordination
                      </h4>
                      <ul className="space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-sm lg:text-base">
                        {[
                          'Establish clear communication channels and response time expectations',
                          'Document decisions and action items from every meeting',
                          'Hold regular one-on-ones with team members to address individual concerns'
                        ].map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 sm:mr-3 text-sm sm:text-lg flex-shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-100 hover:border-orange-200 transition-all duration-300">
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-4 sm:mb-6">
                        📊 Planning & Organization
                      </h4>
                      <ul className="space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-sm lg:text-base">
                        {[
                          'Break down large tasks into smaller, manageable milestones',
                          'Create realistic timelines with buffer time for unexpected challenges',
                          'Identify and track project risks early, with mitigation plans',
                          'Set clear project scope and manage scope creep proactively'
                        ].map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-600 mr-2 sm:mr-3 text-sm sm:text-lg flex-shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100 hover:border-blue-200 transition-all duration-300">
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-4 sm:mb-6">
                        👥 Team Leadership
                      </h4>
                      <ul className="space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-sm lg:text-base">
                        {[
                          'Foster a collaborative environment where team members feel comfortable sharing ideas and concerns',
                          'Recognize and celebrate achievements both big and small',
                          'Facilitate knowledge sharing between team members',
                          'Provide constructive feedback regularly, not just during formal reviews'
                        ].map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 sm:mr-3 text-sm sm:text-lg flex-shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-orange-100 hover:border-orange-200 transition-all duration-300">
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-4 sm:mb-6">
                        🔄 Process Improvement
                      </h4>
                      <ul className="space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-sm lg:text-base">
                        {[
                          'Conduct retrospectives at the end of each sprint or milestone',
                          'Gather feedback from team members continuously',
                          'Stay updated on industry best practices and project management methodologies',
                          'Adapt your management style to different team members\' working preferences'
                        ].map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-600 mr-2 sm:mr-3 text-sm sm:text-lg flex-shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pro Tips Section */}
                <div className="mt-8 sm:mt-10 md:mt-12 bg-gray-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-4 sm:mb-6 text-center sm:text-left">
                    ⭐ Pro Tips for Success
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                      <h5 className="text-blue-600 font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
                        <span className="mr-2">🎯</span>
                        Stay Focused
                      </h5>
                      <p className="leading-relaxed text-xs sm:text-sm text-gray-600">
                        Keep the team aligned with project goals and regularly revisit objectives to ensure everyone stays on track.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                      <h5 className="text-orange-600 font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
                        <span className="mr-2">🔥</span>
                        Maintain Momentum
                      </h5>
                      <p className="leading-relaxed text-xs sm:text-sm text-gray-600">
                        Celebrate small wins and maintain team energy through regular check-ins and positive reinforcement.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                      <h5 className="text-blue-600 font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
                        <span className="mr-2">🛡️</span>
                        Risk Management
                      </h5>
                      <p className="leading-relaxed text-xs sm:text-sm text-gray-600">
                        Identify potential blockers early and have contingency plans ready to keep the project moving forward.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                      <h5 className="text-orange-600 font-semibold mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
                        <span className="mr-2">📈</span>
                        Continuous Learning
                      </h5>
                      <p className="leading-relaxed text-xs sm:text-sm text-gray-600">
                        Learn from each project and apply those lessons to improve your project management skills continuously.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Tracks Section */}
          <section className="mt-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 p-6 sm:p-8 md:p-12 text-white relative overflow-hidden">
                <div className="relative text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
                    🎯 Industry Track Overviews
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-blue-100 font-light leading-relaxed max-w-4xl mx-auto">
                    Choose your industry track and work on real-world projects that align with your career goals
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {industryTracks.map((track) => (
                    <div key={track.id} className="group">
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-500 h-full flex flex-col">
                        
                        <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                          {track.icon}
                        </div>

                        <h3 className="text-xl font-black text-gray-900 text-center mb-4 group-hover:text-blue-600 transition-colors duration-300">
                          {track.name}
                        </h3>

                        <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                          {track.description}
                        </p>

                        <Link
                          to={`/projects?industry=${track.name.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')}`}
                          className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 text-center shadow-md hover:shadow-lg"
                        >
                          Explore Projects
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Industry Track Benefits */}
                <div className="mt-12 bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 text-center">
                    🌟 Why Choose an Industry Track?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                    <div className="flex items-start">
                      <span className="text-blue-600 text-2xl mr-4 flex-shrink-0">✓</span>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Focused Career Path</h4>
                        <p className="text-sm leading-relaxed">Build expertise in specific industries that align with your career aspirations and interests</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 text-2xl mr-4 flex-shrink-0">✓</span>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Real-World Experience</h4>
                        <p className="text-sm leading-relaxed">Work on projects that mirror actual challenges faced by professionals in your chosen industry</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-600 text-2xl mr-4 flex-shrink-0">✓</span>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Industry-Specific Skills</h4>
                        <p className="text-sm leading-relaxed">Develop technical and domain knowledge that employers value in your target industry</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-600 text-2xl mr-4 flex-shrink-0">✓</span>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Portfolio Differentiation</h4>
                        <p className="text-sm leading-relaxed">Stand out with specialized projects that demonstrate your commitment to a specific career path</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="mt-16 text-center">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                🚀 Ready to Lead a Project or Earn Your Badges?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                💡 Have an idea? Take the lead and build something impactful—or join a project, contribute your skills, and earn badges as you grow. Whether you're leading or learning, <span className="text-blue-600 font-semibold">ProjectX gives you the platform to bridge academia to industry and build your future-proof career</span>.
              </p>
              <div className="text-gray-700 text-lg mb-8 font-semibold">
                <span className="text-orange-600">Submit Your Project</span> or <span className="text-blue-600">Join a Project</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/projects"
                  className="bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 text-white px-8 py-4 rounded-full font-black text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block"
                >
                  Join a Project
                </Link>
                <Link 
                  to="/submit-project"
                  className="bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 text-white px-8 py-4 rounded-full font-black text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block"
                >
                  Submit Your Project
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Badge Details Modal */}
      {showBadgeModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <img 
                  src={selectedBadge.image} 
                  alt={`${selectedBadge.badgeTitle} Icon`}
                  className="w-16 h-16 mr-4 object-contain"
                />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                    {selectedBadge.badgeTitle}
                  </h2>
                  <p className="text-blue-600 font-semibold">{selectedBadge.subtitle}</p>
                </div>
              </div>
              <button
                onClick={closeBadgeModal}
                className="text-gray-400 hover:text-gray-900 transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              
              <div>
                <h3 className="text-blue-600 font-semibold mb-2 text-lg">About This Badge</h3>
                <p className="text-gray-700 leading-relaxed">{selectedBadge.description}</p>
              </div>

              <div>
                <h3 className="text-blue-600 font-semibold mb-2 text-lg">Key Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBadge.requiredSkills.split(', ').map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-blue-600 font-semibold mb-2 text-lg">Badge Goals</h3>
                <p className="text-gray-700 leading-relaxed">{selectedBadge.badgeGoals}</p>
              </div>

              <div>
                <h3 className="text-blue-600 font-semibold mb-3 text-lg">Badge Progression Levels</h3>
                <div className="space-y-3">
                  {selectedBadge.levels.map((level, index) => {
                    const colors = ['#f97316', '#3b82f6', '#f59e0b', '#2563eb'];
                    const descriptions = [
                      'Entry level - First successful project collaboration',
                      'Experienced - 5+ completed projects',
                      'Advanced - 10+ completed projects with high proficiency',
                      'Expert - 15+ completed projects with exceptional skills'
                    ];
                    return (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: colors[index] }}
                        ></div>
                        <div>
                          <div className="font-semibold text-gray-900">{level}</div>
                          <div className="text-gray-500 text-sm">{descriptions[index]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={closeBadgeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold transition-all duration-300 border border-gray-200"
                >
                  Close
                </button>
                <Link
                  to="/projects"
                  onClick={closeBadgeModal}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold transition-all duration-500 transform hover:scale-105 shadow-md hover:shadow-lg text-center"
                >
                  Start Earning This Badge
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <li><Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">Home</Link></li>
                <li><Link to="/projects" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">Projects</Link></li>
                <li><Link to="/tech-badges" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">Tech Badges</Link></li>
                <li><Link to="/career/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">Contact</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6">
                Support & Legal
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link to="/career/support" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">Support</Link></li>
                <li><Link to="/career/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">About</Link></li>
                <li><Link to="/career/terms" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">Terms of Service</Link></li>
                <li><Link to="/career/privacy" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm sm:text-base font-medium">Privacy Policy</Link></li>
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
                <span className="text-gray-400 text-sm font-medium">Transforming Careers with AI</span>
                <span className="text-orange-400 text-lg sm:text-xl">•</span>
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

        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        input:focus, textarea:focus, select:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        select option {
          background-color: white;
          color: #111827;
        }
      `}</style>
    </div>
  );
};

export default TechTalentBadges;
