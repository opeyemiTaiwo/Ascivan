// src/Pages/projects/ProjectsListing.jsx - Fully Responsive

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Industry tracks data with icons
const industryTracks = [
  { value: 'healthcare', label: 'Healthcare/Medical', icon: '🏥' },
  { value: 'finance', label: 'Finance/Fintech', icon: '💰' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { value: 'entertainment', label: 'Entertainment/Media', icon: '🎮' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'technology', label: 'Technology/Software/SaaS', icon: '💻' },
  { value: 'cybersecurity', label: 'Cybersecurity', icon: '🔒' },
  { value: 'transportation', label: 'Transportation/Logistics', icon: '🚚' },
  { value: 'realestate', label: 'Real Estate/PropTech', icon: '🏠' },
  { value: 'energy', label: 'Energy/Utilities', icon: '⚡' },
  { value: 'agriculture', label: 'Agriculture/AgTech', icon: '🌾' },
  { value: 'manufacturing', label: 'Manufacturing/Industrial', icon: '🏭' },
  { value: 'legal', label: 'Legal Tech', icon: '⚖️' },
  { value: 'nonprofit', label: 'Non-Profit/Social Impact', icon: '🤝' },
  { value: 'travel', label: 'Travel/Hospitality', icon: '✈️' },
  { value: 'sports', label: 'Sports/Fitness', icon: '⚽' },
  { value: 'food', label: 'Food/Beverage', icon: '🍽️' },
  { value: 'fashion', label: 'Fashion/Retail', icon: '👗' },
  { value: 'construction', label: 'Construction/Infrastructure', icon: '🏗️' },
  { value: 'marketing', label: 'Marketing/Advertising', icon: '📢' }
];

const ProjectsListing = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [appliedProjects, setAppliedProjects] = useState(new Set());
  const [selectedFilters, setSelectedFilters] = useState({
    industryTrack: '',
    timeline: '',
    status: '',
    experienceLevel: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper functions
  const isProjectOwner = (project) => {
    if (!currentUser || !project) return false;
    return project.submitterId === currentUser.uid || 
           project.submitterEmail === currentUser.email || 
           project.contactEmail === currentUser.email;
  };

  const getIndustryLabel = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.label : industryTrack;
  };

  const getIndustryIcon = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.icon : '💼';
  };

  const formatTimeline = (timeline) => {
    const map = {
      '1-week': '1 Week',
      '2-weeks': '2 Weeks',
      '1-month': '1 Month',
      '2-3-months': '2-3 Months',
      '3-6-months': '3-6 Months',
      '6-months-plus': '6+ Months',
      'flexible': 'Flexible'
    };
    return map[timeline] || timeline;
  };

  const isValidProject = (item) => {
    if (!item) return false;
    const hasTitle = item.projectTitle?.trim().length > 0;
    const hasDesc = item.projectDescription?.trim().length > 0;
    if (!hasTitle && !hasDesc) return false;
    if (item.type === 'event') return false;
    return true;
  };

  // Fetch applied projects
  useEffect(() => {
    if (!currentUser) {
      setAppliedProjects(new Set());
      return;
    }

    const q = query(
      collection(db, 'project_applications'),
      where('applicantId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = new Set();
      snapshot.docs.forEach(doc => ids.add(doc.data().projectId));
      setAppliedProjects(ids);
    });

    return unsubscribe;
  }, [currentUser]);

  // Fetch all projects
  useEffect(() => {
    const q = query(
      collection(db, 'client_projects'),
      orderBy('submissionDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rawData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        postedDate: doc.data().submissionDate?.toDate?.()?.toISOString() || 
                   doc.data().postedDate?.toDate?.()?.toISOString() || 
                   new Date().toISOString(),
        submissionDate: doc.data().submissionDate?.toDate?.()?.toISOString() || 
                       new Date().toISOString()
      }));
      
      const validProjects = rawData.filter(isValidProject);
      setProjects(validProjects);
      setFilteredProjects(validProjects);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setFilteredProjects([]);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter projects
  useEffect(() => {
    const filtered = projects.filter(project => {
      if (!isValidProject(project)) return false;
      
      const searchFields = ['projectTitle', 'projectDescription', 'requiredSkills', 
        'companyName', 'contactName', 'projectGoals', 'additionalInfo'];
      
      const matchesSearch = searchQuery === '' || searchFields.some(field => 
        project[field]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesIndustry = !selectedFilters.industryTrack || 
        project.industryTrack === selectedFilters.industryTrack;
      const matchesTimeline = !selectedFilters.timeline || 
        project.timeline === selectedFilters.timeline;
      const matchesStatus = !selectedFilters.status || 
        project.status === selectedFilters.status;
      const matchesExperience = !selectedFilters.experienceLevel || 
        project.experienceLevel === selectedFilters.experienceLevel;

      return matchesSearch && matchesIndustry && matchesTimeline && 
             matchesStatus && matchesExperience;
    });

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedFilters]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      industryTrack: '',
      timeline: '',
      status: '',
      experienceLevel: ''
    });
    setSearchQuery('');
  };

  const handleApplyClick = (project) => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          from: `/projects/apply/${project.id}`,
          message: 'Please sign in to apply to this project' 
        }
      });
      return;
    }
    navigate(`/projects/apply/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Global Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            <Link to="/" className="flex items-center">
              <img 
                src="/Images/loomiq-logo.svg" 
                alt="Loomiq" 
                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
              />
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              {currentUser && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
                >
                  Dashboard
                </Link>
              )}
              
              <Link 
                to="/projects" 
                className="text-blue-600 hover:text-blue-700 font-bold text-sm lg:text-base transition-colors"
              >
                Projects
              </Link>
              
              {currentUser ? (
                <div className="hidden sm:flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
                  {currentUser.photoURL && (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-7xl">
          
          {/* Hero Section */}
          <section className="mb-8 sm:mb-12 text-center">
            <div className="mb-4 sm:mb-6">
              <span className="text-orange-600 uppercase tracking-wider text-xs sm:text-sm font-bold">
                Live Projects • Apply Instantly
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Browse All Projects
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover exciting projects across diverse industries and join talented teams
            </p>
          </section>

          {/* Filters Section */}
          <section className="mb-8 sm:mb-12">
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
              
              {/* Search Bar */}
              <div className="mb-4 sm:mb-6">
                <input
                  type="text"
                  placeholder="Search projects by title, description, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <select
                  value={selectedFilters.industryTrack}
                  onChange={(e) => handleFilterChange('industryTrack', e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                >
                  <option value="">All Industries</option>
                  {industryTracks.map(track => (
                    <option key={track.value} value={track.value}>
                      {track.icon} {track.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedFilters.timeline}
                  onChange={(e) => handleFilterChange('timeline', e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                >
                  <option value="">All Timelines</option>
                  <option value="1-week">1 Week</option>
                  <option value="2-weeks">2 Weeks</option>
                  <option value="1-month">1 Month</option>
                  <option value="2-3-months">2-3 Months</option>
                  <option value="3-6-months">3-6 Months</option>
                  <option value="6-months-plus">6+ Months</option>
                  <option value="flexible">Flexible</option>
                </select>

                <select
                  value={selectedFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>

                <select
                  value={selectedFilters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                >
                  <option value="">All Experience Levels</option>
                  <option value="junior-level">Junior Level</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior-level">Senior Level</option>
                  <option value="expert-level">Expert Level</option>
                </select>
              </div>

              {/* Filter Stats */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="text-gray-600 text-xs sm:text-sm">
                  Showing <span className="font-semibold text-gray-900">{filteredProjects.length}</span> of <span className="font-semibold text-gray-900">{projects.length}</span> projects
                </div>
                {(searchQuery || Object.values(selectedFilters).some(v => v)) && (
                  <button 
                    onClick={clearFilters} 
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors text-sm"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Projects Grid */}
          <section>
            {loading ? (
              <div className="text-center py-16 sm:py-20">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-base sm:text-lg">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 border border-gray-200 max-w-2xl mx-auto">
                  <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">📦</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No Projects Found</h3>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    {searchQuery || Object.values(selectedFilters).some(v => v) 
                      ? 'Try adjusting your filters or search query'
                      : 'Be the first to submit a project!'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    {(searchQuery || Object.values(selectedFilters).some(v => v)) && (
                      <button 
                        onClick={clearFilters}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors text-sm sm:text-base"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button 
                      onClick={() => navigate('/submit-project')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors text-sm sm:text-base"
                    >
                      Submit Project
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredProjects.map((project) => {
                  const hasApplied = appliedProjects.has(project.id);
                  const isOwner = isProjectOwner(project);
                  
                  return (
                    <div 
                      key={project.id} 
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all"
                    >
                      
                      {/* Project Banner */}
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <div className="text-4xl sm:text-5xl">
                          {getIndustryIcon(project.industryTrack)}
                        </div>
                        
                        {/* Status Badges */}
                        <div className="absolute top-3 right-3">
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            project.status === 'active' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {project.status === 'active' ? '✓ ACTIVE' : 'DRAFT'}
                          </div>
                        </div>

                        {isOwner && (
                          <div className="absolute top-3 left-3 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200">
                            YOUR PROJECT
                          </div>
                        )}

                        {hasApplied && !isOwner && (
                          <div className="absolute top-3 left-3 bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-200">
                            APPLIED ✓
                          </div>
                        )}
                      </div>

                      {/* Project Content */}
                      <div className="p-5 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 line-clamp-2">
                          {project.projectTitle}
                        </h3>
                        
                        {/* Project Meta */}
                        <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 mb-4">
                          {project.industryTrack && (
                            <div className="flex items-center">
                              <span className="mr-1.5">{getIndustryIcon(project.industryTrack)}</span>
                              {getIndustryLabel(project.industryTrack)}
                            </div>
                          )}
                          {project.companyName && (
                            <div className="flex items-center">
                              🏢 {project.companyName}
                            </div>
                          )}
                          <div className="flex items-center">
                            ⏱️ {formatTimeline(project.timeline)}
                          </div>
                          {project.experienceLevel && (
                            <div className="flex items-center">
                              📊 {project.experienceLevel.replace('-', ' ')}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {project.projectDescription && (
                          <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed text-sm">
                            {project.projectDescription}
                          </p>
                        )}

                        {/* Skills */}
                        {project.requiredSkills && (
                          <div className="mb-5">
                            <p className="text-blue-600 text-xs sm:text-sm font-semibold mb-1.5">Required Skills:</p>
                            <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">{project.requiredSkills}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2.5 sm:space-y-3">
                          <Link 
                            to={`/projects/${project.id}`}
                            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-center px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm"
                          >
                            View Details
                          </Link>

                          {isOwner ? (
                            <Link
                              to="/projects/owner-dashboard"
                              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-colors text-sm"
                            >
                              Manage Project
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleApplyClick(project)}
                              disabled={hasApplied}
                              className={`w-full text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold transition-colors text-sm ${
                                hasApplied 
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white'
                              }`}
                            >
                              {hasApplied ? '✓ Already Applied' : !currentUser ? 'Login to Apply →' : 'Apply to Join →'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Submit Project CTA */}
          <section className="mt-12 sm:mt-16 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 sm:p-12 border border-blue-200">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
                Ready to Lead a Project?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Submit your project idea and build a team of talented developers
              </p>
              <button 
                onClick={() => navigate('/submit-project')}
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Submit Your Project
              </button>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        select option {
          background-color: white;
          color: #111827;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProjectsListing;
