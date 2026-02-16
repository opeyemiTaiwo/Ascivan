// src/Pages/projects/ProjectOwnerDashboard.jsx - Fully Responsive

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc,
  getDocs,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { createMemberJoinedNotification } from '../../utils/notificationHelpers';

const sendEmailNotification = async (endpoint, data) => {
  try {
    console.log(`Sending email notification via ${endpoint}...`);
    const response = await fetch(`/api/notifications/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      console.log(`Email notification sent successfully:`, result.results);
      return { success: true, results: result.results };
    } else {
      console.error(`Email notification failed:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`Error sending email notification:`, error);
    return { success: false, error: error.message };
  }
};

// Industry tracks data
const industryTracks = [
  { value: 'healthcare', label: 'Healthcare/Medical'},
  { value: 'finance', label: 'Finance/Fintech'},
  { value: 'education', label: 'Education'},
  { value: 'ecommerce', label: 'E-commerce'},
  { value: 'entertainment', label: 'Entertainment/Media'},
  { value: 'government', label: 'Government'},
  { value: 'technology', label: 'Technology/Software/SaaS'},
  { value: 'cybersecurity', label: 'Cybersecurity'},
  { value: 'transportation', label: 'Transportation/Logistics'},
  { value: 'realestate', label: 'Real Estate/PropTech'},
  { value: 'energy', label: 'Energy/Utilities'},
  { value: 'agriculture', label: 'Agriculture/AgTech'},
  { value: 'manufacturing', label: 'Manufacturing/Industrial'},
  { value: 'legal', label: 'Legal Tech'},
  { value: 'nonprofit', label: 'Non-Profit/Social Impact'},
  { value: 'travel', label: 'Travel/Hospitality'},
  { value: 'sports', label: 'Sports/Fitness'},
  { value: 'food', label: 'Food/Beverage'},
  { value: 'fashion', label: 'Fashion/Retail'},
  { value: 'construction', label: 'Construction/Infrastructure'},
  { value: 'marketing', label: 'Marketing/Advertising'}
];

