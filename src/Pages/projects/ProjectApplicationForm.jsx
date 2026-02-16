// src/Pages/projects/ProjectApplicationForm.jsx

// Responsive application form with global navbar

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

// Industry tracks data
const industryTracks = [
  { value: 'healthcare', label: 'Healthcare/Medical', icon: '🏥'},
  { value: 'finance', label: 'Finance/Fintech', icon: '💰' },
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

// Email notification helper function
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
      console.log(`✅ Email notification sent successfully:`, result.results);
      return { success: true, results: result.results };
    } else {
      console.error(`❌ Email notification failed:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`Error sending email notification:`, error);
    return { success: false, error: error.message };
  }
};

const ProjectApplicationForm = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    interestedRole: '',
    experience: '',
    skills: '',
    portfolio: '',
    motivation: '',
    availableStart: '',
    hoursPerWeek: '',
    preferredContact: 'email'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Helper function to get industry label
  const getIndustryLabel = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.label : industryTrack;
  };

  // Helper function to get industry icon
  const getIndustryIcon = (industryTrack) => {
    const track = industryTracks.find(t => t.value === industryTrack);
    return track ? track.icon : '💼';
  };

  // Helper function to format timeline
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
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          from: `/projects/apply/${projectId}`,
          message: 'Please sign in to apply to projects' 
        }
      });
    }
  }, [currentUser, navigate, projectId]);

  useEffect(() => {
    if (currentUser && projectId) {
      fetchProjectAndCheckApplication();
    }
  }, [currentUser, projectId]);

  useEffect(() => {
    if (currentUser && !formData.applicantName) {
      setFormData(prev => ({
        ...prev,
        applicantName: currentUser.displayName || currentUser.email.split('@')[0]
      }));
    }
  }, [currentUser]);

  const fetchProjectAndCheckApplication = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'client_projects', projectId));
      if (!projectDoc.exists()) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }

      const projectData = { id: projectDoc.id, ...projectDoc.data() };
      
      if (projectData.status !== 'active' && projectData.status !== 'approved') {
        toast.error('This project is not accepting applications');
        navigate('/projects');
        return;
      }

      setProject(projectData);

      const applicationsQuery = query(
        collection(db, 'project_applications'),
        where('projectId', '==', projectId),
        where('applicantEmail', '==', currentUser.email)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      if (!applicationsSnapshot.empty) {
        setHasApplied(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.applicantName.trim()) errors.push('Your name is required');
    if (!formData.interestedRole.trim()) errors.push('Please specify your interested role');
    if (!formData.experience.trim()) errors.push('Please describe your experience');
    if (!formData.skills.trim()) errors.push('Please list your relevant skills');
    if (!formData.motivation.trim()) errors.push('Please explain why you want to join this project');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    if (!currentUser) {
      toast.error('Please sign in to submit application');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(`Please fix the following:\n${errors.join('\n')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const applicationData = {
        projectId: projectId,
        projectTitle: project.projectTitle,
        industryTrack: project.industryTrack,
        
        applicantId: currentUser.uid,
        applicantEmail: currentUser.email,
        applicantName: formData.applicantName.trim(),
        applicantPhoto: currentUser.photoURL || null,
        
        interestedRole: formData.interestedRole.trim(),
        experience: formData.experience.trim(),
        skills: formData.skills.trim(),
        portfolio: formData.portfolio.trim() || null,
        motivation: formData.motivation.trim(),
        availableStart: formData.availableStart || null,
        hoursPerWeek: formData.hoursPerWeek || null,
        preferredContact: formData.preferredContact,
        
        projectOwnerId: project.submitterId,
        projectOwnerEmail: project.contactEmail,
        projectOwnerName: project.contactName || project.submitterName,
        
        status: 'submitted',
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        applicationSource: 'web_form',
        reviewed: false
      };

      await addDoc(collection(db, 'project_applications'), applicationData);

      try {
        const newApplicationEmailData = {
          projectOwnerEmail: project.contactEmail,
          projectOwnerName: project.contactName || project.submitterName || 'Project Owner',
          applicantName: formData.applicantName.trim(),
          applicantEmail: currentUser.email,
          roleAppliedFor: formData.interestedRole.trim(),
          projectTitle: project.projectTitle,
          industryTrack: getIndustryLabel(project.industryTrack),
          experience: formData.experience.trim(),
          skills: formData.skills.trim(),
          portfolio: formData.portfolio.trim() || 'Not provided',
          motivation: formData.motivation.trim(),
          hoursPerWeek: formData.hoursPerWeek || 'Not specified',
          availableStart: formData.availableStart || 'Not specified',
          applicationDate: new Date().toISOString()
        };

        const emailResult = await sendEmailNotification('send-new-application', newApplicationEmailData);
        
        if (emailResult.success) {
          console.log('New application email sent to project owner');
        } else {
          console.error('Failed to send new application email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending new application email:', emailError);
      }

      try {
        await addDoc(collection(db, 'notifications'), {
          recipientEmail: project.contactEmail,
          recipientId: project.submitterId,
          recipientName: project.contactName || project.submitterName,
          type: 'new_application',
          title: 'New Project Application',
          message: `${formData.applicantName} has applied to join your project "${project.projectTitle}" as ${formData.interestedRole}`,
          projectId: projectId,
          projectTitle: project.projectTitle,
          applicantEmail: currentUser.email,
          applicantName: formData.applicantName,
          applicantRole: formData.interestedRole,
          createdAt: serverTimestamp(),
          read: false,
          priority: 'high'
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      setSubmitStatus('success');
      setHasApplied(true);
      
      toast.success(
        `Application submitted successfully!\n\n` +
        `The project owner will review your application and contact you via ${formData.preferredContact === 'email' ? 'email' : 'phone'}.`,
        { autoClose: 5000 }
      );

      setFormData({
        applicantName: currentUser.displayName || currentUser.email.split('@')[0],
        interestedRole: '',
        experience: '',
        skills: '',
        portfolio: '',
        motivation: '',
        availableStart: '',
        hoursPerWeek: '',
        preferredContact: 'email'
      });

      setTimeout(() => {
        navigate('/projects');
      }, 3000);

    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitStatus('error');
      
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check your account status.');
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (hasApplied) {
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
              
              <div className="flex items-center space-x-4 lg:space-x-6">
                <Link 
                  to="/projects" 
                  className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
                >
                  Back to Projects
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
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="pt-20 sm:pt-24 flex items-center justify-center min-h-screen px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 max-w-2xl w-full text-center shadow-lg">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Already Applied</h2>
            <p className="text-gray-600 mb-8">
              You've already submitted an application for this project. 
              The project owner will contact you if they're interested.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/projects"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                Browse Other Projects
              </Link>
              <Link 
                to="/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-bold transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
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
                to="/projects" 
                className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
              >
                Back to Projects
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
                  
                  {/* Mobile: Just show avatar */}
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

      {/* Hero Section - Clean gradient, no background image */}
      <section 
        className="pt-24 sm:pt-32 pb-12 sm:pb-16"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Project Badge */}
            <div className="inline-block mb-6 bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30">
              <p className="text-blue-100 font-semibold text-sm sm:text-base">
                Applying to: <span className="text-white font-bold">{project.projectTitle}</span>
              </p>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Apply to Join This Team
            </h1>

            <p className="text-lg sm:text-xl text-blue-50 mb-8">
              Show your skills and motivation to join this exciting project
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - White Background */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-6xl">
          
          {/* Project Overview */}
          <section className="mb-8 sm:mb-12">
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Project Title</p>
                  <p className="text-gray-900 font-semibold">{project.projectTitle}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Industry Track</p>
                  <p className="text-gray-900 font-semibold flex items-center">
                    <span className="mr-2">{getIndustryIcon(project.industryTrack)}</span>
                    {getIndustryLabel(project.industryTrack)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Timeline</p>
                  <p className="text-gray-900 font-semibold">{formatTimeline(project.timeline)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Experience Level</p>
                  <p className="text-gray-900 font-semibold">{project.experienceLevel || 'Any Level'}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-gray-600 text-sm mb-2">Description</p>
                <p className="text-gray-700">{project.projectDescription}</p>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 text-sm mb-2">Required Skills</p>
                <p className="text-blue-600">{project.requiredSkills}</p>
              </div>
            </div>
          </section>

          {/* Application Form */}
          <section className="mb-12 sm:mb-16">
            <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 border border-gray-200 shadow-sm">
              
              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="text-blue-600 text-2xl mr-4">✅</div>
                    <div>
                      <h3 className="text-blue-900 font-bold text-lg mb-2">Application Submitted!</h3>
                      <p className="text-blue-800">The project owner will review your application and contact you soon.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="text-red-600 text-2xl mr-4">❌</div>
                    <div>
                      <h3 className="text-red-900 font-bold text-lg mb-2">Submission Failed</h3>
                      <p className="text-red-800">Please try again or contact support if the problem persists.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                    Your Information
                  </h2>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    
                    {/* Name */}
                    <div className="lg:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="applicantName"
                        value={formData.applicantName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div className="lg:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">Project owner will contact you via this email</p>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Interested Role *
                      </label>
                      <input
                        type="text"
                        name="interestedRole"
                        value={formData.interestedRole}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="e.g., Frontend Developer, Designer"
                      />
                    </div>

                    {/* Hours Per Week */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Hours Per Week
                      </label>
                      <select
                        name="hoursPerWeek"
                        value={formData.hoursPerWeek}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="">Select availability</option>
                        <option value="5-10">5-10 hours</option>
                        <option value="10-20">10-20 hours</option>
                        <option value="20-30">20-30 hours</option>
                        <option value="30-40">30-40 hours</option>
                        <option value="40+">40+ hours (Full-time)</option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Available Start Date
                      </label>
                      <input
                        type="date"
                        name="availableStart"
                        value={formData.availableStart}
                        onChange={handleInputChange}
                        min={getTodayDateString()}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    {/* Contact Method */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Preferred Contact Method
                      </label>
                      <select
                        name="preferredContact"
                        value={formData.preferredContact}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="either">Either</option>
                      </select>
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      Relevant Experience *
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-y"
                      placeholder="Describe your relevant experience for this project..."
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      Your Skills *
                    </label>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-y"
                      placeholder="List your relevant skills and technologies..."
                    />
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      Portfolio / GitHub / LinkedIn
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>

                  {/* Motivation */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      Why do you want to join this project? *
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-y"
                      placeholder="Explain your motivation and what you can contribute to this project..."
                    />
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-blue-900 font-bold text-base sm:text-lg mb-4">Application Tips</h3>
                  <ul className="text-blue-800 space-y-2 text-sm">
                    <li>• Be specific about your relevant experience and skills</li>
                    <li>• Explain how you can contribute to the project's success</li>
                    <li>• Include links to your portfolio or previous work if available</li>
                    <li>• Show genuine interest and enthusiasm for the project</li>
                    <li>• Be realistic about your availability and commitment</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Submitting Application...
                      </span>
                    ) : (
                      <span>Submit Application →</span>
                    )}
                  </button>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mt-4">
                    * Required fields. The project owner will review your application and contact you.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        input[type="date"] {
          color-scheme: light;
        }

        select option {
          background-color: white;
          color: #111827;
        }
      `}</style>
    </div>
  );
};

export default ProjectApplicationForm;
