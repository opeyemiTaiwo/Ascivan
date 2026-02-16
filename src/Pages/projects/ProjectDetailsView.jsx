// src/Pages/projects/ProjectDetailsView.jsx - Fully Responsive

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  doc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

// Industry tracks data
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

const ProjectDetailsView = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplication, setUserApplication] = useState(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const getIndustryLabel = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.label : industryTrack;
  };

  const getIndustryIcon = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.icon : '💼';
  };

  const getEventIcon = (eventType) => {
    const icons = {
      'workshop': '🛠️',
      'hackathon': '💻',
      'networking': '🤝',
      'conference': '🎤',
      'meetup': '👥',
      'webinar': '🌐'
    };
    return icons[eventType] || '📅';
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

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  useEffect(() => {
    if (currentUser && project) {
      checkUserApplication();
      checkIfProjectOwner();
    }
  }, [currentUser, project]);

  useEffect(() => {
    if (project) {
      fetchRelatedEvents();
    }
  }, [project]);

  const fetchProjectDetails = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'client_projects', projectId));
      
      if (projectDoc.exists()) {
        const projectData = { id: projectDoc.id, ...projectDoc.data() };
        setProject(projectData);
      } else {
        setError('Project not found');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
      setLoading(false);
    }
  };

  const fetchRelatedEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'tech_events'),
        where('status', '==', 'approved'),
        orderBy('eventDate', 'asc')
      );

      const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
        const allEvents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          eventDate: doc.data().eventDate?.toDate?.() || new Date()
        }));

        const currentTime = new Date();
        const upcomingEvents = allEvents.filter(event => 
          event.eventDate > currentTime
        );

        const projectRelatedEvents = upcomingEvents.filter(event => {
          return event.selectedProjectIds && 
                 event.selectedProjectIds.length > 0 &&
                 event.associatedProjects &&
                 event.associatedProjects.some(eventProject => 
                   eventProject.projectTitle === project.projectTitle ||
                   eventProject.id === project.id
                 );
        });

        setRelatedEvents(projectRelatedEvents);
        setLoadingEvents(false);
      }, (error) => {
        console.error('Error fetching events:', error);
        setRelatedEvents([]);
        setLoadingEvents(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up events listener:', error);
      setRelatedEvents([]);
      setLoadingEvents(false);
    }
  };

  const checkUserApplication = async () => {
    if (!currentUser?.email || !projectId) return;

    try {
      const applicationsQuery = query(
        collection(db, 'project_applications'),
        where('projectId', '==', projectId),
        where('applicantEmail', '==', currentUser.email)
      );

      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      if (!applicationsSnapshot.empty) {
        const applicationData = applicationsSnapshot.docs[0].data();
        setUserApplication(applicationData);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const checkIfProjectOwner = () => {
    if (currentUser?.email && project?.contactEmail) {
      const isOwner = currentUser.email === project.contactEmail;
      setIsProjectOwner(isOwner);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getApplicationStatusText = () => {
    if (!userApplication) return null;
    
    switch (userApplication.status) {
      case 'submitted':
        return 'Application Submitted - Pending Review';
      case 'under_review':
        return 'Application Under Review';
      case 'approved':
        return '✅ Application Approved - Welcome to the team!';
      case 'rejected':
        return '❌ Application Rejected';
      default:
        return 'Application Status: ' + userApplication.status;
    }
  };

  const formatEventDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const addToGoogleCalendar = (event) => {
    const startDate = new Date(event.eventDate);
    const endDate = new Date(startDate.getTime() + (parseFloat(event.duration) * 60 * 60 * 1000));
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.eventTitle)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`${event.eventDescription}\n\nJoin here: ${event.meetingUrl}`)}&location=${encodeURIComponent(event.meetingUrl)}`;
    
    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl sm:text-6xl mb-6">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error || 'The project you are looking for does not exist.'}</p>
          <Link 
            to="/projects"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Projects
          </Link>
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
                to={currentUser ? "/community" : "/"} 
                className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
              >
                Home
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-7xl">
          
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <Link 
              to={isProjectOwner ? "/projects/owner-dashboard" : "/projects"}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm sm:text-base"
            >
              <span className="mr-2">←</span>
              Back to {isProjectOwner ? "My Projects" : "All Projects"}
            </Link>
          </div>

          {/* Project Header */}
          <section className="mb-8 sm:mb-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div className="mb-6 lg:mb-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
                    {project.projectTitle}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border ${getStatusColor(project.status)}`}>
                      {project.status === 'active' ? '✓ Active' : project.status}
                    </span>
                    
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm font-semibold border border-blue-200 flex items-center">
                      <span className="mr-1.5">{getIndustryIcon(project.industryTrack)}</span>
                      <span className="hidden sm:inline">{getIndustryLabel(project.industryTrack)}</span>
                      <span className="sm:hidden">{getIndustryLabel(project.industryTrack).split('/')[0]}</span>
                    </span>
                    
                    <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs sm:text-sm font-semibold border border-orange-200">
                      ⏱️ {formatTimeline(project.timeline)}
                    </span>
                  </div>
                  
                  {isProjectOwner && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 sm:mb-6">
                      <p className="text-yellow-800 font-semibold text-sm sm:text-base">
                        👑 You own this project
                      </p>
                    </div>
                  )}
                  
                  {userApplication && (
                    <div className={`border rounded-xl p-4 mb-4 sm:mb-6 ${getStatusColor(userApplication.status)}`}>
                      <p className="font-semibold text-sm sm:text-base">
                        {getApplicationStatusText()}
                      </p>
                      {userApplication.submittedAt && (
                        <p className="text-xs sm:text-sm mt-1 opacity-80">
                          Applied on {new Date(userApplication.submittedAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 lg:ml-8 w-full lg:w-auto lg:min-w-[200px]">
                  {isProjectOwner ? (
                    <>
                      <Link 
                        to="/projects/owner-dashboard"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors text-center text-sm sm:text-base"
                      >
                        📊 Manage Project
                      </Link>
                      <Link 
                        to={`/projects/${projectId}/edit`}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-colors text-center text-sm sm:text-base"
                      >
                        ✏️ Edit Project
                      </Link>
                      <Link 
                        to="/submit-event"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-colors text-center text-sm sm:text-base"
                      >
                        📅 Host Event
                      </Link>
                    </>
                  ) : currentUser ? (
                    userApplication ? (
                      <div className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold text-center text-sm sm:text-base">
                        ✓ Application {userApplication.status}
                      </div>
                    ) : (
                      <Link 
                        to={`/projects/${projectId}/apply`}
                        className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all text-center text-sm sm:text-base"
                      >
                        Apply to Join →
                      </Link>
                    )
                  ) : (
                    <Link 
                      to="/login"
                      className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all text-center text-sm sm:text-base"
                    >
                      Login to Apply
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              
              {/* Description */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Project Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {project.projectDescription}
                </p>
              </div>

              {/* Skills */}
              {project.requiredSkills && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.split(',').map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm font-medium border border-blue-200"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {project.projectGoals && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">🎯 Project Goals</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {project.projectGoals}
                  </p>
                </div>
              )}

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-blue-50 border border-orange-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center mb-3 sm:mb-0">
                      📅 <span className="ml-2">Related Events</span>
                    </h2>
                    <Link 
                      to="/events"
                      className="text-orange-600 hover:text-orange-700 transition-colors text-sm sm:text-base font-semibold"
                    >
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {relatedEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="bg-white border border-orange-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                        <div className="mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center flex-1 min-w-0">
                              <span className="text-xl mr-2 flex-shrink-0">{getEventIcon(event.eventType)}</span>
                              <h3 className="font-bold text-orange-800 text-sm sm:text-base line-clamp-2">
                                {event.eventTitle}
                              </h3>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            📅 {formatEventDate(event.eventDate)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            👤 {event.organizerName} • ⏱️ {event.duration}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                            {event.eventDescription}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => addToGoogleCalendar(event)}
                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm border border-blue-200"
                          >
                            📅 Add to Calendar
                          </button>
                          
                          {event.meetingUrl && (
                            <button
                              onClick={() => window.open(event.meetingUrl, '_blank')}
                              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm border border-orange-200"
                            >
                              🔗 Join Event
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {relatedEvents.length > 3 && (
                      <div className="text-center pt-4 border-t border-orange-200">
                        <Link 
                          to="/events"
                          className="text-orange-600 hover:text-orange-700 font-semibold transition-colors text-sm sm:text-base"
                        >
                          View {relatedEvents.length - 3} more events →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Project Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Project Information</h3>
                <div className="space-y-3 text-sm sm:text-base">
                  
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Industry:</span>
                    <span className="text-gray-900 font-semibold flex items-center">
                      <span className="mr-1">{getIndustryIcon(project.industryTrack)}</span>
                      <span className="hidden sm:inline">{getIndustryLabel(project.industryTrack)}</span>
                      <span className="sm:hidden">{getIndustryLabel(project.industryTrack).split('/')[0]}</span>
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="text-gray-900 font-semibold">{formatTimeline(project.timeline)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Experience:</span>
                    <span className="text-gray-900 font-semibold capitalize">{project.experienceLevel?.replace('-', ' ')}</span>
                  </div>
                  
                  {project.budget && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Budget:</span>
                      <span className="text-gray-900 font-semibold">{project.budget}</span>
                    </div>
                  )}
                  
                  {project.createdAt && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Posted:</span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(project.createdAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Owner */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Project Owner</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Contact:</span>
                    <p className="text-gray-900 font-semibold">{project.contactName || 'Project Owner'}</p>
                  </div>
                  
                  {!isProjectOwner && currentUser && (
                    <a 
                      href={`mailto:${project.contactEmail}?subject=Interest in ${project.projectTitle}`}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-center text-sm"
                    >
                      📧 Contact Owner
                    </a>
                  )}
                </div>
              </div>

              {/* Events Count */}
              {relatedEvents.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-blue-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                    📅 <span className="ml-2">Events</span>
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{relatedEvents.length}</div>
                    <div className="text-gray-600 text-sm mb-4">upcoming events</div>
                    <Link 
                      to="/events"
                      className="block w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-center text-sm"
                    >
                      View All Events
                    </Link>
                  </div>
                </div>
              )}

              {/* Owner Stats */}
              {isProjectOwner && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">📊 Application Stats</h3>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-4">View detailed statistics</p>
                    <Link 
                      to="/projects/owner-dashboard"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-center text-sm"
                    >
                      View Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailsView;