// Helper functions
const getIndustryLabel = (industryTrack) => {
  const track = industryTracks.find(t => t.value === industryTrack);
  return track ? track.label : industryTrack;
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

const ProjectOwnerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.email) {
      const unsubscribe = fetchMyProjects();
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchMyProjects = () => {
    try {
      console.log('Fetching projects for:', currentUser.email);
      const projectsQuery = query(
        collection(db, 'client_projects'),
        where('contactEmail', '==', currentUser.email)
      );
      
      const unsubscribe = onSnapshot(
        projectsQuery, 
        async (snapshot) => {
          console.log('Projects snapshot received:', snapshot.docs.length, 'projects');
          try {
            const projectsList = [];
            for (const projectDoc of snapshot.docs) {
              const projectData = { id: projectDoc.id, ...projectDoc.data() };
              if (!['approved', 'active'].includes(projectData.status)) continue;
              
              try {
                const groupQuery = query(
                  collection(db, 'groups'),
                  where('projectId', '==', projectDoc.id)
                );
                const groupSnapshot = await getDocs(groupQuery);
                if (!groupSnapshot.empty) {
                  projectData.group = { id: groupSnapshot.docs[0].id, ...groupSnapshot.docs[0].data() };
                }
              } catch (groupError) {
                console.error('Error fetching group for project:', projectDoc.id, groupError);
              }
              
              try {
                const applicationsQuery = query(
                  collection(db, 'project_applications'),
                  where('projectId', '==', projectDoc.id)
                );
                const applicationsSnapshot = await getDocs(applicationsQuery);
                const pendingApplications = applicationsSnapshot.docs.filter(doc => {
                  const status = doc.data().status;
                  return ['submitted', 'under_review'].includes(status);
                });
                projectData.pendingApplications = pendingApplications.length;
              } catch (appError) {
                console.error('Error fetching applications for project:', projectDoc.id, appError);
                projectData.pendingApplications = 0;
              }
              projectsList.push(projectData);
            }
            projectsList.sort((a, b) => {
              const dateA = a.createdAt?.toDate?.() || new Date(0);
              const dateB = b.createdAt?.toDate?.() || new Date(0);
              return dateB - dateA;
            });
            setMyProjects(projectsList);
            setLoading(false);
            setError(null);
          } catch (processingError) {
            console.error('Error processing projects data:', processingError);
            setError('Error processing projects data');
            setLoading(false);
          }
        },
        (queryError) => {
          console.error('Firestore query error:', queryError);
          setError('Failed to load projects: ' + queryError.message);
          setLoading(false);
          if (queryError.code === 'failed-precondition') {
            toast.error('Database configuration error. Please contact support.');
          } else {
            toast.error('Failed to load your projects. Please try refreshing the page.');
          }
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up projects query:', error);
      setError('Failed to initialize projects query');
      setLoading(false);
      return () => {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading your projects...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Unable to Load Projects</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchMyProjects();
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
            <Link 
              to="/projects"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your projects.</p>
          <Link 
            to="/login"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Login
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
            
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/Images/loomiq-logo.svg" 
                alt="Loomiq" 
                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
              />
            </Link>
            
            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
              >
                Dashboard
              </Link>
              
              {currentUser && (
                <>
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
                  
                  {/* Mobile: Just avatar */}
                  <div className="sm:hidden">
                    {currentUser.photoURL && (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          
          {/* Page Header */}
          <section className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              My <span className="text-blue-600">Projects</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Manage your projects and team applications</p>
          </section>

          {/* Stats Grid */}
          <section className="mb-8 sm:mb-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Total Projects</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-600">{myProjects.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Active Teams</p>
                <p className="text-2xl sm:text-3xl font-black text-orange-600">{myProjects.filter(p => p.group).length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Applications</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-600">{myProjects.reduce((sum, p) => sum + (p.pendingApplications || 0), 0)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Team Members</p>
                <p className="text-2xl sm:text-3xl font-black text-orange-600">{myProjects.reduce((sum, p) => sum + (p.group?.memberCount || 0), 0)}</p>
              </div>
            </div>
          </section>

          {/* Projects List */}
          {myProjects.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 border border-gray-200 max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No Projects Yet</h3>
                <p className="text-gray-600 mb-6 sm:mb-8">Submit your first project to start building your team!</p>
                <Link 
                  to="/submit-project"
                  className="inline-block bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all text-sm sm:text-base"
                >
                  Submit Your First Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ProjectCard = ({ project, currentUser }) => {
  const [showApplications, setShowApplications] = useState(false);
  
  const isCompleted = project.group?.status === 'completed';
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Project Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">{project.projectTitle}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              {project.status}
            </span>
            {project.pendingApplications > 0 && !isCompleted && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                {project.pendingApplications} app{project.pendingApplications !== 1 ? 's' : ''}
              </span>
            )}
            {isCompleted && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                Completed
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">{project.projectDescription}</p>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-600 text-xs sm:text-sm">
          <span className="bg-gray-100 px-2 py-1 rounded">{getIndustryLabel(project.industryTrack)}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{formatTimeline(project.timeline)}</span>
          {project.experienceLevel && (
            <span className="bg-gray-100 px-2 py-1 rounded">{project.experienceLevel}</span>
          )}
        </div>
      </div>

      {/* Team Status */}
      {project.group ? (
        <div className={`mb-4 sm:mb-6 p-4 rounded-xl ${
          isCompleted 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className={`font-semibold text-sm sm:text-base ${isCompleted ? 'text-green-700' : 'text-orange-700'}`}>
                {isCompleted ? 'Team Project Completed' : 'Team Group Active'}
              </h4>
              <p className="text-gray-700 text-xs sm:text-sm mt-1">
                {isCompleted 
                  ? `Completed with ${project.group.memberCount} member(s)`
                  : `${project.group.memberCount} team member(s)`
                }
              </p>
            </div>
            <Link 
              to={`/groups/${project.group.id}`}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm text-center whitespace-nowrap ${
                isCompleted
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isCompleted ? 'View Team' : 'Manage Team'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-4 sm:mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="text-blue-700 font-semibold text-sm sm:text-base">Group Created</h4>
          <p className="text-gray-700 text-xs sm:text-sm mt-1">Your collaboration group was created. Applications available soon.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Link 
          to={`/projects/${project.id}`} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-center text-sm"
        >
          View Details
        </Link>
        {project.group && (
          isCompleted ? (
            <button 
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-semibold cursor-not-allowed text-center text-sm"
            >
              Completed
            </button>
          ) : (
            <Link 
              to={`/career/project-completion/${project.group.id}`} 
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-center text-sm"
            >
              Complete Project
            </Link>
          )
        )}
      </div>

      {/* Applications Section */}
      {!isCompleted && (
        <div className="space-y-3 sm:space-y-4">
          <button 
            onClick={() => setShowApplications(!showApplications)} 
            className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between text-sm"
          >
            <span>Manage Applications ({project.pendingApplications})</span>
            <span className={`transition-transform ${showApplications ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showApplications && project.group && (
            <ProjectApplicationManager projectId={project.id} groupData={project.group} currentUser={currentUser} />
          )}
          
          {showApplications && !project.group && (
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Loading Team Group</h4>
              <p className="text-gray-600 text-sm">Your team group is being set up. Refresh if this persists.</p>
            </div>
          )}
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="text-green-700 font-semibold text-sm sm:text-base">Project Successfully Completed</h4>
          <p className="text-gray-700 text-xs sm:text-sm mt-1">All badges awarded to team members. Great work!</p>
        </div>
      )}
    </div>
  );
};

const ProjectApplicationManager = ({ projectId, groupData, currentUser }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const handleCopyEmail = async (applicantEmail, applicantName) => {
    try {
      await navigator.clipboard.writeText(applicantEmail);
      toast.success(`${applicantName}'s email copied!`);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = applicantEmail;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(`${applicantName}'s email copied!`);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsQuery = query(
        collection(db, 'project_applications'),
        where('projectId', '==', projectId)
      );
      const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
        const applicationsList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(app => ['submitted', 'under_review'].includes(app.status))
          .sort((a, b) => {
            const dateA = a.submittedAt?.toDate?.() || new Date(0);
            const dateB = b.submittedAt?.toDate?.() || new Date(0);
            return dateB - dateA;
          });
        setApplications(applicationsList);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
      toast.error('Failed to load applications');
    }
  };

  const approveApplication = async (applicationId, applicationData) => {
    try {
      if (!applicationData.applicantEmail || !groupData.projectTitle || !groupData.id) {
        toast.error('Cannot approve: Missing required information');
        return;
      }

      const existingMembersQuery = query(
        collection(db, 'group_members'),
        where('groupId', '==', groupData.id),
        where('status', '==', 'active')
      );
      const existingMembersSnapshot = await getDocs(existingMembersQuery);
      const existingMembers = existingMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      await updateDoc(doc(db, 'project_applications', applicationId), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser.email,
        approvedByProjectOwner: true,
        approvedByName: currentUser.displayName || currentUser.email.split('@')[0]
      });

      await addDoc(collection(db, 'group_members'), {
        groupId: groupData.id,
        userEmail: applicationData.applicantEmail,
        userName: applicationData.applicantName,
        userId: applicationData.applicantId,
        role: 'member',
        status: 'active',
        joinedAt: serverTimestamp(),
        projectRole: applicationData.interestedRole || 'Developer',
        addedBy: currentUser.email,
        addedByProjectOwner: true,
        addedByName: currentUser.displayName || currentUser.email.split('@')[0]
      });

      await updateDoc(doc(db, 'groups', groupData.id), {
        memberCount: increment(1),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      try {
        await createMemberJoinedNotification(groupData.id, groupData.projectTitle, applicationData.applicantName, existingMembers);
      } catch (notificationError) {
        console.error('Failed to send member joined notifications:', notificationError);
      }

      try {
        const emailData = {
          applicationData: {
            applicantEmail: applicationData.applicantEmail,
            applicantName: applicationData.applicantName,
            applicantId: applicationData.applicantId,
            roleAppliedFor: applicationData.interestedRole || 'Developer',
            projectOwner: currentUser.displayName || currentUser.email.split('@')[0] || 'Project Owner',
            additionalEmails: [],
            approvalDate: new Date().toISOString(),
            projectTitle: groupData.projectTitle
          },
          projectData: {
            projectTitle: groupData.projectTitle,
            contactName: currentUser.displayName || currentUser.email.split('@')[0] || 'Project Owner',
            contactEmail: currentUser.email,
            companyName: groupData.companyName || 'Team Project',
            industryTrack: getIndustryLabel(groupData.industryTrack) || 'Technology',
            timeline: formatTimeline(groupData.timeline) || 'Ongoing',
            teamSize: (groupData.memberCount || 0) + 1,
            groupId: groupData.id,
            originalProjectId: groupData.originalProjectId || groupData.projectId || null,
            description: groupData.description || groupData.projectDescription || '',
            experienceLevel: groupData.experienceLevel || 'Mixed',
            budget: groupData.budget || 'Not specified'
          }
        };
        const emailResult = await sendEmailNotification('send-application-approved', emailData);
        if (emailResult.success) {
          toast.success('Application Approved! Welcome email sent.');
        } else {
          toast.success('Application Approved! Member added.');
        }
      } catch (emailError) {
        toast.success('Application Approved! Member added.');
      }

      try {
        await addDoc(collection(db, 'notifications'), {
          recipientEmail: applicationData.applicantEmail,
          recipientName: applicationData.applicantName,
          recipientId: applicationData.applicantId,
          type: 'application_approved',
          title: 'Application Approved!',
          message: `Your application to join "${groupData.projectTitle}" has been approved. Welcome to the team!`,
          projectId: projectId,
          groupId: groupData.id,
          projectTitle: groupData.projectTitle,
          approvedBy: currentUser.email,
          approvedByName: currentUser.displayName || currentUser.email.split('@')[0],
          createdAt: serverTimestamp(),
          read: false,
          priority: 'high'
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }

      try {
        await addDoc(collection(db, 'group_posts'), {
          groupId: groupData.id,
          authorId: 'system',
          authorName: 'Loomiq',
          authorEmail: 'system@loomiqhq.com',
          authorPhoto: '/Images/loomiq-logo.svg',
          title: 'New Team Member Joined!',
          content: `${applicationData.applicantName} has joined as ${applicationData.interestedRole || 'Developer'}! Welcome aboard!`,
          type: 'announcement',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          replyCount: 0,
          isPinned: false,
          isSystemPost: true,
          relatedToApplication: applicationId,
          newMemberEmail: applicationData.applicantEmail,
          newMemberName: applicationData.applicantName,
          likes: [],
          likeCount: 0
        });
      } catch (postError) {
        console.error('Failed to create group announcement:', postError);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Error approving application: ' + (error.message || 'Unknown error'));
    }
  };

  const rejectApplication = async (applicationId, applicationData, reason = '') => {
    try {
      if (!applicationData.applicantEmail || !groupData.projectTitle) {
        toast.error('Cannot reject: Missing required information');
        return;
      }
      
      await updateDoc(doc(db, 'project_applications', applicationId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: currentUser.email,
        rejectedByName: currentUser.displayName || currentUser.email.split('@')[0],
        rejectionReason: reason || 'No specific reason provided'
      });
      
      try {
        const emailData = {
          applicationData: {
            applicantName: applicationData.applicantName,
            applicantEmail: applicationData.applicantEmail,
            applicantId: applicationData.applicantId,
            roleAppliedFor: applicationData.interestedRole || 'Developer'
          },
          projectData: {
            projectTitle: groupData.projectTitle,
            contactName: currentUser.displayName || currentUser.email.split('@')[0] || 'Project Owner',
            contactEmail: currentUser.email,
            companyName: groupData.companyName || 'Team Project',
            industryTrack: getIndustryLabel(groupData.industryTrack) || 'Technology',
            projectDescription: groupData.description || groupData.projectDescription || ''
          },
          rejectionReason: reason || ''
        };
        await sendEmailNotification('send-application-rejected', emailData);
        toast.success('Application Rejected. Email sent.');
      } catch (emailError) {
        toast.success('Application Rejected.');
      }
      
      try {
        await addDoc(collection(db, 'notifications'), {
          recipientEmail: applicationData.applicantEmail,
          recipientName: applicationData.applicantName,
          recipientId: applicationData.applicantId,
          type: 'application_rejected',
          title: 'Application Update',
          message: `Your application for "${groupData.projectTitle}" has been reviewed. Thank you for your interest.`,
          projectId: projectId,
          projectTitle: groupData.projectTitle,
          rejectedBy: currentUser.email,
          rejectedByName: currentUser.displayName || currentUser.email.split('@')[0],
          rejectionReason: reason || 'No specific reason provided',
          createdAt: serverTimestamp(),
          read: false,
          priority: 'normal'
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Error rejecting application');
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 bg-gray-100 rounded-xl">
        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">No Applications Yet</h4>
        <p className="text-gray-600 text-sm">Applications will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto">
      {applications.map((app) => (
        <div key={app.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          
          {/* Applicant Info */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{app.applicantName}</h4>
              <p className="text-gray-600 text-xs sm:text-sm truncate">{app.applicantEmail}</p>
              <p className="text-blue-600 text-xs sm:text-sm">Role: {app.interestedRole || 'Developer'}</p>
              {app.availableStart && (
                <p className="text-gray-500 text-xs">Available: {new Date(app.availableStart).toLocaleDateString()}</p>
              )}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              app.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
              app.status === 'under_review' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {app.status.replace('_', ' ')}
            </span>
          </div>
          
          {/* Experience */}
          <div className="mb-3">
            <h5 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Experience:</h5>
            <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">{app.experience}</p>
          </div>
          
          {/* Portfolio */}
          {app.portfolio && (
            <div className="mb-3">
              <a 
                href={app.portfolio} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 underline text-xs sm:text-sm break-all"
              >
                View Portfolio →
              </a>
            </div>
          )}
          
          {/* Motivation */}
          {app.motivation && (
            <div className="mb-3">
              <h5 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Motivation:</h5>
              <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">{app.motivation}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                onClick={() => approveApplication(app.id, app)} 
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
              >
                Approve & Add
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Optional feedback (Leave blank for standard message):');
                  if (reason === null) return;
                  if (window.confirm(`Reject ${app.applicantName}'s application?`)) {
                    rejectApplication(app.id, app, reason);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
              >
                Reject
              </button>
            </div>
            <button 
              onClick={() => handleCopyEmail(app.applicantEmail, app.applicantName)} 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
            >
              Copy Email
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectOwnerDashboard;
