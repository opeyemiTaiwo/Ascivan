// src/Pages/projects/ProjectDetail.jsx - Fully Responsive

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Industry tracks with icons
const industryTracks = [
  { value: 'healthcare', label: 'Healthcare/Medical', icon: '🏥'},
  { value: 'finance', label: 'Finance/Fintech', icon: '💰'},
  { value: 'education', label: 'Education', icon: '📚'},
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒'},
  { value: 'entertainment', label: 'Entertainment/Media', icon: '🎮'},
  { value: 'government', label: 'Government', icon: '🏛️'},
  { value: 'technology', label: 'Technology/Software/SaaS', icon: '💻'},
  { value: 'cybersecurity', label: 'Cybersecurity', icon: '🔒'},
  { value: 'transportation', label: 'Transportation/Logistics', icon: '🚚'},
  { value: 'realestate', label: 'Real Estate/PropTech', icon: '🏠'},
  { value: 'energy', label: 'Energy/Utilities', icon: '⚡'},
  { value: 'agriculture', label: 'Agriculture/AgTech', icon: '🌾'},
  { value: 'manufacturing', label: 'Manufacturing/Industrial', icon: '🏭'},
  { value: 'legal', label: 'Legal Tech', icon: '⚖️'},
  { value: 'nonprofit', label: 'Non-Profit/Social Impact', icon: '🤝'},
  { value: 'travel', label: 'Travel/Hospitality', icon: '✈️'},
  { value: 'sports', label: 'Sports/Fitness', icon: '⚽'},
  { value: 'food', label: 'Food/Beverage', icon: '🍽️'},
  { value: 'fashion', label: 'Fashion/Retail', icon: '👗'},
  { value: 'construction', label: 'Construction/Infrastructure', icon: '🏗️'},
  { value: 'marketing', label: 'Marketing/Advertising', icon: '📢'}
];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  // Helper functions
  const getIndustryLabel = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.label : industryTrack;
  };

  const getIndustryIcon = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.icon : '💼';
  };

  const formatTimeline = (timeline) => {
    const timelineMap = {
      '1-week': '1 Week',
      '2-weeks': '2 Weeks',
      '1-month': '1 Month',
      '2-3-months': '2-3 Months',
      '3-6-months': '3-6 Months',
      '6-months-plus': '6+ Months',
      'flexible': 'Flexible'
    };
    return timelineMap[timeline] || timeline;
  };

  const formatDateAsText = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateDaysUntilStart = (startDate) => {
    if (!startDate) return null;
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return null;
      const today = new Date();
      const diffTime = start - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return null;
    }
  };

  const isProjectOwner = (project) => {
    if (!currentUser || !project) return false;
    return (
      (project.submitterId && currentUser.uid === project.submitterId) ||
      (project.submitterEmail && currentUser.email === project.submitterEmail) ||
      (project.contactEmail && currentUser.email === project.contactEmail)
    );
  };

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Project ID not provided');
        setLoading(false);
        return;
      }

      try {
        const projectRef = doc(db, 'client_projects', projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          const rawData = projectSnap.data();
          const projectData = {
            id: projectSnap.id,
            ...rawData,
            startDate: rawData.startDate || rawData.projectStartDate || null,
            endDate: rawData.endDate || rawData.projectEndDate || null,
            postedDate: rawData.submissionDate?.toDate?.()?.toISOString() || 
                       rawData.postedDate?.toDate?.()?.toISOString() || 
                       rawData.createdAt?.toDate?.()?.toISOString() || 
                       new Date().toISOString()
          };
          
          if (projectData.status !== 'active') {
            setError('Project not found or not active');
            setLoading(false);
            return;
          }
          
          setProject(projectData);
        } else {
          setError('Project not found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Check if user has applied
  useEffect(() => {
    const checkApplication = async () => {
      if (!currentUser || !projectId) {
        setHasApplied(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'project_applications'),
          where('applicantId', '==', currentUser.uid),
          where('projectId', '==', projectId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          setHasApplied(!snapshot.empty);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error checking application:', error);
      }
    };

    checkApplication();
  }, [currentUser, projectId]);

  const handleProjectUrlClick = (url) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl sm:text-6xl mb-6">❌</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{error || 'Project not found'}</h2>
          <button 
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

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
              <Link 
                to="/projects" 
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm lg:text-base transition-colors"
              >
                Projects
              </Link>
              
              {currentUser && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
                >
                  Dashboard
                </Link>
              )}
              
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <button 
              onClick={() => navigate('/projects')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm sm:text-base"
            >
              <span className="mr-2">←</span>
              Back to Projects
            </button>
          </div>

          {/* Project Banner */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6 sm:mb-8">
            <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl sm:text-7xl md:text-8xl mb-3 sm:mb-4 opacity-60">
                  {getIndustryIcon(project.industryTrack)}
                </div>
                <p className="text-gray-600 font-semibold text-sm sm:text-base md:text-lg">
                  {getIndustryLabel(project.industryTrack)}
                </p>
              </div>

              {/* Status Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                  ✓ VERIFIED
                </div>
                {isProjectOwner(project) && (
                  <div className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                    YOUR PROJECT
                  </div>
                )}
              </div>

              {/* Project Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3">
                  {project.projectTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white text-xs sm:text-sm">
                  <span>{project.companyName || 'Individual Project'}</span>
                  <span>•</span>
                  <span>{formatTimeline(project.timeline)}</span>
                  {project.startDate && calculateDaysUntilStart(project.startDate) !== null && (
                    <>
                      <span>•</span>
                      <span className="text-orange-300">
                        {(() => {
                          const days = calculateDaysUntilStart(project.startDate);
                          if (days > 0) return `Starts in ${days} days`;
                          if (days === 0) return 'Starts Today!';
                          return `Started ${Math.abs(days)} days ago`;
                        })()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              
              {/* Description */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Project Description
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {project.projectDescription}
                </p>
              </div>

              {/* Timeline Dates */}
              {(project.startDate || project.endDate) && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Project Timeline
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {project.startDate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-blue-700 font-bold text-base sm:text-lg mb-2">Start Date</h3>
                        <p className="text-gray-900 font-bold text-lg sm:text-xl mb-1">
                          {formatDateAsText(project.startDate)}
                        </p>
                        {(() => {
                          const days = calculateDaysUntilStart(project.startDate);
                          if (days !== null && days > 0) {
                            return (
                              <p className="text-blue-600 text-xs sm:text-sm font-medium">
                                In {days} day{days !== 1 ? 's' : ''}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                    
                    {project.endDate && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-orange-700 font-bold text-base sm:text-lg mb-2">End Date</h3>
                        <p className="text-gray-900 font-bold text-lg sm:text-xl">
                          {formatDateAsText(project.endDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Required Skills */}
              {project.requiredSkills && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {project.requiredSkills.split(',').map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm border border-blue-200"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(project.projectGoals || project.additionalInfo) && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Additional Information
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    {project.projectGoals && (
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-blue-600 mb-2 sm:mb-3">Project Goals</h3>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">{project.projectGoals}</p>
                      </div>
                    )}
                    {project.additionalInfo && (
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-blue-600 mb-2 sm:mb-3">Additional Notes</h3>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">{project.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24">
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Project Details
                </h3>
                
                {/* Details List */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-2">
                    <span className="text-gray-600 text-xs sm:text-sm">Industry:</span>
                    <span className="text-gray-900 font-semibold text-xs sm:text-sm text-right flex items-center">
                      <span className="mr-1">{getIndustryIcon(project.industryTrack)}</span>
                      {getIndustryLabel(project.industryTrack)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-2">
                    <span className="text-gray-600 text-xs sm:text-sm">Timeline:</span>
                    <span className="text-gray-900 font-semibold text-xs sm:text-sm text-right">
                      {formatTimeline(project.timeline)}
                    </span>
                  </div>
                  
                  {project.startDate && (
                    <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-2">
                      <span className="text-gray-600 text-xs sm:text-sm">Start Date:</span>
                      <span className="text-blue-600 font-semibold text-xs sm:text-sm text-right">
                        {formatDateAsText(project.startDate)}
                      </span>
                    </div>
                  )}
                  
                  {project.endDate && (
                    <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-2">
                      <span className="text-gray-600 text-xs sm:text-sm">End Date:</span>
                      <span className="text-orange-600 font-semibold text-xs sm:text-sm text-right">
                        {formatDateAsText(project.endDate)}
                      </span>
                    </div>
                  )}
                  
                  {project.experienceLevel && (
                    <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-2">
                      <span className="text-gray-600 text-xs sm:text-sm">Experience:</span>
                      <span className="text-gray-900 font-semibold text-xs sm:text-sm text-right">
                        {project.experienceLevel}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-2">
                    <span className="text-gray-600 text-xs sm:text-sm">Posted:</span>
                    <span className="text-gray-900 font-semibold text-xs sm:text-sm text-right">
                      {new Date(project.postedDate).toLocaleDateString()}
                    </span>
                  </div>

                  {project.projectUrl && (
                    <div className="border-b border-gray-200 pb-2">
                      <span className="text-gray-600 text-xs sm:text-sm block mb-2">Project URL:</span>
                      <button
                        onClick={() => handleProjectUrlClick(project.projectUrl)}
                        className="text-blue-600 hover:text-blue-700 transition-colors text-xs sm:text-sm font-medium break-all text-left"
                      >
                        {project.projectUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <span className="ml-1">↗</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isProjectOwner(project) ? (
                    <button
                      onClick={() => navigate(`/projects/${project.id}/edit`)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 sm:py-4 rounded-lg font-bold transition-colors text-sm sm:text-base"
                    >
                      Edit Project ✏️
                    </button>
                  ) : (
                    <Link
                      to={hasApplied ? '#' : `/projects/apply/${projectId}`}
                      className={`block w-full text-center ${
                        hasApplied 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white px-6 py-3 sm:py-4 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                        hasApplied ? 'pointer-events-none' : ''
                      }`}
                    >
                      {hasApplied ? 'Already Applied ✓' : !currentUser ? 'Login to Apply' : 'Apply Now →'}
                    </Link>
                  )}
                </div>

                {/* Contact Info (for logged in users) */}
                {currentUser && !isProjectOwner(project) && (
                  <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Contact</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Name:</span>
                        <span className="text-gray-900 text-right">{project.contactName || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900 text-right truncate">{project.contactEmail || 'Available after application'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
